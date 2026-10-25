"""Unit and Integration Tests for AI / ML Anomaly Detection Engine (Step 7).

Validates:
- Synthetic dataset generation (reproducibility, shapes, physical bounds, fault scenarios).
- Isolation Forest model pipeline (fitting, predict 1/-1, decision_function continuous score).
- Input validation (NaN, infinite, mismatched feature dimension handling).
- Model serialization and artifact persistence (joblib + metadata JSON).
- Diagnostic context generation without fabricated root cause claims.
- FastAPI REST endpoints (/api/v1/ai/status, /predict, /latest, /metrics).
- Regression compatibility with existing sensor simulator and WebSocket infrastructure.
"""

import math
from pathlib import Path
import numpy as np
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.dataset import (
    FEATURE_NAMES,
    generate_evaluation_dataset,
    generate_fault_scenario,
    generate_normal_operating_data,
)
from app.ml.model import MotorAnomalyDetector
from app.ml.persistence import load_model, save_model
from app.schemas.ai import AnomalyPredictionInput
from app.services.anomaly_detector import AnomalyDetectionService, get_anomaly_service
from app.services.sensor_simulator import get_sensor_simulator


@pytest.fixture
def client():
    """FastAPI TestClient fixture."""
    return TestClient(app)


# =============================================================================
# 1. Dataset Pipeline Tests
# =============================================================================

def test_dataset_reproducibility():
    """Verify that dataset generation produces identical results with identical random seeds."""
    data1 = generate_normal_operating_data(n_samples=50, seed=42)
    data2 = generate_normal_operating_data(n_samples=50, seed=42)
    data3 = generate_normal_operating_data(n_samples=50, seed=99)

    assert np.array_equal(data1, data2), "Identical seeds must produce identical data"
    assert not np.array_equal(data1, data3), "Different seeds should produce different sequences"


def test_dataset_shape_and_features():
    """Check dataset shape, feature count, and basic physical realism."""
    n_samples = 200
    data = generate_normal_operating_data(n_samples=n_samples, seed=123)

    assert data.shape == (n_samples, 3)
    # Check no NaN or infinite values
    assert not np.isnan(data).any()
    assert not np.isinf(data).any()

    # Verify normal bounds for electric motor
    temps, vibs, rpms = data[:, 0], data[:, 1], data[:, 2]
    assert 58.0 <= temps.min() and temps.max() <= 78.0
    assert 0.8 <= vibs.min() and vibs.max() <= 1.9
    assert 1478.0 <= rpms.min() and rpms.max() <= 1496.0


def test_fault_scenarios_generation():
    """Verify all four simulated fault scenarios generate expected anomaly characteristics."""
    scenarios = ["overheating", "excessive_vibration", "rpm_instability", "combined_fault"]

    for sc in scenarios:
        fault_data = generate_fault_scenario(sc, n_samples=50, seed=200)
        assert fault_data.shape == (50, 3)
        assert not np.isnan(fault_data).any()

        temps, vibs, rpms = fault_data[:, 0], fault_data[:, 1], fault_data[:, 2]
        if sc == "overheating":
            assert temps.max() > 85.0, "Overheating should exhibit high temperature"
        elif sc == "excessive_vibration":
            assert vibs.max() > 3.0, "Excessive vibration should exceed normal bounds"
        elif sc == "rpm_instability":
            assert rpms.min() < 1450.0, "RPM instability should show significant speed drop"
        elif sc == "combined_fault":
            assert temps.max() > 90.0 and vibs.max() > 3.0, "Combined fault should affect multiple channels"


def test_evaluation_dataset_separation():
    """Ensure evaluation dataset maintains strict label separation and scenario balance."""
    X, y, labels = generate_evaluation_dataset(n_normal=100, n_per_fault=25, seed=555)

    assert len(X) == 200
    assert len(y) == 200
    assert len(labels) == 200
    assert np.sum(y == 0) == 100  # Normal inliers
    assert np.sum(y == 1) == 100  # Fault outliers


# =============================================================================
# 2. Model & Pipeline Tests
# =============================================================================

def test_isolation_forest_fit_and_predict():
    """Verify Isolation Forest fits on normal data and classifies nominal vs anomalous samples."""
    train_data = generate_normal_operating_data(n_samples=500, seed=42)
    detector = MotorAnomalyDetector(n_estimators=50, contamination=0.03, random_state=42)
    detector.fit(train_data)

    assert detector.is_fitted
    assert detector.model is not None

    # Normal sample deep in healthy distribution
    pred_normal, score_normal, is_anom_normal = detector.predict_single(68.0, 1.20, 1488.0)
    assert pred_normal == 1, "Nominal baseline sample should be classified as inlier (1)"
    assert not is_anom_normal
    assert score_normal > 0.0, "Normal reading should have positive anomaly decision score"

    # Extreme fault sample (overheating + severe vibration)
    pred_fault, score_fault, is_anom_fault = detector.predict_single(125.0, 8.5, 1200.0)
    assert pred_fault == -1, "Severe fault reading should be classified as anomaly (-1)"
    assert is_anom_fault
    assert score_fault < 0.0, "Anomalous reading should have negative anomaly decision score"


def test_model_invalid_inputs():
    """Verify robust exception handling for mismatched dimensions and NaN/infinite inputs."""
    train_data = generate_normal_operating_data(n_samples=100, seed=42)
    detector = MotorAnomalyDetector(n_estimators=20, random_state=42)
    detector.fit(train_data)

    # Wrong feature count
    with pytest.raises(ValueError):
        detector.predict(np.array([[68.0, 1.2]]))  # Only 2 features

    # NaN input
    with pytest.raises(ValueError):
        detector.predict(np.array([[np.nan, 1.2, 1488.0]]))

    # Infinite input
    with pytest.raises(ValueError):
        detector.predict(np.array([[68.0, np.inf, 1488.0]]))


def test_diagnostic_context_generation():
    """Verify diagnostic context generates descriptive, objective reference notes."""
    detector = MotorAnomalyDetector(n_estimators=20, random_state=42)
    train_data = generate_normal_operating_data(n_samples=100, seed=42)
    detector.fit(train_data)

    # High temperature test
    ctx = detector.generate_diagnostic_context(
        temperature=115.0,
        vibration=1.2,
        rpm=1488.0,
        is_anomaly=True,
        anomaly_score=-0.12,
    )
    assert "elevated" in ctx.deviations[0].lower()
    assert "Anomalous" in ctx.inlier_status

    # Nominal test
    ctx_normal = detector.generate_diagnostic_context(
        temperature=68.0,
        vibration=1.2,
        rpm=1488.0,
        is_anomaly=False,
        anomaly_score=0.15,
    )
    assert len(ctx_normal.deviations) == 0
    assert "Nominal" in ctx_normal.inlier_status


# =============================================================================
# 3. Model Persistence Tests
# =============================================================================

def test_model_persistence_roundtrip(tmp_path: Path):
    """Test saving and loading trained model artifact to a temporary directory."""
    train_data = generate_normal_operating_data(n_samples=200, seed=42)
    detector = MotorAnomalyDetector(n_estimators=30, random_state=42)
    detector.fit(train_data)

    model_path, meta_path = save_model(
        detector=detector,
        evaluation_metrics={"test_metric": 0.99},
        training_sample_count=200,
        artifacts_dir=tmp_path,
    )

    assert model_path.exists()
    assert meta_path.exists()

    # Reload from disk
    loaded_detector, loaded_meta = load_model(artifacts_dir=tmp_path)
    assert loaded_detector.is_fitted
    assert loaded_meta["training_sample_count"] == 200

    # Predictions must match exactly
    orig_pred, orig_score, _ = detector.predict_single(70.0, 1.3, 1485.0)
    load_pred, load_score, _ = loaded_detector.predict_single(70.0, 1.3, 1485.0)

    assert orig_pred == load_pred
    assert math.isclose(orig_score, load_score, rel_tol=1e-5)


# =============================================================================
# 4. Service Layer Tests
# =============================================================================

def test_service_prediction_validation():
    """Verify AnomalyDetectionService handles invalid fields and missing values gracefully."""
    service = get_anomaly_service()
    assert service.is_ready

    # Valid prediction input
    valid_input = AnomalyPredictionInput(temperature=68.5, vibration=1.22, rpm=1488.0)
    resp = service.predict(valid_input)
    assert resp.is_anomaly is False
    assert resp.prediction == 1
    assert "temperature" in resp.features_evaluated

    # Missing/NaN values should trigger 422
    with pytest.raises(Exception):
        service.predict({"temperature": float("nan"), "vibration": 1.2, "rpm": 1488.0})


# =============================================================================
# 5. FastAPI Endpoints Tests
# =============================================================================

def test_api_ai_status(client: TestClient):
    """Verify GET /api/v1/ai/status returns correct metadata and readiness."""
    response = client.get("/api/v1/ai/status")
    assert response.status_code == 200
    data = response.json()

    assert data["model_loaded"] is True
    assert data["status"] == "ready"
    assert data["algorithm"] == "IsolationForest (scikit-learn)"
    assert data["features"] == ["temperature", "vibration", "rpm"]
    assert data["training_sample_count"] > 0


def test_api_ai_predict_normal(client: TestClient):
    """Verify POST /api/v1/ai/predict with normal values returns inlier prediction."""
    payload = {
        "temperature": 68.2,
        "vibration": 1.25,
        "rpm": 1488.1,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_anomaly"] is False
    assert data["prediction"] == 1
    assert data["anomaly_score"] > 0.0
    assert data["features_evaluated"]["temperature"] == 68.2
    assert "Nominal" in data["diagnostic_context"]["inlier_status"]


def test_api_ai_predict_fault(client: TestClient):
    """Verify POST /api/v1/ai/predict with severe anomalous values returns outlier prediction."""
    payload = {
        "temperature": 128.5,
        "vibration": 8.7,
        "rpm": 1180.0,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["is_anomaly"] is True
    assert data["prediction"] == -1
    assert data["anomaly_score"] < 0.0
    assert len(data["diagnostic_context"]["deviations"]) > 0
    assert "Anomalous" in data["diagnostic_context"]["inlier_status"]


def test_api_ai_predict_validation_error(client: TestClient):
    """Verify POST /api/v1/ai/predict rejects invalid types or missing required values."""
    # Missing vibration
    response = client.post("/api/v1/ai/predict", json={"temperature": 68.0, "rpm": 1488.0})
    assert response.status_code == 422


def test_api_ai_latest_live_inference(client: TestClient):
    """Verify GET /api/v1/ai/latest scores the current reading from the active simulator."""
    simulator = get_sensor_simulator()
    simulator.step()  # Ensure at least one reading exists

    response = client.get("/api/v1/ai/latest")
    assert response.status_code == 200
    data = response.json()

    assert "prediction" in data
    assert "anomaly_score" in data
    assert "features_evaluated" in data
    assert data["source"] == "live_simulator_stream"


def test_api_ai_metrics(client: TestClient):
    """Verify GET /api/v1/ai/metrics returns benchmark metrics and synthetic disclaimer."""
    response = client.get("/api/v1/ai/metrics")
    assert response.status_code == 200
    data = response.json()

    assert "evaluation_summary" in data
    summary = data["evaluation_summary"]
    assert "confusion_matrix" in summary
    assert "accuracy" in summary
    assert "precision" in summary
    assert "recall" in summary
    assert "f1_score" in summary
    assert "synthetic" in data["disclaimer"].lower()


# =============================================================================
# 6. Advanced Edge Cases, Boundaries & Pipeline Verification
# =============================================================================

def test_train_pipeline_end_to_end(tmp_path: Path):
    """Test full execution of train_and_evaluate function."""
    from app.ml.train import train_and_evaluate

    summary = train_and_evaluate(
        n_train_samples=250,
        n_eval_normal=80,
        n_eval_per_fault=20,
        train_seed=123,
        eval_seed=456,
        n_estimators=25,
        artifacts_dir=tmp_path,
    )

    assert "confusion_matrix" in summary
    assert "scenario_breakdown" in summary
    assert summary["accuracy"] >= 0.85
    assert "normal" in summary["scenario_breakdown"]
    assert "overheating" in summary["scenario_breakdown"]
    assert (tmp_path / "isolation_forest_v1.joblib").exists()
    assert (tmp_path / "isolation_forest_v1_metadata.json").exists()


def test_corrupted_model_file_handling(tmp_path: Path):
    """Verify load_model raises RuntimeError when joblib artifact is corrupt."""
    model_file = tmp_path / "isolation_forest_v1.joblib"
    meta_file = tmp_path / "isolation_forest_v1_metadata.json"

    # Write corrupt data
    model_file.write_bytes(b"corrupt_non_joblib_data")
    meta_file.write_text('{"model_name": "test"}', encoding="utf-8")

    with pytest.raises(RuntimeError):
        load_model(artifacts_dir=tmp_path)


def test_missing_metadata_file_handling(tmp_path: Path):
    """Verify load_model raises FileNotFoundError when metadata JSON is missing."""
    model_file = tmp_path / "isolation_forest_v1.joblib"
    model_file.write_bytes(b"dummy")

    with pytest.raises(FileNotFoundError):
        load_model(artifacts_dir=tmp_path)


def test_boundary_diagnostic_deviations():
    """Verify diagnostic context generation across distinct parameter deviation scenarios."""
    detector = MotorAnomalyDetector(n_estimators=10, random_state=42)
    train_data = generate_normal_operating_data(n_samples=50, seed=42)
    detector.fit(train_data)

    # 1. Low temperature deviation
    ctx_cold = detector.generate_diagnostic_context(45.0, 1.2, 1488.0, is_anomaly=True, anomaly_score=-0.1)
    assert any("below normal" in d for d in ctx_cold.deviations)

    # 2. High vibration deviation
    ctx_vib = detector.generate_diagnostic_context(68.0, 3.5, 1488.0, is_anomaly=True, anomaly_score=-0.1)
    assert any("Vibration is unusually high" in d for d in ctx_vib.deviations)

    # 3. Low RPM deviation (slip)
    ctx_slip = detector.generate_diagnostic_context(68.0, 1.2, 1350.0, is_anomaly=True, anomaly_score=-0.1)
    assert any("slip/drop" in d for d in ctx_slip.deviations)

    # 4. High RPM deviation (overspeed)
    ctx_fast = detector.generate_diagnostic_context(68.0, 1.2, 1510.0, is_anomaly=False, anomaly_score=0.1)
    assert any("slightly elevated" in d for d in ctx_fast.deviations)


def test_service_unloaded_fallback():
    """Verify AnomalyDetectionService gracefully signals unavailable when model is not loaded."""
    service = AnomalyDetectionService()
    # Explicitly do not load
    service._is_initialized = True
    service._detector = None

    status_resp = service.get_status()
    assert status_resp.model_loaded is False
    assert status_resp.status == "not_loaded"

    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc_info:
        service.predict({"temperature": 68.0, "vibration": 1.2, "rpm": 1488.0})
    assert exc_info.value.status_code == 503


def test_api_predict_retains_custom_metadata(client: TestClient):
    """Verify POST /api/v1/ai/predict retains custom device_id and timestamp in output."""
    payload = {
        "device_id": "PUMP-MOTOR-WEST-04",
        "timestamp": "2026-10-21T18:30:00Z",
        "temperature": 68.0,
        "vibration": 1.2,
        "rpm": 1488.0,
    }
    response = client.post("/api/v1/ai/predict", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["device_id"] == "PUMP-MOTOR-WEST-04"
    assert "2026-10-21T18:30:00" in data["timestamp"]


def test_api_root_metadata(client: TestClient):
    """Verify GET / returns root service information and links to all sensor and AI endpoints."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()

    assert data["status"] == "online"
    assert "ai_status" in data
    assert "ai_latest" in data
    assert "ai_metrics" in data
    assert "sensors_latest" in data
    assert "sensors_ws" in data

