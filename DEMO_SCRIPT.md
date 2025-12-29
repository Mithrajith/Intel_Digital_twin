# Digital Twin Demo Script

This script guides you through a presentation of the Intel Digital Twin project.

## Prerequisites

Ensure all 3 components are running in separate terminals:

1.  **Technovate Backend (Analysis)**: `uvicorn app.main:app --reload --port 8000` (in `Backend/technovate_backend`)
2.  **Demo Server (Physical Mock)**: `uvicorn main:app --reload --port 8001` (in `Backend/demo_machine_server`)
3.  **Frontend**: `npm run dev` (in `frontend`)

---

## Scene 1: The "Normal" State (Baseline)

**Action**: Open Dashboard at `http://localhost:5173`.
**Narrative**:
"Here we see the Digital Twin of a robotic arm in its normal operating state.
*   **Left**: The 3D visualization mirrors the physical robot's movements in real-time.
*   **Right**: Live telemetry shows stable vibration (0.1g) and temperature (25°C).
*   **Predictions**: The AI model shows a low Failure Probability (<5%) and a high Remaining Useful Life (RUL > 1000 hours)."

**Visual Check**:
*   Robot arm moving smoothly.
*   Color is **Blue/Grey** (Healthy).
*   Status badge says **"Healthy"**.

---

## Scene 2: The "What-If" Scenario (Fault Injection)

**Action**: Navigate to the **Control Panel** page.
**Narrative**:
"Now, let's simulate a common industrial fault. Using the Control Panel, we can inject a 'Motor Overheating' scenario to see how the Digital Twin reacts."

**Action**: Click **"Inject: Overheat Motor #2"**.
**Narrative**:
"I've just injected a fault signal into the system. The physical machine (simulated) is now reporting rising temperatures on Joint 2."

---

## Scene 3: AI Detection & Response

**Action**: Navigate quickly to the **Predictions** page.
**Narrative**:
"Watch the AI analysis.
1.  **Anomaly Detection**: The Isolation Forest model immediately flags this behavior as anomalous (Score jumps > 0.7).
2.  **RUL Prediction**: The LSTM model recalculates the Remaining Useful Life, dropping it significantly (e.g., < 50 hours).
3.  **Failure Probability**: The XGBoost classifier predicts a high likelihood of failure in the next 24 hours."

**Action**: Navigate to the **Simulation** page.
**Narrative**:
"On the visual twin, we see the affected joint glowing **Red**. This heatmap visualization allows operators to instantly pinpoint the source of the problem without digging into logs."

---

## Scene 4: Explainability (Why?)

**Action**: Point to the **SHAP Explanation** chart (if visible on Dashboard/Predictions).
**Narrative**:
"The system doesn't just say 'Error'. It uses SHAP (SHapley Additive exPlanations) to tell us *why*.
Here, we see 'Temperature' and 'Vibration' are the top contributing factors to this failure prediction, confirming our diagnosis."

---

## Scene 5: Resolution

**Action**: Go back to **Control Panel** and click **"Reset System"**.
**Narrative**:
"Once the maintenance team addresses the issue (simulated here by a reset), the system returns to a healthy state."

**Action**: Show **Dashboard** returning to normal.
**Narrative**:
"The Digital Twin confirms the fix, and the RUL estimate recovers. This closes the loop on predictive maintenance."
