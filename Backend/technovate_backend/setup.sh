#!/bin/bash
# Quick start script for Technovate backend

set -e

echo "================================"
echo "Technovate Backend Setup"
echo "================================"
echo ""

# Check if URDF exists
if [ ! -f "data/urdf/armpi_fpv.urdf" ]; then
    echo "Copying URDF file..."
    mkdir -p data/urdf
    cp ../digital_twin_robot/robot_digital_twin/3d_model_urdf_files/armpi_fpv.urdf data/urdf/
    echo "✓ URDF copied"
fi

# Create virtual environment if it doesn't exist
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    python -m venv .venv
    echo "✓ Virtual environment created"
fi

# Activate virtual environment and install dependencies
echo "Installing dependencies..."
source .venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet fastapi 'uvicorn[standard]' pydantic pydantic-settings numpy pandas scikit-learn xgboost python-multipart joblib pytest
echo "✓ Dependencies installed"

# Train models if they don't exist
if [ ! -f "data/trained_models/anomaly_detector.pkl" ]; then
    echo ""
    echo "Training ML models (this may take a few minutes)..."
    python train_models.py
else
    echo "✓ Pre-trained models found"
fi

echo ""
echo "================================"
echo "Setup Complete!"
echo "================================"
echo ""
echo "To start the backend server:"
echo "  source .venv/bin/activate"
echo "  uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "Or run directly:"
echo "  .venv/bin/uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"
echo ""
echo "API will be available at: http://localhost:8000"
echo "API docs at: http://localhost:8000/docs"
echo ""
