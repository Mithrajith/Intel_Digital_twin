# Technovate Digital Twin - Complete Integration Guide

## 🚀 Quick Start

```bash
cd /home/zypher/PROJECT/Intel_Digital_twin
./start.sh
```

This will:
1. Set up backend (install dependencies, train ML models)
2. Set up frontend (install npm packages)
3. Start both servers
4. Open at http://localhost:5173

## 📡 API Endpoints (Backend)

### Machine Management
- `GET /machines` - List all machines
- `GET /machine/meta` - Machine metadata (URDF info)
- `GET /machine/state` - Current state (joints, sensors)
- `GET /machine/health` - ML predictions (anomaly, failure, RUL)
- `POST /machine/control` - Control commands
- `GET /logs/export` - Export sensor logs as CSV

### Real-Time Streaming
- `WS /ws/machines/{machine_id}` - WebSocket for live data (10Hz)

## 🎨 Frontend Pages

1. **Home** (`/`) - Landing page
2. **Overview** (`/overview`) - Health dashboard
3. **Dashboard** (`/dashboard`) - Live sensor monitoring
4. **Predictions** (`/predictions`) - AI/ML predictions
5. **Simulation** (`/simulation`) - 2D kinematic view
6. **Control Panel** (`/control`) - Machine control
7. **Logs** (`/logs`) - System logs
8. **Alerts** (`/alerts`) - Alert management
9. **Model Info** (`/model-info`) - ML model details
10. **Settings** (`/settings`) - Configuration

## 🔧 Manual Setup

### Backend Only
```bash
cd Backend/technovate_backend
./setup.sh
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 7000
```

### Frontend Only
```bash
cd frontend
npm install
npm run dev
```

## 📊 Features Implemented

### Backend ✅
- ✅ URDF parsing (armpi_fpv with 5 joints)
- ✅ Physics simulation (lightweight Python)
- ✅ Sensor generation (temp, vibration, torque)
- ✅ Reduced Order Model (ROM)
- ✅ ML models: Isolation Forest + XGBoost
- ✅ WebSocket real-time streaming
- ✅ All REST API endpoints
- ✅ Frontend-compatible data format

### Frontend ✅
- ✅ React + Vite + Tailwind CSS
- ✅ 10 pages with routing
- ✅ Real-time charts (Recharts)
- ✅ 2D kinematic visualization
- ✅ WebSocket integration
- ✅ Responsive design

## 🔗 Integration Points

### Dashboard Page
- Connects to `ws://localhost:7000/ws/machines/armpi_fpv_01`
- Displays 4 live charts (angle, torque, temp, vibration)
- Fetches machine list from `/machines`

### Overview Page
- Shows overall health score
- Displays runtime, load, vibration metrics
- System events timeline

### Predictions Page
- Shows failure probability (circular progress)
- Displays RUL in hours
- Component risk assessment
- Uses `/machine/health` endpoint

### Simulation Page
- 2D kinematic visualization
- Driven by real-time joint angles
- Stress coloring based on vibration

## 🧪 Testing

### Test Backend
```bash
# Check API
curl http://localhost:7000/machines | jq

# Test WebSocket (using websocat)
websocat ws://localhost:7000/ws/machines/armpi_fpv_01

# Export logs
curl http://localhost:7000/logs/export -o logs.csv
```

### Test Frontend
1. Open http://localhost:5173
2. Navigate to Dashboard
3. Click "Start Stream"
4. Verify live charts updating
5. Check other pages

## 📁 Project Structure

```
Intel_Digital_twin/
├── Backend/
│   └── technovate_backend/
│       ├── app/
│       │   ├── simulation/    # URDF, physics, sensors, ROM
│       │   ├── ml/           # ML models
│       │   ├── api/          # API routes
│       │   └── main.py       # FastAPI app with WebSocket
│       ├── data/
│       │   ├── urdf/         # armpi_fpv.urdf
│       │   └── trained_models/ # ML models
│       └── train_models.py
├── frontend/
│   ├── src/
│   │   ├── pages/           # 10 pages
│   │   ├── components/      # Reusable components
│   │   └── hooks/          # useSimulatedSensor
│   └── package.json
└── start.sh                 # One-command startup
```

## 🎯 Key Features

### Real-Time Data Flow
```
Simulation → Sensor Generator → WebSocket → Frontend Charts
     ↓
  ML Models → Predictions → API → Frontend Display
```

### Data Format (WebSocket)
```json
{
  "timestamp": 1735377891.234,
  "machine_id": "armpi_fpv_01",
  "status": "running",
  "joint_1_angle": 45.2,
  "joint_1_temperature": 32.5,
  "joint_1_torque": 0.08,
  "temperature_core": 35.7,
  "vibration_level": 0.25,
  "power_consumption": 120.5
}
```

## 🐛 Troubleshooting

### Backend won't start
```bash
cd Backend/technovate_backend
source venv/bin/activate
python -c "import fastapi; print('OK')"
```

### Frontend can't connect
- Check backend is running on port 7000
- Check CORS is enabled (already configured)
- Check WebSocket URL in browser console

### No ML predictions
```bash
cd Backend/technovate_backend
source venv/bin/activate
python train_models.py
```

## 📝 Next Steps

1. **3D Visualization**: Convert URDF to GLB for Three.js
2. **Historical Playback**: Add time-range queries
3. **Multi-Machine**: Support multiple assets
4. **Deployment**: Docker containers
5. **Authentication**: Add user login

## 🎉 Success Criteria

✅ Backend running on port 7000
✅ Frontend running on port 5173
✅ WebSocket connected (check browser console)
✅ Live charts updating on Dashboard
✅ ML predictions showing on Predictions page
✅ All 10 pages accessible

---

**Built with**: Python, FastAPI, React, Vite, Tailwind CSS, Three.js, XGBoost, scikit-learn
