# Technovate Backend - Quick Reference

## Start the Backend

```bash
cd Backend/technovate_backend
./setup.sh
```

Then:
```bash
source .venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API Endpoints

- **GET** `/machine/meta` - Machine metadata from URDF
- **GET** `/machine/state` - Current joint states and sensors
- **GET** `/machine/health` - ML predictions (anomaly, failure, RUL)
- **POST** `/machine/control` - Control commands
- **GET** `/logs/export` - Export sensor logs as CSV

API Docs: http://localhost:8000/docs

## Test Endpoints

```bash
# Metadata
curl http://localhost:8000/machine/meta | jq

# State
curl http://localhost:8000/machine/state | jq

# Health
curl http://localhost:8000/machine/health | jq

# Control
curl -X POST http://localhost:8000/machine/control \
  -H "Content-Type: application/json" \
  -d '{"command": "reset"}'

# Export logs
curl http://localhost:8000/logs/export -o logs.csv
```

## Project Structure

```
Backend/technovate_backend/
├── app/
│   ├── simulation/     # URDF, physics, sensors, ROM
│   ├── ml/            # Anomaly, failure, RUL models
│   ├── models/        # Pydantic schemas
│   └── main.py        # FastAPI app
├── data/
│   ├── urdf/          # armpi_fpv.urdf
│   └── trained_models/ # ML models
├── tests/             # API tests
└── train_models.py    # Training script
```

## Key Features

✅ Uses existing `armpi_fpv.urdf` (5 revolute joints)
✅ Lightweight Python physics simulator
✅ Synthetic sensor generation (temp, vibration, power)
✅ Reduced Order Model (ROM)
✅ ML: Isolation Forest + XGBoost
✅ All 5 required API endpoints
✅ Background simulation loop
✅ CORS enabled for frontend

## Frontend Integration

1. Fetch `/machine/meta` for joint info
2. Poll `/machine/state` every 1s for live data
3. Poll `/machine/health` every 10s for predictions
4. Convert URDF to GLB for 3D visualization
5. Animate joints using angles from `/machine/state`
6. Display health predictions from `/machine/health`
