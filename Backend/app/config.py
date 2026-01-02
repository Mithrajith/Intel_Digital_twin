"""Configuration management for Technovate backend."""
from pydantic_settings import BaseSettings
from pathlib import Path


class Settings(BaseSettings):
    """Application settings."""
    
    # Application
    app_name: str = "Technovate Digital Twin Backend"
    app_version: str = "0.1.0"
    debug: bool = True
    
    # Paths
    base_dir: Path = Path(__file__).parent.parent
    data_dir: Path = base_dir / "data"
    urdf_path: Path = data_dir / "urdf" / "armpi_fpv.urdf"
    sensor_logs_dir: Path = data_dir / "sensor_logs"
    models_dir: Path = data_dir / "trained_models"
    
    # Simulation
    simulation_frequency: float = 10.0  # Hz
    rom_reduction_factor: int = 10  # Reduce timesteps by this factor
    
    # Sensor parameters
    base_temperature: float = 25.0  # Celsius
    max_temperature: float = 80.0
    vibration_base: float = 0.1  # g
    vibration_max: float = 2.0
    
    # ML parameters
    anomaly_contamination: float = 0.05  # Expected anomaly rate
    failure_threshold: float = 0.7  # Failure probability threshold
    rul_warning_hours: float = 100.0  # RUL warning threshold
    
    # API
    cors_origins: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:7000",
        "http://127.0.0.1:7000"
    ]
    
    class Config:
        env_file = "venv"
        env_file_encoding = "utf-8"


settings = Settings()

# Ensure directories exist
settings.sensor_logs_dir.mkdir(parents=True, exist_ok=True)
settings.models_dir.mkdir(parents=True, exist_ok=True)
