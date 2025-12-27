# 🧠 Frontend Prompt — Smart Digital Twin for Predictive Maintenance (Technovate)

You are building the **frontend UI** for a **Smart Digital Twin platform** that predicts machine failures before they happen.

The system simulates an industrial machine, streams sensor data in real time, runs AI models for failure prediction and Remaining Useful Life (RUL), and visualizes everything in a clean engineering-grade dashboard.

The frontend must feel like a **control room**, not a marketing website.

---

## 🎯 Core Goals

- Real-time visibility into machine health
- Clear AI-driven failure predictions
- Visual proof of a working digital twin
- Operator-friendly controls
- Engineer-friendly data export

No fluff. No unnecessary animations. Clarity over beauty.

---

## 🧭 Page Structure & Features

### 1️⃣ Home / Landing Page
**Purpose:** Explain value in under 10 seconds.

**Include:**
- Project name: *Technovate*
- One-line pitch: “Predict machine failures before they happen”
- Simple system flow:
  Real Machine → Digital Twin → AI → Alerts
- Key stats (uptime %, predicted failures, RUL)
- CTA button: “Open Dashboard”

---

### 2️⃣ Machine Overview Page
**Purpose:** High-level status of the monitored machine.

**Include:**
- Machine name & type (e.g., 2-axis robotic arm)
- Health score (0–100)
- Current status: Normal / Warning / Critical
- Runtime hours
- Last predicted failure time
- Load condition indicator

---

### 3️⃣ Live Monitoring Dashboard (Core Page)
**Purpose:** Real-time observability.

**Include:**
- Live streaming sensor charts:
  - Joint angle
  - Motor torque
  - Temperature
  - Vibration / load
- Auto-updating time-series graphs
- Threshold lines (safe vs risky)
- Pause / resume live stream
- Sensor enable/disable toggles

---

### 4️⃣ AI Prediction & Health Page
**Purpose:** Show intelligence, not raw data.

**Include:**
- Failure probability (%)
- Remaining Useful Life (hours / cycles)
- Detected anomalies count
- Component-level risk (motor, joint, bearing)
- Prediction confidence score
- Short rule-based explanation for alerts

---

### 5️⃣ Digital Twin Simulation Page
**Purpose:** Visual proof of the digital twin.

**Include:**
- 2D/3D simulation view (canvas or embedded stream)
- Real-time pose updates
- Highlight stressed components
- Sync toggle (simulation ↔ live data)
- Simulation speed control (1×, 2×)
- Play / Pause / Reset simulation

---

### 6️⃣ Control Panel Page
**Purpose:** Operator interaction.

**Include:**
- Start simulation
- Stop simulation
- Reset system state
- Optional fault injection (overheat / overload)
- Emergency stop (soft)
- Confirmation dialogs for critical actions

---

### 7️⃣ Logs & Data Export Page
**Purpose:** Engineering analysis & traceability.

**Include:**
- Session-wise logs
- Time-range filtering
- Export sensor + prediction data
- CSV / JSON download
- Metadata:
  - Model version
  - Simulation parameters
  - Timestamp

---

### 8️⃣ Alerts & Notifications Page
**Purpose:** Centralized warning system.

**Include:**
- Active alerts list
- Alert history
- Severity levels (Info / Warning / Critical)
- Acknowledge / dismiss alerts
- Timestamped events

---

### 9️⃣ Model & System Info Page
**Purpose:** Transparency and credibility.

**Include:**
- ML models used (XGBoost, Isolation Forest)
- ROM technique used
- Input features list
- Training data source (synthetic)
- Last model update time
- System version info

---

### 🔟 Settings Page
**Purpose:** Safe configuration.

**Include:**
- Sensor refresh rate
- Alert thresholds
- Chart preferences
- Theme toggle (dark/light)
- Reset application state

---

## 🧩 Reusable UI Components

Design reusable components for:
- Health indicator badge
- Status chips
- Metric tiles (value + unit + trend)
- Time-series chart component
- Alert card
- Loading skeletons

---

## 🧭 Navigation Structure

Home
├─ Machine Overview
├─ Live Dashboard
├─ AI Predictions
├─ Simulation
├─ Control Panel
├─ Logs & Export
├─ Alerts
├─ Model Info
└─ Settings

---

## 🧠 Design Principles

- Engineering-first UI
- High contrast, readable charts
- Minimal animations
- Dark mode preferred
- Clear error & alert feedback
- Desktop-first layout

---

## 🚫 Explicitly Exclude (Base Version)

- Multi-machine support
- Cloud sync
- Mobile PWA
- SHAP / explainable AI graphs
- Historical playback timeline

---

## 🏁 Final Note

This UI should feel like:
> “An engineer sitting inside the machine’s brain.”

If it looks flashy but hides information, it’s wrong.
If it’s boring but clear, it’s correct.
