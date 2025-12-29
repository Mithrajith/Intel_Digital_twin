import requests
import json
import time

def verify_logs_endpoint():
    url = "http://localhost:8000/logs"
    print(f"\nFetching {url}...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"Log entries: {len(data)}")
            if len(data) > 0:
                print("First log:", json.dumps(data[0], indent=2))
                # Verify fields
                required = ['id', 'timestamp', 'event', 'machine_id', 'type', 'user']
                if all(k in data[0] for k in required):
                    print("SUCCESS: Logs endpoint returns valid format.")
                else:
                    print(f"FAILURE: Logs missing keys. Found: {data[0].keys()}")
            else:
                 print("WARNING: Logs empty (sim might just started).")
        else:
            print(f"FAILURE: Logs endpoint returned {response.status_code}")
    except Exception as e:
        print(f"FAILURE: Logs request failed: {e}")

def verify_sensor_data_endpoint():
    url = "http://localhost:8000/sensor-data"
    print(f"\nFetching {url}...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print(f"Sensor data points: {len(data)}")
            if len(data) > 0:
                print("First point:", json.dumps(data[0], indent=2))
                # Logs.jsx expects: timestamp, temperature, vibration, pressure, prediction
                required = ['timestamp', 'temperature', 'vibration', 'pressure']
                if all(k in data[0] for k in required):
                    print("SUCCESS: Sensor data endpoint returns valid format.")
                else:
                    print(f"FAILURE: Sensor data missing keys. Found: {data[0].keys()}")
            else:
                 print("WARNING: Sensor data empty.")
        else:
            print(f"FAILURE: Sensor data endpoint returned {response.status_code}")
    except Exception as e:
        print(f"FAILURE: Sensor data request failed: {e}")

def verify_fault_injection():
    url = "http://localhost:8000/machine/control"
    payload = {
        "command": "inject_fault",
        "parameters": {
            "type": "temperature",
            "severity": 0.8
        }
    }
    print(f"\nInjecting Fault to {url}...")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
             print("Control Response:", json.dumps(response.json(), indent=2))
             print("SUCCESS: Fault injection accepted.")
        else:
             print(f"FAILURE: Fault injection returned {response.status_code}")
             print(response.text)
    except Exception as e:
        print(f"FAILURE: Fault injection request failed: {e}")

if __name__ == "__main__":
    # Wait for sim to generate some logs
    print("Waiting for simulation to generate logs...")
    time.sleep(3)
    
    # Start sim first just in case
    try:
        requests.post("http://localhost:8000/machine/control", json={"command": "start"})
    except:
        pass
        
    time.sleep(2)
    verify_logs_endpoint()
    verify_sensor_data_endpoint()
    verify_fault_injection()
