# Smart Digital Twin – Folder-wise Phase Breakdown

This document maps the **phase-wise TODO plan** into four concrete project folders:

* `frontend/`
* `backend/`
* `ml_service/`
* `simulation_realtime_mock_data_runner/`

This structure is **execution-oriented** and matches how real digital twin systems are built.

---

## Folder Structure

```
smart-digital-twin/
├── frontend/
├── backend/
├── ml_service/
└── simulation_realtime_mock_data_runner/
```

---

## Phase 0: Foundation & Scoping (Week 0)

### frontend/

* No implementation
* Review-only

### backend/

* Define asset metadata schema
* Define sensor → component mapping format
* Define API contracts (inputs/outputs only)

### ml_service/

* Define ML problem type (RUL, anomaly, classification)
* Define evaluation metrics

### simulation_realtime_mock_data_runner/

* Decide real vs simulated vs hybrid data
* Define baseline signal ranges

**Deliverables**

* Finalized asset definition
* Sensor–failure mapping
* Dataset decision

---

## Phase 1: Data Acquisition & Ingestion (Week 1)

### frontend/

* Placeholder UI for "Live Data" (no logic)

### backend/

* Implement ingestion endpoints
  * MQTT / REST / ROS bridge
* Define time-series storage schema
* Persist raw sensor data

### ml_service/

* Validate incoming data format
* Reject malformed or missing signals

### simulation_realtime_mock_data_runner/

* Generate timestamped sensor streams
* Simulate normal + degraded behavior
* Push data to backend

**Deliverables**

* Live or simulated data flow
* Stored historical dataset

---

## Phase 2: Digital Twin Core (Week 2)

### frontend/

* Load static GLB model (no live sync yet)

### backend/

* Store URDF
* Maintain asset state object
* Sync sensor values → component state
* Expose live state API

### ml_service/

* No training yet
* Consume state snapshots for future use

### simulation_realtime_mock_data_runner/

* Ensure sensor signals align with URDF components

**Deliverables**

* URDF model
* GLB model
* Live state JSON

---

## Phase 3: ML & Predictive Intelligence (Week 3)

### frontend/

* Display prediction placeholders

### backend/

* Route sensor history to ML service
* Cache prediction outputs

### ml_service/

* Preprocess time-series data
* Train models:
  * RUL (LSTM / XGBoost)
  * Anomaly detection (Isolation Forest)
* Validate models
* Expose inference API

### simulation_realtime_mock_data_runner/

* Inject fault scenarios for training/testing

**Deliverables**

* Trained ML models
* Prediction APIs
* Inference pipeline

---

## Phase 4: Explainability Layer (Week 4)

### frontend/

* UI sections for explanations

### backend/

* Store explanation metadata
* Attach explanations to predictions

### ml_service/

* Implement SHAP / permutation importance
* Generate human-readable reasons
* Compute health score

### simulation_realtime_mock_data_runner/

* Trigger explainable failure cases

**Deliverables**

* Explainability JSON
* Component health scores

---

## Phase 5: Visualization & Dashboard (Week 5)

### frontend/

* Render GLB model
* Overlay:
  * Heatmaps
  * Alerts
  * Health status
* Plot sensor trends and RUL
* Timeline playback

### backend/

* Stream live state + predictions
* Manage alert thresholds

### ml_service/

* Serve real-time inference

### simulation_realtime_mock_data_runner/

* Drive live demo scenarios

**Deliverables**

* Interactive 3D digital twin
* Live dashboard

---

## Phase 6: What-if & Simulation Intelligence (Week 6 – Advanced)

### frontend/

* UI for what-if inputs
* Comparative visualization

### backend/

* Orchestrate simulation runs
* Track baseline vs simulated outcomes

### ml_service/

* Predict future RUL under altered conditions

### simulation_realtime_mock_data_runner/

* Modify signal generators dynamically

**Deliverables**

* What-if simulation engine
* Scenario comparison views

---

## Phase 7: System Hardening & Demo Readiness (Final Week)

### frontend/

* UI polish
* Error states

### backend/

* Logging
* Fallback handling
* API stability

### ml_service/

* Model versioning
* Deterministic inference

### simulation_realtime_mock_data_runner/

* Stable demo scripts

**Deliverables**

* Demo-ready system
* Polished repository

---

## Phase 8: Optional Extensions

### frontend/

* Fleet dashboards

### backend/

* Multi-asset orchestration
* Maintenance scheduling logic

### ml_service/

* Online retraining
* Model drift detection

### simulation_realtime_mock_data_runner/

* Fleet-scale simulation

---

## Core Principle

> Each phase must produce something  **visible, testable, and defensible** .

This breakdown is aligned with industry-grade digital twin systems and is suitable for SIH, hackathons, and future scaling.
