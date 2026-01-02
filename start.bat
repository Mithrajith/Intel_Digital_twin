@echo off
REM ==========================================
REM   Technovate Digital Twin - Full Stack
REM ==========================================

REM Backend setup
cd Backend

IF NOT EXIST venv (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat

REM Install dependencies
venv\Scripts\pip install --quiet --upgrade pip
venv\Scripts\pip install --quiet fastapi "uvicorn[standard]" pydantic pydantic-settings numpy pandas scikit-learn xgboost python-multipart joblib pytest websockets shap

REM Copy URDF if needed
IF NOT EXIST data\urdf\armpi_fpv.urdf (
    echo Copying URDF file...
    mkdir data\urdf 2>nul
    IF EXIST create_multibody_from_urdf\armpi_fpv\armpi_fpv.urdf (
        copy create_multibody_from_urdf\armpi_fpv\armpi_fpv.urdf data\urdf\
    ) ELSE (
        echo Warning: URDF source file not found
    )
)

REM Train models if needed
IF NOT EXIST data\trained_models\anomaly_detector.pkl (
    echo Training ML models (this will take a few minutes)...
    python train_models.py
) ELSE (
    echo ✓ ML models already trained
)

echo ✓ Backend ready
cd ..

REM Frontend setup
cd frontend
IF NOT EXIST node_modules (
    echo Installing frontend dependencies...
    npm install
) ELSE (
    echo ✓ Frontend dependencies already installed
)

echo ✓ Frontend ready
cd ..

REM Start backend and frontend
start cmd /k "cd Backend && call venv\Scripts\activate.bat && uvicorn app.main:app --host 0.0.0.0 --port 7000"
start cmd /k "cd frontend && npm run dev"

echo ==========================================
echo   ✓ All services running!
echo ==========================================
echo.
echo 🌐 Frontend:  http://localhost:5173
echo 🔧 Backend:   http://localhost:7000
echo 📚 API Docs:  http://localhost:7000/docs
echo.
pause
