"""Pydantic schemas for AI / ML Anomaly Detection Service and Endpoints."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DiagnosticContextSchema(BaseModel):
    """Statistical diagnostic context comparing readings to nominal bounds."""
    summary: str = Field(..., description="Human-readable summary of sensor alignment to normal baseline")
    deviations: List[str] = Field(default_factory=list, description="Specific threshold deviations identified relative to baseline")
    inlier_status: str = Field(..., description="Isolation Forest outlier classification status")


class AnomalyPredictionInput(BaseModel):
    """Input sensor reading payload for ML anomaly inference."""
    temperature: float = Field(
        ...,
        description="Stator winding temperature in degrees Celsius (°C)",
        examples=[68.4],
    )
    vibration: float = Field(
        ...,
        description="Drive-end bearing vibration velocity in mm/s RMS (ISO 10816)",
        examples=[1.25],
    )
    rpm: float = Field(
        ...,
        description="Motor shaft speed in revolutions per minute (RPM)",
        examples=[1488.2],
    )
    device_id: Optional[str] = Field(
        default="SIMOTICS-150KW-01",
        description="Asset identifier",
    )
    timestamp: Optional[datetime] = Field(
        default=None,
        description="Optional timestamp of telemetry collection",
    )


class AnomalyPredictionResponse(BaseModel):
    """Response payload containing Isolation Forest inference results."""
    device_id: str = Field(..., description="Asset identifier")
    timestamp: datetime = Field(..., description="Evaluation timestamp")
    is_anomaly: bool = Field(..., description="True if IsolationForest predicted outlier (-1), False if inlier (1)")
    prediction: int = Field(..., description="Raw scikit-learn prediction: 1 (inlier/normal), -1 (anomaly/outlier)")
    anomaly_score: float = Field(
        ...,
        description="Continuous anomaly score from decision_function(). Negative indicates anomaly under configured contamination threshold.",
    )
    model_name: str = Field(default="IsolationForest-Motor-AnomalyDetector")
    model_version: str = Field(default="1.0.0")
    source: str = Field(default="simulated_sensor_data", description="Data stream source")
    features_evaluated: Dict[str, float] = Field(..., description="Exact feature dictionary used during inference")
    diagnostic_context: DiagnosticContextSchema = Field(
        ...,
        description="Statistical diagnostic reference notes (NOT model-diagnosed mechanical root causes)",
    )


class AIModelStatusResponse(BaseModel):
    """Health and version inspection response for the ML Anomaly Detection Engine."""
    model_loaded: bool = Field(..., description="Whether the trained ML model is loaded and ready in memory")
    status: str = Field(..., description="'ready', 'not_loaded', or 'degraded'")
    model_name: str
    model_version: str
    algorithm: str
    features: List[str]
    feature_units: Dict[str, str]
    training_sample_count: Optional[int] = None
    contamination: Optional[float] = None
    trained_at: Optional[str] = None


class AIModelMetricsResponse(BaseModel):
    """Comprehensive evaluation metrics and test benchmarks for the ML model."""
    model_name: str
    model_version: str
    evaluation_summary: Dict[str, Any]
    disclaimer: str
