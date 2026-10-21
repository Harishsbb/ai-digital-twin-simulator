# AI Digital Twin Simulator — Completed Work & Architecture Summary

> **Project Name:** AI Digital Twin Simulator  
> **Repository:** [https://github.com/Harishsbb/ai-digital-twin-simulator](https://github.com/Harishsbb/ai-digital-twin-simulator)  
> **Current Status:** Steps 1 through 6 Fully Implemented, Tested & Verified  
> **Next Milestone:** Step 7 — AI / ML Anomaly Detection Engine & Predictive Maintenance

---

## 1. Executive Summary

The **AI Digital Twin Simulator** is a high-fidelity industrial digital twin platform for a 3-phase AC induction electric motor (`IND-MTR-415V-01`). The system pairs a WebGL-based CAD-grade 3D model with a physics-driven synthetic sensor simulator, providing continuous real-time telemetry streaming over WebSockets and dynamic 3D visual reactions.

---

## 2. Completed Milestones (Steps 1 to 6)

### Step 1 & 2: CAD-Grade 3D Electric Motor Model
- **Interactive 3D Assembly**: Modeled using Three.js and React Three Fiber in [`IndustrialMotor.tsx`](frontend/src/components/twin/IndustrialMotor.tsx) with 7 core industrial components:
  1. Stator Core & Laminated Copper Windings
  2. Squirrel Cage Rotor & Balancing End Rings
  3. Hardened Steel Drive-End Shaft with Keyway
  4. Drive-End (DE) and Non-Drive-End (NDE) Ball Bearings
  5. Ribbed Motor Housing with 32 Cooling Fins & Base Mounting Feet
  6. Centrifugal Cooling Fan Impeller & Perforated Cowl Shroud
  7. Terminal Junction Box & Lifting Eye Bolt
- **Component Inspection**: Hover highlighting, 3D leader line callouts, and contextual technical specifications displayed in [`ComponentDetailsCard.tsx`](frontend/src/components/twin/ComponentDetailsCard.tsx).

### Step 3: Exploded View & Precision Camera Calibration
- **Default Assembled State**: Defaults to realistic assembled view; toggles smoothly to exploded view with a single click.
- **60 FPS Lerp Animation**: Smooth component separation along radial and axial vectors using mathematical damping.
- **Calibrated 3/4 Isometric Framing**: Locked default and Reset View camera coordinates (`position: [-3.45, 1.95, 3.45]`, `target: [0.08, 0.08, 0.05]`, `FOV: 38°`) in [`MotorScene.tsx`](frontend/src/components/twin/MotorScene.tsx).

### Step 4: UI/UX Redesign, Contrast & Branding
- **High-Contrast Typography**: Full WCAG AAA compliance using deep navy (`#10213D`), slate (`#0F172A` / `#475569`), and royal blue (`#1769FF`) across all cards and navigation.
- **Custom Branding**: Custom 3D isometric SVG favicon in [`favicon.svg`](frontend/public/favicon.svg) and a high-resolution documentation hero banner in [`docs/assets/banner.jpg`](docs/assets/banner.jpg).
- **Glassmorphic Layouts**: Refined light-theme dashboard cards, responsive sidebar, and breadcrumbs.

### Step 5: Synthetic Sensor Telemetry Engine (FastAPI Backend)
- **Continuous Physics Simulation**: Implemented in [`sensor_simulator.py`](backend/app/services/sensor_simulator.py) using Ornstein-Uhlenbeck mean-reverting drift (no unnatural random jumps):
  - **Temperature (°C)**: Thermal inertia ($\tau \approx 120s$) with exponential dissipation.
  - **Vibration (mm/s)**: Rotational unbalance coupled with 25Hz rotational harmonics.
  - **RPM**: Synchronous line frequency with torque slip (nominal 1488 RPM).
- **Modes & Lifecycle**: Seamless toggle between **Normal Mode** (healthy baseline) and **Fault Mode** (degraded bearing/winding failure).
- **APIs & WebSocket**:
  - `GET /api/v1/sensors/latest`
  - `GET /api/v1/sensors/state`
  - `GET /api/v1/sensors/history`
  - `POST /api/v1/sensors/control`
  - `POST /api/v1/sensors/toggle-mode`
  - `WS /api/v1/sensors/ws` (high-frequency 500ms broadcast).

### Step 6: Live Sensor Integration with 3D Digital Twin
- **Shared Telemetry Stream**: Single shared WebSocket managed via [`SensorStreamContext.tsx`](frontend/src/context/SensorStreamContext.tsx) and [`useSensorStream.ts`](frontend/src/context/useSensorStream.ts). Used by both the 3D Digital Twin and the Sensors page without duplicate connections.
- **Connection Status Watchdog**: Real-time indicator for `Connected`, `Stale Data` (no packet in > 3.5s), and `Disconnected` (with automated 2.5s reconnect).
- **RPM-Driven Rotation**: Shaft, rotor, and cooling fan rotate at speeds proportional to incoming live RPM. Scaled with anti-aliasing factor (`0.22`) to avoid 60Hz wagon-wheel stroboscopic illusion.
- **ISO 10816 Vibration Jitter**: Maps vibration velocity to bounded multi-harmonic 2D micro-displacement ($A \in [0.0008, 0.016]$).
- **Dynamic Temperature Heatmap**: Smooth amber ($74^\circ\text{C}-92^\circ\text{C}$), hot orange ($92^\circ\text{C}-110^\circ\text{C}$), and radiant red ($>110^\circ\text{C}$) emissive glow on stator core, housing, and bearings. Original materials 100% restored upon cooling. User selection highlight (`#0284c7`) always takes precedence.
- **Live Sensor Overlay**: Floating dock [`LiveSensorOverlay.tsx`](frontend/src/components/twin/LiveSensorOverlay.tsx) positioned over the 3D canvas displaying Temperature, Vibration, RPM, sync time, and quick controls (Inject Fault, Pause, Reset).

---

## 3. Project Architecture & Directory Structure

```text
ai-digital-twin-simulator/
├── backend/
│   ├── app/
│   │   ├── api/routes/          # REST & WebSocket endpoints (health, info, sensors)
│   │   ├── core/                # App configuration & CORS settings
│   │   ├── schemas/sensor.py    # Pydantic v2 telemetry validation models
│   │   ├── services/sensor_simulator.py # Stochastic physics engine & WS manager
│   │   └── main.py              # FastAPI app with async lifespan ticker
│   ├── tests/
│   │   └── test_sensor_simulator.py # 16 unit & integration tests
│   ├── run.py                   # Simple Python entrypoint (auto-venv switch)
│   ├── run.bat                  # 1-click Windows backend launcher
│   └── requirements.txt         # FastAPI, Uvicorn, Pydantic, WebSockets
│
├── frontend/
│   ├── src/
│   │   ├── components/twin/     # 3D Motor, Scene, Viewport, LeaderLabels, LiveSensorOverlay
│   │   ├── context/             # SensorStreamContext, SensorStreamContextDef, useSensorStream
│   │   ├── pages/
│   │   │   ├── DigitalTwinPage.tsx # Main 3D Motor Digital Twin & Overlay
│   │   │   ├── SensorsPage.tsx     # Oscilloscope charts & dials
│   │   │   └── OverviewPage.tsx    # Dashboard overview
│   │   ├── services/api.ts      # REST API & WebSocket URL utilities
│   │   ├── types/index.ts       # TypeScript models & telemetry interfaces
│   │   ├── utils/motorTelemetryMath.ts # Physics conversions & thermal mapping
│   │   └── tests/motorTelemetryMath.test.ts # 14 unit tests
│   └── package.json             # React 19, Three.js, R3F, Vite 8, Tailwind CSS
│
├── run_all.bat                  # 1-click launcher for both Backend & Frontend
├── run_backend.bat              # 1-click launcher for Backend
├── docs/assets/banner.jpg       # Project documentation hero banner
└── README.md                    # Main documentation
```

---

## 4. How to Run the Project

### Option A: 1-Click Launch (Both Backend & Frontend)
In Windows Explorer or PowerShell inside `D:\projects\ai domain project`, run:
```powershell
.\run_all.bat
```

### Option B: Run in Separate Terminals
**Terminal 1 — Backend:**
```powershell
cd "D:\projects\ai domain project\backend"
python run.py
```
*(Backend runs at `http://127.0.0.1:8000` | Swagger Docs at `http://127.0.0.1:8000/docs`)*

**Terminal 2 — Frontend:**
```powershell
cd "D:\projects\ai domain project\frontend"
npm run dev
```
*(Frontend runs at `http://localhost:5173`)*

---

## 5. Verification & Test Commands

- **Backend Pytest Suite (16 tests pass)**:
  ```powershell
  cd "D:\projects\ai domain project\backend"
  .\venv\Scripts\python.exe -m pytest tests -v
  ```
- **Frontend Unit Tests (14 tests pass)**:
  ```powershell
  cd "D:\projects\ai domain project\frontend"
  npm test
  ```
- **Frontend Lint Check (0 warnings, 0 errors)**:
  ```powershell
  cd "D:\projects\ai domain project\frontend"
  npm run lint
  ```
- **Frontend Build Check**:
  ```powershell
  cd "D:\projects\ai domain project\frontend"
  npm run build
  ```

---

## 6. What's Next (Roadmap for Next Step / New Chat)

- **Step 7 — AI / ML Anomaly Detection Engine**:
  - Implement unsupervised machine learning models (Isolation Forest / Autoencoder) in `backend/app/ml/`.
  - Process sliding telemetry windows (Temperature, Vibration, RPM) to compute an anomaly score (0.0 to 1.0) and Health Index (%).
  - Stream real-time anomaly probabilities and early degradation warnings to the frontend.
  - Implement root-cause fault classification (e.g., Bearing Failure, Stator Winding Overheat, Rotor Mass Unbalance).
