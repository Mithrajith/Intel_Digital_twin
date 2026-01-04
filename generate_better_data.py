import pandas as pd
import numpy as np

def generate_trajectory(start_angles, end_angles, steps):
    return np.linspace(start_angles, end_angles, steps)

def create_sequence():
    # Define keyframes [J1, J2, J3, J4, J5]
    # Angles in degrees
    
    # Industrial "Ready" Pose (Cobra Style)
    # J2 (Shoulder) leans back slightly (-15)
    # J3 (Elbow) bends forward (+45)
    # J4 (Wrist) points down (+30)
    home = np.array([0, -15, 45, 30, 0])
    
    # Sequence Keyframes
    pre_pick = np.array([0, 30, 30, 30, 0])
    pick = np.array([0, 45, 45, 45, 0]) 
    pick_closed = np.array([0, 45, 45, 45, 90])
    lift = np.array([0, 0, 45, 30, 90]) # Lift to a neutral-ish pose
    rotate = np.array([90, 0, 45, 30, 90])
    drop_approach = np.array([90, 45, 45, 45, 90])
    drop_open = np.array([90, 45, 45, 45, 0])
    post_drop = np.array([90, 0, 45, 30, 0])
    
    # Return to Industrial Home
    back_home = home

    # Generate segments
    fps = 10
    segments = [
        (home, home, 1.0), # Wait in Ready Pose
        (home, pick, 2.0), # Reach Down
        (pick, pick, 0.5), # Stabilize
        (pick, pick_closed, 0.5), # Close Gripper
        (pick_closed, lift, 1.5), # Lift
        (lift, rotate, 2.0), # Rotate
        (rotate, drop_approach, 1.5), # Lower
        (drop_approach, drop_open, 0.5), # Open
        (drop_open, post_drop, 1.0), # Lift
        (post_drop, back_home, 2.0) # Return to Ready
    ]

    data = []
    current_time = 0.0

    for start, end, duration in segments:
        steps = int(duration * fps)
        traj = generate_trajectory(start, end, steps)
        for row in traj:
            data.append([current_time, *row])
            current_time += 1.0/fps
            current_time = round(current_time, 2)

    df = pd.DataFrame(data, columns=['timestamp', 'joint_1', 'joint_2', 'joint_3', 'joint_4', 'joint_5'])
    return df

if __name__ == "__main__":
    df = create_sequence()
    df.to_csv('Backend/data/real_data.csv', index=False)
    print("Generated Backend/data/real_data.csv with Industrial Home pose.")
