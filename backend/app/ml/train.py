"""Training & Evaluation Pipeline for Motor Telemetry Isolation Forest.

Executes reproducible training on normal operating data, followed by comprehensive
evaluation on a held-out dataset containing both normal and distinct fault scenarios.
Persists the trained model artifact and evaluation metadata to disk.
"""

from pathlib import Path
from typing import Any, Dict, Optional
import numpy as np
from sklearn.metrics import confusion_matrix, f1_score, precision_score, recall_score

from app.ml.dataset import (
    FEATURE_NAMES,
    generate_evaluation_dataset,
    generate_normal_operating_data,
)
from app.ml.model import MotorAnomalyDetector
from app.ml.persistence import save_model


def train_and_evaluate(
    n_train_samples: int = 6000,
    n_eval_normal: int = 1200,
    n_eval_per_fault: int = 300,
    train_seed: int = 42,
    eval_seed: int = 999,
    contamination: float = 0.03,
    n_estimators: int = 150,
    artifacts_dir: Optional[Path] = None,
) -> Dict[str, Any]:
    """Train Isolation Forest on normal baseline telemetry and evaluate against held-out scenarios."""
    print("=" * 70)
    print("AI Digital Twin - Machine Learning Anomaly Detection Training Pipeline")
    print("Algorithm: Isolation Forest (scikit-learn)")
    print(f"Features:  {', '.join(FEATURE_NAMES)}")
    print("=" * 70)

    # 1. Generate Training Telemetry (Strictly Normal baseline data)
    print(f"\n[1/4] Generating {n_train_samples} normal operating training samples (seed={train_seed})...")
    X_train = generate_normal_operating_data(
        n_samples=n_train_samples,
        dt=0.5,
        seed=train_seed,
    )
    print(f"      Training data shape: {X_train.shape}")
    print(f"      Temperature: [{X_train[:, 0].min():.1f}°C – {X_train[:, 0].max():.1f}°C], Mean: {X_train[:, 0].mean():.1f}°C")
    print(f"      Vibration:   [{X_train[:, 1].min():.2f} – {X_train[:, 1].max():.2f} mm/s], Mean: {X_train[:, 1].mean():.2f} mm/s")
    print(f"      RPM:         [{X_train[:, 2].min():.1f} – {X_train[:, 2].max():.1f} RPM], Mean: {X_train[:, 2].mean():.1f} RPM")

    # 2. Fit Isolation Forest
    print(f"\n[2/4] Fitting IsolationForest (n_estimators={n_estimators}, contamination={contamination})...")
    detector = MotorAnomalyDetector(
        n_estimators=n_estimators,
        contamination=contamination,
        random_state=train_seed,
    )
    detector.fit(X_train)
    print("      Model training complete.")

    # 3. Generate Held-out Evaluation Telemetry
    print(f"\n[3/4] Generating held-out evaluation dataset (seed={eval_seed})...")
    X_eval, y_eval_true, scenarios = generate_evaluation_dataset(
        n_normal=n_eval_normal,
        n_per_fault=n_eval_per_fault,
        seed=eval_seed,
    )
    print(f"      Evaluation samples: {len(X_eval)} total ({n_eval_normal} normal, {n_eval_per_fault * 4} fault)")

    # 4. Model Inference & Evaluation Metrics
    print("\n[4/4] Evaluating Isolation Forest across scenarios...")
    # predict() returns 1 for inlier (normal), -1 for anomaly (outlier)
    raw_preds = detector.predict(X_eval)
    scores = detector.decision_function(X_eval)

    # Convert to binary: 1 = detected anomaly, 0 = normal
    y_pred_binary = (raw_preds == -1).astype(int)

    # Overall metrics
    cm = confusion_matrix(y_eval_true, y_pred_binary)
    tn, fp, fn, tp = cm.ravel()

    precision = float(precision_score(y_eval_true, y_pred_binary, zero_division=0))
    recall = float(recall_score(y_eval_true, y_pred_binary, zero_division=0))
    f1 = float(f1_score(y_eval_true, y_pred_binary, zero_division=0))
    fpr = float(fp / (fp + tn)) if (fp + tn) > 0 else 0.0
    accuracy = float((tp + tn) / (tp + tn + fp + fn))

    # Scenario breakdown
    scenario_metrics: Dict[str, Dict[str, Any]] = {}
    unique_scenarios = ["normal", "overheating", "excessive_vibration", "rpm_instability", "combined_fault"]

    for sc in unique_scenarios:
        mask = [s == sc for s in scenarios]
        sub_true = y_eval_true[mask]
        sub_pred = y_pred_binary[mask]
        sub_scores = scores[mask]

        if sc == "normal":
            # For normal, detection rate = true negative rate (specificity)
            correct = int(np.sum(sub_pred == 0))
            total = len(sub_true)
            rate = correct / total if total > 0 else 0.0
            scenario_metrics[sc] = {
                "sample_count": total,
                "inlier_retention_rate": round(rate, 4),
                "false_positive_count": int(np.sum(sub_pred == 1)),
                "mean_anomaly_score": round(float(np.mean(sub_scores)), 4),
            }
        else:
            # For fault scenarios, detection rate = sensitivity (recall within scenario)
            detected = int(np.sum(sub_pred == 1))
            total = len(sub_true)
            rate = detected / total if total > 0 else 0.0
            scenario_metrics[sc] = {
                "sample_count": total,
                "detected_anomaly_count": detected,
                "detection_rate": round(rate, 4),
                "mean_anomaly_score": round(float(np.mean(sub_scores)), 4),
            }

    evaluation_summary: Dict[str, Any] = {
        "evaluation_sample_count": len(X_eval),
        "normal_sample_count": n_eval_normal,
        "fault_sample_count": len(X_eval) - n_eval_normal,
        "confusion_matrix": {
            "true_negatives": int(tn),
            "false_positives": int(fp),
            "false_negatives": int(fn),
            "true_positives": int(tp),
        },
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "false_positive_rate": round(fpr, 4),
        "scenario_breakdown": scenario_metrics,
        "disclaimer": (
            "These evaluation metrics are based on synthetic simulator-generated data "
            "and do not establish performance on real industrial equipment."
        ),
    }

    print("\n" + "=" * 70)
    print("                 EVALUATION RESULTS SUMMARY")
    print("=" * 70)
    print(f"Total Evaluation Samples: {len(X_eval)}")
    print(f"Confusion Matrix:         TN={tn}, FP={fp}, FN={fn}, TP={tp}")
    print(f"Accuracy:                 {accuracy * 100:.2f}%")
    print(f"Precision:                {precision * 100:.2f}%")
    print(f"Recall (Sensitivity):     {recall * 100:.2f}%")
    print(f"F1 Score:                 {f1:.4f}")
    print(f"False Positive Rate:      {fpr * 100:.2f}%")
    print("-" * 70)
    print("Detection Rate by Scenario:")
    print(f"  • Normal Telemetry (Inlier Retention): {scenario_metrics['normal']['inlier_retention_rate'] * 100:.2f}% (FPR: {fpr * 100:.2f}%)")
    for sc in ["overheating", "excessive_vibration", "rpm_instability", "combined_fault"]:
        rate = scenario_metrics[sc]['detection_rate'] * 100
        mean_s = scenario_metrics[sc]['mean_anomaly_score']
        print(f"  • {sc:<21}: {rate:6.2f}% detection (mean score: {mean_s:+.4f})")
    print("=" * 70)

    # 5. Save model and metadata
    model_path, meta_path = save_model(
        detector=detector,
        evaluation_metrics=evaluation_summary,
        training_sample_count=n_train_samples,
        artifacts_dir=artifacts_dir,
    )
    print(f"\nArtifacts persisted:")
    print(f"  Model:    {model_path}")
    print(f"  Metadata: {meta_path}\n")

    return evaluation_summary


if __name__ == "__main__":
    train_and_evaluate()
