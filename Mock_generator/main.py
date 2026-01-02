from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
import asyncio
import json
import random
import time
from typing import List

from simulator import get_machine_data, get_all_machines
import models, schemas, crud
from database import SessionLocal, engine

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Demo Machine Server", description="Simulates industrial machine data for Digital Twin")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Enable CORS for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:7000",
        "http://127.0.0.1:7000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to the Digital Twin Demo Machine Server"}

@app.get("/machines")
async def list_machines():
    """List all available simulated machines."""
    return get_all_machines()

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pathlib import Path
import os

# Define paths dynamically
BASE_DIR = Path(__file__).resolve().parent
# Go up one level to Backend, then down to the target
PROJECT_ROOT = BASE_DIR.parent 
MESHES_DIR = PROJECT_ROOT / "digital_twin_robot" / "pole_project" / "create_multibody_from_urdf" / "armpi_fpv" / "meshes"
URDF_FILE = PROJECT_ROOT / "digital_twin_robot" / "pole_project" / "create_multibody_from_urdf" / "armpi_fpv" / "armpi_fpv.urdf"

# Mount static files for meshes
if MESHES_DIR.exists():
    app.mount("/meshes", StaticFiles(directory=str(MESHES_DIR)), name="meshes")
else:
    print(f"Warning: Meshes directory not found at {MESHES_DIR}")

@app.get("/urdf")
async def get_urdf():
    """Serve the URDF file directly."""
    if not URDF_FILE.exists():
        raise HTTPException(status_code=404, detail="URDF file not found")
    return FileResponse(str(URDF_FILE), media_type='application/xml')

@app.get("/machines/{machine_id}/data")
async def read_machine_data(machine_id: str):
    """Get a single snapshot of machine data."""
    data = get_machine_data(machine_id)
    if data:
        return data
    return {"error": "Machine not found"}

@app.get("/logs", response_model=List[schemas.Log])
async def read_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Fetch system logs from the database."""
    logs = crud.get_logs(db, skip=skip, limit=limit)
    return logs

@app.post("/logs", response_model=schemas.Log)
async def create_log(log: schemas.LogCreate, db: Session = Depends(get_db)):
    """Create a new log entry."""
    return crud.create_log(db=db, log=log)

@app.websocket("/ws/machines/{machine_id}")
async def websocket_endpoint(websocket: WebSocket, machine_id: str, db: Session = Depends(get_db)):
    """Stream real-time data for a specific machine."""
    await websocket.accept()
    
    # Log connection event
    try:
        crud.create_log(db, schemas.LogCreate(
            event=f"Client connected to {machine_id}",
            type="info",
            user="System",
            machine_id=machine_id
        ))
    except Exception as e:
        print(f"Failed to log connection: {e}")

    last_log_time = 0

    try:
        while True:
            data = get_machine_data(machine_id)
            if data:
                await websocket.send_json(data)
                
                # Dynamic Logging based on Telemetry Thresholds
                # We rate limit logs to avoid flooding the DB (max 1 log per 10s per machine)
                current_time = time.time()
                if current_time - last_log_time > 10:
                    
                    # Robot Logic: High Temperature
                    if "temperature_core" in data and data["temperature_core"] > 49.5:
                        crud.create_log(db, schemas.LogCreate(
                            event=f"High Temperature Warning: {data['temperature_core']:.1f}°C",
                            type="warning",
                            user="System",
                            machine_id=machine_id
                        ))
                        last_log_time = current_time
                        
                    # CNC Logic: High Vibration
                    elif "vibration_spindle" in data and data["vibration_spindle"] > 1.6:
                        crud.create_log(db, schemas.LogCreate(
                            event=f"Excessive Spindle Vibration: {data['vibration_spindle']:.2f}g",
                            type="error",
                            user="System",
                            machine_id=machine_id
                        ))
                        last_log_time = current_time
                        
                    # Conveyor Logic: High Load
                    elif "motor_load" in data and data["motor_load"] > 84:
                        crud.create_log(db, schemas.LogCreate(
                            event=f"High Motor Load: {data['motor_load']:.1f}%",
                            type="warning",
                            user="System",
                            machine_id=machine_id
                        ))
                        last_log_time = current_time

            else:
                await websocket.send_json({"error": "Machine not found"})
            
            # Simulate sampling rate (e.g., 10Hz = 0.1s)
            await asyncio.sleep(0.1) 
    except WebSocketDisconnect:
        print(f"Client disconnected from machine {machine_id}")
        try:
            crud.create_log(db, schemas.LogCreate(
                event=f"Client disconnected from {machine_id}",
                type="info",
                user="System",
                machine_id=machine_id
            ))
        except:
            pass
    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

    except Exception as e:
        print(f"Error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7000)
