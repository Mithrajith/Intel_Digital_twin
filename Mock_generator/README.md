# Digital Twin Demo Machine Server

## Overview

The **Demo Machine Server** is a lightweight, high-performance backend service built with **FastAPI**. It serves as a surrogate for physical industrial hardware in the Digital Twin project. 

In a real-world scenario, this server would be replaced by an IoT Gateway or an Edge Device collecting data from PLCs and sensors. For this prototype, it simulates realistic telemetry data (vibration, temperature, torque, etc.) for multiple types of industrial machinery, enabling the development and testing of the Frontend Dashboard without requiring physical access to machines.

## Project Structure

```
mock_generator/
├── main.py           # FastAPI application entry point, route definitions, and WebSocket handling
├── simulator.py      # Core physics simulation logic for generating realistic sensor data
├── requirements.txt  # Python dependencies
└── README.md         # Documentation
```

## Features & Simulation Logic

The server runs a continuous simulation loop for registered machines. It generates data using mathematical functions (sine waves, noise injection, exponential decay) to mimic real-world physical behaviors.

### Supported Machines

1.  **Robotic Arm (`robot_01`)**
    *   **Simulated Sensors**:
        *   `joint_1_angle`: Oscillating movement (Sine wave).
        *   `temperature_core`: Gradual heating with random fluctuations.
        *   `vibration_level`: Baseline vibration with periodic spikes.
        *   `power_consumption`: Correlated with movement intensity.
    *   **Use Case**: Monitoring joint health and detecting overheating.

2.  **CNC Milling Machine (`cnc_01`)**
    *   **Simulated Sensors**:
        *   `spindle_speed`: High RPM values with load variations.
        *   `tool_temperature`: Simulates warm-up curves (Exponential rise).
        *   `axis_x/y/z_position`: Tool path tracking.
        *   `vibration_spindle`: High-frequency noise indicating cutting load.
    *   **Use Case**: Predictive maintenance for tool wear and spindle health.

3.  **Conveyor Belt (`conveyor_01`)**
    *   **Simulated Sensors**:
        *   `belt_speed`: Constant speed with minor slippage noise.
        *   `motor_load`: Varies based on "items processed".
        *   `bearing_temperature`: Slow thermal inertia.
    *   **Use Case**: Throughput monitoring and motor fault detection.

## Prerequisites

- **Python 3.8+**
- **pip** (Python Package Manager)

## Installation & Setup

1.  **Navigate to the server directory**:
    ```bash
    cd mock_generator
    ```

2.  **Create a Virtual Environment** (Recommended to isolate dependencies):
    *   **Windows**:
        ```powershell
        python -m venv venv
        .\venv\Scripts\activate
        ```
    *   **macOS/Linux**:
        ```bash
        python3 -m venv venv
        source venv/bin/activate
        ```

3.  **Install Dependencies**:
    ```bash
    pip install -r requirements.txt
    ```

## Running the Server

Start the server using `uvicorn` (ASGI server):

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 7000
```

*   `--reload`: Enables auto-restart on code changes (dev mode).
*   `--host 0.0.0.0`: Makes the server accessible from other devices on the network.

**Console Output:**
You should see:
```
INFO:     Uvicorn running on http://0.0.0.0:7000 (Press CTRL+C to quit)
```

## API Documentation

### REST Endpoints

| Method | Endpoint | Description | Response Example |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Health check | `{"message": "Welcome..."}` |
| `GET` | `/machines` | List all available machines | `[{"id": "robot_01", "type": "robotic_arm"}, ...]` |
| `GET` | `/machines/{id}/data` | Get a single data snapshot | `{"machine_id": "robot_01", "temperature": 45.2, ...}` |

### WebSocket Endpoints

**URL**: `ws://localhost:7000/ws/machines/{machine_id}`

*   **Description**: Establishes a persistent connection to stream data in real-time (approx. 10Hz).
*   **Behavior**:
    *   On Connect: Server accepts connection.
    *   Loop: Sends JSON data packet every 0.1s.
    *   On Disconnect: Server handles cleanup and logs the event.

## Frontend Integration

The React Frontend connects to this server using the `useSimulatedSensor` hook.

1.  **Discovery**: The dashboard calls `GET /machines` to populate the machine selector dropdown.
2.  **Streaming**: When a user selects a machine and clicks "Start Stream", the frontend opens a WebSocket connection to the corresponding URL.
3.  **Data Mapping**: The frontend maps the raw backend keys (e.g., `temperature_core`) to the UI component props (e.g., `temperature`).

## Troubleshooting

*   **"Connection Refused"**: Ensure the server is running. Check if port 7000 is occupied.
*   **"Machine Not Found"**: Verify you are using a valid ID from the `/machines` list.
*   **CORS Errors**: The server is configured with `allow_origins=["*"]` for development. For production, restrict this to your frontend domain.
