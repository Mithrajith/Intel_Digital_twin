import math
import random
import time
from typing import Dict, Any

class MachineSimulator:
    def __init__(self, machine_id: str, machine_type: str):
        self.machine_id = machine_id
        self.machine_type = machine_type
        self.start_time = time.time()
        self.status = "running"

    def generate_data(self) -> Dict[str, Any]:
        current_time = time.time()
        elapsed = current_time - self.start_time
        
        base_data = {
            "machine_id": self.machine_id,
            "timestamp": current_time,
            "status": self.status,
            "uptime_seconds": int(elapsed)
        }

        if self.machine_type == "robotic_arm":
            return {**base_data, **self._generate_robotic_arm_data(elapsed)}
        elif self.machine_type == "cnc_milling":
            return {**base_data, **self._generate_cnc_data(elapsed)}
        elif self.machine_type == "conveyor_belt":
            return {**base_data, **self._generate_conveyor_data(elapsed)}
        else:
            return base_data

    def _generate_robotic_arm_data(self, t: float) -> Dict[str, float]:
        # Simulate 6 joints
        return {
            "joint_1_angle": 90 + 45 * math.sin(t * 0.5),
            "joint_2_angle": 30 + 20 * math.cos(t * 0.3),
            "joint_3_angle": -15 + 10 * math.sin(t * 0.7),
            "temperature_core": 45 + 5 * math.sin(t * 0.05) + random.uniform(-0.5, 0.5),
            "vibration_level": 0.5 + 0.2 * math.sin(t * 2.0) + random.uniform(0, 0.1),
            "power_consumption": 120 + 30 * abs(math.sin(t * 0.5))
        }

    def _generate_cnc_data(self, t: float) -> Dict[str, float]:
        return {
            "spindle_speed": 5000 + 100 * math.sin(t * 0.1) + random.uniform(-50, 50),
            "tool_temperature": 60 + 15 * (1 - math.exp(-t / 600)) + random.uniform(-1, 1), # Warming up
            "axis_x_position": 100 * math.sin(t * 0.2),
            "axis_y_position": 100 * math.cos(t * 0.2),
            "axis_z_position": -10 + 5 * math.sin(t * 0.5),
            "vibration_spindle": 1.2 + 0.5 * random.random()
        }

    def _generate_conveyor_data(self, t: float) -> Dict[str, float]:
        return {
            "belt_speed": 2.5 + 0.1 * math.sin(t * 0.1) + random.uniform(-0.05, 0.05),
            "motor_load": 75 + 10 * math.sin(t * 0.05) + random.uniform(-2, 2),
            "bearing_temperature": 35 + 2 * math.sin(t * 0.01),
            "items_processed": int(t * 0.5)
        }

# Registry of available machines
machines = {
    "robot_01": MachineSimulator("robot_01", "robotic_arm"),
    "cnc_01": MachineSimulator("cnc_01", "cnc_milling"),
    "conveyor_01": MachineSimulator("conveyor_01", "conveyor_belt")
}

def get_machine_data(machine_id: str):
    if machine_id in machines:
        return machines[machine_id].generate_data()
    return None

def get_all_machines():
    return [{"id": m_id, "type": m.machine_type} for m_id, m in machines.items()]
