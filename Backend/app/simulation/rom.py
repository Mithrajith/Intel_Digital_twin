"""Reduced Order Model (ROM) for efficient computation."""
import numpy as np
from typing import List, Dict
from collections import deque

from .physics_sim import JointState


class ReducedOrderModel:
    """
    Reduced Order Model using linear approximation and timestep reduction.
    
    Reduces computational load while maintaining accuracy for ML feature extraction.
    """
    
    def __init__(self, reduction_factor: int = 10):
        """
        Initialize ROM.
        
        Args:
            reduction_factor: Factor by which to reduce timesteps (e.g., 10 = 100Hz -> 10Hz)
        """
        self.reduction_factor = reduction_factor
        self.buffer: deque = deque(maxlen=reduction_factor)
        self.reduced_state: Dict[str, JointState] = {}
    
    def add_state(self, joint_states: List[JointState]):
        """Add a high-frequency state to the buffer."""
        self.buffer.append(joint_states)
    
    def get_reduced_state(self) -> List[JointState]:
        """
        Get reduced-order state using linear approximation.
        
        Returns averaged state over the buffer window.
        """
        if len(self.buffer) == 0:
            return []
        
        # Average states over the buffer
        joint_names = [state.name for state in self.buffer[0]]
        reduced_states = []
        
        for i, joint_name in enumerate(joint_names):
            angles = [states[i].angle for states in self.buffer]
            velocities = [states[i].velocity for states in self.buffer]
            accelerations = [states[i].acceleration for states in self.buffer]
            torques = [states[i].torque for states in self.buffer]
            
            # Linear approximation (averaging)
            avg_state = JointState(
                name=joint_name,
                angle=float(np.mean(angles)),
                velocity=float(np.mean(velocities)),
                acceleration=float(np.mean(accelerations)),
                torque=float(np.mean(torques))
            )
            
            reduced_states.append(avg_state)
        
        return reduced_states
    
    def is_ready(self) -> bool:
        """Check if buffer is full and ready for reduction."""
        return len(self.buffer) == self.reduction_factor
    
    def reset(self):
        """Reset the ROM buffer."""
        self.buffer.clear()
        self.reduced_state.clear()
