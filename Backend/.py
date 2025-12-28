from urdfpy import URDF

robot = URDF.load("/home/zypher/PROJECT/Intel_Digital_twin/Backend/digital_twin_robot/robot_digital_twin/3d_model_urdf_files/armpi_fpv.urdf")
robot.save("robot.obj")
