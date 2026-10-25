/**
 * Step 11: What-If Simulation Presets, Bounds & Delta Comparison Logic
 * 
 * Provides predefined operational scenarios aligned with the induction motor
 * synthetic dataset and ISO 10816 vibration severity standards.
 */

import type {
  BaselineComparisonDelta,
  ModelComparisonResult,
  ParameterValidationErrors,
  ScenarioPreset,
  WhatIfParameters,
} from '../types/whatIf'
import type { AnomalyPredictionResponse } from '../types'

export const WHAT_IF_BOUNDS = {
  temperature: {
    min: 20.0,
    max: 140.0,
    default: 68.0,
    step: 0.5,
    unit: '°C',
    label: 'Stator Winding Temperature',
  },
  vibration: {
    min: 0.0,
    max: 14.0,
    default: 1.2,
    step: 0.05,
    unit: 'mm/s',
    label: 'Drive-End Bearing Vibration',
  },
  rpm: {
    min: 600.0,
    max: 1800.0,
    default: 1488.0,
    step: 1.0,
    unit: 'RPM',
    label: 'Shaft Rotational Speed',
  },
}

export const NOMINAL_BASELINE_PARAMETERS: WhatIfParameters = {
  temperature: 68.0,
  vibration: 1.2,
  rpm: 1488.0,
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'nominal_baseline',
    name: 'Nominal Baseline Operating State',
    category: 'nominal',
    description: 'Motor operating under balanced 4-pole synchronous conditions with standard thermal dissipation (ISO 10816 Zone A).',
    parameters: {
      temperature: 68.0,
      vibration: 1.2,
      rpm: 1488.0,
    },
    expectedBehaviorHint: 'Consistently classified as Nominal (Inlier) with positive decision score in dense baseline subspace.',
  },
  {
    id: 'elevated_temp_warning',
    name: 'Elevated Stator Temperature',
    category: 'thermal',
    description: 'Thermal buildup simulating cooling fin dust obstruction or elevated ambient heat while mechanical dynamics remain normal.',
    parameters: {
      temperature: 88.5,
      vibration: 1.45,
      rpm: 1482.0,
    },
    expectedBehaviorHint: 'Thermal elevation approaches upper operational envelope; Isolation Forest decision score decreases toward decision boundary.',
  },
  {
    id: 'severe_thermal_overheating',
    name: 'Severe Winding Overheating (NEMA Class F)',
    category: 'thermal',
    description: 'Stator winding insulation temperature exceeding 105°C critical limit due to prolonged electrical overload.',
    parameters: {
      temperature: 112.0,
      vibration: 2.1,
      rpm: 1465.0,
    },
    expectedBehaviorHint: 'Strongly classified as Anomaly (Outlier) due to high dimensional divergence along temperature axis.',
  },
  {
    id: 'bearing_unbalance_zone_c',
    name: 'Bearing Unbalance (ISO Zone C)',
    category: 'vibration',
    description: 'Rotational unbalance or mild shaft misalignment causing vibration to breach ISO 10816 Zone C unrestricted limit (4.5 mm/s).',
    parameters: {
      temperature: 72.0,
      vibration: 5.2,
      rpm: 1485.0,
    },
    expectedBehaviorHint: 'Classified as Anomaly (Outlier); decision score dips into negative territory as vibration leaves training cluster.',
  },
  {
    id: 'severe_bearing_spall_zone_d',
    name: 'Severe Bearing Defect (ISO Zone D)',
    category: 'vibration',
    description: 'Advanced rolling element bearing raceway spalling and cage damage generating violent vibration in excess of 7.1 mm/s.',
    parameters: {
      temperature: 82.0,
      vibration: 8.4,
      rpm: 1470.0,
    },
    expectedBehaviorHint: 'Severely negative anomaly score; tree depth partitioning easily isolates point as extreme outlier.',
  },
  {
    id: 'rotor_slip_and_drag',
    name: 'Severe Motor Slip & Mechanical Drag',
    category: 'mechanical',
    description: 'Heavy mechanical drag, partial rotor bar fracture, or severe slip causing shaft rotational velocity to drop below 1350 RPM.',
    parameters: {
      temperature: 79.0,
      vibration: 2.8,
      rpm: 1320.0,
    },
    expectedBehaviorHint: 'Classified as Anomaly (Outlier); model isolates velocity deficit from the learned 1488 RPM cluster.',
  },
  {
    id: 'compound_catastrophic_fault',
    name: 'Compound Multi-Variable Fault',
    category: 'compound',
    description: 'Concurrently elevated stator temperature (118°C), destructive vibration (9.2 mm/s in Zone D), and critical rotor stall slip (1240 RPM).',
    parameters: {
      temperature: 118.0,
      vibration: 9.2,
      rpm: 1240.0,
    },
    expectedBehaviorHint: 'Extreme outlier across all three input dimensions; decision function score hits maximum anomaly depths.',
  },
]

/**
 * Validate input parameters against allowed physical ranges and numerical finiteness.
 */
export function validateWhatIfParameters(params: Partial<WhatIfParameters>): ParameterValidationErrors {
  const errors: ParameterValidationErrors = {}

  // Temperature validation
  if (params.temperature === undefined || params.temperature === null || Number.isNaN(params.temperature)) {
    errors.temperature = 'Temperature is required and must be a valid number.'
  } else if (!Number.isFinite(params.temperature)) {
    errors.temperature = 'Temperature must be a finite number.'
  } else if (params.temperature < WHAT_IF_BOUNDS.temperature.min || params.temperature > WHAT_IF_BOUNDS.temperature.max) {
    errors.temperature = `Temperature must be between ${WHAT_IF_BOUNDS.temperature.min}°C and ${WHAT_IF_BOUNDS.temperature.max}°C.`
  }

  // Vibration validation
  if (params.vibration === undefined || params.vibration === null || Number.isNaN(params.vibration)) {
    errors.vibration = 'Vibration is required and must be a valid number.'
  } else if (!Number.isFinite(params.vibration)) {
    errors.vibration = 'Vibration must be a finite number.'
  } else if (params.vibration < WHAT_IF_BOUNDS.vibration.min || params.vibration > WHAT_IF_BOUNDS.vibration.max) {
    errors.vibration = `Vibration must be between ${WHAT_IF_BOUNDS.vibration.min} and ${WHAT_IF_BOUNDS.vibration.max} mm/s.`
  }

  // RPM validation
  if (params.rpm === undefined || params.rpm === null || Number.isNaN(params.rpm)) {
    errors.rpm = 'RPM is required and must be a valid number.'
  } else if (!Number.isFinite(params.rpm)) {
    errors.rpm = 'RPM must be a finite number.'
  } else if (params.rpm < WHAT_IF_BOUNDS.rpm.min || params.rpm > WHAT_IF_BOUNDS.rpm.max) {
    errors.rpm = `RPM must be between ${WHAT_IF_BOUNDS.rpm.min} and ${WHAT_IF_BOUNDS.rpm.max} RPM.`
  }

  return errors
}

/**
 * Compute differences between baseline parameters and hypothetical scenario parameters.
 */
export function calculateParameterDeltas(
  baseline: WhatIfParameters,
  scenario: WhatIfParameters
): BaselineComparisonDelta[] {
  const deltas: BaselineComparisonDelta[] = [
    {
      parameter: 'temperature',
      baselineValue: baseline.temperature,
      scenarioValue: scenario.temperature,
      difference: Number((scenario.temperature - baseline.temperature).toFixed(2)),
      unit: '°C',
      status:
        scenario.temperature > baseline.temperature
          ? 'increased'
          : scenario.temperature < baseline.temperature
          ? 'decreased'
          : 'unchanged',
    },
    {
      parameter: 'vibration',
      baselineValue: baseline.vibration,
      scenarioValue: scenario.vibration,
      difference: Number((scenario.vibration - baseline.vibration).toFixed(2)),
      unit: 'mm/s',
      status:
        scenario.vibration > baseline.vibration
          ? 'increased'
          : scenario.vibration < baseline.vibration
          ? 'decreased'
          : 'unchanged',
    },
    {
      parameter: 'rpm',
      baselineValue: baseline.rpm,
      scenarioValue: scenario.rpm,
      difference: Number((scenario.rpm - baseline.rpm).toFixed(1)),
      unit: 'RPM',
      status:
        scenario.rpm > baseline.rpm
          ? 'increased'
          : scenario.rpm < baseline.rpm
          ? 'decreased'
          : 'unchanged',
    },
  ]

  return deltas
}

/**
 * Generate technical explanation of baseline vs scenario ML classification comparison.
 */
export function generateComparisonSummary(
  baselinePred: AnomalyPredictionResponse | null,
  scenarioPred: AnomalyPredictionResponse | null,
  deltas: BaselineComparisonDelta[]
): ModelComparisonResult {
  if (!scenarioPred) {
    return {
      baselinePrediction: baselinePred,
      scenarioPrediction: null,
      isClassificationChanged: false,
      scoreDifference: null,
      summaryExplanation: 'Run simulation to evaluate hypothetical parameters through the Isolation Forest model.',
    }
  }

  const isChanged = baselinePred ? baselinePred.is_anomaly !== scenarioPred.is_anomaly : false
  const scoreDiff = baselinePred
    ? Number((scenarioPred.anomaly_score - baselinePred.anomaly_score).toFixed(4))
    : null

  const changedDeltas = deltas.filter((d) => d.status !== 'unchanged')
  const shiftList = changedDeltas
    .map((d) => `${d.parameter} (${d.difference > 0 ? '+' : ''}${d.difference} ${d.unit})`)
    .join(', ')

  let explanation: string

  if (!baselinePred) {
    explanation = scenarioPred.is_anomaly
      ? `Hypothetical inputs classified as Anomaly (Outlier) with decision score ${scenarioPred.anomaly_score >= 0 ? '+' : ''}${scenarioPred.anomaly_score.toFixed(4)}. Establish baseline to compute relative score shifts.`
      : `Hypothetical inputs classified as Normal (Inlier) with decision score +${scenarioPred.anomaly_score.toFixed(4)}. Baseline comparison not yet evaluated.`
  } else if (isChanged) {
    if (scenarioPred.is_anomaly && !baselinePred.is_anomaly) {
      explanation = `Classification shifted from Normal (Inlier) to Anomaly (Outlier). The introduced telemetry deviations [${shiftList}] increased tree isolation paths, producing a score drop of ${scoreDiff}.`
    } else {
      explanation = `Classification transitioned from Anomaly to Normal. Adjusted parameters aligned the reading with the high-density normal training cluster, increasing the decision score by +${Math.abs(scoreDiff ?? 0)}.`
    }
  } else {
    if (scenarioPred.is_anomaly) {
      explanation = `Both baseline and hypothetical scenario are classified as Anomalous. Mathematical decision score difference: ${scoreDiff !== null && scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff}.`
    } else {
      explanation = `Both baseline and hypothetical scenario remain within the learned normal training envelope (Inliers). Decision score difference is ${scoreDiff !== null && scoreDiff >= 0 ? `+${scoreDiff}` : scoreDiff}.`
    }
  }

  return {
    baselinePrediction: baselinePred,
    scenarioPrediction: scenarioPred,
    isClassificationChanged: isChanged,
    scoreDifference: scoreDiff,
    summaryExplanation: explanation,
  }
}
