"""URDF parser for extracting machine metadata.

Reuses patterns from digital_twin_robot project.
"""
import xml.etree.ElementTree as ET
from typing import List, Dict, Tuple, Optional
from pathlib import Path
from dataclasses import dataclass


@dataclass
class Joint:
    """Joint information from URDF."""
    name: str
    joint_type: str
    parent_link: str
    child_link: str
    axis: Tuple[float, float, float]
    origin_xyz: Tuple[float, float, float]
    origin_rpy: Tuple[float, float, float]
    lower_limit: float = -3.14
    upper_limit: float = 3.14
    effort_limit: float = 1000.0
    velocity_limit: float = 10.0


@dataclass
class Link:
    """Link information from URDF."""
    name: str
    has_inertial: bool = False
    mass: float = 0.0
    inertia: Optional[Dict[str, float]] = None


class URDFParser:
    """Parse URDF files and extract metadata."""
    
    def __init__(self, urdf_path: Path):
        """Initialize parser with URDF file path."""
        self.urdf_path = urdf_path
        self.tree = None
        self.root = None
        self.joints: List[Joint] = []
        self.links: List[Link] = []
        self.robot_name: str = ""
        
    def parse(self) -> bool:
        """Parse the URDF file."""
        try:
            self.tree = ET.parse(self.urdf_path)
            self.root = self.tree.getroot()
            self.robot_name = self.root.get('name', 'unknown')
            
            self._parse_links()
            self._parse_joints()
            
            return True
        except Exception as e:
            print(f"Error parsing URDF: {e}")
            return False
    
    def _parse_links(self):
        """Extract link information."""
        for link_elem in self.root.findall('link'):
            name = link_elem.get('name')
            inertial_elem = link_elem.find('inertial')
            
            if inertial_elem is not None:
                mass_elem = inertial_elem.find('mass')
                mass = float(mass_elem.get('value', 0.0)) if mass_elem is not None else 0.0
                
                inertia_elem = inertial_elem.find('inertia')
                inertia = None
                if inertia_elem is not None:
                    inertia = {
                        'ixx': float(inertia_elem.get('ixx', 0)),
                        'ixy': float(inertia_elem.get('ixy', 0)),
                        'ixz': float(inertia_elem.get('ixz', 0)),
                        'iyy': float(inertia_elem.get('iyy', 0)),
                        'iyz': float(inertia_elem.get('iyz', 0)),
                        'izz': float(inertia_elem.get('izz', 0)),
                    }
                
                self.links.append(Link(name=name, has_inertial=True, mass=mass, inertia=inertia))
            else:
                self.links.append(Link(name=name, has_inertial=False))
    
    def _parse_joints(self):
        """Extract joint information."""
        for joint_elem in self.root.findall('joint'):
            name = joint_elem.get('name')
            joint_type = joint_elem.get('type')
            
            # Parent and child links
            parent = joint_elem.find('parent')
            child = joint_elem.find('child')
            parent_link = parent.get('link') if parent is not None else ""
            child_link = child.get('link') if child is not None else ""
            
            # Axis
            axis_elem = joint_elem.find('axis')
            if axis_elem is not None:
                axis_str = axis_elem.get('xyz', '0 0 1')
                axis = tuple(map(float, axis_str.split()))
            else:
                axis = (0.0, 0.0, 1.0)
            
            # Origin
            origin_elem = joint_elem.find('origin')
            if origin_elem is not None:
                xyz_str = origin_elem.get('xyz', '0 0 0')
                rpy_str = origin_elem.get('rpy', '0 0 0')
                origin_xyz = tuple(map(float, xyz_str.split()))
                origin_rpy = tuple(map(float, rpy_str.split()))
            else:
                origin_xyz = (0.0, 0.0, 0.0)
                origin_rpy = (0.0, 0.0, 0.0)
            
            # Limits
            limit_elem = joint_elem.find('limit')
            if limit_elem is not None:
                lower = float(limit_elem.get('lower', -3.14))
                upper = float(limit_elem.get('upper', 3.14))
                effort = float(limit_elem.get('effort', 1000.0))
                velocity = float(limit_elem.get('velocity', 10.0))
            else:
                lower, upper, effort, velocity = -3.14, 3.14, 1000.0, 10.0
            
            joint = Joint(
                name=name,
                joint_type=joint_type,
                parent_link=parent_link,
                child_link=child_link,
                axis=axis,
                origin_xyz=origin_xyz,
                origin_rpy=origin_rpy,
                lower_limit=lower,
                upper_limit=upper,
                effort_limit=effort,
                velocity_limit=velocity
            )
            
            self.joints.append(joint)
    
    def get_revolute_joints(self) -> List[Joint]:
        """Get only revolute joints (controllable)."""
        return [j for j in self.joints if j.joint_type == 'revolute']
    
    def get_joint_by_name(self, name: str) -> Optional[Joint]:
        """Get joint by name."""
        for joint in self.joints:
            if joint.name == name:
                return joint
        return None
    
    def get_metadata_dict(self) -> Dict:
        """Get metadata as dictionary for API response."""
        revolute_joints = self.get_revolute_joints()
        
        return {
            'robot_name': self.robot_name,
            'num_joints': len(revolute_joints),
            'joints': [
                {
                    'name': j.name,
                    'type': j.joint_type,
                    'axis': list(j.axis),
                    'lower_limit': j.lower_limit,
                    'upper_limit': j.upper_limit,
                    'max_effort': j.effort_limit,
                    'max_velocity': j.velocity_limit,
                }
                for j in revolute_joints
            ],
            'links': [link.name for link in self.links]
        }
