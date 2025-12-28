from urdfpy import URDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
urdf_path = PROJECT_ROOT / "digital_twin_robot" / "robot_digital_twin" / "3d_model_urdf_files" / "armpi_fpv.urdf"

robot = URDF.load(str(urdf_path))
robot.save("robot.obj")
