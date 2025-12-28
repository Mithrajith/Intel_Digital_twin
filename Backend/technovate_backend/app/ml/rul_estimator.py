"""Remaining Useful Life (RUL) estimation using XGBoost regression."""
import numpy as np
import xgboost as xgb
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import joblib
from pathlib import Path
from typing import Optional

from ..config import settings


class RULEstimator:
    """XGBoost-based RUL estimator."""
    
    def __init__(self):
        """Initialize RUL estimator."""
        self.model = xgb.XGBRegressor(
            n_estimators=100,
            max_depth=6,
            learning_rate=0.1,
            random_state=42,
            objective='reg:squarederror'
        )
        self.is_trained = False
        self.model_path = settings.models_dir / "rul_estimator.pkl"
    
    def train(self, X: np.ndarray, y: np.ndarray, test_size: float = 0.2):
        """
        Train the RUL estimator.
        
        Args:
            X: Feature matrix (n_samples, n_features)
            y: RUL values in hours (n_samples,)
            test_size: Proportion of data for testing
        """
        print(f"Training XGBoost regressor on {X.shape[0]} samples...")
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Train model
        self.model.fit(
            X_train, y_train,
            eval_set=[(X_test, y_test)],
            verbose=False
        )
        
        # Evaluate
        y_pred = self.model.predict(X_test)
        
        mse = mean_squared_error(y_test, y_pred)
        mae = mean_absolute_error(y_test, y_pred)
        r2 = r2_score(y_test, y_pred)
        
        print(f"\nRegression Metrics:")
        print(f"  MSE: {mse:.4f}")
        print(f"  MAE: {mae:.4f}")
        print(f"  R²:  {r2:.4f}")
        
        self.is_trained = True
        print("RUL estimator trained successfully.")
    
    def predict(self, X: np.ndarray) -> float:
        """
        Predict remaining useful life.
        
        Args:
            X: Feature vector (n_features,) or matrix (n_samples, n_features)
            
        Returns:
            Predicted RUL in hours
        """
        if not self.is_trained:
            raise ValueError("Model not trained. Call train() first.")
        
        # Ensure 2D array
        if X.ndim == 1:
            X = X.reshape(1, -1)
        
        # Predict RUL
        rul = self.model.predict(X)[0]
        
        # Ensure non-negative
        rul = max(0.0, float(rul))
        
        return rul
    
    def save(self, path: Optional[Path] = None):
        """Save trained model to disk."""
        if path is None:
            path = self.model_path
        
        joblib.dump(self.model, path)
        print(f"RUL estimator saved to {path}")
    
    def load(self, path: Optional[Path] = None):
        """Load trained model from disk."""
        if path is None:
            path = self.model_path
        
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        
        self.model = joblib.load(path)
        self.is_trained = True
        print(f"RUL estimator loaded from {path}")
