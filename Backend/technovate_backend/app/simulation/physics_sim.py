"""Lightweight physics simulator for robotic arm.

Reuses patterns from demo_machine_server/simulator.py.
"""
import numpy as np
import time
from typing import Dict, List
from dataclasses import dataclass

from .urdf_parser import URDFParser, Joint


@dataclass
class JointState:
    """Current state of a joint."""
    name: str
    angle: float  # radians
    velocity: float  # rad/s
    acceleration: float  # rad/s^2
    torque: float  # Nm


class PhysicsSimulator:
    """Lightweight physics simulator for robotic arm."""
    
    def __init__(self, urdf_parser: URDFParser, frequency: float = 10.0):
        """
        Initialize simulator.
        
        Args:
            urdf_parser: Parsed URDF data
            frequency: Simulation frequency in Hz
        """
        self.urdf_parser = urdf_parser
        self.frequency = frequency
        self.dt = 1.0 / frequency
        
        self.revolute_joints = urdf_parser.get_revolute_joints()
        self.joint_states: Dict[str, JointState] = {}
        
        # Simulation parameters
        self.start_time = time.time()
        self.sim_time = 0.0
        
        # Initialize joint states
        self._initialize_joints()
        
    def _initialize_joints(self):
        """Initialize joint states to neutral positions."""
        for joint in self.revolute_joints:
            # Start at midpoint of joint range
            mid_angle = (joint.lower_limit + joint.upper_limit) / 2.0
            
            self.joint_states[joint.name] = JointState(
                name=joint.name,
                angle=mid_angle,
                velocity=0.0,
                acceleration=0.0,
                torque=0.0
            )
    
    def step(self):
        """Advance simulation by one timestep."""
        self.sim_time += self.dt
        elapsed = time.time() - self.start_time
        
        # Update each joint with sinusoidal motion pattern
        for i, joint in enumerate(self.revolute_joints):
            state = self.joint_states[joint.name]
            
            # Different frequency for each joint to create realistic motion
            freq = 0.3 + i * 0.1
            amplitude = (joint.upper_limit - joint.lower_limit) * 0.3
            center = (joint.lower_limit + joint.upper_limit) / 2.0
            
            # Position (sinusoidal trajectory)
            target_angle = center + amplitude * np.sin(2 * np.pi * freq * elapsed)
            
            # Velocity (derivative of position)
            target_velocity = amplitude * 2 * np.pi * freq * np.cos(2 * np.pi * freq * elapsed)
            
            # Acceleration (derivative of velocity)
            target_acceleration = -amplitude * (2 * np.pi * freq) ** 2 * np.sin(2 * np.pi * freq * elapsed)
            
            # Add small random noise
            noise_angle = np.random.normal(0, 0.01)
            noise_velocity = np.random.normal(0, 0.05)
            
            # Update state
            state.angle = np.clip(target_angle + noise_angle, joint.lower_limit, joint.upper_limit)
            state.velocity = target_velocity + noise_velocity
            state.acceleration = target_acceleration
            
            # Calculate torque (simplified dynamics: torque = I * alpha + friction)
            # Assume unit inertia and simple friction model
            friction_coeff = 0.1
            state.torque = state.acceleration + friction_coeff * state.velocity
            
            # Clip torque to joint limits
            state.torque = np.clip(state.torque, -joint.effort_limit, joint.effort_limit)
    
    def get_joint_states(self) -> List[JointState]:
        """Get current states of all joints."""
        return list(self.joint_states.values())
    
    def get_state_dict(self) -> Dict:
        """Get joint states as dictionary."""
        return {
            'timestamp': time.time(),
            'sim_time': self.sim_time,
            'joints': [
                {
                    'name': state.name,
                    'angle': float(state.angle),
                    'velocity': float(state.velocity),
                    'torque': float(state.torque),
                }
                for state in self.joint_states.values()
            ]
        }
    
    def reset(self):
        """Reset simulation to initial state."""
        self.start_time = time.time()
        self.sim_time = 0.0
        self._initialize_joints()
