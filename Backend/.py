from urdfpy import URDF
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent
urdf_path = PROJECT_ROOT / "data" / "urdf" / "armpi_fpv.urdf"
# Alternative source if not found in data/urdf
if not urdf_path.exists():
    urdf_path = PROJECT_ROOT / "create_multibody_from_urdf" / "armpi_fpv" / "armpi_fpv.urdf"

robot = URDF.load(str(urdf_path))
robot.save("robot.obj")
