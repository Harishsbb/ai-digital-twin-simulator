# Supabase PostgreSQL Database Integration (Step 12)

This document provides setup and security instructions for the **Supabase PostgreSQL** database integration in the **AI Digital Twin Simulator** backend.

---

## 1. Architecture Overview

- **Database Provider**: Supabase Cloud PostgreSQL
- **Project**: `ai-digital-twin-db`
- **Connection Mode**: Session Pooler (IPv4 compatible via Supabase Pooler on Port `5432`)
- **ORM**: SQLAlchemy 2.0 (with connection pre-ping, auto-recycle, and connection pooling)
- **Driver**: `psycopg2-binary`
- **Migrations**: Alembic 1.13+
- **Security**: Environment-based configuration with strict credential masking and zero passwords logged.

---

## 2. Security & Credentials Protection

1. **Never Commit Secrets**:
   - `backend/.env` is strictly ignored by `.gitignore`.
   - Never commit connection strings or passwords to Git.
   - Use `backend/.env.example` as a template with placeholders only.

2. **Automatic Password URL-Encoding**:
   - If your password contains special characters (e.g. `@`, `#`, `/`, `!`, `$`), the application automatically URL-encodes it using Python's `urllib.parse.quote_plus`.

3. **Masked Logging**:
   - `Settings.get_masked_database_url()` masks the password (`:****@`) in logs and health check outputs.

---

## 3. Configuration Instructions

Create or edit your local `backend/.env` file:

### Option A: Discrete Connection Parameters (Recommended)
```env
# Supabase PostgreSQL Session Pooler
DB_HOST=aws-0-ap-northeast-2.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.gqilhgcbqkbttbqqgoqb
DB_PASSWORD=your_actual_supabase_password_here
DB_SSLMODE=require

# Pool Tuning
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10
DB_POOL_TIMEOUT=10
DB_ECHO=false
```

### Option B: Full Connection URL
```env
DATABASE_URL=postgresql://postgres.gqilhgcbqkbttbqqgoqb:your_actual_password_here@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

---

## 4. Running Database Migrations

Apply the initial schema to your Supabase PostgreSQL database:

```powershell
# From the backend directory
cd "D:\projects\ai domain project\backend"

# Apply all migrations to the latest revision
python -m alembic upgrade head
```

To roll back a migration:
```powershell
python -m alembic downgrade -1
```

---

## 5. Database Schema & Tables

The migration creates 4 dedicated tables:

| Table Name | Description | Key Columns | Indexes |
| :--- | :--- | :--- | :--- |
| `sensor_readings` | Live motor telemetry stream | `id`, `device_id`, `timestamp`, `temperature`, `vibration`, `rpm`, `mode`, `is_running`, `sequence` | `device_id`, `timestamp`, `sequence`, composite `(device_id, timestamp)` |
| `ai_predictions` | Isolation Forest inference evaluations | `id`, `device_id`, `timestamp`, `is_anomaly`, `prediction`, `anomaly_score`, `model_name`, `source`, `features_evaluated`, `diagnostic_context` | `device_id`, `timestamp`, `is_anomaly`, `source`, composite `(device_id, is_anomaly, timestamp)` |
| `alert_records` | Operational alarm episodes & operator acknowledgments | `id`, `episode_id`, `device_id`, `alert_type`, `severity`, `title`, `message`, `status`, `timestamp`, `acknowledged_at`, `acknowledged_by`, `dismissed_at`, `anomaly_score`, `sensor_snapshot` | `episode_id`, `device_id`, `severity`, `status`, `timestamp`, composite `(status, timestamp)` |
| `whatif_experiments` | Saved counterfactual simulation runs | `id`, `name`, `timestamp`, `temperature`, `vibration`, `rpm`, `is_anomaly`, `prediction`, `anomaly_score`, `baseline_snapshot` | `timestamp`, `is_anomaly` |

---

## 6. Non-Blocking Persistence & Live Stream Isolation

1. **Zero WebSocket Lag**:
   - Background telemetry broadcasts step every 0.5s.
   - Database writes are dispatched asynchronously via `AsyncPersistenceManager` to background thread pool executors, ensuring database latency never delays WebSocket packets.

2. **Hypothetical Sandbox Isolation**:
   - Inferences created by the **What-If Simulation** (`/what-if`) use device identifiers such as `HYPOTHETICAL-WHATIF-01` or `WHATIF-BASELINE-01`.
   - The persistence dispatcher skips storing hypothetical runs as real sensor telemetry or live machine alerts.

---

## 7. Verification & Health Monitoring

To verify database connectivity:
```bash
curl http://localhost:8000/api/v1/db/health
```

Expected response when connected:
```json
{
  "status": "connected",
  "connected": true,
  "database_type": "Supabase PostgreSQL (Session Pooler)",
  "host": "aws-0-ap-northeast-2.pooler.supabase.com",
  "port": 5432,
  "database": "postgres",
  "masked_url": "postgresql://postgres.gqilhgcbqkbttbqqgoqb:****@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require",
  "latency_ms": 32.4,
  "tables_registered": [
    "sensor_readings",
    "ai_predictions",
    "alert_records",
    "whatif_experiments"
  ],
  "timestamp": "2026-10-25T10:45:00.000000Z",
  "error": null
}
```

---

## 8. Graceful Fallback Mode

If the Supabase database is unreachable or no credentials are provided:
- The backend logs an informational warning without crashing.
- Live telemetry continues streaming via the in-memory circular ring buffer (500 items).
- All `/api/health` and simulation endpoints remain operational.
