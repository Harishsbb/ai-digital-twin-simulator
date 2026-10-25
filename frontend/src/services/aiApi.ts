/**
 * AI Anomaly Detection API Service
 * 
 * Provides typed, resilient HTTP client services for scikit-learn Isolation Forest
 * status, real-time telemetry inference, manual prediction testing, and evaluation metrics.
 */

import type {
  AIModelMetricsResponse,
  AIModelStatusResponse,
  AnomalyPredictionInput,
  AnomalyPredictionResponse,
} from '../types'
import { getApiBaseUrl } from './api.ts'

export class AIError extends Error {
  public status?: number
  public isNetworkError: boolean
  public isTimeout: boolean

  constructor(
    message: string,
    options?: { status?: number; isNetworkError?: boolean; isTimeout?: boolean }
  ) {
    super(message)
    this.name = 'AIError'
    this.status = options?.status
    this.isNetworkError = options?.isNetworkError ?? false
    this.isTimeout = options?.isTimeout ?? false
  }
}

export interface RequestOptions {
  signal?: AbortSignal
  timeoutMs?: number
}

/**
 * Internal fetch wrapper with timeout support and strict error parsing.
 */
async function fetchWithTimeout(
  endpoint: string,
  init: RequestInit = {},
  timeoutMs = 6000
): Promise<Response> {
  const baseUrl = getApiBaseUrl()
  const url = `${baseUrl}${endpoint}`

  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    controller.abort()
  }, timeoutMs)

  // Chain external signal if provided
  if (init.signal) {
    init.signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...init.headers,
      },
    })
    return response
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new AIError(`Request timed out after ${timeoutMs}ms: ${endpoint}`, {
        isTimeout: true,
      })
    }
    throw new AIError(
      err instanceof Error ? err.message : `Network connection failed to ${endpoint}`,
      { isNetworkError: true }
    )
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Inspect model loading state, version, and feature configuration.
 * GET /api/v1/ai/status
 */
export async function fetchAIStatus(options?: RequestOptions): Promise<AIModelStatusResponse> {
  const response = await fetchWithTimeout('/api/v1/ai/status', { signal: options?.signal }, options?.timeoutMs)

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = String(errJson.detail)
    } catch {
      // Use statusText if body is not JSON
    }
    throw new AIError(`Failed to fetch AI status: ${errorDetail}`, {
      status: response.status,
    })
  }

  return response.json()
}

/**
 * Score the latest running simulator reading directly on the backend.
 * GET /api/v1/ai/latest
 */
export async function fetchAILatest(options?: RequestOptions): Promise<AnomalyPredictionResponse> {
  const response = await fetchWithTimeout('/api/v1/ai/latest', { signal: options?.signal }, options?.timeoutMs)

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = String(errJson.detail)
    } catch {
      // Use statusText
    }
    throw new AIError(`Failed to score latest sensor reading: ${errorDetail}`, {
      status: response.status,
    })
  }

  return response.json()
}

/**
 * Submit custom or historical telemetry payload for Isolation Forest inference.
 * POST /api/v1/ai/predict
 */
export async function predictAnomaly(
  input: AnomalyPredictionInput,
  options?: RequestOptions
): Promise<AnomalyPredictionResponse> {
  const response = await fetchWithTimeout(
    '/api/v1/ai/predict',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      signal: options?.signal,
    },
    options?.timeoutMs
  )

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = typeof errJson.detail === 'string' ? errJson.detail : JSON.stringify(errJson.detail)
    } catch {
      // Use statusText
    }
    throw new AIError(`Prediction failed (${response.status}): ${errorDetail}`, {
      status: response.status,
    })
  }

  return response.json()
}

/**
 * Retrieve held-out evaluation metrics, confusion matrix, and scenario breakdowns.
 * GET /api/v1/ai/metrics
 */
export async function fetchAIMetrics(options?: RequestOptions): Promise<AIModelMetricsResponse> {
  const response = await fetchWithTimeout('/api/v1/ai/metrics', { signal: options?.signal }, options?.timeoutMs)

  if (!response.ok) {
    let errorDetail = response.statusText
    try {
      const errJson = await response.json()
      if (errJson?.detail) errorDetail = String(errJson.detail)
    } catch {
      // Use statusText
    }
    throw new AIError(`Failed to fetch AI metrics: ${errorDetail}`, {
      status: response.status,
    })
  }

  return response.json()
}

/**
 * Helper to correctly interpret Isolation Forest raw predictions and decision scores.
 * 
 * Rules:
 * - Raw prediction: 1 = inlier (conforms to normal distribution), -1 = anomaly (outlier).
 * - Continuous score: lower/negative = more anomalous; higher/positive = deeper inlier.
 * - Score is NOT a percentage probability and NOT a time-to-failure metric.
 */
export function interpretAnomalyScore(prediction: number, score: number): {
  isAnomaly: boolean
  label: 'Normal' | 'Anomaly Detected'
  badgeColor: string
  scoreDescription: string
} {
  const isAnomaly = prediction === -1 || score < 0
  return {
    isAnomaly,
    label: isAnomaly ? 'Anomaly Detected' : 'Normal',
    badgeColor: isAnomaly ? 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]' : 'text-[#059669] bg-[#ECFDF5] border-[#A7F3D0]',
    scoreDescription: isAnomaly
      ? 'Score < 0.0: Sample falls into low-density feature space (Isolation Forest outlier)'
      : 'Score >= 0.0: Sample conforms to high-density learned normal baseline (inlier)',
  }
}
