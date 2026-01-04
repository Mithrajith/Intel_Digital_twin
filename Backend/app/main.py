"""FastAPI application for Technovate Digital Twin backend."""
# Trigger reload for data update
from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import asyncio
import time
import pandas as pd
from io import StringIO
from pathlib import Path
import math
import numpy as np

from .config import settings
from .models.schemas import (
    MachineMetadata, MachineState, HealthPrediction,
    ControlCommand, ControlResponse, JointInfo, JointState, Log
)
from .simulation.urdf_parser import URDFParser
from .simulation.physics_sim import PhysicsSimulator
from .simulation.real_data_sim import RealDataSimulator
from .simulation.sensor_generator import SensorGenerator
from .simulation.rom import ReducedOrderModel
from .ml.preprocessing import FeatureEngineer
from .ml.anomaly_detector import AnomalyDetector
from .ml.failure_predictor import FailurePredictor
from .ml.rul_estimator import RULEstimator


# Global state
class AppState:
    """Application state container."""
    urdf_parser: URDFParser = None
    simulator: PhysicsSimulator = None
    sensor_gen: SensorGenerator = None
    rom: ReducedOrderModel = None
    feature_eng: FeatureEngineer = None
    anomaly_detector: AnomalyDetector = None
    failure_predictor: FailurePredictor = None
    rul_estimator: RULEstimator = None
    sensor_logs: list = []
    system_logs: list = []
    last_alert_log_time: dict = {}  # Track last log time for alerts to prevent flooding
    is_running: bool = False
    simulation_task: asyncio.Task = None


state = AppState()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle management for the application."""
    # Startup
    print("Starting Technovate Digital Twin Backend...")
    
    # Copy URDF file if needed
    # Dynamic path resolution
    BASE_DIR = Path(__file__).resolve().parent
    # Go up 2 levels: app -> Backend
    BACKEND_DIR = BASE_DIR.parent
    urdf_source = BACKEND_DIR / "create_multibody_from_urdf" / "armpi_fpv" / "armpi_fpv.urdf"
    
    if urdf_source.exists() and not settings.urdf_path.exists():
        import shutil
        settings.urdf_path.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy(urdf_source, settings.urdf_path)
        print(f"Copied URDF to {settings.urdf_path}")
    elif not settings.urdf_path.exists():
        print(f"Warning: URDF file not found at expected location: {urdf_source}")
        print(f"Please ensure URDF file exists at: {settings.urdf_path}")
    
    # Initialize URDF parser
    state.urdf_parser = URDFParser(settings.urdf_path)
    if not state.urdf_parser.parse():
        raise RuntimeError("Failed to parse URDF file")
    print(f"Loaded URDF: {state.urdf_parser.robot_name}")
    
    # Initialize simulation
    if settings.use_real_data:
        print(f"Using Real Data Simulator from {settings.real_data_path}")
        state.simulator = RealDataSimulator(state.urdf_parser, settings.real_data_path, settings.simulation_frequency)
    else:
        print("Using Synthetic Physics Simulator")
        state.simulator = PhysicsSimulator(state.urdf_parser, settings.simulation_frequency)
        
    state.sensor_gen = SensorGenerator(state.simulator)
    state.rom = ReducedOrderModel(settings.rom_reduction_factor)
    print("Simulation initialized")
    
    # Initialize ML components
    state.feature_eng = FeatureEngineer(window_size=10)
    state.anomaly_detector = AnomalyDetector()
    state.failure_predictor = FailurePredictor()
    state.rul_estimator = RULEstimator()
    print("ML components initialized")
    
    # Try to load pre-trained models
    try:
        state.anomaly_detector.load()
        state.failure_predictor.load()
        state.rul_estimator.load()
        print("Loaded pre-trained models")
    except FileNotFoundError:
        print("No pre-trained models found. Training with synthetic data...")
        # Generate synthetic training data
        n_samples = 1000
        X_train = []
        y_failure = []
        y_rul = []
        
        for _ in range(n_samples):
            # Step simulation to get varied data
            state.simulator.step()
            sensor_data = state.sensor_gen.generate()
            
            # Extract features
            # Use same feature set as get_machine_health
            joint_states = state.simulator.get_joint_states()
            num_joints = len(joint_states)
            if num_joints > 0:
                avg_temp = sum(sensor_data.joint_temperatures.values()) / len(sensor_data.joint_temperatures)
                avg_velocity = sum(abs(js.velocity) for js in joint_states) / num_joints
                avg_torque = sum(abs(js.torque) for js in joint_states) / num_joints
            else:
                avg_temp = 25.0
                avg_velocity = 0.0
                avg_torque = 0.0

            current_features = {
                'temperature': avg_temp,
                'vibration': sensor_data.overall_vibration,
                'power': sensor_data.power_consumption,
                'velocity': avg_velocity,
                'torque': avg_torque,
            }
            
            # Add to feature engineer to update buffers
            state.feature_eng.add_sample(current_features)
            features = state.feature_eng.extract_features(current_features)
            
            if features is not None:
                X_train.append(features)
                # Simulate failure labels (random for now)
                y_failure.append(np.random.choice([0, 1], p=[0.9, 0.1]))
                # Simulate RUL (remaining useful life in hours)
                y_rul.append(np.random.uniform(0, 1000))
        
        if X_train:
            # Prepare features for ML (scaling)
            # We need to fit the scaler on the whole dataset
            df_train = pd.DataFrame(X_train)
            df_train = df_train.fillna(0)
            
            # Fit scaler
            state.feature_eng.scaler.fit(df_train)
            state.feature_eng.is_fitted = True
            
            # Transform
            X_train_scaled = state.feature_eng.scaler.transform(df_train)
            
            y_failure = np.array(y_failure)
            y_rul = np.array(y_rul)
            
            # Train models
            state.anomaly_detector.train(X_train_scaled)
            state.failure_predictor.train(X_train_scaled, y_failure)
            state.rul_estimator.train(X_train_scaled, y_rul)
            
            # Save models
            state.anomaly_detector.save()
            state.failure_predictor.save()
            state.rul_estimator.save()
            print("Trained and saved models with synthetic data")
        else:
            print("Failed to generate training data")
    
    # Start simulation loop
    state.is_running = True
    state.simulation_task = asyncio.create_task(simulation_loop())
    
    # Log startup
    state.system_logs.append(Log(
        id=1,
        timestamp=time.time() * 1000,
        event="System Started",
        type="info",
        user="System",
        machine_id="armpi_fpv_01"
    ))

    yield
    
    # Shutdown
    print("Shutting down...")
    state.is_running = False
    if state.simulation_task:
        state.simulation_task.cancel()
        try:
            await state.simulation_task
        except asyncio.CancelledError:
            pass


async def simulation_loop():
    """Background task for running simulation."""
    while state.is_running:
        try:
            # Step simulation
            state.simulator.step()
            
            # Generate sensor data
            sensor_data = state.sensor_gen.generate()
            
            # Log sensor data
            log_entry = {
                'timestamp': sensor_data.timestamp,
                'overall_vibration': sensor_data.overall_vibration,
                'power_consumption': sensor_data.power_consumption,
            }
            
            # Add joint-specific data
            joint_states = state.simulator.get_joint_states()
            for i, js in enumerate(joint_states):
                log_entry[f'joint_{i}_angle'] = js.angle
                log_entry[f'joint_{i}_velocity'] = js.velocity
                log_entry[f'joint_{i}_torque'] = js.torque
                log_entry[f'joint_{i}_temperature'] = sensor_data.joint_temperatures.get(js.name, 25.0)
                log_entry[f'joint_{i}_vibration'] = sensor_data.joint_vibrations.get(js.name, 0.0)
            
            state.sensor_logs.append(log_entry)
            
            # Keep only last 10000 logs
            if len(state.sensor_logs) > 10000:
                state.sensor_logs = state.sensor_logs[-10000:]
            
            # Sleep to match simulation frequency
            await asyncio.sleep(1.0 / settings.simulation_frequency)
            
        except Exception as e:
            print(f"Error in simulation loop: {e}")
            await asyncio.sleep(1.0)


# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="Backend API for Technovate Digital Twin - Predictive Maintenance",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve URDF and Meshes
@app.get("/urdf")
async def get_urdf():
    """Serve the URDF file directly."""
    if not settings.urdf_path.exists():
        raise HTTPException(status_code=404, detail="URDF file not found")
    return FileResponse(str(settings.urdf_path), media_type='application/xml')

# Try to locate meshes directory relative to URDF
# Assuming standard structure: .../package_name/urdf/robot.urdf and .../package_name/meshes/
meshes_path = settings.urdf_path.parent.parent / "meshes"
if meshes_path.exists():
    app.mount("/meshes", StaticFiles(directory=str(meshes_path)), name="meshes")


@app.get("/")
async def root():
    """API information."""
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "status": "running" if state.is_running else "stopped",
        "endpoints": [
            "/machines",
            "/machine/meta",
            "/machine/state",
            "/machine/health",
            "/machine/control",
            "/logs/export",
            "/ws/machines/{machine_id}"
        ]
    }


@app.get("/machines")
async def list_machines():
    """List available machines (frontend compatibility)."""
    return [
        {
            "id": "armpi_fpv_01",
            "type": "robotic_arm"
        }
    ]


@app.get("/machine/meta", response_model=MachineMetadata)
async def get_machine_metadata():
    """Get machine metadata from URDF."""
    if not state.urdf_parser:
        raise HTTPException(status_code=503, detail="URDF not loaded")
    
    metadata = state.urdf_parser.get_metadata_dict()
    
    return MachineMetadata(
        machine_id="armpi_fpv_01",
        machine_type="robotic_arm",
        num_joints=metadata['num_joints'],
        joints=[JointInfo(**j) for j in metadata['joints']],
        links=metadata['links']
    )


@app.get("/machine/state")
async def get_machine_state():
    """Get current machine state with both structured and flat formats."""
    if not state.simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")
    
    joint_states = state.simulator.get_joint_states()
    sensor_data = state.sensor_gen.generate()
    
    # Structured format (original)
    structured_joints = [
        {
            "name": js.name,
            "angle": js.angle,
            "velocity": js.velocity,
            "torque": js.torque,
            "temperature": sensor_data.joint_temperatures.get(js.name, 25.0)
        }
        for js in joint_states
    ]
    
    # Flat format for frontend compatibility
    flat_data = {}
    for i, js in enumerate(joint_states, 1):
        flat_data[f"joint_{i}_angle"] = js.angle * (180 / math.pi)  # Convert to degrees
        flat_data[f"joint_{i}_velocity"] = js.velocity
        flat_data[f"joint_{i}_torque"] = js.torque
        flat_data[f"joint_{i}_temperature"] = sensor_data.joint_temperatures.get(js.name, 25.0)
    
    # Add aggregate metrics
    flat_data["temperature_core"] = sum(sensor_data.joint_temperatures.values()) / len(sensor_data.joint_temperatures)
    flat_data["vibration_level"] = sensor_data.overall_vibration
    flat_data["power_consumption"] = sensor_data.power_consumption
    
    return {
        "machine_id": "armpi_fpv_01",
        "timestamp": time.time(),
        "status": "running" if state.is_running else "stopped",
        "uptime_seconds": state.simulator.sim_time,
        "joints": structured_joints,
        "vibration_level": sensor_data.overall_vibration,
        # Flat format fields for frontend
        **flat_data
    }


@app.get("/machine/health", response_model=HealthPrediction)
async def get_machine_health():
    """Get health predictions."""
    if not state.simulator:
        raise HTTPException(status_code=503, detail="Simulator not initialized")
    
    # Get current sensor data
    sensor_data = state.sensor_gen.generate()
    joint_states = state.simulator.get_joint_states()
    
    # Prepare features
    num_joints = len(joint_states)
    if num_joints > 0:
        avg_temp = sum(sensor_data.joint_temperatures.values()) / len(sensor_data.joint_temperatures)
        avg_velocity = sum(abs(js.velocity) for js in joint_states) / num_joints
        avg_torque = sum(abs(js.torque) for js in joint_states) / num_joints
    else:
        avg_temp = 25.0
        avg_velocity = 0.0
        avg_torque = 0.0

    current_features = {
        'temperature': avg_temp,
        'vibration': sensor_data.overall_vibration,
        'power': sensor_data.power_consumption,
        'velocity': avg_velocity,
        'torque': avg_torque,
    }
    
    # Add to feature engineer
    state.feature_eng.add_sample(current_features)
    features = state.feature_eng.extract_features(current_features)
    X = state.feature_eng.prepare_for_ml(features)
    
    # Default predictions if models not trained
    anomaly_score = 0.0
    failure_prob = 0.0
    rul_hours = 1000.0
    
    try:
        if state.anomaly_detector.is_trained:
            anomaly_score = state.anomaly_detector.predict(X)
        
        if state.failure_predictor.is_trained:
            failure_prob = state.failure_predictor.predict_proba(X)
        
        if state.rul_estimator.is_trained:
            rul_hours = state.rul_estimator.predict(X)
    except Exception as e:
        print(f"Prediction error: {e}")
    
    # Determine health status
    if failure_prob > 0.7 or rul_hours < 50:
        health_status = "critical"
    elif failure_prob > 0.4 or rul_hours < 100:
        health_status = "warning"
    else:
        health_status = "healthy"
    
    # Generate alerts
    alerts = []
    if anomaly_score > 0.7:
        alerts.append("Critical anomaly score detected")
    elif anomaly_score > 0.4:
        alerts.append("Elevated anomaly score detected")
        
    if failure_prob > 0.7:
        alerts.append("High failure probability")
    elif failure_prob > 0.4:
        alerts.append("Elevated failure risk")
        
    if rul_hours < 50:
        alerts.append(f"Critical RUL: {rul_hours:.1f} hours remaining")
    elif rul_hours < 100:
        alerts.append(f"Low RUL: {rul_hours:.1f} hours remaining")
    
    # Component health (per joint)
    component_health = {}
    for js in joint_states:
        temp = sensor_data.joint_temperatures.get(js.name, 25.0)
        vib = sensor_data.joint_vibrations.get(js.name, 0.0)
        
        # Simple health score based on temperature and vibration
        health = 1.0 - (temp - 25.0) / 55.0 - vib / 2.0
        component_health[js.name] = max(0.0, min(1.0, health))
    
    return HealthPrediction(
        machine_id="armpi_fpv_01",
        timestamp=time.time(),
        anomaly_score=anomaly_score,
        failure_probability=failure_prob,
        rul_hours=rul_hours,
        health_status=health_status,
        alerts=alerts,
        component_health=component_health
    )


@app.post("/machine/control", response_model=ControlResponse)
async def control_machine(command: ControlCommand):
    """Control machine operation."""
    success = False
    message = ""
    
    if command.command == "start":
        if not state.is_running:
            state.is_running = True
            state.simulation_task = asyncio.create_task(simulation_loop())
            success = True
            message = "Simulation started"
        else:
            message = "Simulation already running"
            success = True
    
    elif command.command == "stop":
        if state.is_running:
            state.is_running = False
            if state.simulation_task:
                state.simulation_task.cancel()
            success = True
            message = "Simulation stopped"
        else:
            message = "Simulation already stopped"
            success = True
    
    elif command.command == "reset":
        state.simulator.reset()
        state.sensor_gen.reset()
        state.sensor_logs.clear()
        success = True
        message = "Simulation reset"
    
    elif command.command == "inject_fault":
        fault_type = command.parameters.get("type", "temperature") if command.parameters else "temperature"
        severity = command.parameters.get("severity", 0.5) if command.parameters else 0.5
        state.sensor_gen.inject_fault(fault_type, severity)
        success = True
        message = f"Injected {fault_type} fault with severity {severity}"
    
    else:
        raise HTTPException(status_code=400, detail=f"Unknown command: {command.command}")
    
    # Log the command
    state.system_logs.append(Log(
        id=len(state.system_logs) + 1,
        timestamp=time.time() * 1000,  # JS expects ms
        event=message,
        type="info" if success else "error",
        user="Operator",
        machine_id="armpi_fpv_01"
    ))

    return ControlResponse(
        success=success,
        message=message,
        timestamp=time.time()
    )


@app.get("/logs", response_model=list[Log])
async def get_logs():
    """Get system logs."""
    # Return logs sorted by timestamp desc
    return sorted(state.system_logs, key=lambda x: x.timestamp, reverse=True)


@app.get("/sensor-data")
async def get_sensor_data():
    """Get historical sensor data for playback."""
    # Return sensor logs sorted by timestamp
    return sorted(state.sensor_logs, key=lambda x: x['timestamp'])


@app.get("/logs/export")
async def export_logs(start_time: float = None, end_time: float = None):
    """Export sensor logs as CSV."""
    if not state.sensor_logs:
        raise HTTPException(status_code=404, detail="No logs available")
    
    # Filter logs by time range
    logs = state.sensor_logs
    if start_time is not None:
        logs = [log for log in logs if log['timestamp'] >= start_time]
    if end_time is not None:
        logs = [log for log in logs if log['timestamp'] <= end_time]
    
    if not logs:
        raise HTTPException(status_code=404, detail="No logs in specified time range")
    
    # Convert to CSV
    df = pd.DataFrame(logs)
    csv_buffer = StringIO()
    df.to_csv(csv_buffer, index=False)
    csv_buffer.seek(0)
    
    return StreamingResponse(
        iter([csv_buffer.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sensor_logs.csv"}
    )


@app.websocket("/ws/machines/{machine_id}")
async def websocket_machine_stream(websocket: WebSocket, machine_id: str):
    """WebSocket endpoint for real-time machine data streaming."""
    await websocket.accept()
    
    try:
        while True:
            if not state.simulator or not state.sensor_gen:
                await websocket.send_json({"error": "Simulator not initialized"})
                await asyncio.sleep(1)
                continue
            
            # Get current state
            joint_states = state.simulator.get_joint_states()
            sensor_data = state.sensor_gen.generate()
            

            # Format data for frontend (flat structure)
            data = {
                "timestamp": time.time(),
                "machine_id": machine_id,
                "status": "running" if state.is_running else "stopped",
            }

            # Add joint data in flat format
            for i, js in enumerate(joint_states, 1):
                data[f"joint_{i}_angle"] = js.angle * (180 / math.pi)  # Degrees
                data[f"joint_{i}_velocity"] = js.velocity
                data[f"joint_{i}_torque"] = js.torque
                data[f"joint_{i}_temperature"] = sensor_data.joint_temperatures.get(js.name, 25.0)

            # Add aggregate metrics
            data["temperature_core"] = sum(sensor_data.joint_temperatures.values()) / len(sensor_data.joint_temperatures)
            data["vibration_level"] = sensor_data.overall_vibration
            data["power_consumption"] = sensor_data.power_consumption

            # --- Real-time ML inference integration ---
            # Prepare features for ML models (matching train_models.py keys)
            # Calculate aggregates
            avg_velocity = sum(abs(js.velocity) for js in joint_states) / len(joint_states) if joint_states else 0.0
            avg_torque = sum(abs(js.torque) for js in joint_states) / len(joint_states) if joint_states else 0.0
            avg_angle = sum(abs(js.angle) for js in joint_states) / len(joint_states) if joint_states else 0.0

            features_for_eng = {
                "temperature": data["temperature_core"],
                "vibration": data["vibration_level"],
                "power": data["power_consumption"],
                "velocity": avg_velocity,
                "torque": avg_torque,
            }

            # Add sample to rolling buffer
            state.feature_eng.add_sample(features_for_eng)
            # Extract features for ML
            ml_features = state.feature_eng.extract_features(features_for_eng)

            # Convert features to numpy array for model input
            import numpy as np
            feature_vector = np.array([v for v in ml_features.values()], dtype=np.float32).reshape(1, -1)

            # Run ML models (with error handling)
            try:
                anomaly_score = float(state.anomaly_detector.predict(feature_vector))
            except Exception as e:
                anomaly_score = 0.0
            try:
                failure_prob = float(state.failure_predictor.predict_proba(feature_vector))
            except Exception as e:
                failure_prob = 0.0
            try:
                rul_hours = float(state.rul_estimator.predict(feature_vector))
            except Exception as e:
                rul_hours = 0.0

            data["anomaly_score"] = anomaly_score
            data["failure_probability"] = failure_prob
            data["rul_hours"] = rul_hours

            # Generate alerts for WebSocket
            alerts = []
            if anomaly_score > 0.7:
                alerts.append({"type": "critical", "title": "Critical Anomaly", "message": f"Critical anomaly score: {anomaly_score:.2f}"})
            elif anomaly_score > 0.4:
                alerts.append({"type": "warning", "title": "Potential Anomaly", "message": f"Elevated anomaly score: {anomaly_score:.2f}"})
                
            if failure_prob > 0.7:
                alerts.append({"type": "critical", "title": "Failure Imminent", "message": f"Failure probability: {failure_prob:.2f}"})
            elif failure_prob > 0.4:
                alerts.append({"type": "warning", "title": "Failure Risk", "message": f"Elevated failure risk: {failure_prob:.2f}"})
                
            if rul_hours < 50:
                alerts.append({"type": "critical", "title": "Critical RUL", "message": f"Remaining Useful Life critical: {rul_hours:.1f} hours"})
            elif rul_hours < 100:
                alerts.append({"type": "warning", "title": "Low RUL", "message": f"Remaining Useful Life low: {rul_hours:.1f} hours"})
            
            # Check sensor thresholds
            if data["temperature_core"] > 80:
                alerts.append({"type": "critical", "title": "Overheating", "message": f"Core temperature critical: {data['temperature_core']:.1f}°C"})
            elif data["temperature_core"] > 60:
                alerts.append({"type": "warning", "title": "High Temperature", "message": f"Core temperature high: {data['temperature_core']:.1f}°C"})
                
            if data["vibration_level"] > 3.0:
                alerts.append({"type": "critical", "title": "High Vibration", "message": f"Vibration level critical: {data['vibration_level']:.2f}g"})

            data["alerts"] = alerts

            # Log alerts to system logs (with deduplication)
            current_time = time.time()
            for alert in alerts:
                # Create a unique key for the alert
                alert_key = f"{alert['title']}:{alert['message']}"
                
                # Check if we should log this alert (e.g., if it hasn't been logged in the last 10 seconds)
                last_logged = state.last_alert_log_time.get(alert_key, 0)
                if current_time - last_logged > 10.0:
                    # Log it
                    state.system_logs.append(Log(
                        id=len(state.system_logs) + 1,
                        timestamp=current_time * 1000,
                        event=f"{alert['title']}: {alert['message']}",
                        type="error" if alert['type'] == 'critical' else "warning",
                        user="System",
                        machine_id=machine_id
                    ))
                    # Update last logged time
                    state.last_alert_log_time[alert_key] = current_time

            # Debug: print outgoing data for troubleshooting
            print('WebSocket send:', data)

            # Send data
            await websocket.send_json(data)
            
            # Stream at 10 Hz
            await asyncio.sleep(0.1)
            
    except WebSocketDisconnect:
        print(f"WebSocket client disconnected from {machine_id}")
    except Exception as e:
        print(f"WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass


# SHAP explainability endpoint (must be after app = FastAPI(...))
@app.post("/explain/failure")
async def explain_failure(features: dict = Body(...)):
    """
    Return SHAP values for the failure predictor given input features.
    Expects a dict of features (same as used for ML inference).
    """
    try:
        import numpy as np
        
        # Map raw features to training feature names if needed
        # If input has 'temperature_core', it's likely raw data from frontend
        if "temperature_core" in features:
            # Reconstruct aggregates
            # Note: Frontend sends angles in degrees, model expects radians for 'angle' feature
            
            # Extract joint data if available
            velocities = [v for k, v in features.items() if 'velocity' in k and 'joint' in k]
            torques = [v for k, v in features.items() if 'torque' in k and 'joint' in k]
            angles_deg = [v for k, v in features.items() if 'angle' in k and 'joint' in k]
            
            avg_velocity = sum(abs(v) for v in velocities) / len(velocities) if velocities else 0.0
            avg_torque = sum(abs(v) for v in torques) / len(torques) if torques else 0.0
            # Convert degrees to radians for average angle
            avg_angle = sum(abs(v * (math.pi / 180.0)) for v in angles_deg) / len(angles_deg) if angles_deg else 0.0
            
            mapped_features = {
                "temperature": features.get("temperature_core", 0.0),
                "vibration": features.get("vibration_level", 0.0),
                "power": features.get("power_consumption", 0.0),
                "velocity": avg_velocity,
                "torque": avg_torque,
            }
            
            # Use FeatureEngineer to get full feature vector (using current history)
            # Note: This uses the global state's history, which is correct for "explain current state"
            ml_features = state.feature_eng.extract_features(mapped_features)
            
            # Use prepare_for_ml to get scaled features (matching training data distribution)
            scaled_features = state.feature_eng.prepare_for_ml(ml_features)
            feature_vector = scaled_features.reshape(1, -1)
            
            # Get feature names from the scaler to ensure correct order matching the vector
            if hasattr(state.feature_eng.scaler, 'feature_names_in_'):
                feature_names = list(state.feature_eng.scaler.feature_names_in_)
            else:
                feature_names = list(ml_features.keys())
            
        else:
            # Assume features are already processed or we can't process them
            feature_vector = np.array([v for v in features.values()], dtype=np.float32).reshape(1, -1)
            feature_names = list(features.keys())

        shap_result = state.failure_predictor.shap_explain(feature_vector, feature_names=feature_names)
        
        # Debug logging
        print(f"SHAP Input Features: {feature_names}")
        print(f"SHAP Input Vector: {feature_vector}")
        print(f"SHAP Result: {shap_result}")
        
        return shap_result
    except Exception as e:
        print(f"SHAP Error: {e}")
        # Return empty structure instead of 500 to prevent frontend crash
        return {
            "shap_values": [],
            "base_value": 0.0,
            "feature_names": []
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)
