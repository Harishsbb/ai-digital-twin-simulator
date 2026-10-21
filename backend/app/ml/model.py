"""Machine Learning Anomaly Detection Model for Induction Motor Telemetry.

Uses scikit-learn's Isolation Forest algorithm to detect anomalous sensor patterns
by isolating observations via random attribute partitioning.

Mathematical Concept & Boundaries:
- IsolationForest.predict() returns 1 for inliers (normal) and -1 for anomalies (outliers).
- decision_function() returns a continuous anomaly score where lower/negative values indicate
  greater divergence from the normal baseline distribution. It is NOT a calibrated probability.
- contamination controls the expected proportion of outliers for threshold calibration.
  It is NOT a probability of motor failure.
- Isolation Forest is an unsupervised detector; it does not automatically diagnose mechanical
  root causes (e.g., bearing raceway fatigue vs winding insulation breakdown). Any supplementary
  interpretability notes are provided strictly as diagnostic context based on empirical ranges.
"""

from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple, Union
import numpy as np
from sklearn.ensemble import IsolationForest

from app.ml.dataset import (
    FEATURE_NAMES,
    FEATURE_UNITS,
    RPM_NORMAL_MAX,
    RPM_NORMAL_MIN,
    TEMP_NORMAL_MAX,
    TEMP_NORMAL_MIN,
    VIB_NORMAL_MAX,
    VIB_NORMAL_MIN,
)


@dataclass
class DiagnosticContext:
    """Statistical interpretation of sensor readings relative to learned nominal operating bounds.
    
    NOTE: These explanations are diagnostic context based on reference parameters,
    NOT model-diagnosed mechanical root causes.
    """
    summary: str
    deviations: List[str]
    inlier_status: str


class MotorAnomalyDetector:
    """Production wrapper around scikit-learn's IsolationForest for motor telemetry."""

    def __init__(
        self,
        n_estimators: int = 150,
        contamination: float = 0.03,
        random_state: int = 42,
        max_samples: Union[str, int] = "auto",
    ):
        self.n_estimators = n_estimators
        self.contamination = contamination
        self.random_state = random_state
        self.max_samples = max_samples

        self.model: Optional[IsolationForest] = None
        self.is_fitted: bool = False
        self.feature_names: List[str] = list(FEATURE_NAMES)
        self.feature_units: Dict[str, str] = dict(FEATURE_UNITS)

    def _init_estimator(self) -> IsolationForest:
        return IsolationForest(
            n_estimators=self.n_estimators,
            contamination=self.contamination,
            random_state=self.random_state,
            max_samples=self.max_samples,
            n_jobs=-1,
        )

    def fit(self, X: np.ndarray) -> "MotorAnomalyDetector":
        """Fit Isolation Forest on normal baseline operating telemetry.

        Args:
            X: 2D numpy array of shape (n_samples, 3) in order [temperature, vibration, rpm].
        """
        if not isinstance(X, np.ndarray):
            X = np.asarray(X, dtype=np.float64)

        if X.ndim != 2 or X.shape[1] != len(self.feature_names):
            raise ValueError(
                f"Expected 2D array with {len(self.feature_names)} features {self.feature_names}, "
                f"got shape {X.shape}"
            )

        if np.isnan(X).any() or np.isinf(X).any():
            raise ValueError("Training data contains NaN or infinite values.")

        self.model = self._init_estimator()
        self.model.fit(X)
        self.is_fitted = True
        return self

    def predict(self, X: np.ndarray) -> np.ndarray:
        """Predict whether observations are inliers (1) or anomalies (-1)."""
        if not self.is_fitted or self.model is None:
            raise RuntimeError("Model has not been fitted or loaded yet.")
        X_arr = self._validate_and_format_input(X)
        return self.model.predict(X_arr)

    def decision_function(self, X: np.ndarray) -> np.ndarray:
        """Compute the average anomaly score of observations.
        
        Values < 0 correspond to anomalies under the configured contamination threshold;
        higher positive values indicate typical inliers deep inside the normal distribution.
        """
        if not self.is_fitted or self.model is None:
            raise RuntimeError("Model has not been fitted or loaded yet.")
        X_arr = self._validate_and_format_input(X)
        return self.model.decision_function(X_arr)

    def _validate_and_format_input(self, X: Union[np.ndarray, List[float], List[List[float]]]) -> np.ndarray:
        arr = np.asarray(X, dtype=np.float64)
        if arr.ndim == 1:
            if arr.shape[0] != len(self.feature_names):
                raise ValueError(
                    f"Expected 1D sample with {len(self.feature_names)} features, got {arr.shape[0]}"
                )
            arr = arr.reshape(1, -1)
        elif arr.ndim == 2:
            if arr.shape[1] != len(self.feature_names):
                raise ValueError(
                    f"Expected 2D array with {len(self.feature_names)} features, got {arr.shape[1]}"
                )
        else:
            raise ValueError(f"Input must be 1D or 2D array, got {arr.ndim}D.")

        if np.isnan(arr).any() or np.isinf(arr).any():
            raise ValueError("Input data contains NaN or infinite values.")

        return arr

    def predict_single(
        self,
        temperature: float,
        vibration: float,
        rpm: float,
    ) -> Tuple[int, float, bool]:
        """Inference on a single point-in-time sensor reading.

        Returns:
            Tuple of:
            - prediction: int (1 for inlier, -1 for anomaly)
            - anomaly_score: float (decision_function value, negative = anomaly)
            - is_anomaly: bool (True if prediction == -1)
        """
        sample = np.array([[temperature, vibration, rpm]], dtype=np.float64)
        pred = int(self.predict(sample)[0])
        score = float(self.decision_function(sample)[0])
        is_anomaly = bool(pred == -1)
        return pred, score, is_anomaly

    def generate_diagnostic_context(
        self,
        temperature: float,
        vibration: float,
        rpm: float,
        is_anomaly: bool,
        anomaly_score: float,
    ) -> DiagnosticContext:
        """Generate human-readable diagnostic context based on empirical normal bounds.

        Explicitly marked as diagnostic reference context, NOT model-derived fault diagnosis.
        """
        deviations: List[str] = []

        if temperature > TEMP_NORMAL_MAX:
            deviations.append(
                f"Temperature is elevated ({temperature:.1f}°C) relative to normal operating range ({TEMP_NORMAL_MIN:.1f}°C – {TEMP_NORMAL_MAX:.1f}°C)."
            )
        elif temperature < TEMP_NORMAL_MIN:
            deviations.append(
                f"Temperature is below normal operating baseline ({temperature:.1f}°C)."
            )

        if vibration > VIB_NORMAL_MAX:
            deviations.append(
                f"Vibration is unusually high ({vibration:.2f} mm/s) exceeding ISO Zone A normal boundary ({VIB_NORMAL_MAX:.2f} mm/s)."
            )

        if rpm < RPM_NORMAL_MIN:
            deviations.append(
                f"RPM shows significant slip/drop ({rpm:.1f} RPM) below nominal operating threshold ({RPM_NORMAL_MIN:.1f} RPM)."
            )
        elif rpm > RPM_NORMAL_MAX:
            deviations.append(
                f"RPM is slightly elevated ({rpm:.1f} RPM) above nominal synchronous window ({RPM_NORMAL_MAX:.1f} RPM)."
            )

        if is_anomaly:
            if deviations:
                summary = "Sensor telemetry deviates from the learned normal multi-dimensional operating distribution."
            else:
                summary = "Multi-channel sensor combination exhibits unusual pattern divergence despite individual values nearing marginal thresholds."
            inlier_status = "Anomalous (Outlier detected by Isolation Forest)"
        else:
            summary = "Telemetry conforms to the learned normal induction motor operating distribution."
            inlier_status = "Nominal (Inlier within learned distribution)"

        return DiagnosticContext(
            summary=summary,
            deviations=deviations,
            inlier_status=inlier_status,
        )

    def get_config(self) -> Dict[str, Any]:
        """Return model hyperparameters and configuration."""
        return {
            "model_type": "IsolationForest",
            "n_estimators": self.n_estimators,
            "contamination": self.contamination,
            "random_state": self.random_state,
            "max_samples": str(self.max_samples),
            "features": self.feature_names,
            "feature_units": self.feature_units,
        }
