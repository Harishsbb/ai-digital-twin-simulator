"""Machine Learning modules and predictive pipelines for AI Digital Twin.

Step 7 Implementation:
- MotorAnomalyDetector: Isolation Forest anomaly detector
- Synthetic Telemetry Dataset Generator
- Model Persistence & Metadata Serialization
"""

from app.ml.dataset import (
    FEATURE_NAMES,
    FEATURE_UNITS,
    generate_evaluation_dataset,
    generate_fault_scenario,
    generate_normal_operating_data,
)
from app.ml.model import DiagnosticContext, MotorAnomalyDetector
from app.ml.persistence import get_metadata, is_model_available, load_model, save_model

__all__ = [
    "FEATURE_NAMES",
    "FEATURE_UNITS",
    "DiagnosticContext",
    "MotorAnomalyDetector",
    "generate_evaluation_dataset",
    "generate_fault_scenario",
    "generate_normal_operating_data",
    "get_metadata",
    "is_model_available",
    "load_model",
    "save_model",
]

