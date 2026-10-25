"""Unit & Integration Tests for Step 12: Supabase PostgreSQL Database Integration.

Verifies:
1. Database URL construction, password URL-encoding, and credential masking.
2. SQLAlchemy models for SensorReadings, AIPredictions, AlertRecords, and WhatIfExperiments.
3. CRUD operations, constraints, and indexes using an isolated in-memory test database.
4. Non-blocking persistence dispatcher behavior and error resilience.
5. Database health endpoint (/api/v1/db/health).
6. Alert and What-If persistence endpoints with database session dependency injection.
7. Graceful degradation when the database is offline or unconfigured.
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from sqlalchemy.pool import StaticPool

from app.core.config import Settings
from app.db.base import Base
from app.db.models import (
    AIPredictionModel,
    AlertRecordModel,
    SensorReadingModel,
    WhatIfExperimentModel,
)
from app.db.repositories import (
    AIPredictionRepository,
    AlertRepository,
    AsyncPersistenceManager,
    SensorRepository,
    WhatIfRepository,
)
from app.db.session import get_db, set_custom_engine, reset_engine
from app.main import app
from app.schemas.ai import (
    AnomalyPredictionInput,
    AnomalyPredictionResponse,
    DiagnosticContextSchema,
)
from app.schemas.sensor import SensorReading, SimulatorMode

# Configure isolated in-memory SQLite database for test suite using StaticPool
TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture(scope="function")
def test_db():
    """Create a fresh in-memory database schema for each test."""
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    set_custom_engine(engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)
        reset_engine()


@pytest.fixture
def client(test_db):
    """FastAPI TestClient with overridden get_db dependency pointing to test in-memory database."""
    def override_get_db():
        yield test_db

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


# =============================================================================
# 1. Configuration, URL-Encoding & Credential Masking Tests
# =============================================================================

class TestDatabaseConfiguration:
    def test_database_url_from_discrete_params(self):
        s = Settings(
            database_url=None,
            db_user="postgres.test",
            db_password="SecretPassword123",
            db_host="aws-0.supabase.com",
            db_port=5432,
            db_name="postgres",
            db_sslmode="require",
        )
        url = s.get_database_url()
        assert url is not None
        assert url.startswith("postgresql://postgres.test:SecretPassword123@aws-0.supabase.com:5432/postgres")
        assert "sslmode=require" in url

    def test_database_password_url_encoding(self):
        # Passwords with special characters: '@', '#', '/', '!', '$'
        s = Settings(
            database_url=None,
            db_user="postgres.test",
            db_password="p@ss/word#with$special!chars",
            db_host="pooler.supabase.com",
            db_port=5432,
            db_name="postgres",
        )
        url = s.get_database_url()
        assert url is not None
        # Must encode '@' as '%40', '/' as '%2F', '#' as '%23'
        assert "%40" in url
        assert "%2F" in url
        assert "%23" in url
        assert "p@ss" not in url

    def test_get_masked_database_url_never_exposes_password(self):
        s = Settings(
            database_url="postgresql://user:SuperSecretPassword99@pooler.supabase.com:5432/postgres?sslmode=require"
        )
        masked = s.get_masked_database_url()
        assert "SuperSecretPassword99" not in masked
        assert ":****@" in masked

    def test_postgres_legacy_prefix_converted_to_postgresql(self):
        s = Settings(
            database_url="postgres://user:pass@pooler.supabase.com:5432/postgres"
        )
        assert s.get_database_url().startswith("postgresql://")

    def test_unconfigured_database_url_returns_none(self):
        s = Settings(database_url=None, db_password=None)
        assert s.get_database_url() is None
        assert s.get_masked_database_url() == "Not Configured"


# =============================================================================
# 2. Sensor Reading CRUD & Model Tests
# =============================================================================

class TestSensorRepository:
    def test_save_and_get_latest_reading(self, test_db):
        reading = SensorReading(
            device_id="SIMOTICS-150KW-01",
            timestamp=datetime(2026, 10, 25, 10, 0, 0, tzinfo=timezone.utc),
            temperature=68.42,
            vibration=1.24,
            rpm=1488.2,
            mode=SimulatorMode.NORMAL,
            is_running=True,
            sequence=101,
        )
        saved = SensorRepository.save_reading(test_db, reading)
        assert saved.id is not None
        assert saved.temperature == 68.42
        assert saved.sequence == 101

        latest = SensorRepository.get_latest(test_db, "SIMOTICS-150KW-01")
        assert latest is not None
        assert latest.sequence == 101
        assert latest.temperature == 68.42

    def test_get_history_limit_and_ordering(self, test_db):
        for i in range(10):
            reading = SensorReading(
                device_id="SIMOTICS-150KW-01",
                timestamp=datetime(2026, 10, 25, 10, i, 0, tzinfo=timezone.utc),
                temperature=68.0 + i,
                vibration=1.2,
                rpm=1488.0,
                mode=SimulatorMode.NORMAL,
                is_running=True,
                sequence=i,
            )
            SensorRepository.save_reading(test_db, reading)

        history = SensorRepository.get_history(test_db, "SIMOTICS-150KW-01", limit=5)
        assert len(history) == 5
        # Ordered desc: newest first
        assert history[0].sequence == 9
        assert history[4].sequence == 5


# =============================================================================
# 3. AI Anomaly Prediction CRUD & Model Tests
# =============================================================================

class TestAIPredictionRepository:
    def test_save_and_query_predictions(self, test_db):
        pred = AnomalyPredictionResponse(
            device_id="SIMOTICS-150KW-01",
            timestamp=datetime.now(timezone.utc),
            is_anomaly=True,
            prediction=-1,
            anomaly_score=-0.2145,
            model_name="isolation_forest_induction_motor",
            model_version="1.0.0",
            source="live_simulator_stream",
            features_evaluated={
                "temperature": 112.5,
                "vibration": 2.4,
                "rpm": 1460.0,
            },
            diagnostic_context=DiagnosticContextSchema(
                summary="Elevated temperature",
                deviations=["Stator coil overheating"],
                inlier_status="outlier",
            ),
        )
        saved = AIPredictionRepository.save_prediction(test_db, pred, source="live_simulator_stream")
        assert saved.id is not None
        assert saved.is_anomaly is True
        assert saved.prediction == -1
        assert saved.features_evaluated["temperature"] == 112.5

        recent_anomalies = AIPredictionRepository.get_recent(
            test_db, "SIMOTICS-150KW-01", limit=10, anomalies_only=True
        )
        assert len(recent_anomalies) == 1
        assert recent_anomalies[0].anomaly_score == -0.2145


# =============================================================================
# 4. Alert Record CRUD & Lifecycle Tests
# =============================================================================

class TestAlertRepository:
    def test_save_acknowledge_and_dismiss_alert(self, test_db):
        alert_payload = {
            "id": "alert-uuid-001",
            "episode_id": "ep-999",
            "device_id": "SIMOTICS-150KW-01",
            "alert_type": "HIGH_VIBRATION_ZONE_D",
            "severity": "critical",
            "title": "Severe Bearing Defect",
            "message": "Vibration exceeded 7.1 mm/s",
            "status": "active",
            "anomaly_score": -0.32,
            "sensor_snapshot": {"temperature": 75.0, "vibration": 8.5, "rpm": 1475.0},
        }

        # 1. Save
        alert = AlertRepository.save_alert(test_db, alert_payload)
        assert alert.id == "alert-uuid-001"
        assert alert.status == "active"

        # 2. Acknowledge
        acked = AlertRepository.acknowledge_alert(test_db, "alert-uuid-001", acknowledged_by="lead_engineer")
        assert acked is not None
        assert acked.status == "acknowledged"
        assert acked.acknowledged_by == "lead_engineer"
        assert acked.acknowledged_at is not None

        # 3. Dismiss
        dismissed = AlertRepository.dismiss_alert(test_db, "alert-uuid-001")
        assert dismissed is not None
        assert dismissed.status == "dismissed"
        assert dismissed.dismissed_at is not None

        # Filter query
        dismissed_list = AlertRepository.get_alerts(test_db, status="dismissed")
        assert len(dismissed_list) == 1
        assert dismissed_list[0].id == "alert-uuid-001"


# =============================================================================
# 5. What-If Experiment History CRUD Tests
# =============================================================================

class TestWhatIfRepository:
    def test_save_get_and_delete_experiment(self, test_db):
        exp_payload = {
            "id": "exp-1001",
            "name": "Elevated Stator Temperature Test",
            "temperature": 88.5,
            "vibration": 1.45,
            "rpm": 1482.0,
            "is_anomaly": False,
            "prediction": 1,
            "anomaly_score": 0.045,
            "baseline_snapshot": {"temperature": 68.0, "vibration": 1.2, "rpm": 1488.0},
        }

        # 1. Save
        saved = WhatIfRepository.save_experiment(test_db, exp_payload)
        assert saved.id == "exp-1001"
        assert saved.temperature == 88.5

        # 2. Get list
        experiments = WhatIfRepository.get_experiments(test_db, limit=10)
        assert len(experiments) == 1
        assert experiments[0].name == "Elevated Stator Temperature Test"

        # 3. Delete
        success = WhatIfRepository.delete_experiment(test_db, "exp-1001")
        assert success is True
        assert len(WhatIfRepository.get_experiments(test_db)) == 0


# =============================================================================
# 6. Database API Routes & Health Endpoints
# =============================================================================

class TestDatabaseAPIEndpoints:
    def test_database_health_endpoint(self, client):
        response = client.get("/api/v1/db/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert "connected" in data
        assert "database_type" in data
        assert "tables_registered" in data
        assert len(data["tables_registered"]) == 4

    def test_post_and_get_alert_via_api(self, client):
        payload = {
            "id": "api-alert-01",
            "episode_id": "api-ep-01",
            "device_id": "SIMOTICS-150KW-01",
            "alert_type": "OVERHEATING_CRITICAL",
            "severity": "critical",
            "title": "Winding Overheating",
            "message": "Temperature exceeded 110C",
            "anomaly_score": -0.28,
            "sensor_snapshot": {"temperature": 112.0, "vibration": 1.5, "rpm": 1480.0},
        }
        res = client.post("/api/v1/db/alerts", json=payload)
        assert res.status_code == 201
        assert res.json()["persisted"] is True

        # Fetch alerts
        get_res = client.get("/api/v1/db/alerts")
        assert get_res.status_code == 200
        alerts = get_res.json()["alerts"]
        assert len(alerts) >= 1
        assert alerts[0]["id"] == "api-alert-01"

    def test_acknowledge_and_dismiss_alert_via_api(self, client):
        payload = {
            "id": "api-alert-02",
            "episode_id": "api-ep-02",
            "device_id": "SIMOTICS-150KW-01",
            "title": "Unbalance Alert",
            "message": "Vibration high",
        }
        client.post("/api/v1/db/alerts", json=payload)

        # Ack
        ack_res = client.patch(
            "/api/v1/db/alerts/api-alert-02/acknowledge",
            json={"acknowledged_by": "qa_operator"},
        )
        assert ack_res.status_code == 200
        assert ack_res.json()["alert"]["status"] == "acknowledged"

        # Dismiss
        dismiss_res = client.patch("/api/v1/db/alerts/api-alert-02/dismiss")
        assert dismiss_res.status_code == 200
        assert dismiss_res.json()["alert"]["status"] == "dismissed"

    def test_post_and_get_whatif_experiment_via_api(self, client):
        payload = {
            "id": "api-exp-01",
            "name": "Compound Fault Scenario",
            "temperature": 118.0,
            "vibration": 9.2,
            "rpm": 1240.0,
            "is_anomaly": True,
            "prediction": -1,
            "anomaly_score": -0.41,
        }
        res = client.post("/api/v1/db/whatif/experiments", json=payload)
        assert res.status_code == 201
        assert res.json()["persisted"] is True

        # Fetch
        get_res = client.get("/api/v1/db/whatif/experiments")
        assert get_res.status_code == 200
        exps = get_res.json()["experiments"]
        assert len(exps) >= 1
        assert exps[0]["id"] == "api-exp-01"

        # Delete
        del_res = client.delete("/api/v1/db/whatif/experiments/api-exp-01")
        assert del_res.status_code == 200
        assert del_res.json()["deleted"] is True

    def test_whatif_prediction_does_not_create_operational_alert(self, client):
        """Verify that What-If predictions and experiments never create operational alerts."""
        # 1. Post a severe anomaly to What-If experiments
        whatif_payload = {
            "id": "whatif-exp-test-isolation",
            "name": "High Heat Extreme Scenario",
            "temperature": 135.0,
            "vibration": 10.5,
            "rpm": 1050.0,
            "is_anomaly": True,
            "prediction": -1,
            "anomaly_score": -0.45,
            "baseline_snapshot": {"temperature": 68.0, "vibration": 1.2, "rpm": 1488.0},
        }
        res = client.post("/api/v1/db/whatif/experiments", json=whatif_payload)
        assert res.status_code == 201

        # 2. Call /api/v1/ai/predict with hypothetical outlier
        pred_res = client.post(
            "/api/v1/ai/predict",
            json={"temperature": 135.0, "vibration": 10.5, "rpm": 1050.0, "device_id": "HYPOTHETICAL-01"},
        )
        assert pred_res.status_code == 200
        assert pred_res.json()["is_anomaly"] is True

        # 3. Verify operational alerts table remains pristine (zero alerts)
        alerts_res = client.get("/api/v1/db/alerts")
        assert alerts_res.status_code == 200
        assert len(alerts_res.json()["alerts"]) == 0

    def test_database_endpoints_reject_invalid_payloads(self, client):
        """Verify database endpoints return 422 for malformed payloads and 404 for missing IDs."""
        # Missing required fields in alert
        bad_alert = client.post("/api/v1/db/alerts", json={"title": "Missing fields"})
        assert bad_alert.status_code == 422

        # Missing required fields in whatif experiment
        bad_whatif = client.post("/api/v1/db/whatif/experiments", json={"name": "Incomplete"})
        assert bad_whatif.status_code == 422

        # Non-existent alert acknowledge returns 404
        ack_404 = client.patch("/api/v1/db/alerts/non-existent-alert-uuid/acknowledge")
        assert ack_404.status_code == 404

        # Non-existent alert dismiss returns 404
        dismiss_404 = client.patch("/api/v1/db/alerts/non-existent-alert-uuid/dismiss")
        assert dismiss_404.status_code == 404

    def test_database_health_endpoint_when_disconnected(self, client, monkeypatch):
        """Verify GET /api/v1/db/health safely returns disconnected status when DB ping fails."""
        import app.api.routes.database as db_route
        monkeypatch.setattr(
            db_route,
            "check_db_connection",
            lambda: {
                "status": "disconnected",
                "connected": False,
                "database_url": "postgresql://user:****@host:5432/db",
                "latency_ms": None,
                "error": "Connection refused",
            },
        )
        response = client.get("/api/v1/db/health")
        assert response.status_code == 200
        data = response.json()
        assert data["connected"] is False
        assert data["status"] == "disconnected"
        assert data["error"] == "Connection refused"



# =============================================================================
# 7. Non-blocking Persistence & Error Resilience
# =============================================================================

class TestPersistenceResilience:
    def test_async_save_reading_resilience_when_db_is_none(self):
        reading = SensorReading(
            device_id="SIMOTICS-150KW-01",
            timestamp=datetime.now(timezone.utc),
            temperature=68.4,
            vibration=1.2,
            rpm=1488.0,
            mode=SimulatorMode.NORMAL,
            is_running=True,
            sequence=1,
        )
        # Should not raise any exception even if database is not active
        AsyncPersistenceManager._sync_save_reading(reading)

    def test_async_save_prediction_resilience_when_db_is_none(self):
        pred = AnomalyPredictionResponse(
            device_id="SIMOTICS-150KW-01",
            timestamp=datetime.now(timezone.utc),
            is_anomaly=False,
            prediction=1,
            anomaly_score=0.15,
            model_name="isolation_forest_induction_motor",
            model_version="1.0.0",
            source="live_simulator_stream",
            features_evaluated={
                "temperature": 68.4,
                "vibration": 1.2,
                "rpm": 1488.0,
            },
            diagnostic_context=DiagnosticContextSchema(
                summary="Normal baseline alignment",
                deviations=[],
                inlier_status="inlier",
            ),
        )
        # Should not raise exception
        AsyncPersistenceManager._sync_save_prediction(pred, source="live_simulator_stream")
