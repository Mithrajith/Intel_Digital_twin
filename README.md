# Intel Digital Twin for Predictive Maintenance

## Overview

This workspace contains a collection of projects and prototypes for building a **Smart Digital Twin platform** (Technovate) that predicts industrial equipment failures before they occur. The system simulates machines, streams sensor data, applies AI for predictions, and provides a dashboard for monitoring. Features are split across multiple folders, requiring integration for a complete solution.

The platform focuses on predictive maintenance for machines like robotic arms and aircraft engines, using physics-based simulations and machine learning.

## What is Done

- **Simulation Engines**: ROS2 and Gazebo setup for robotic digital twins (in `digital_twin_robot/robot_digital_twin/`).
- **AI Models**: Deep learning models for aircraft engine diagnostics and prognostics (TensorFlow/Keras in `digital-twin-for-aircraft-engine-maintenance/`).
- **ML Pipelines**: Predictive maintenance scripts using scikit-learn and XGBoost (in `predictive-maintenance/` and `Predictive-Maintenance-for-Industrial-Equipment/`).
- **Frontend Prototype**: React-based dashboard with Tailwind CSS for monitoring and controls (in `digital_twin_robot/frontend/`).
- **Data Handling**: CSV/JSON export, feature engineering, and exploratory data analysis (notebooks across folders).
- **Hybrid Modeling**: Python package for digital twins with physics-based and ML components (in `Digital-Twin-in-python/`).
- **Visualization**: Charts and plots using Plotly, Matplotlib, and Recharts.

## What Needs to be Done

- **Integration**: Combine simulation (ROS/Gazebo), AI models, and frontend into a single platform.
- **Backend API**: Implement FastAPI endpoints to connect simulation data to AI predictions and serve the frontend.
- **Real-Time Streaming**: Enable live sensor data flow from simulation to dashboard.
- **Model Deployment**: Deploy AI models for inference (e.g., using TensorFlow Serving).
- **Database**: Add persistent storage for sensor logs and predictions.
- **Testing**: Unit and integration tests for reliability (basic structure in `Digital-Twin-in-python/tests/`).
- **Documentation**: Update guides for setup and usage.

## What is Not Done Yet

**Full Digital Twin Simulation**: Complete integration of Gazebo/ROS with AI for real-time predictions.

**Advanced Explainable AI**: SHAP or similar for model interpretability.

**Fault Injection**: Tools for simulating failures in the digital twin.

**Historical Playback**: Time-scrubbing for past data analysis.

**Multi-Machine Support**: Extend beyond single machine types (e.g., support for CNC machines).


## Intel Technologies Used

"Intel" here refers to intelligent technologies (AI/ML and simulation tools) for building smart systems. The following are the key tools and technologies employed:

### AI/ML Frameworks

- **TensorFlow/Keras**: Deep learning for diagnostics, prognostics, and sequential modeling (e.g., RUL prediction).
- **Scikit-learn**: Traditional ML for classification, regression, anomaly detection (e.g., RandomForest, Isolation Forest).
- **XGBoost**: Gradient boosting for failure prediction and RUL estimation.
- **PCA**: Dimensionality reduction for feature engineering.

### Simulation and Modeling

- **ROS2**: Robotic simulation and sensor data handling.
- **Gazebo**: Physics-based simulation engine for digital twins.
- **OpenModelica**: System dynamics modeling (state-space equations).
- **MATLAB/Simulink**: Multibody dynamics and control systems.
- **URDF**: 3D robot model definitions.

### Frontend and Visualization

- **React.js**: Component-based UI for dashboards.
- **Tailwind CSS**: Utility-first styling.
- **Recharts/Plotly.js/Chart.js**: Interactive charts for sensor data and predictions.
- **Streamlit**: Rapid prototyping for ML apps.

### Backend and Data

- **FastAPI**: Planned for REST APIs (Python-based).
- **Pandas/NumPy**: Data manipulation and analysis.
- **Hydra-core/Pydantic**: Configuration and validation.
- **MLflow**: Experiment tracking for ML models.

### Other Tools

- **Jupyter Notebooks**: For EDA, model training, and evaluation.
- **Docker**: Containerization for deployment.
- **Poetry/Pip**: Dependency management.

## How to Run/Combine

1. **Setup Environment**: Install Python 3.8+, Node.js. Use `pip install -r requirements.txt` from relevant folders.
2. **Run Simulations**: Navigate to `digital_twin_robot/robot_digital_twin/` and launch ROS/Gazebo.
3. **Train Models**: Execute notebooks in `digital-twin-for-aircraft-engine-maintenance/` for AI models.
4. **Start Frontend**: `cd digital_twin_robot/frontend && npm install && npm run dev`.
5. **Integrate**: Build a FastAPI backend to bridge simulation and AI, then connect to React frontend.
6. **Test**: Run scripts in `predictive-maintenance/` or the Streamlit app.

For full integration, combine components into a monolithic app or microservices architecture.

## Contributing

Features are modular; contribute to specific folders and propose merges for integration.

## License

Varies by folder; check individual READMEs.
