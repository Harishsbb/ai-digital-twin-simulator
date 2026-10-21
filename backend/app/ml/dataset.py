"""Synthetic Telemetry Dataset Generator for Motor Anomaly Detection.

Generates reproducible normal operating baseline data and distinct industrial fault scenarios
based on the 3-phase induction motor physical parameters (IND-MTR-415V-01).

DISCLAIMER:
All generated datasets are synthetic, physics-informed simulations for digital twin
demonstrations and do not establish measured performance on actual physical industrial equipment.
"""

from typing import Dict, List, Tuple
import math
import numpy as np

# Feature schema contract
FEATURE_NAMES: List[str] = ["temperature", "vibration", "rpm"]
FEATURE_UNITS: Dict[str, str] = {
    "temperature": "°C",
    "vibration": "mm/s RMS",
    "rpm": "RPM",
}

# Nominal baseline operating ranges (4-pole 50Hz 150kW Induction Motor)
TEMP_BASELINE: float = 68.0
TEMP_NORMAL_MIN: float = 58.0
TEMP_NORMAL_MAX: float = 78.0

VIB_BASELINE: float = 1.20
VIB_NORMAL_MIN: float = 0.80
VIB_NORMAL_MAX: float = 1.90

RPM_BASELINE: float = 1488.0
RPM_NORMAL_MIN: float = 1478.0
RPM_NORMAL_MAX: float = 1496.0


def generate_normal_operating_data(
    n_samples: int = 6000,
    dt: float = 0.5,
    seed: int = 42,
) -> np.ndarray:
    """Generate reproducible normal motor operating telemetry using Ornstein-Uhlenbeck processes.

    Simulates continuous mean-reverting thermal dissipation, ISO Zone A vibration with 25Hz
    rotational harmonics, and synchronous line speed with physical slip inertia.

    Returns:
        np.ndarray of shape (n_samples, 3) with columns [temperature, vibration, rpm].
    """
    rng = np.random.RandomState(seed)

    temp = TEMP_BASELINE + rng.normal(0, 1.0)
    vib = VIB_BASELINE + rng.normal(0, 0.05)
    rpm = RPM_BASELINE + rng.normal(0, 1.5)

    data = np.zeros((n_samples, 3), dtype=np.float64)

    # Simulation parameters matching sensor_simulator.py
    theta_temp = 0.05
    sigma_temp = 0.08
    theta_vib = 0.25
    sigma_vib = 0.05
    theta_rpm = 0.35
    sigma_rpm = 1.4

    for t in range(n_samples):
        # 1. Temperature: OU process around baseline with subtle operational drift
        temp_drift = theta_temp * (TEMP_BASELINE - temp) * dt
        temp_noise = rng.normal(0, sigma_temp * math.sqrt(dt))
        temp = np.clip(temp + temp_drift + temp_noise, TEMP_NORMAL_MIN, TEMP_NORMAL_MAX)

        # 2. Vibration: OU process with rotational harmonic ripple
        harmonic = 0.06 * math.sin(t * 0.15)
        vib_drift = theta_vib * (VIB_BASELINE + harmonic - vib) * dt
        vib_noise = rng.normal(0, sigma_vib * math.sqrt(dt))
        vib = np.clip(vib + vib_drift + vib_noise, VIB_NORMAL_MIN, VIB_NORMAL_MAX)

        # 3. RPM: OU process around synchronous frequency with slip
        rpm_drift = theta_rpm * (RPM_BASELINE - rpm) * dt
        rpm_noise = rng.normal(0, sigma_rpm * math.sqrt(dt))
        rpm = np.clip(rpm + rpm_drift + rpm_noise, RPM_NORMAL_MIN, RPM_NORMAL_MAX)

        data[t, 0] = round(float(temp), 2)
        data[t, 1] = round(float(vib), 2)
        data[t, 2] = round(float(rpm), 1)

    return data


def generate_fault_scenario(
    scenario: str,
    n_samples: int = 250,
    seed: int = 101,
) -> np.ndarray:
    """Generate synthetic telemetry for specific industrial fault scenarios.

    Supported scenarios:
    - 'overheating': Stator thermal breakdown (84°C to 135°C), mild vibration rise.
    - 'excessive_vibration': Bearing spall / rotor unbalance (2.8 to 11.5 mm/s RMS).
    - 'rpm_instability': Torque slip / phase imbalance (1150 to 1420 RPM).
    - 'combined_fault': Critical multi-channel failure (high temp, heavy vib, degraded RPM).

    Returns:
        np.ndarray of shape (n_samples, 3) with columns [temperature, vibration, rpm].
    """
    rng = np.random.RandomState(seed)
    data = np.zeros((n_samples, 3), dtype=np.float64)

    if scenario == "overheating":
        # Stator winding overheating: progressive thermal buildup
        temps = np.linspace(84.0, 132.0, n_samples) + rng.normal(0, 1.2, n_samples)
        # Thermal expansion produces slightly elevated vibration
        vibs = 1.6 + (temps - 84.0) * 0.012 + rng.normal(0, 0.1, n_samples)
        vibs = np.clip(vibs, 1.2, 3.5)
        # Minor slip drop under thermal resistance
        rpms = RPM_BASELINE - (temps - 84.0) * 0.5 + rng.normal(0, 3.0, n_samples)
        rpms = np.clip(rpms, 1440.0, 1492.0)

    elif scenario == "excessive_vibration":
        # Bearing flaking / cage defect: ISO Zone C & D vibration spikes
        vibs = rng.uniform(3.2, 9.8, n_samples) + (rng.uniform(0, 1, n_samples) ** 3) * 2.5
        vibs = np.clip(vibs, 2.5, 13.5)
        # Bearing friction friction-induced moderate temperature rise
        temps = 72.0 + rng.uniform(0, 16.0, n_samples)
        # Slight speed flutter from bearing drag
        rpms = RPM_BASELINE + rng.normal(0, 6.0, n_samples)

    elif scenario == "rpm_instability":
        # Severe rotor slip, power voltage dips, or mechanical load surges
        rpms = rng.uniform(1050.0, 1420.0, n_samples) + rng.normal(0, 15.0, n_samples)
        rpms = np.clip(rpms, 900.0, 1450.0)
        # High slip induces winding current rise & temperature climb
        temps = 74.0 + (1488.0 - rpms) * 0.04 + rng.normal(0, 1.5, n_samples)
        temps = np.clip(temps, 68.0, 95.0)
        # Torque oscillations cause elevated vibration
        vibs = 1.7 + rng.exponential(0.6, n_samples)
        vibs = np.clip(vibs, 1.1, 4.2)

    elif scenario == "combined_fault":
        # Severe compounded multi-failure mode
        temps = np.linspace(92.0, 138.0, n_samples) + rng.normal(0, 2.0, n_samples)
        vibs = np.linspace(4.0, 12.0, n_samples) + rng.normal(0, 0.8, n_samples)
        rpms = np.linspace(1440.0, 1180.0, n_samples) + rng.normal(0, 12.0, n_samples)

    else:
        raise ValueError(f"Unknown fault scenario: '{scenario}'")

    data[:, 0] = np.round(temps, 2)
    data[:, 1] = np.round(vibs, 2)
    data[:, 2] = np.round(rpms, 1)
    return data


def generate_evaluation_dataset(
    n_normal: int = 1200,
    n_per_fault: int = 300,
    seed: int = 999,
) -> Tuple[np.ndarray, np.ndarray, List[str]]:
    """Generate a held-out evaluation dataset containing normal and fault scenarios.

    Guarantees strict separation from training data (uses different random seed and sizes).

    Returns:
        X: np.ndarray of shape (N, 3)
        y: np.ndarray of shape (N,) where 0 = normal (inlier), 1 = anomaly (fault)
        scenario_labels: List[str] length N with scenario names
    """
    scenarios = ["overheating", "excessive_vibration", "rpm_instability", "combined_fault"]

    # Generate held-out normal test samples
    normal_data = generate_normal_operating_data(n_samples=n_normal, dt=0.5, seed=seed)
    X_list = [normal_data]
    y_list = [np.zeros(n_normal, dtype=np.int32)]
    labels_list = ["normal"] * n_normal

    for idx, sc in enumerate(scenarios):
        fault_data = generate_fault_scenario(scenario=sc, n_samples=n_per_fault, seed=seed + 10 + idx)
        X_list.append(fault_data)
        y_list.append(np.ones(n_per_fault, dtype=np.int32))
        labels_list.extend([sc] * n_per_fault)

    X = np.vstack(X_list)
    y = np.concatenate(y_list)
    return X, y, labels_list
