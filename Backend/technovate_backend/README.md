# Technovate Backend - Digital Twin for Predictive Maintenance

Backend service for the Technovate Smart Digital Twin platform. Provides simulation, ML-based predictions, and REST APIs for frontend consumption.

## Features

- URDF-based machine modeling (armpi_fpv robotic arm)
- Lightweight physics simulation with synthetic sensor generation
- Reduced Order Model (ROM) for efficient computation
- ML models: Isolation Forest (anomaly), XGBoost (failure prediction & RUL)
- FastAPI endpoints for machine state, health, and control

## Setup

```bash
# Install dependencies with uv
uv sync

# Copy URDF file
cp ../digital_twin_robot/robot_digital_twin/3d_model_urdf_files/armpi_fpv.urdf data/urdf/

# Run server
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- `GET /machine/meta` - Machine metadata (joints, limits)
- `GET /machine/state` - Current joint states and sensors
- `GET /machine/health` - Health predictions (anomaly, failure, RUL)
- `POST /machine/control` - Control commands
- `GET /logs/export` - Export sensor logs as CSV

## Architecture

```
app/
├── simulation/    # URDF parsing, physics sim, sensor generation, ROM
├── ml/           # Anomaly detection, failure prediction, RUL estimation
├── api/          # FastAPI route handlers
└── models/       # Pydantic schemas
```

## Testing

```bash
uv run pytest tests/ -v
```
