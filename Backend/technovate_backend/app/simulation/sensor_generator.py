"""Synthetic sensor data generator.

Reuses patterns from predictive-maintenance/main.py.
"""
import numpy as np
from typing import Dict, List
from dataclasses import dataclass

from .physics_sim import PhysicsSimulator, JointState
from ..config import settings


@dataclass
class SensorData:
    """Sensor readings for the machine."""
    timestamp: float
    joint_temperatures: Dict[str, float]
    joint_vibrations: Dict[str, float]
    overall_vibration: float
    power_consumption: float


class SensorGenerator:
    """Generate synthetic sensor data from simulation."""
    
    def __init__(self, simulator: PhysicsSimulator):
        """Initialize sensor generator."""
        self.simulator = simulator
        
        # Degradation tracking (simulates wear over time)
        self.degradation_factor = 0.0
        self.cycles_count = 0
        
        # Temperature accumulation (thermal inertia)
        self.joint_temps: Dict[str, float] = {}
        for joint_name in simulator.joint_states.keys():
            self.joint_temps[joint_name] = settings.base_temperature
    
    def generate(self) -> SensorData:
        """Generate sensor data based on current simulation state."""
        joint_states = self.simulator.get_joint_states()
        timestamp = self.simulator.sim_time
        
        # Update degradation (increases over time)
        self.cycles_count += 1
        self.degradation_factor = min(1.0, self.cycles_count / 100000.0)
        
        # Generate sensor data for each joint
        joint_temperatures = {}
        joint_vibrations = {}
        total_vibration = 0.0
        total_power = 0.0
        
        for state in joint_states:
            # Temperature: function of torque and accumulated heat
            # Higher torque -> more heat generation
            heat_generation = abs(state.torque) * 2.0
            heat_dissipation = (self.joint_temps[state.name] - settings.base_temperature) * 0.1
            
            # Thermal model with degradation
            temp_change = (heat_generation - heat_dissipation) * 0.01
            self.joint_temps[state.name] += temp_change
            
            # Add degradation effect (worn joints run hotter)
            degradation_temp = self.degradation_factor * 10.0
            
            # Add noise
            noise = np.random.normal(0, 0.5)
            
            final_temp = self.joint_temps[state.name] + degradation_temp + noise
            final_temp = np.clip(final_temp, settings.base_temperature, settings.max_temperature)
            joint_temperatures[state.name] = float(final_temp)
            
            # Vibration: function of velocity and degradation
            # Higher velocity -> more vibration
            # Degradation increases vibration
            base_vibration = abs(state.velocity) * 0.1
            degradation_vibration = self.degradation_factor * 0.5
            vibration_noise = np.random.normal(0, 0.05)
            
            vibration = settings.vibration_base + base_vibration + degradation_vibration + vibration_noise
            vibration = np.clip(vibration, 0, settings.vibration_max)
            joint_vibrations[state.name] = float(vibration)
            
            total_vibration += vibration
            
            # Power consumption: function of torque and velocity
            power = abs(state.torque * state.velocity) * 10.0  # Watts
            total_power += power
        
        # Overall vibration (RMS of all joints)
        overall_vibration = float(np.sqrt(total_vibration / len(joint_states)))
        
        return SensorData(
            timestamp=timestamp,
            joint_temperatures=joint_temperatures,
            joint_vibrations=joint_vibrations,
            overall_vibration=overall_vibration,
            power_consumption=float(total_power)
        )
    
    def inject_fault(self, fault_type: str = "temperature", severity: float = 0.5):
        """
        Inject a fault for testing ML models.
        
        Args:
            fault_type: Type of fault (temperature, vibration, degradation, overload, pressure_loss, drift)
            severity: Fault severity (0-1)
        """
        if fault_type == "temperature" or fault_type == "overload":
            # Increase all joint temperatures
            for joint_name in self.joint_temps.keys():
                self.joint_temps[joint_name] += severity * 30.0
        
        elif fault_type == "vibration" or fault_type == "pressure_loss":
            # Increase degradation factor temporarily or permanently
            self.degradation_factor = min(1.0, self.degradation_factor + severity)
        
        elif fault_type == "degradation" or fault_type == "drift":
            # Simulate wear
            self.cycles_count += int(severity * 50000)
            self.degradation_factor = min(1.0, self.cycles_count / 100000.0)
    
    def reset(self):
        """Reset sensor state."""
        self.degradation_factor = 0.0
        self.cycles_count = 0
        for joint_name in self.joint_temps.keys():
            self.joint_temps[joint_name] = settings.base_temperature
