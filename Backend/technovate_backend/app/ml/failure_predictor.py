"""Failure prediction using XGBoost classifier."""
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import joblib
from pathlib import Path
from typing import Optional, Tuple

from ..config import settings


class FailurePredictor:
    """XGBoost-based failure predictor."""

    def shap_explain(self, X: np.ndarray, feature_names=None):
        """
        Compute SHAP values for the input features.
        Args:
            X: Feature vector (n_features,) or matrix (n_samples, n_features)
            feature_names: Optional list of feature names
        Returns:
            SHAP values and base value
        """
        import shap
        if X.ndim == 1:
            X = X.reshape(1, -1)
        explainer = shap.TreeExplainer(self.model)
        shap_values = explainer.shap_values(X)
        base_value = explainer.expected_value
        return {
            "shap_values": shap_values.tolist(),
            "base_value": base_value.tolist() if hasattr(base_value, 'tolist') else base_value,
            "feature_names": feature_names if feature_names else None
        }
    
    def __init__(self):
        """Initialize failure predictor."""
        self.model = xgb.XGBClassifier(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            eval_metric='logloss',
            use_label_encoder=False
        )
        self.is_trained = False
        self.model_path = settings.models_dir / "failure_predictor.pkl"
    
    def train(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2):
        """
        Train the failure predictor.
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: Binary labels (0=normal, 1=failure)
            test_size: Proportion of data for testing
        """
        print(f"Training XGBoost classifier on {X.shape[0]} samples...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42, stratify=y
        )
        
        # Train model
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        y_prob = self.model.predict_proba(X_test)[:, 1]
        
        print("\nClassification Report:")
        print(classification_report(y_test, y_pred))
        
        try:
            auc = roc_auc_score(y_test, y_prob)
            print(f"ROC AUC Score: {auc:.4f}")
        except:
            print("Could not compute ROC AUC (possibly single class in test set)")
        
        self.is_trained = True
        print("Failure predictor trained successfully.")
    
    def predict_proba(self, X: np.ndarray) -> float:
        """
        Predict failure probability.
        
        Args:
            X: Feature vector (n_features,) or matrix (n_samples, n_features)
            
        Returns:
            Failure probability between 0 and 1
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Ensure 2D array
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # Get probability of failure (class 1)
        prob = self.model.predict_proba(X)[0, 1]
        
        return float(prob)
    
    def predict(self, X: np.ndarray, threshold: float = None) -> bool:
        """
        Predict failure (binary).
        
        Args:
            X: Feature vector
            threshold: Decision threshold (default from settings)
            
        Returns:
            True if failure predicted, False otherwise
        """
        if threshold is None:
            threshold = settings.failure_threshold
        
        prob = self.predict_proba(X)
        return prob >= threshold
    
    def save(self, path: Optional[Path] = None):
        """Save trained model to disk."""
        if path is None:
            path = self.model_path
        
        joblib.dump(self.model, path)
        print(f"Failure predictor saved to {path}")
    
    def load(self, path: Optional[Path] = None):
        """Load trained model from disk."""
        if path is None:
            path = self.model_path
        
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        
        self.model = joblib.load(path)
        self.is_trained = True
        print(f"Failure predictor loaded from {path}")
