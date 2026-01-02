#!/bin/bash
# Complete project startup script

set -e

echo "=========================================="
echo "  Technovate Digital Twin - Full Stack"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Backend setup
echo -e "${BLUE}[1/3] Setting up Backend...${NC}"
cd Backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
venv/bin/pip install --quiet --upgrade pip
venv/bin/pip install --quiet fastapi 'uvicorn[standard]' pydantic pydantic-settings \
    numpy pandas scikit-learn xgboost python-multipart joblib pytest websockets

# Copy URDF if needed
if [ ! -f "data/urdf/armpi_fpv.urdf" ]; then
    echo "Copying URDF file..."
    mkdir -p data/urdf
    if [ -f "create_multibody_from_urdf/armpi_fpv/armpi_fpv.urdf" ]; then
        cp create_multibody_from_urdf/armpi_fpv/armpi_fpv.urdf data/urdf/
    else
        echo "Warning: URDF source file not found, checking data/urdf/ directory..."
    fi
fi

# Train models if needed
if [ ! -f "data/trained_models/anomaly_detector.pkl" ]; then
    echo "Training ML models (this will take a few minutes)..."
    python train_models.py
else
    echo "✓ ML models already trained"
fi

echo -e "${GREEN}✓ Backend ready${NC}"
echo ""

# Frontend setup
echo -e "${BLUE}[2/3] Setting up Frontend...${NC}"
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
else
    echo "✓ Frontend dependencies already installed"
fi

echo -e "${GREEN}✓ Frontend ready${NC}"
echo ""

# Start services
echo -e "${BLUE}[3/3] Starting Services...${NC}"
echo ""
echo "Starting backend server on http://localhost:7000"
echo "Starting frontend server on http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Start backend in background
cd ../Backend
source venv/bin/activate
uvicorn app.main:app --host 0.0.0.0 --port 7000 &
BACKEND_PID=$!

# Wait for backend to start
sleep 3

# Start frontend
cd ../frontend
npm run dev &
FRONTEND_PID=$!

# Wait for frontend to start
sleep 2

echo ""
echo "=========================================="
echo -e "${GREEN}✓ All services running!${NC}"
echo "=========================================="
echo ""
echo "🌐 Frontend:  http://localhost:5173"
echo "🔧 Backend:   http://localhost:7000"
echo "📚 API Docs:  http://localhost:7000/docs"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C and cleanup
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT

# Wait for both processes
wait
