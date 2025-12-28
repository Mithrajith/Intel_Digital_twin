"""Feature engineering and preprocessing for ML models.

Reuses patterns from predictive-maintenance/main.py.
"""
import numpy as np
import pandas as pd
from sklearn.preprocessing import MinMaxScaler
from typing import List, Dict, Tuple
from collections import deque


class FeatureEngineer:
    """Feature engineering for time-series sensor data."""
    
    def __init__(self, window_size: int = 10):
        """
        Initialize feature engineer.
        
        Args:
            window_size: Number of timesteps for rolling statistics
        """
        self.window_size = window_size
        self.scaler = MinMaxScaler()
        self.is_fitted = False
        
        # Rolling buffers for each feature
        self.buffers: Dict[str, deque] = {}
    
    def add_sample(self, features: Dict[str, float]):
        """Add a sample to rolling buffers."""
        for key, value in features.items():
            if key not in self.buffers:
                self.buffers[key] = deque(maxlen=self.window_size)
            self.buffers[key].append(value)
    
    def extract_features(self, current_data: Dict[str, float]) -> Dict[str, float]:
        """
        Extract engineered features from current data and rolling buffers.
        
        Args:
            current_data: Current sensor readings
            
        Returns:
            Dictionary of engineered features
        """
        features = {}
        
        # Add current values
        for key, value in current_data.items():
            features[f'{key}_current'] = value
        
        # Add rolling statistics if buffer is full
        for key, buffer in self.buffers.items():
            if len(buffer) >= self.window_size:
                values = list(buffer)
                features[f'{key}_mean'] = np.mean(values)
                features[f'{key}_std'] = np.std(values)
                features[f'{key}_max'] = np.max(values)
                features[f'{key}_min'] = np.min(values)
                features[f'{key}_range'] = np.max(values) - np.min(values)
        
        # Add derived features (ratios, etc.)
        if 'temperature_current' in features and 'velocity_current' in features:
            epsilon = 1e-10
            features['temp_velocity_ratio'] = features['temperature_current'] / (abs(features['velocity_current']) + epsilon)
        
        if 'torque_current' in features and 'angle_current' in features:
            epsilon = 1e-10
            features['torque_angle_ratio'] = features['torque_current'] / (abs(features['angle_current']) + epsilon)
        
        return features
    
    def prepare_for_ml(self, features: Dict[str, float]) -> np.ndarray:
        """
        Prepare features for ML model input.
        
        Args:
            features: Dictionary of features
            
        Returns:
            Numpy array of scaled features
        """
        # Convert to DataFrame for consistent ordering
        df = pd.DataFrame([features])
        
        # Handle NaN and inf values
        df = df.fillna(0)
        df = df.replace([np.inf, -np.inf], 0)
        
        # Scale features
        if not self.is_fitted:
            # First time: fit scaler
            scaled = self.scaler.fit_transform(df)
            self.is_fitted = True
        else:
            # Subsequent times: transform only
            scaled = self.scaler.transform(df)
        
        return scaled[0]
    
    def create_training_dataset(self, sensor_logs: List[Dict]) -> Tuple[np.ndarray, List[str]]:
        """
        Create training dataset from sensor logs.
        
        Args:
            sensor_logs: List of sensor reading dictionaries
            
        Returns:
            Tuple of (feature matrix, feature names)
        """
        all_features = []
        
        # Reset buffers
        self.buffers.clear()
        
        for log in sensor_logs:
            # Add to rolling buffers
            self.add_sample(log)
            
            # Extract features
            features = self.extract_features(log)
            all_features.append(features)
        
        # Convert to DataFrame
        df = pd.DataFrame(all_features)
        
        # Handle missing values
        df = df.fillna(df.mean())
        df = df.replace([np.inf, -np.inf], 0)
        
        # Fit scaler on training data
        X = self.scaler.fit_transform(df)
        self.is_fitted = True
        
        return X, list(df.columns)
    
    def reset(self):
        """Reset buffers and scaler."""
        self.buffers.clear()
        self.scaler = MinMaxScaler()
        self.is_fitted = False
