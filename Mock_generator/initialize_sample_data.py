#!/usr/bin/env python3
"""
Initialize the backend database with sample scenarios, failure modes, and maintenance tasks.
Run this after starting the backend server to populate it with test data.
"""

import requests
import json
from datetime import datetime, timedelta

BASE_URL = "http://localhost:7000"

def create_sample_scenarios():
    """Create sample simulation scenarios."""
    scenarios = [
        {
            "name": "Normal Operation",
            "description": "Standard operating conditions",
            "machine_type": "robotic_arm",
            "parameters": {"type": "normal", "load_factor": 1.0}
        },
        {
            "name": "High Load Manufacturing",
            "description": "Heavy duty operation with increased load",
            "machine_type": "robotic_arm",
            "parameters": {"type": "high_load", "load_factor": 1.3, "duty_cycle": 0.9}
        },
        {
            "name": "Precision Machining",
            "description": "High precision, low vibration mode",
            "machine_type": "cnc_milling",
            "parameters": {"type": "precision_mode", "vibration_reduction": 0.5}
        },
        {
            "name": "Cold Environment",
            "description": "Operation in cold environment",
            "machine_type": "cnc_milling",
            "parameters": {"type": "low_temperature", "temp_offset": -15}
        },
        {
            "name": "High Speed Production",
            "description": "Increased belt speed for high throughput",
            "machine_type": "conveyor_belt",
            "parameters": {"type": "high_speed", "speed_multiplier": 1.2}
        }
    ]
    
    print("Creating sample scenarios...")
    for scenario in scenarios:
        try:
            response = requests.post(f"{BASE_URL}/scenarios", json=scenario)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created scenario: {scenario['name']} (ID: {result['id']})")
            else:
                print(f"❌ Failed to create scenario: {scenario['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating scenario {scenario['name']}: {e}")

def create_sample_failure_modes():
    """Create sample failure modes."""
    failure_modes = [
        {
            "name": "Bearing Wear - Early Stage",
            "description": "Slight increase in vibration due to bearing wear",
            "machine_type": "robotic_arm",
            "severity": "low",
            "failure_type": "bearing",
            "probability": 0.05
        },
        {
            "name": "Bearing Degradation - Advanced",
            "description": "Significant bearing degradation with high vibration",
            "machine_type": "robotic_arm",
            "severity": "high",
            "failure_type": "bearing",
            "probability": 0.02
        },
        {
            "name": "Motor Overheating",
            "description": "Motor running hot due to insufficient cooling",
            "machine_type": "cnc_milling",
            "severity": "medium",
            "failure_type": "motor",
            "probability": 0.08
        },
        {
            "name": "Critical Motor Failure",
            "description": "Severe motor overheating requiring immediate attention",
            "machine_type": "cnc_milling",
            "severity": "critical",
            "failure_type": "motor",
            "probability": 0.01
        },
        {
            "name": "Sensor Interference",
            "description": "Electromagnetic interference causing noisy readings",
            "machine_type": "conveyor_belt",
            "severity": "low",
            "failure_type": "sensor",
            "probability": 0.15
        },
        {
            "name": "Belt Misalignment",
            "description": "Conveyor belt running off-track",
            "machine_type": "conveyor_belt",
            "severity": "medium",
            "failure_type": "bearing",
            "probability": 0.03
        }
    ]
    
    print("Creating sample failure modes...")
    for failure in failure_modes:
        try:
            response = requests.post(f"{BASE_URL}/failure-modes", json=failure)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created failure mode: {failure['name']} (ID: {result['id']})")
            else:
                print(f"❌ Failed to create failure mode: {failure['name']} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating failure mode {failure['name']}: {e}")

def create_sample_maintenance_tasks():
    """Create sample maintenance tasks."""
    base_time = datetime.now()
    
    maintenance_tasks = [
        {
            "title": "Weekly Lubrication - Robot Arm",
            "description": "Apply grease to all joint bearings and moving parts",
            "machine_id": "robot_01",
            "task_type": "preventive",
            "priority": "medium",
            "estimated_duration": 45,
            "cost": 50.0,
            "scheduled_date": (base_time + timedelta(days=2)).isoformat(),
            "assigned_technician": "John Smith"
        },
        {
            "title": "Bearing Replacement - Joint 2",
            "description": "Replace worn bearing in joint 2 due to vibration anomaly",
            "machine_id": "robot_01",
            "task_type": "corrective",
            "priority": "high",
            "estimated_duration": 180,
            "cost": 350.0,
            "scheduled_date": (base_time + timedelta(days=1)).isoformat(),
            "assigned_technician": "Mike Johnson"
        },
        {
            "title": "Spindle Calibration",
            "description": "Calibrate spindle speed and accuracy",
            "machine_id": "cnc_01",
            "task_type": "preventive",
            "priority": "medium",
            "estimated_duration": 90,
            "cost": 150.0,
            "scheduled_date": (base_time + timedelta(days=5)).isoformat(),
            "assigned_technician": "Sarah Davis"
        },
        {
            "title": "Tool Change",
            "description": "Replace cutting tools due to wear",
            "machine_id": "cnc_01",
            "task_type": "corrective",
            "priority": "medium",
            "estimated_duration": 30,
            "cost": 200.0,
            "scheduled_date": (base_time + timedelta(hours=6)).isoformat(),
            "assigned_technician": "Sarah Davis"
        },
        {
            "title": "Belt Tension Adjustment",
            "description": "Adjust conveyor belt tension to manufacturer specifications",
            "machine_id": "conveyor_01",
            "task_type": "preventive",
            "priority": "low",
            "estimated_duration": 30,
            "cost": 25.0,
            "scheduled_date": (base_time + timedelta(days=7)).isoformat()
        },
        {
            "title": "Motor Maintenance",
            "description": "Inspect and service conveyor motor",
            "machine_id": "conveyor_01",
            "task_type": "predictive",
            "priority": "medium",
            "estimated_duration": 120,
            "cost": 180.0,
            "scheduled_date": (base_time + timedelta(days=14)).isoformat(),
            "assigned_technician": "Alex Wilson"
        },
        {
            "title": "Quarterly Inspection - All Systems",
            "description": "Comprehensive quarterly inspection and maintenance",
            "machine_id": "robot_01",
            "task_type": "preventive",
            "priority": "high",
            "estimated_duration": 240,
            "cost": 500.0,
            "scheduled_date": (base_time + timedelta(days=30)).isoformat(),
            "assigned_technician": "Mike Johnson"
        }
    ]
    
    print("Creating sample maintenance tasks...")
    for task in maintenance_tasks:
        try:
            response = requests.post(f"{BASE_URL}/maintenance-tasks", json=task)
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Created maintenance task: {task['title']} (ID: {result['id']})")
            else:
                print(f"❌ Failed to create maintenance task: {task['title']} - Status: {response.status_code}")
        except Exception as e:
            print(f"❌ Error creating maintenance task {task['title']}: {e}")

def main():
    """Initialize the database with sample data."""
    print("🚀 Initializing Backend Database with Sample Data")
    print("="*60)
    
    # Test if server is running
    try:
        response = requests.get(f"{BASE_URL}/")
        if response.status_code != 200:
            print(f"❌ Server not responding properly. Status: {response.status_code}")
            return
    except Exception as e:
        print(f"❌ Cannot connect to backend server at {BASE_URL}")
        print(f"Error: {e}")
        print("Make sure the backend server is running!")
        return
    
    print("✅ Backend server is running")
    print()
    
    # Create sample data
    create_sample_scenarios()
    print()
    create_sample_failure_modes()
    print()
    create_sample_maintenance_tasks()
    
    print()
    print("="*60)
    print("✅ Database initialization complete!")
    print()
    print("You can now:")
    print("1. View scenarios: GET /scenarios")
    print("2. Activate scenario: POST /scenarios/{id}/activate")
    print("3. View failure modes: GET /failure-modes")
    print("4. Inject failures: POST /failure-modes/{id}/activate")
    print("5. View maintenance: GET /maintenance-tasks")
    print("6. Get upcoming tasks: GET /maintenance-tasks/upcoming")

if __name__ == "__main__":
    main()