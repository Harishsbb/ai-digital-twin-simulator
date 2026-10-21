"""Machine Learning Anomaly Detection Service for Industrial Motor Telemetry.

Manages runtime model lifecycle, provides high-throughput inference on live or submitted
telemetry packets, validates feature schemas, and generates diagnostic context.
"""

from datetime import datetime, timezone
import logging
import math
from typing import Any, Dict, Optional, Union
from fastapi import HTTPException, status

from app.ml.model import MotorAnomalyDetector
from app.ml.persistence import get_metadata, is_model_available, load_model
from app.schemas.ai import (
    AIModelMetricsResponse,
    AIModelStatusResponse,
    AnomalyPredictionInput,
    AnomalyPredictionResponse,
    DiagnosticContextSchema,
)
from app.schemas.sensor import SensorReading

logger = logging.getLogger(__name__)


class AnomalyDetectionService:
    """Service handling ML inference, lifecycle management, and telemetry diagnostic interpretation."""

    def __init__(self):
        self._detector: Optional[MotorAnomalyDetector] = None
        self._metadata: Optional[Dict[str, Any]] = None
        self._load_error: Optional[str] = None
        self._is_initialized = False

    def load(self, force_reload: bool = False):
        """Load the persisted Isolation Forest model artifact into memory."""
        if self._is_initialized and not force_reload:
            return

        try:
            if not is_model_available():
                self._load_error = "Model artifacts not found. Run training script first (`python -m app.ml.train`)."
                logger.warning(self._load_error)
                self._detector = None
                self._metadata = None
                self._is_initialized = True
                return

            detector, metadata = load_model()
            self._detector = detector
            self._metadata = metadata
            self._load_error = None
            self._is_initialized = True
            logger.info(
                f"AnomalyDetectionService loaded {metadata.get('model_name')} "
                f"v{metadata.get('model_version')} with {len(detector.feature_names)} features."
            )
        except Exception as err:
            self._load_error = f"Failed to load ML model artifact: {err}"
            logger.error(self._load_error, exc_info=True)
            self._detector = None
            self._metadata = None
            self._is_initialized = True

    @property
    def is_ready(self) -> bool:
        """Return True if model is loaded and ready for inference."""
        if not self._is_initialized:
            self.load()
        return self._detector is not None and self._detector.is_fitted

    def get_status(self) -> AIModelStatusResponse:
        """Inspect the current operational state, version, and feature configuration of the ML engine."""
        if not self._is_initialized:
            self.load()

        if self.is_ready and self._detector and self._metadata:
            return AIModelStatusResponse(
                model_loaded=True,
                status="ready",
                model_name=self._metadata.get("model_name", "IsolationForest-Motor-AnomalyDetector"),
                model_version=self._metadata.get("model_version", "1.0.0"),
                algorithm=self._metadata.get("algorithm", "IsolationForest (scikit-learn)"),
                features=self._detector.feature_names,
                feature_units=self._detector.feature_units,
                training_sample_count=self._metadata.get("training_sample_count"),
                contamination=self._metadata.get("contamination"),
                trained_at=self._metadata.get("saved_at_utc"),
            )
        else:
            return AIModelStatusResponse(
                model_loaded=False,
                status="not_loaded" if not self._load_error else "degraded",
                model_name="IsolationForest-Motor-AnomalyDetector",
                model_version="1.0.0",
                algorithm="IsolationForest (scikit-learn)",
                features=["temperature", "vibration", "rpm"],
                feature_units={"temperature": "°C", "vibration": "mm/s RMS", "rpm": "RPM"},
                training_sample_count=None,
                contamination=None,
                trained_at=None,
            )

    def get_metrics(self) -> AIModelMetricsResponse:
        """Return held-out benchmark evaluation metrics and training metadata."""
        if not self._is_initialized:
            self.load()

        meta = self._metadata or get_metadata() or {}
        eval_metrics = meta.get("evaluation_metrics", {})

        return AIModelMetricsResponse(
            model_name=meta.get("model_name", "IsolationForest-Motor-AnomalyDetector"),
            model_version=meta.get("model_version", "1.0.0"),
            evaluation_summary=eval_metrics,
            disclaimer=(
                "These evaluation metrics are based on synthetic simulator-generated data "
                "and do not establish performance on real industrial equipment."
            ),
        )

    def predict(
        self,
        reading: Union[AnomalyPredictionInput, SensorReading, Dict[str, Any]],
        source: str = "simulated_sensor_data",
    ) -> AnomalyPredictionResponse:
        """Execute Isolation Forest inference on a point-in-time sensor reading.

        Validates all inputs, ensures numerical finiteness, and returns anomaly score + classification.
        """
        if not self.is_ready or self._detector is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Anomaly detection model is not available. {self._load_error or 'Please train the model.'}",
            )

        # Extract telemetry fields
        if isinstance(reading, dict):
            temp = reading.get("temperature")
            vib = reading.get("vibration")
            rpm = reading.get("rpm")
            device_id = reading.get("device_id", "SIMOTICS-150KW-01")
            ts = reading.get("timestamp") or datetime.now(timezone.utc)
        elif isinstance(reading, (AnomalyPredictionInput, SensorReading)):
            temp = reading.temperature
            vib = reading.vibration
            rpm = reading.rpm
            device_id = reading.device_id
            ts = reading.timestamp or datetime.now(timezone.utc)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported reading payload type: {type(reading)}",
            )

        # Numerical validation
        for name, val in [("temperature", temp), ("vibration", vib), ("rpm", rpm)]:
            if val is None:
                raise HTTPException(
                    status_code=422,
                    detail=f"Field '{name}' is required and cannot be null.",
                )
            try:
                f_val = float(val)
                if math.isnan(f_val) or math.isinf(f_val):
                    raise ValueError(f"Value for '{name}' must be finite, got {f_val}")
            except (TypeError, ValueError) as err:
                raise HTTPException(
                    status_code=422,
                    detail=f"Invalid value for '{name}': {err}",
                )

        f_temp = float(temp)
        f_vib = float(vib)
        f_rpm = float(rpm)

        # Execute model prediction
        pred, score, is_anomaly = self._detector.predict_single(
            temperature=f_temp,
            vibration=f_vib,
            rpm=f_rpm,
        )

        # Generate diagnostic context
        diag = self._detector.generate_diagnostic_context(
            temperature=f_temp,
            vibration=f_vib,
            rpm=f_rpm,
            is_anomaly=is_anomaly,
            anomaly_score=score,
        )

        return AnomalyPredictionResponse(
            device_id=device_id,
            timestamp=ts if isinstance(ts, datetime) else datetime.now(timezone.utc),
            is_anomaly=is_anomaly,
            prediction=pred,
            anomaly_score=round(score, 4),
            model_name=self._metadata.get("model_name", "IsolationForest-Motor-AnomalyDetector") if self._metadata else "IsolationForest-Motor-AnomalyDetector",
            model_version=self._metadata.get("model_version", "1.0.0") if self._metadata else "1.0.0",
            source=source,
            features_evaluated={
                "temperature": round(f_temp, 2),
                "vibration": round(f_vib, 2),
                "rpm": round(f_rpm, 1),
            },
            diagnostic_context=DiagnosticContextSchema(
                summary=diag.summary,
                deviations=diag.deviations,
                inlier_status=diag.inlier_status,
            ),
        )


# Singleton instance
_anomaly_service_instance: Optional[AnomalyDetectionService] = None


def get_anomaly_service() -> AnomalyDetectionService:
    """Dependency provider / singleton accessor for the Anomaly Detection Service."""
    global _anomaly_service_instance
    if _anomaly_service_instance is None:
        _anomaly_service_instance = AnomalyDetectionService()
        _anomaly_service_instance.load()
    return _anomaly_service_instance
