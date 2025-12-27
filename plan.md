# Smart Digital Twin – Work Division 

This document defines a **clear, non-overlapping division of work** for a team building the Smart Digital Twin for Predictive Maintenance.

The goal is:

* Parallel execution
* Minimal bottlenecks
* Clear ownership
* Easy phase-wise tracking

---

## 👤 Person 1 – Simulation & Data Engineer

**Owns: Reality (even if simulated)**

**Primary Folder**

```
simulation_realtime_mock_data_runner/
```

### Responsibilities by Phase

**Phase 0 – Foundation**

* Assist in selecting target asset
* Define realistic sensor ranges
* Map sensors → physical components

**Phase 1 – Data Acquisition**

* Build real-time mock data generator
* Simulate:
  * Normal operation
  * Gradual degradation
  * Failure scenarios
* Push data via MQTT / REST

**Phase 2 – Digital Twin Alignment**

* Ensure sensor signals align with URDF components
* Validate joint/component naming consistency

**Phase 3 – ML Support**

* Generate labeled fault scenarios
* Stress-test ML pipelines with edge cases

**Phase 6 – What-if Simulation**

* Modify signal generators dynamically
* Simulate future scenarios (load ↑, cooling ↓)

**Phase 7 – Demo Readiness**

* Prepare stable demo scripts
* One-command demo runner

**Deliverables**

* Realistic sensor streams
* Fault injection scenarios
* Demo-safe simulation runner

---

## 👤 Person 2 – ML & Intelligence Engineer

**Owns: Intelligence (prediction + reasoning)**

**Primary Folder**

```
ml_service/
```

### Responsibilities by Phase

**Phase 0 – Foundation**

* Define ML problem types (RUL, anomaly detection)
* Lock evaluation metrics

**Phase 1 – Data Validation**

* Validate incoming data schema
* Define preprocessing pipeline

**Phase 3 – Predictive Intelligence**

* Train models:
  * RUL (LSTM / XGBoost)
  * Anomaly detection (Isolation Forest)
* Validate model performance
* Expose inference APIs

**Phase 4 – Explainability**

* Implement SHAP / permutation importance
* Generate human-readable explanations
* Create health score formula

**Phase 6 – What-if Intelligence**

* Predict RUL under altered conditions

**Phase 7 – System Hardening**

* Freeze model versions
* Ensure deterministic inference

**Deliverables**

* Trained ML models
* Inference + explainability APIs
* Health scoring logic

---

## 👤 Person 3 – System & Frontend Engineer

**Owns: Integration, Visualization, and Narrative**

**Primary Folders**

```
frontend/
backend/
```

### Responsibilities by Phase

**Phase 0 – Architecture**

* Define overall system architecture
* Define API contracts

**Phase 1 – Backend Ingestion**

* Implement data ingestion layer
* Store sensor data
* Maintain asset state

**Phase 2 – Digital Twin Core**

* Manage URDF storage
* Convert URDF → GLB
* Maintain live state JSON

**Phase 5 – Visualization**

* Build dashboard
* Render GLB model
* Overlay:
  * Heatmaps
  * Alerts
  * Component health
* Plot sensor trends and RUL

**Phase 6 – What-if Orchestration**

* Coordinate what-if simulation runs
* Compare baseline vs simulated outcomes

**Phase 7 – Demo & Polish**

* UI polish
* Logging and fallback handling
* README and architecture diagram
* Demo narration flow

**Deliverables**

* Interactive 3D digital twin
* Live dashboard
* Judge-ready system presentation

---

## Responsibility Matrix

| Area                       | Owner                |
| -------------------------- | -------------------- |
| Simulation & Mock Data     | Person 1             |
| ML Models & Explainability | Person 2             |
| Backend & Frontend         | Person 3             |
| URDF Structure             | Person 3             |
| Sensor–Component Mapping  | Person 1             |
| Demo Readiness             | All (Person 3 leads) |

---

## Team Rule (Non‑Negotiable)

> No one works in isolation for more than one phase.

At the end of each phase:

* Person 1 provides data
* Person 2 validates intelligence
* Person 3 makes it visible

This feedback loop ensures the project evolves as a  **system** , not three disconnected parts.

---

## One‑Line Execution Principle

> Simulate reality → predict failure → explain why → visualize clearly → support decisions

This division is suitable for  **SIH, hackathons, and production‑ready prototypes** .
