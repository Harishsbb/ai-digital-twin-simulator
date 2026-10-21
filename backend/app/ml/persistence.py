"""Model Persistence and Metadata Management for Motor Anomaly Detector.

Saves and loads trained Isolation Forest models using joblib with accompanying JSON metadata.
Guarantees safe paths within the application artifacts directory and provides clear error handling.
"""

from datetime import datetime, timezone
import json
import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional, Tuple
import joblib

from app.ml.model import MotorAnomalyDetector

logger = logging.getLogger(__name__)

# Default artifact directory relative to this file
DEFAULT_ARTIFACTS_DIR = Path(__file__).resolve().parent / "artifacts"
MODEL_FILENAME = "isolation_forest_v1.joblib"
METADATA_FILENAME = "isolation_forest_v1_metadata.json"
MODEL_VERSION = "1.0.0"
MODEL_NAME = "IsolationForest-Motor-AnomalyDetector"


def get_artifacts_dir(custom_path: Optional[Path] = None) -> Path:
    """Resolve and ensure the artifacts directory exists."""
    artifacts_dir = custom_path or DEFAULT_ARTIFACTS_DIR
    artifacts_dir.mkdir(parents=True, exist_ok=True)
    return artifacts_dir


def save_model(
    detector: MotorAnomalyDetector,
    evaluation_metrics: Optional[Dict[str, Any]] = None,
    training_sample_count: int = 0,
    artifacts_dir: Optional[Path] = None,
) -> Tuple[Path, Path]:
    """Persist a fitted MotorAnomalyDetector and associated metadata.

    Args:
        detector: Fitted MotorAnomalyDetector instance.
        evaluation_metrics: Evaluation summary dictionary.
        training_sample_count: Number of training samples fitted on.
        artifacts_dir: Optional custom storage path.

    Returns:
        Tuple of (model_file_path, metadata_file_path).
    """
    if not detector.is_fitted or detector.model is None:
        raise ValueError("Cannot persist an unfitted MotorAnomalyDetector.")

    target_dir = get_artifacts_dir(artifacts_dir)
    model_path = target_dir / MODEL_FILENAME
    metadata_path = target_dir / METADATA_FILENAME

    # Persist the scikit-learn estimator using joblib
    joblib.dump(detector.model, model_path, compress=3)

    # Build comprehensive metadata document
    metadata: Dict[str, Any] = {
        "model_name": MODEL_NAME,
        "model_version": MODEL_VERSION,
        "algorithm": "IsolationForest (scikit-learn)",
        "saved_at_utc": datetime.now(timezone.utc).isoformat(),
        "training_sample_count": training_sample_count,
        "random_seed": detector.random_state,
        "contamination": detector.contamination,
        "n_estimators": detector.n_estimators,
        "max_samples": str(detector.max_samples),
        "features": detector.feature_names,
        "feature_units": detector.feature_units,
        "evaluation_metrics": evaluation_metrics or {},
        "disclaimer": (
            "Model trained and evaluated on synthetic physics-informed simulator data. "
            "Metrics reflect synthetic benchmark scenarios and do not represent verified "
            "physical equipment certifications."
        ),
    }

    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info(f"Model saved successfully to {model_path} and metadata to {metadata_path}")
    return model_path, metadata_path


def load_model(artifacts_dir: Optional[Path] = None) -> Tuple[MotorAnomalyDetector, Dict[str, Any]]:
    """Safely load the persisted Isolation Forest model and its metadata.

    Raises:
        FileNotFoundError: If model or metadata files do not exist.
        RuntimeError: If loading fails due to corruption or version incompatibility.
    """
    target_dir = get_artifacts_dir(artifacts_dir)
    model_path = target_dir / MODEL_FILENAME
    metadata_path = target_dir / METADATA_FILENAME

    if not model_path.exists():
        raise FileNotFoundError(
            f"Trained model artifact not found at '{model_path}'. "
            "Run training script first (`python -m app.ml.train`)."
        )

    if not metadata_path.exists():
        raise FileNotFoundError(f"Model metadata file not found at '{metadata_path}'.")

    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            metadata = json.load(f)

        sklearn_model = joblib.load(model_path)

        detector = MotorAnomalyDetector(
            n_estimators=metadata.get("n_estimators", 150),
            contamination=metadata.get("contamination", 0.03),
            random_state=metadata.get("random_seed", 42),
        )
        detector.model = sklearn_model
        detector.is_fitted = True
        detector.feature_names = metadata.get("features", detector.feature_names)
        detector.feature_units = metadata.get("feature_units", detector.feature_units)

        logger.info(f"Loaded {metadata.get('model_name')} v{metadata.get('model_version')}")
        return detector, metadata

    except Exception as err:
        logger.error(f"Failed to load model from '{model_path}': {err}")
        raise RuntimeError(f"Model artifact could not be loaded: {err}") from err


def get_metadata(artifacts_dir: Optional[Path] = None) -> Optional[Dict[str, Any]]:
    """Read metadata without instantiating the scikit-learn model."""
    target_dir = get_artifacts_dir(artifacts_dir)
    metadata_path = target_dir / METADATA_FILENAME
    if not metadata_path.exists():
        return None
    try:
        with open(metadata_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as err:
        logger.warning(f"Could not read metadata from {metadata_path}: {err}")
        return None


def is_model_available(artifacts_dir: Optional[Path] = None) -> bool:
    """Check if valid model and metadata artifacts exist on disk."""
    target_dir = get_artifacts_dir(artifacts_dir)
    return (target_dir / MODEL_FILENAME).exists() and (target_dir / METADATA_FILENAME).exists()
