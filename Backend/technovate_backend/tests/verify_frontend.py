
import asyncio
import websockets
import json
import requests
import time

async def verify_websocket():
    uri = "ws://localhost:8000/ws/machines/armpi_fpv_01"
    print(f"Connecting to {uri}...")
    try:
        async with websockets.connect(uri) as websocket:
            # Wait for a message
            message = await asyncio.wait_for(websocket.recv(), timeout=5.0)
            data = json.loads(message)
            print("WebSocket Data Received:")
            print(json.dumps(data, indent=2))
            
            # Verify ML fields
            ml_fields = ['anomaly_score', 'failure_probability', 'rul_hours']
            missing = [f for f in ml_fields if f not in data]
            if missing:
                print(f"FAILURE: WebSocket missing fields: {missing}")
            else:
                print("SUCCESS: WebSocket contains all ML fields.")
                
    except Exception as e:
        print(f"FAILURE: WebSocket connection failed: {e}")

def verify_health_endpoint():
    url = "http://localhost:8000/machine/health"
    print(f"\nFetching {url}...")
    try:
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            print("Health API Data:")
            print(json.dumps(data, indent=2))
            
            # Verify fields
            if 'anomaly_score' in data and 'failure_probability' in data:
                 print("SUCCESS: Health endpoint returns ML data.")
            else:
                 print("FAILURE: Health endpoint missing ML data.")
        else:
            print(f"FAILURE: Health endpoint returned {response.status_code}")
    except Exception as e:
        print(f"FAILURE: Health endpoint request failed: {e}")

def verify_shap_endpoint():
    url = "http://localhost:8000/explain/failure"
    # payload from frontend Dashboard.jsx logic
    payload = {
        "temperature": 60.0,
        "vibration": 0.5,
        "power": 100.0,
        "velocity": 0.1,
        "torque": 0.5,
        "angle": 1.57
    }
    print(f"\nPosting to {url}...")
    try:
        response = requests.post(url, json=payload)
        if response.status_code == 200:
            data = response.json()
            # print("SHAP Data:", json.dumps(data, indent=2))
            if 'shap_values' in data:
                print("SUCCESS: SHAP endpoint returned shap_values.")
            else:
                print("FAILURE: SHAP response missing values.")
        else:
            print(f"FAILURE: SHAP endpoint returned {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"FAILURE: SHAP endpoint request failed: {e}")

async def main():
    # Wait a bit for backend to be ready if we just started it (manual check generally)
    await verify_websocket()
    verify_health_endpoint()
    verify_shap_endpoint()

if __name__ == "__main__":
    asyncio.run(main())
