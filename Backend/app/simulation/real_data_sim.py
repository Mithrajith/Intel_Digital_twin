"""Real data simulator for robotic arm.

Replays data from a CSV file instead of generating synthetic physics.
"""
import pandas as pd
import numpy as np
import time
from typing import Dict, List
from dataclasses import dataclass
from pathlib import Path

from .urdf_parser import URDFParser

@dataclass
class JointState:
    """Current state of a joint."""
    name: str
    angle: float  # radians
    velocity: float  # rad/s
    acceleration: float  # rad/s^2
    torque: float  # Nm


class RealDataSimulator:
    """Simulator that replays real data from a CSV file."""
    
    def __init__(self, urdf_parser: URDFParser, data_path: Path, frequency: float = 10.0):
        """
        Initialize simulator with real data.
        
        Args:
            urdf_parser: Parsed URDF data
            data_path: Path to CSV file containing real data
            frequency: Simulation frequency in Hz
        """
        self.urdf_parser = urdf_parser
        self.frequency = frequency
        self.dt = 1.0 / frequency
        self.data_path = data_path
        
        self.revolute_joints = urdf_parser.get_revolute_joints()
        self.joint_states: Dict[str, JointState] = {}
        
        self.data = None
        self.current_index = 0
        self.sim_time = 0.0
        
        self._load_data()
        self._initialize_joints()
        
    def _load_data(self):
        """Load data from CSV file."""
        if self.data_path.exists():
            try:
                self.data = pd.read_csv(self.data_path)
                print(f"Loaded real data from {self.data_path}: {len(self.data)} rows")
                # print columns to help debugging
                print(f"Columns: {self.data.columns.tolist()}")
            except Exception as e:
                print(f"Error loading real data: {e}")
                self.data = None
        else:
            print(f"Real data file not found: {self.data_path}")
            self.data = None

    def _initialize_joints(self):
        """Initialize joint states."""
        for joint in self.revolute_joints:
            self.joint_states[joint.name] = JointState(
                name=joint.name,
                angle=0.0,
                velocity=0.0,
                acceleration=0.0,
                torque=0.0
            )
            
    def step(self):
        """Advance simulation by one timestep (read next row)."""
        self.sim_time += self.dt
        
        if self.data is not None and not self.data.empty:
            # Loop through data
            row_idx = self.current_index % len(self.data)
            row = self.data.iloc[row_idx]
            
            # Update joints from CSV columns
            for i, joint in enumerate(self.revolute_joints):
                angle = 0.0
                found = False
                
                # Try exact name match
                if joint.name in row:
                    angle = row[joint.name]
                    found = True
                # Try 'joint_N' format (1-based index)
                elif f"joint_{i+1}" in row:
                    angle = row[f"joint_{i+1}"]
                    found = True
                # Try 'jN' format
                elif f"j{i+1}" in row:
                    angle = row[f"j{i+1}"]
                    found = True
                
                if found:
                    state = self.joint_states[joint.name]
                    # Assuming data is in DEGREES, convert to RADIANS
                    state.angle = np.deg2rad(float(angle))
                    
                    # We could estimate velocity if we wanted, but for now 0
                    state.velocity = 0.0
                    state.torque = 0.0
            
            self.current_index += 1
        else:
            # Fallback if no data
            pass

    def get_joint_states(self) -> List[JointState]:
        """Get current state of all joints."""
        return list(self.joint_states.values())
        
    def reset(self):
        """Reset simulation to beginning."""
        self.current_index = 0
        self.sim_time = 0.0
