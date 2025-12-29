"""Training script for ML models.

Run this script to generate training data and train all ML models.
"""
import numpy as np
import pandas as pd
from pathlib import Path
import sys

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent))

from app.config import settings
from app.simulation.urdf_parser import URDFParser
from app.simulation.physics_sim import PhysicsSimulator
from app.simulation.sensor_generator import SensorGenerator
from app.ml.preprocessing import FeatureEngineer
from app.ml.anomaly_detector import AnomalyDetector
from app.ml.failure_predictor import FailurePredictor
from app.ml.rul_estimator import RULEstimator


def generate_training_data(num_samples: int = 5000):
    """Generate synthetic training data with normal and failure scenarios."""
    print(f"Generating {num_samples} training samples...")
    
    # Initialize simulation
    urdf_parser = URDFParser(settings.urdf_path)
    if not urdf_parser.parse():
        raise RuntimeError("Failed to parse URDF")
    
    simulator = PhysicsSimulator(urdf_parser, frequency=10.0)
    sensor_gen = SensorGenerator(simulator)
    
    # Generate data
    all_data = []
    labels_failure = []
    labels_rul = []
    
    for i in range(num_samples):
        # Step simulation
        simulator.step()
        sensor_data = sensor_gen.generate()
        joint_states = simulator.get_joint_states()
        
        # Collect features
        features = {
            'temperature': sum(sensor_data.joint_temperatures.values()) / len(sensor_data.joint_temperatures),
            'vibration': sensor_data.overall_vibration,
            'power': sensor_data.power_consumption,
            'velocity': sum(abs(js.velocity) for js in joint_states) / len(joint_states),
            'torque': sum(abs(js.torque) for js in joint_states) / len(joint_states),
            'angle': sum(abs(js.angle) for js in joint_states) / len(joint_states),
        }
        
        all_data.append(features)
        
        # Label generation
        # Failure occurs when degradation is high
        degradation = sensor_gen.degradation_factor
        is_failure = 1 if degradation > 0.7 else 0
        labels_failure.append(is_failure)
        
        # RUL decreases with degradation (max 500 hours)
        rul = max(0, 500 * (1 - degradation))
        labels_rul.append(rul)
        
        # Inject faults periodically to create failure scenarios
        if i % 1000 == 500:
            sensor_gen.inject_fault("degradation", severity=0.3)
        
        if (i + 1) % 500 == 0:
            print(f"  Generated {i + 1}/{num_samples} samples...")
    
    print("Training data generation complete.")
    
    return all_data, labels_failure, labels_rul


def train_models():
    """Train all ML models."""
    print("\n" + "="*60)
    print("TRAINING ML MODELS")
    print("="*60 + "\n")
    
    # Generate training data
    data, failure_labels, rul_labels = generate_training_data(num_samples=5000)
    
    # Feature engineering
    print("\nFeature Engineering...")
    feature_eng = FeatureEngineer(window_size=10)
    X, feature_names = feature_eng.create_training_dataset(data)
    feature_eng.save() # Save the fitted scaler
    print(f"Feature matrix shape: {X.shape}")
    print(f"Features: {feature_names[:5]}... ({len(feature_names)} total)")
    
    # Convert labels to numpy arrays
    y_failure = np.array(failure_labels)
    y_rul = np.array(rul_labels)
    
    # Train Anomaly Detector (on normal data only)
    print("\n" + "-"*60)
    print("Training Anomaly Detector (Isolation Forest)")
    print("-"*60)
    normal_data = X[y_failure == 0]
    print(f"Using {len(normal_data)} normal samples")
    
    anomaly_detector = AnomalyDetector()
    anomaly_detector.train(normal_data)
    anomaly_detector.save()
    
    # Test anomaly detection
    test_normal = X[y_failure == 0][:10]
    test_anomaly = X[y_failure == 1][:10] if sum(y_failure) > 10 else X[-10:]
    
    print("\nTesting on normal samples:")
    for i, sample in enumerate(test_normal[:3]):
        score = anomaly_detector.predict(sample)
        print(f"  Sample {i}: anomaly_score={score:.4f}")
    
    print("\nTesting on anomalous samples:")
    for i, sample in enumerate(test_anomaly[:3]):
        score = anomaly_detector.predict(sample)
        print(f"  Sample {i}: anomaly_score={score:.4f}")
    
    # Train Failure Predictor
    print("\n" + "-"*60)
    print("Training Failure Predictor (XGBoost Classifier)")
    print("-"*60)
    print(f"Failure rate: {sum(y_failure)/len(y_failure)*100:.2f}%")
    
    failure_predictor = FailurePredictor()
    failure_predictor.train(X, y_failure)
    failure_predictor.save()
    
    # Train RUL Estimator
    print("\n" + "-"*60)
    print("Training RUL Estimator (XGBoost Regressor)")
    print("-"*60)
    print(f"RUL range: {min(y_rul):.1f} - {max(y_rul):.1f} hours")
    
    rul_estimator = RULEstimator()
    rul_estimator.train(X, y_rul)
    rul_estimator.save()
    
    print("\n" + "="*60)
    print("TRAINING COMPLETE")
    print("="*60)
    print(f"\nModels saved to: {settings.models_dir}")
    print("\nYou can now start the backend server:")
    print("  cd Backend/technovate_backend")
    print("  uvicorn app.main:app --reload")


if __name__ == "__main__":
    # Ensure URDF exists
    if not settings.urdf_path.exists():
        print(f"Error: URDF file not found at {settings.urdf_path}")
        print("\nPlease copy the URDF file:")
        print("  cp ../digital_twin_robot/robot_digital_twin/3d_model_urdf_files/armpi_fpv.urdf data/urdf/")
        sys.exit(1)
    
    train_models()
