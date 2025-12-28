"""Pydantic schemas for API requests and responses."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from datetime import datetime


class JointInfo(BaseModel):
    """Joint metadata."""
    name: str
    type: str
    axis: List[float]
    lower_limit: float
    upper_limit: float
    max_effort: float
    max_velocity: float


class MachineMetadata(BaseModel):
    """Machine metadata response."""
    machine_id: str = "armpi_fpv_01"
    machine_type: str = "robotic_arm"
    num_joints: int
    joints: List[JointInfo]
    links: List[str]


class JointState(BaseModel):
    """Single joint state."""
    name: str
    angle: float = Field(..., description="Joint angle in radians")
    velocity: float = Field(..., description="Joint velocity in rad/s")
    torque: float = Field(..., description="Joint torque in Nm")
    temperature: float = Field(..., description="Joint temperature in Celsius")


class MachineState(BaseModel):
    """Current machine state."""
    machine_id: str = "armpi_fpv_01"
    timestamp: float
    status: str = "running"
    uptime_seconds: float
    joints: List[JointState]
    vibration_level: float = Field(..., description="Overall vibration in g")


class HealthPrediction(BaseModel):
    """Health prediction response."""
    machine_id: str = "armpi_fpv_01"
    timestamp: float
    anomaly_score: float = Field(..., ge=0, le=1, description="Anomaly score (0=normal, 1=anomalous)")
    failure_probability: float = Field(..., ge=0, le=1, description="Failure probability")
    rul_hours: float = Field(..., description="Remaining Useful Life in hours")
    health_status: str = Field(..., description="Overall health: healthy, warning, critical")
    alerts: List[str] = Field(default_factory=list)
    component_health: Dict[str, float] = Field(default_factory=dict)


class ControlCommand(BaseModel):
    """Control command request."""
    command: str = Field(..., description="Command: start, stop, reset, set_speed")
    parameters: Optional[Dict[str, float]] = None


class ControlResponse(BaseModel):
    """Control command response."""
    success: bool
    message: str
    timestamp: float


class LogExportParams(BaseModel):
    """Log export parameters."""
    start_time: Optional[float] = None
    end_time: Optional[float] = None
    format: str = "csv"
