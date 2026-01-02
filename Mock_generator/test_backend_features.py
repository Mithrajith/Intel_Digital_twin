#!/usr/bin/env python3
"""
Comprehensive test suite for backend features:
- Multi-scenario simulation
- Failure mode injection
- Maintenance scheduling
"""

import asyncio
import json
import requests
import websockets
from datetime import datetime, timedelta
from typing import List, Dict, Any
import time

BASE_URL = "http://localhost:7000"
WS_URL = "ws://localhost:7000"

class BackendTester:
    def __init__(self):
        self.session = requests.Session()
        self.test_results = []

    def log_test(self, test_name: str, success: bool, message: str = ""):
        """Log test results."""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        self.test_results.append({
            "test": test_name,
            "success": success,
            "message": message,
            "timestamp": datetime.now().isoformat()
        })

    def test_basic_endpoints(self):
        """Test basic API endpoints."""
        print("\n=== Testing Basic Endpoints ===")
        
        # Test root endpoint
        try:
            response = self.session.get(f"{BASE_URL}/")
            self.log_test("Root Endpoint", response.status_code == 200, f"Status: {response.status_code}")
        except Exception as e:
            self.log_test("Root Endpoint", False, str(e))

        # Test machines list
        try:
            response = self.session.get(f"{BASE_URL}/machines")
            machines = response.json()
            self.log_test("List Machines", response.status_code == 200 and len(machines) > 0, 
                         f"Found {len(machines)} machines")
        except Exception as e:
            self.log_test("List Machines", False, str(e))

    def test_simulation_scenarios(self):
        """Test simulation scenarios functionality."""
        print("\n=== Testing Simulation Scenarios ===")
        
        # Create test scenarios
        scenarios = [
            {
                "name": "High Load Test",
                "description": "Simulate high operational load conditions",
                "machine_type": "robotic_arm",
                "parameters": {"type": "high_load", "load_factor": 1.3}
            },
            {
                "name": "Low Temperature Environment",
                "description": "Cold environment simulation",
                "machine_type": "cnc_milling",
                "parameters": {"type": "low_temperature", "temp_offset": -15}
            },
            {
                "name": "High Speed Operation",
                "description": "High speed manufacturing mode",
                "machine_type": "conveyor_belt",
                "parameters": {"type": "high_speed", "speed_multiplier": 1.2}
            }
        ]

        created_scenarios = []

        # Create scenarios
        for scenario_data in scenarios:
            try:
                response = self.session.post(f"{BASE_URL}/scenarios", json=scenario_data)
                if response.status_code == 200:
                    scenario = response.json()
                    created_scenarios.append(scenario)
                    self.log_test(f"Create Scenario: {scenario_data['name']}", True, 
                                 f"ID: {scenario['id']}")
                else:
                    self.log_test(f"Create Scenario: {scenario_data['name']}", False, 
                                 f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Create Scenario: {scenario_data['name']}", False, str(e))

        # List scenarios
        try:
            response = self.session.get(f"{BASE_URL}/scenarios")
            scenarios_list = response.json()
            self.log_test("List Scenarios", response.status_code == 200, 
                         f"Found {len(scenarios_list)} scenarios")
        except Exception as e:
            self.log_test("List Scenarios", False, str(e))

        # Activate a scenario
        if created_scenarios:
            try:
                scenario_id = created_scenarios[0]['id']
                response = self.session.post(f"{BASE_URL}/scenarios/{scenario_id}/activate")
                self.log_test("Activate Scenario", response.status_code == 200,
                             f"Activated scenario {scenario_id}")
            except Exception as e:
                self.log_test("Activate Scenario", False, str(e))

    def test_failure_modes(self):
        """Test failure mode injection functionality."""
        print("\n=== Testing Failure Modes ===")
        
        failure_modes = [
            {
                "name": "Bearing Degradation",
                "description": "Gradual bearing wear causing increased vibration",
                "machine_type": "robotic_arm",
                "severity": "medium",
                "failure_type": "bearing",
                "probability": 0.15
            },
            {
                "name": "Motor Overheating",
                "description": "Motor running hot due to insufficient cooling",
                "machine_type": "cnc_milling",
                "severity": "high",
                "failure_type": "motor",
                "probability": 0.08
            },
            {
                "name": "Sensor Malfunction",
                "description": "Noisy sensor readings due to electromagnetic interference",
                "machine_type": "conveyor_belt",
                "severity": "low",
                "failure_type": "sensor",
                "probability": 0.25
            }
        ]

        created_failures = []

        # Create failure modes
        for failure_data in failure_modes:
            try:
                response = self.session.post(f"{BASE_URL}/failure-modes", json=failure_data)
                if response.status_code == 200:
                    failure = response.json()
                    created_failures.append(failure)
                    self.log_test(f"Create Failure Mode: {failure_data['name']}", True,
                                 f"ID: {failure['id']}")
                else:
                    self.log_test(f"Create Failure Mode: {failure_data['name']}", False,
                                 f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Create Failure Mode: {failure_data['name']}", False, str(e))

        # List failure modes
        try:
            response = self.session.get(f"{BASE_URL}/failure-modes")
            failures_list = response.json()
            self.log_test("List Failure Modes", response.status_code == 200,
                         f"Found {len(failures_list)} failure modes")
        except Exception as e:
            self.log_test("List Failure Modes", False, str(e))

        # Activate failure modes
        for failure in created_failures:
            try:
                failure_id = failure['id']
                response = self.session.post(f"{BASE_URL}/failure-modes/{failure_id}/activate")
                self.log_test(f"Activate Failure: {failure['name']}", response.status_code == 200)
            except Exception as e:
                self.log_test(f"Activate Failure: {failure['name']}", False, str(e))

        # Deactivate a failure mode
        if created_failures:
            try:
                failure_id = created_failures[0]['id']
                response = self.session.post(f"{BASE_URL}/failure-modes/{failure_id}/deactivate")
                self.log_test("Deactivate Failure", response.status_code == 200)
            except Exception as e:
                self.log_test("Deactivate Failure", False, str(e))

    def test_maintenance_tasks(self):
        """Test maintenance scheduling functionality."""
        print("\n=== Testing Maintenance Tasks ===")
        
        # Create test maintenance tasks
        base_time = datetime.now()
        maintenance_tasks = [
            {
                "title": "Bearing Replacement",
                "description": "Replace worn bearings in joint 2",
                "machine_id": "robot_01",
                "task_type": "corrective",
                "priority": "high",
                "estimated_duration": 120,  # minutes
                "cost": 250.0,
                "scheduled_date": (base_time + timedelta(days=1)).isoformat(),
                "assigned_technician": "Tech A"
            },
            {
                "title": "Preventive Lubrication",
                "description": "Apply lubrication to all moving parts",
                "machine_id": "cnc_01",
                "task_type": "preventive",
                "priority": "medium",
                "estimated_duration": 45,
                "cost": 50.0,
                "scheduled_date": (base_time + timedelta(days=3)).isoformat(),
                "assigned_technician": "Tech B"
            },
            {
                "title": "Belt Tension Adjustment",
                "description": "Adjust conveyor belt tension",
                "machine_id": "conveyor_01",
                "task_type": "predictive",
                "priority": "low",
                "estimated_duration": 30,
                "cost": 25.0,
                "scheduled_date": (base_time + timedelta(days=7)).isoformat()
            }
        ]

        created_tasks = []

        # Create maintenance tasks
        for task_data in maintenance_tasks:
            try:
                response = self.session.post(f"{BASE_URL}/maintenance-tasks", json=task_data)
                if response.status_code == 200:
                    task = response.json()
                    created_tasks.append(task)
                    self.log_test(f"Create Maintenance Task: {task_data['title']}", True,
                                 f"ID: {task['id']}")
                else:
                    self.log_test(f"Create Maintenance Task: {task_data['title']}", False,
                                 f"Status: {response.status_code}")
            except Exception as e:
                self.log_test(f"Create Maintenance Task: {task_data['title']}", False, str(e))

        # List all maintenance tasks
        try:
            response = self.session.get(f"{BASE_URL}/maintenance-tasks")
            tasks_list = response.json()
            self.log_test("List Maintenance Tasks", response.status_code == 200,
                         f"Found {len(tasks_list)} tasks")
        except Exception as e:
            self.log_test("List Maintenance Tasks", False, str(e))

        # List tasks for specific machine
        try:
            response = self.session.get(f"{BASE_URL}/maintenance-tasks?machine_id=robot_01")
            robot_tasks = response.json()
            self.log_test("Filter Tasks by Machine", response.status_code == 200,
                         f"Found {len(robot_tasks)} tasks for robot_01")
        except Exception as e:
            self.log_test("Filter Tasks by Machine", False, str(e))

        # Get upcoming maintenance
        try:
            response = self.session.get(f"{BASE_URL}/maintenance-tasks/upcoming?days_ahead=10")
            upcoming_tasks = response.json()
            self.log_test("Get Upcoming Maintenance", response.status_code == 200,
                         f"Found {len(upcoming_tasks)} upcoming tasks")
        except Exception as e:
            self.log_test("Get Upcoming Maintenance", False, str(e))

        # Update a maintenance task
        if created_tasks:
            try:
                task_id = created_tasks[0]['id']
                update_data = {
                    "status": "in_progress",
                    "assigned_technician": "Tech C"
                }
                response = self.session.put(f"{BASE_URL}/maintenance-tasks/{task_id}", json=update_data)
                self.log_test("Update Maintenance Task", response.status_code == 200)
            except Exception as e:
                self.log_test("Update Maintenance Task", False, str(e))

    async def test_websocket_data_with_scenarios(self):
        """Test WebSocket data streaming with scenarios and failures active."""
        print("\n=== Testing WebSocket with Active Scenarios/Failures ===")
        
        try:
            uri = f"{WS_URL}/ws/machines/robot_01"
            async with websockets.connect(uri) as websocket:
                print("Connected to WebSocket")
                
                # Collect some data samples
                samples = []
                for i in range(10):
                    data = await websocket.recv()
                    sample = json.loads(data)
                    samples.append(sample)
                    
                    if i % 3 == 0:  # Print every 3rd sample
                        print(f"Sample {i+1}: Temp={sample.get('temperature_core', 'N/A'):.1f}, "
                              f"Vibration={sample.get('vibration_level', 'N/A'):.2f}")
                
                # Check if we received valid data
                self.log_test("WebSocket Data Stream", len(samples) == 10,
                             f"Received {len(samples)} samples")
                
                # Verify scenario effects are present (should have higher values due to active scenario)
                if samples:
                    avg_temp = sum(s.get('temperature_core', 0) for s in samples) / len(samples)
                    self.log_test("Scenario Effects Active", avg_temp > 45,
                                 f"Average temperature: {avg_temp:.1f}°C (should be elevated)")

        except Exception as e:
            self.log_test("WebSocket with Scenarios/Failures", False, str(e))

    def test_data_export_simulation(self):
        """Simulate data export by collecting and formatting sensor data."""
        print("\n=== Testing Data Export Simulation ===")
        
        try:
            # Collect data from all machines
            machines = ["robot_01", "cnc_01", "conveyor_01"]
            export_data = []
            
            for machine_id in machines:
                response = self.session.get(f"{BASE_URL}/machines/{machine_id}/data")
                if response.status_code == 200:
                    data = response.json()
                    export_data.append(data)
            
            # Simulate CSV export format
            if export_data:
                csv_headers = ["timestamp", "machine_id", "status"]
                # Get all unique sensor keys
                sensor_keys = set()
                for data in export_data:
                    sensor_keys.update(k for k in data.keys() if k not in csv_headers)
                
                csv_headers.extend(sorted(sensor_keys))
                
                self.log_test("Data Export Format", len(csv_headers) > 3,
                             f"Export would include {len(csv_headers)} columns")
                
                # Simulate JSON export
                json_export = {
                    "export_timestamp": datetime.now().isoformat(),
                    "machines_count": len(export_data),
                    "data": export_data
                }
                
                self.log_test("JSON Export Format", len(json_export["data"]) == len(machines),
                             f"JSON export ready with {len(export_data)} machine records")
            
        except Exception as e:
            self.log_test("Data Export Simulation", False, str(e))

    def generate_test_report(self):
        """Generate a comprehensive test report."""
        print("\n" + "="*60)
        print("BACKEND FEATURES TEST REPORT")
        print("="*60)
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print(f"Total Tests: {total_tests}")
        print(f"Passed: {passed_tests} ✅")
        print(f"Failed: {failed_tests} ❌")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result['success']:
                    print(f"  • {result['test']}: {result['message']}")
        
        print("\nFeature Status:")
        features = {
            "Multi-scenario Simulation": any("Scenario" in r['test'] for r in self.test_results if r['success']),
            "Failure Mode Injection": any("Failure" in r['test'] for r in self.test_results if r['success']),
            "Maintenance Scheduling": any("Maintenance" in r['test'] for r in self.test_results if r['success']),
            "WebSocket Integration": any("WebSocket" in r['test'] for r in self.test_results if r['success']),
            "Data Export Ready": any("Export" in r['test'] for r in self.test_results if r['success'])
        }
        
        for feature, status in features.items():
            status_icon = "✅" if status else "❌"
            print(f"  {status_icon} {feature}")

async def main():
    """Run the complete backend test suite."""
    print("🚀 Starting Backend Features Test Suite")
    print("Make sure the backend server is running on http://localhost:7000")
    
    tester = BackendTester()
    
    # Run synchronous tests
    tester.test_basic_endpoints()
    tester.test_simulation_scenarios()
    tester.test_failure_modes()
    tester.test_maintenance_tasks()
    tester.test_data_export_simulation()
    
    # Run asynchronous WebSocket tests
    await tester.test_websocket_data_with_scenarios()
    
    # Generate final report
    tester.generate_test_report()

if __name__ == "__main__":
    asyncio.run(main())