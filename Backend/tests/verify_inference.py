
import sys
from pathlib import Path
import numpy as np
import joblib

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.ml.preprocessing import FeatureEngineer
from app.config import settings
from app.ml.failure_predictor import FailurePredictor

def verify_feature_engineer_persistence():
    print("Verifying FeatureEngineer persistence...")
    
    # 1. Create and fit a FeatureEngineer
    fe = FeatureEngineer(window_size=5)
    data = [
        {'temp': 100, 'vib': 0.1},
        {'temp': 110, 'vib': 0.2},
        {'temp': 120, 'vib': 0.3},
    ]
    # Create training set fits the scaler
    X, names = fe.create_training_dataset(data)
    
    # Save it locally for test
    test_path = Path("test_fe.pkl")
    fe.save(test_path)
    
    # 2. Load it back
    fe_loaded = FeatureEngineer(window_size=5)
    fe_loaded.load(test_path)
    
    # 3. Verify consistency
    # New sample
    new_sample = {'temp': 105, 'vib': 0.15}
    
    # Process with original
    fe.add_sample(new_sample) # Add to buffer
    orig_feat = fe.extract_features(new_sample)
    orig_scaled = fe.prepare_for_ml(orig_feat)
    
    # Process with loaded
    # Note: buffers are NOT persisted (they are runtime state), but scaler IS.
    # This is correct behavior.
    fe_loaded.add_sample(new_sample)
    loaded_feat = fe_loaded.extract_features(new_sample)
    loaded_scaled = fe_loaded.prepare_for_ml(loaded_feat)
    
    if np.allclose(orig_scaled, loaded_scaled):
        print("SUCCESS: Loaded FeatureEngineer produces identical output.")
    else:
        print("FAILURE: Loaded FeatureEngineer output matches.")
        print(f"Original: {orig_scaled}")
        print(f"Loaded:   {loaded_scaled}")

    # clean up
    if test_path.exists():
        test_path.unlink()

def verify_model_integration():
    print("\nVerifying Model Integration...")
    # This assumes models are already trained and in the settings directory
    
    try:
        fe = FeatureEngineer()
        fe.load() # Load from settings.models_dir
        
        fp = FailurePredictor()
        fp.load()
        
        print("Models loaded successfully from default location.")
        
        # Test inference flow
        # Must match keys in train_models.py
        sample = {
            'temperature': 60.0,
            'vibration': 0.5,
            'power': 100.0,
            'velocity': 0.1,
            'torque': 0.5,
            'angle': 1.57
        }
        
        # Simulate API flow
        fe.add_sample(sample)
        features = fe.extract_features(sample)
        X = fe.prepare_for_ml(features)
        
        prob = fp.predict_proba(X)
        print(f"Inference successful. Failure probability: {prob:.4f}")
        
    except FileNotFoundError as e:
        print(f"SKIP: Models not found ({e}). Run train_models.py first.")
    except Exception as e:
        print(f"FAILURE: Model integration test failed: {e}")

if __name__ == "__main__":
    verify_feature_engineer_persistence()
    verify_model_integration()
