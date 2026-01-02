"""Anomaly detection using Isolation Forest."""
import numpy as np
from sklearn.ensemble import IsolationForest
import joblib
from pathlib import Path
from typing import Optional

from ..config import settings


class AnomalyDetector:
    """Isolation Forest-based anomaly detector."""
    
    def __init__(self, contamination: float = None):
        """
        Initialize anomaly detector.
        
        Args:
            contamination: Expected proportion of anomalies (default from settings)
        """
        if contamination is None:
            contamination = settings.anomaly_contamination
        
        self.model = IsolationForest(
            contamination=contamination,
            random_state=42,
            n_estimators=100,
            max_samples='auto',
            n_jobs=-1
        )
        self.is_trained = False
        self.model_path = settings.models_dir / "anomaly_detector.pkl"
    
    def train(self, X: np.ndarray):
        """
        Train the anomaly detector on normal operation data.
        
        Args:
            X: Feature matrix (n_samples, n_features)
        """
        print(f"Training Isolation Forest on {X.shape[0]} samples...")
        self.model.fit(X)
        self.is_trained = True
        print("Anomaly detector trained successfully.")
    
    def predict(self, X: np.ndarray) -> float:
        """
        Predict anomaly score for input features.
        
        Args:
            X: Feature vector (n_features,) or matrix (n_samples, n_features)
            
        Returns:
            Anomaly score between 0 (normal) and 1 (anomalous)
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Ensure 2D array
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # Get anomaly scores (more negative = more anomalous)
        scores = self.model.score_samples(X)
        
        # Convert to 0-1 range (0=normal, 1=anomalous)
        # Normalize using sigmoid-like transformation
        anomaly_score = 1.0 / (1.0 + np.exp(scores[0]))
        
        return float(np.clip(anomaly_score, 0, 1))
    
    def save(self, path: Optional[Path] = None):
        """Save trained model to disk."""
        if path is None:
            path = self.model_path
        
        joblib.dump(self.model, path)
        print(f"Anomaly detector saved to {path}")
    
    def load(self, path: Optional[Path] = None):
        """Load trained model from disk."""
        if path is None:
            path = self.model_path
        
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        
        self.model = joblib.load(path)
        self.is_trained = True
        print(f"Anomaly detector loaded from {path}")
