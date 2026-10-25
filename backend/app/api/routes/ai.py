"""FastAPI endpoints for Machine Learning Anomaly Detection Engine (Step 7).

Provides model inspection, benchmark metrics retrieval, manual telemetry scoring,
and real-time inference on the active sensor simulation stream.
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.schemas.ai import (
    AIModelMetricsResponse,
    AIModelStatusResponse,
    AnomalyPredictionInput,
    AnomalyPredictionResponse,
)
from app.services.anomaly_detector import AnomalyDetectionService, get_anomaly_service
from app.services.sensor_simulator import SensorDataSimulator, get_sensor_simulator

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/v1/ai", tags=["AI Anomaly Detection"])


@router.get(
    "/status",
    response_model=AIModelStatusResponse,
    summary="Get AI model operational status & metadata",
    description="Inspect whether the Isolation Forest model is loaded, its version, trained features, and sample count.",
)
async def get_ai_status(
    service: AnomalyDetectionService = Depends(get_anomaly_service),
) -> AIModelStatusResponse:
    """Retrieve operational state and feature metadata of the trained ML model."""
    return service.get_status()


@router.post(
    "/predict",
    response_model=AnomalyPredictionResponse,
    summary="Run ML anomaly inference on sensor reading",
    description="Submit temperature, vibration, and RPM telemetry to obtain Isolation Forest anomaly prediction and continuous score.",
)
async def predict_anomaly(
    reading: AnomalyPredictionInput,
    service: AnomalyDetectionService = Depends(get_anomaly_service),
) -> AnomalyPredictionResponse:
    """Evaluate point-in-time sensor values using the trained Isolation Forest model."""
    result = service.predict(reading=reading, source="user_telemetry_submission")
    # Only persist real operational telemetry, not hypothetical sandbox experiments
    dev_id = reading.device_id or ""
    if not (dev_id.startswith("HYPOTHETICAL") or dev_id.startswith("WHATIF")):
        try:
            from app.db.repositories import AsyncPersistenceManager
            AsyncPersistenceManager.schedule_prediction_persistence(result, source="user_telemetry_submission")
        except Exception as db_err:
            logger.debug(f"Prediction persistence skipped: {db_err}")
    return result


@router.get(
    "/latest",
    response_model=AnomalyPredictionResponse,
    summary="Run ML anomaly inference on latest live simulator telemetry",
    description="Retrieve the latest reading from the running sensor simulator and score it through the Isolation Forest model.",
)
async def predict_latest_simulator_reading(
    simulator: SensorDataSimulator = Depends(get_sensor_simulator),
    service: AnomalyDetectionService = Depends(get_anomaly_service),
) -> AnomalyPredictionResponse:
    """Run real-time inference against the active sensor simulator's current state."""
    latest_reading = simulator.get_latest_reading()
    if latest_reading is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sensor simulator has not produced any telemetry packets yet.",
        )
    result = service.predict(reading=latest_reading, source="live_simulator_stream")
    try:
        from app.db.repositories import AsyncPersistenceManager
        AsyncPersistenceManager.schedule_prediction_persistence(result, source="live_simulator_stream")
    except Exception as db_err:
        logger.debug(f"Live prediction persistence skipped: {db_err}")
    return result


@router.get(
    "/metrics",
    response_model=AIModelMetricsResponse,
    summary="Get ML model evaluation benchmarks",
    description="Retrieve held-out test dataset evaluation metrics, confusion matrix, precision/recall, and scenario detection rates.",
)
async def get_ai_metrics(
    service: AnomalyDetectionService = Depends(get_anomaly_service),
) -> AIModelMetricsResponse:
    """Retrieve model evaluation metrics evaluated against held-out synthetic test scenarios."""
    return service.get_metrics()
