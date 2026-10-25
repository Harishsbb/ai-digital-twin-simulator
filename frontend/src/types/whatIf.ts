/**
 * Step 11: Interactive What-If Simulation Types
 * 
 * Defines contracts for hypothetical parameter adjustments, scenario presets,
 * baseline-vs-scenario delta comparisons, and in-memory experiment history.
 */

import type { AnomalyPredictionResponse } from './index'

export interface WhatIfParameters {
  temperature: number
  vibration: number
  rpm: number
}

export interface ParameterValidationErrors {
  temperature?: string
  vibration?: string
  rpm?: string
}

export interface ScenarioPreset {
  id: string
  name: string
  category: 'nominal' | 'thermal' | 'vibration' | 'mechanical' | 'compound'
  description: string
  parameters: WhatIfParameters
  expectedBehaviorHint: string
}

export interface BaselineComparisonDelta {
  parameter: 'temperature' | 'vibration' | 'rpm'
  baselineValue: number
  scenarioValue: number
  difference: number
  unit: string
  status: 'increased' | 'decreased' | 'unchanged'
}

export interface ModelComparisonResult {
  baselinePrediction: AnomalyPredictionResponse | null
  scenarioPrediction: AnomalyPredictionResponse | null
  isClassificationChanged: boolean
  scoreDifference: number | null // scenario.score - baseline.score
  summaryExplanation: string
}

export interface SavedExperiment {
  id: string
  name: string
  timestamp: string
  timestampMs: number
  inputs: WhatIfParameters
  prediction: AnomalyPredictionResponse
  baselineSnapshot: {
    inputs: WhatIfParameters
    isAnomaly: boolean
    anomalyScore: number
  } | null
}
