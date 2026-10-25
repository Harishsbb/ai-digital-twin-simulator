import { createContext } from 'react'
import type {
  AIModelMetricsResponse,
  AIModelStatusResponse,
  AnomalyPredictionInput,
  AnomalyPredictionResponse,
} from '../types'

export type AIModelReadiness = 'loading' | 'ready' | 'unavailable' | 'error'

export interface AIStreamContextValue {
  // Model status
  modelStatus: AIModelStatusResponse | null
  modelReadiness: AIModelReadiness
  modelError: string | null
  isModelReady: boolean

  // Live prediction
  latestPrediction: AnomalyPredictionResponse | null
  isAnomaly: boolean
  anomalyScore: number | null
  rawPrediction: number | null
  predictionLoading: boolean
  predictionError: string | null
  lastPredictionAt: number | null
  isStale: boolean

  // Evaluation metrics
  metrics: AIModelMetricsResponse | null
  metricsLoading: boolean
  metricsError: string | null

  // Actions
  refreshStatus: () => Promise<void>
  refreshLatest: () => Promise<void>
  refreshMetrics: () => Promise<void>
  predictManual: (input: AnomalyPredictionInput) => Promise<AnomalyPredictionResponse>
}

export const AIStreamContext = createContext<AIStreamContextValue | null>(null)
