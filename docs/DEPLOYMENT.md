# Production Deployment Guide — AI Digital Twin Simulator

This guide outlines the production deployment procedure for the **AI Digital Twin Simulator**, deploying the decoupled multi-tier architecture to **Vercel** (Frontend), **Render** (Backend), and **Supabase** (Database).

---

## 1. Architecture Topology

```
+-------------------------------------------------------------+
|                  Vercel (Frontend Hosting)                   |
|  - React 19 + TypeScript + Vite + Tailwind CSS v4 + Three.js |
|  - Global Edge CDN + SPA Route Rewrites (vercel.json)       |
|  - Public URL: https://<your-app>.vercel.app                |
+------------------------------+------------------------------+
                               | HTTPS REST & WSS Telemetry
                               v
+-------------------------------------------------------------+
|                   Render (Backend Web Service)               |
|  - Python 3.11.9 + FastAPI + Uvicorn + scikit-learn        |
|  - Background Physics Engine (10 Hz Sensor Simulation)      |
|  - Real-Time WebSocket Telemetry Dispatcher                 |
|  - Isolation Forest Pre-Trained ML Artifacts                |
|  - Public URL: https://<your-backend>.onrender.com          |
+------------------------------+------------------------------+
                               | SSL Connection (Port 5432)
                               v
+-------------------------------------------------------------+
|             Supabase (Managed PostgreSQL Database)          |
|  - Project: ai-digital-twin-db                              |
|  - Session Pooler: aws-0-ap-northeast-2.pooler.supabase.com  |
|  - Automated Schema Migrations via Alembic                   |
|  - Persisted Tables: sensor_readings, ai_predictions,       |
|    alert_records, whatif_experiments                        |
+-------------------------------------------------------------+
```

---

## 2. Phase 1 — Supabase Database Verification

The database schema is fully defined in [`alembic/versions/0001_initial_schema.py`](file:///D:/projects/ai%20domain%20project/backend/alembic/versions/0001_initial_schema.py).

### Connection Parameters (Session Pooler)
- **Host:** `aws-0-ap-northeast-2.pooler.supabase.com`
- **Port:** `5432`
- **Database:** `postgres`
- **Username:** `postgres.gqilhgcbqkbttbqqgoqb`
- **SSL Mode:** `require`

### Database Migrations
Migrations run automatically on Render during the build step via:
```bash
alembic upgrade head
```
Or you can apply them locally before first deployment:
```bash
cd backend
alembic upgrade head
```

---

## 3. Phase 2 — Backend Deployment on Render

### Option A: 1-Click Blueprint (Recommended)
1. Log into your [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub repository (`Harishsbb/ai-digital-twin-simulator`).
4. Render detects [`render.yaml`](file:///D:/projects/ai%20domain%20project/render.yaml).
5. Enter the `DATABASE_URL` secret when prompted:
   ```
   postgresql://postgres.gqilhgcbqkbttbqqgoqb:<YOUR_PASSWORD>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
   ```
6. Click **Apply**.

---

### Option B: Manual Web Service Setup
1. In Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure the following fields:

| Field | Value |
|---|---|
| **Name** | `ai-digital-twin-backend` |
| **Region** | `Oregon (US West)` or closest to your users |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt && alembic upgrade head` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Plan Type** | `Free` (or `Starter` for no cold starts) |

4. In **Environment Variables**, add:

| Key | Value | Notes |
|---|---|---|
| `PYTHON_VERSION` | `3.11.9` | Matches local development |
| `ENVIRONMENT` | `production` | Disables debug reload |
| `DATABASE_URL` | `postgresql://postgres.gqilhgcbqkbttbqqgoqb:<PASSWORD>@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require` | Encoded password |
| `CORS_ORIGINS` | `http://localhost:5173,https://<your-app>.vercel.app` | Comma-separated |
| `CORS_ALLOW_ORIGIN_REGEX` | `^https://.*\.vercel\.app$` | Allows Vercel preview branches |

5. Click **Deploy Web Service**.
6. Note your Render URL: `https://<your-backend-name>.onrender.com`.

---

## 4. Phase 3 — Frontend Deployment on Vercel

### Step-by-Step Vercel Setup
1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New…** → **Project**.
3. Import your GitHub repository (`Harishsbb/ai-digital-twin-simulator`).
4. In the **Configure Project** screen:

| Setting | Value |
|---|---|
| **Framework Preset** | `Vite` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

5. Expand **Environment Variables** and add:

| Key | Value | Target |
|---|---|---|
| `VITE_API_BASE_URL` | `https://<your-backend-name>.onrender.com` | Production, Preview, Development |

> [!IMPORTANT]
> Do NOT append a trailing slash to `VITE_API_BASE_URL`. Use `https://my-backend.onrender.com`.

6. Click **Deploy**.
7. Vercel automatically deploys the site and attaches [`frontend/vercel.json`](file:///D:/projects/ai%20domain%20project/frontend/vercel.json) to ensure SPA routes (`/digital-twin`, `/analytics`, `/anomaly-detection`, `/user-manual`) resolve without 404s on browser refresh.

---

## 5. Phase 4 — Post-Deployment Verification Checklist

Once both services are deployed, perform these verification checks:

### 1. Backend Health Check
Visit in your browser:
```
https://<your-backend>.onrender.com/api/health
```
**Expected response:**
```json
{
  "status": "healthy",
  "app_name": "AI Digital Twin Simulator",
  "version": "0.1.0",
  "environment": "production"
}
```

### 2. Database Health Check
```
https://<your-backend>.onrender.com/api/v1/db/health
```
**Expected response:**
```json
{
  "status": "connected",
  "connected": true,
  "database_type": "postgresql",
  "tables_registered": ["sensor_readings", "ai_predictions", "alert_records", "whatif_experiments"]
}
```

### 3. ML Model Readiness
```
https://<your-backend>.onrender.com/api/v1/ai/status
```
**Expected response:**
```json
{
  "status": "ready",
  "model_loaded": true,
  "algorithm": "IsolationForest"
}
```

### 4. WebSocket Live Telemetry
Open the deployed Vercel URL in your browser:
- Header status pill displays **System Online** with a pulsing green indicator.
- 3D motor view displays live shaft rotation, live telemetry cards update at 10 Hz.
- Anomaly score badge reports active inference without errors.

---

## 6. Troubleshooting & Operational Notes

### Free-Tier Cold Starts
On Render's free tier, the web service spins down after 15 minutes of inactivity:
- The initial request after idle may take **30–50 seconds** while the container starts.
- The frontend gracefully displays reconnection indicators (`Reconnecting...`) and automatically resumes once the backend wakes up.
- For 100% uptime with no sleep delays, upgrade the Render instance to **Starter ($7/mo)** or use a free monitoring ping service (e.g. UptimeRobot) pinging `/api/health` every 10 minutes.

### WebSocket Connections on HTTPS
When the frontend is accessed via `https://<app>.vercel.app`, browsers require secure WebSockets (`wss://`). The frontend derivation utility in `frontend/src/services/api.ts` automatically promotes `https:` $\rightarrow$ `wss:`.

### CORS Headers
If you configure a custom domain on Vercel (e.g. `https://simulator.mycompany.com`), add the custom domain to `CORS_ORIGINS` in your Render dashboard environment variables:
```
CORS_ORIGINS=http://localhost:5173,https://<your-app>.vercel.app,https://simulator.mycompany.com
```
