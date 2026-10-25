import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  fetchAIMetrics,
  fetchAILatest,
  fetchAIStatus,
  predictAnomaly as apiPredictAnomaly,
} from '../services/aiApi.ts'
import type {
  AIModelMetricsResponse,
  AIModelStatusResponse,
  AnomalyPredictionInput,
  AnomalyPredictionResponse,
} from '../types'
import {
  AIStreamContext,
  type AIModelReadiness,
  type AIStreamContextValue,
} from './AIStreamContextDef.ts'
import { useSensorStream } from './useSensorStream.ts'

export const AIStreamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connectionStatus, isSimulatorRunning } = useSensorStream()

  // 1. Model Status State
  const [modelStatus, setModelStatus] = useState<AIModelStatusResponse | null>(null)
  const [modelReadiness, setModelReadiness] = useState<AIModelReadiness>('loading')
  const [modelError, setModelError] = useState<string | null>(null)

  // 2. Live Prediction State
  const [latestPrediction, setLatestPrediction] = useState<AnomalyPredictionResponse | null>(null)
  const [predictionLoading, setPredictionLoading] = useState<boolean>(false)
  const [predictionError, setPredictionError] = useState<string | null>(null)
  const [lastPredictionAt, setLastPredictionAt] = useState<number | null>(null)
  const [isStale, setIsStale] = useState<boolean>(false)

  // 3. Evaluation Metrics State
  const [metrics, setMetrics] = useState<AIModelMetricsResponse | null>(null)
  const [metricsLoading, setMetricsLoading] = useState<boolean>(false)
  const [metricsError, setMetricsError] = useState<string | null>(null)

  // Lifecycle & Concurrency References
  const isUnmountedRef = useRef<boolean>(false)
  const requestIdRef = useRef<number>(0)
  const pollingTimerRef = useRef<number | null>(null)
  const staleTimerRef = useRef<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  // Check model readiness helper
  const isModelReady = modelReadiness === 'ready' && !!modelStatus?.model_loaded

  // Load Model Status
  const refreshStatus = useCallback(async () => {
    try {
      const statusData = await fetchAIStatus()
      if (isUnmountedRef.current) return
      setModelStatus(statusData)
      if (statusData.model_loaded && statusData.status === 'ready') {
        setModelReadiness('ready')
      } else {
        setModelReadiness('unavailable')
      }
      setModelError(null)
    } catch (err) {
      if (isUnmountedRef.current) return
      const msg = err instanceof Error ? err.message : 'Failed to reach AI status endpoint'
      setModelError(msg)
      setModelReadiness('error')
    }
  }, [])

  // Refresh Latest Prediction
  const refreshLatest = useCallback(async () => {
    if (isUnmountedRef.current) return

    // Monotonically increasing ID to reject out-of-order responses
    const currentRequestId = ++requestIdRef.current

    // Abort previous in-flight request if pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    const controller = new AbortController()
    abortControllerRef.current = controller

    try {
      const prediction = await fetchAILatest({ signal: controller.signal })
      if (isUnmountedRef.current) return

      // Strict check: Only accept if this was the latest requested call
      if (currentRequestId === requestIdRef.current) {
        setLatestPrediction(prediction)
        setLastPredictionAt(Date.now())
        setIsStale(false)
        setPredictionError(null)
      }
    } catch (err) {
      if (isUnmountedRef.current) return
      // Ignore deliberate aborts
      if (err instanceof DOMException && err.name === 'AbortError') return

      if (currentRequestId === requestIdRef.current) {
        const msg = err instanceof Error ? err.message : 'Inference request failed'
        setPredictionError(msg)
        // Note: Never replace failed prediction with fake normal output
      }
    } finally {
      if (!isUnmountedRef.current && currentRequestId === requestIdRef.current) {
        setPredictionLoading(false)
      }
    }
  }, [])

  // Load Evaluation Metrics
  const refreshMetrics = useCallback(async () => {
    try {
      const metricsData = await fetchAIMetrics()
      if (isUnmountedRef.current) return
      setMetrics(metricsData)
      setMetricsError(null)
    } catch (err) {
      if (isUnmountedRef.current) return
      const msg = err instanceof Error ? err.message : 'Failed to load model evaluation metrics'
      setMetricsError(msg)
    } finally {
      if (!isUnmountedRef.current) {
        setMetricsLoading(false)
      }
    }
  }, [])

  // Manual Prediction Function
  const predictManual = useCallback(async (input: AnomalyPredictionInput) => {
    return await apiPredictAnomaly(input)
  }, [])

  // Initial mount: load model status and initial evaluation metrics
  useEffect(() => {
    isUnmountedRef.current = false
    const initData = async () => {
      await refreshStatus()
      await refreshMetrics()
    }
    void initData()

    return () => {
      isUnmountedRef.current = true
      if (pollingTimerRef.current) clearInterval(pollingTimerRef.current)
      if (staleTimerRef.current) clearInterval(staleTimerRef.current)
      if (abortControllerRef.current) abortControllerRef.current.abort()
    }
  }, [refreshStatus, refreshMetrics])

  // Single Shared Polling Loop for Live Predictions
  useEffect(() => {
    // Only poll when model is ready and WebSocket connection is active
    if (!isModelReady) return

    // Trigger initial reading on readiness
    const triggerInitial = async () => {
      await refreshLatest()
    }
    void triggerInitial()

    // 1500ms interval: optimal balance between freshness and minimal backend load
    pollingTimerRef.current = window.setInterval(() => {
      // Don't poll if simulator is stopped or connection is lost
      if (connectionStatus === 'Connected' && isSimulatorRunning) {
        void refreshLatest()
      }
    }, 1500)

    // Watchdog for Stale Predictions (if no new prediction received for > 4.0s)
    staleTimerRef.current = window.setInterval(() => {
      setLastPredictionAt((lastTime) => {
        if (lastTime !== null && Date.now() - lastTime > 4000) {
          setIsStale(true)
        }
        return lastTime
      })
    }, 1000)

    return () => {
      if (pollingTimerRef.current) {
        clearInterval(pollingTimerRef.current)
        pollingTimerRef.current = null
      }
      if (staleTimerRef.current) {
        clearInterval(staleTimerRef.current)
        staleTimerRef.current = null
      }
    }
  }, [isModelReady, connectionStatus, isSimulatorRunning, refreshLatest])

  // Derive anomaly states safely
  const isAnomaly = latestPrediction?.is_anomaly ?? (latestPrediction?.prediction === -1)
  const anomalyScore = latestPrediction?.anomaly_score ?? null
  const rawPrediction = latestPrediction?.prediction ?? null

  const value: AIStreamContextValue = {
    modelStatus,
    modelReadiness,
    modelError,
    isModelReady,
    latestPrediction,
    isAnomaly,
    anomalyScore,
    rawPrediction,
    predictionLoading,
    predictionError,
    lastPredictionAt,
    isStale: isStale || connectionStatus === 'Stale Data',
    metrics,
    metricsLoading,
    metricsError,
    refreshStatus,
    refreshLatest,
    refreshMetrics,
    predictManual,
  }

  return <AIStreamContext.Provider value={value}>{children}</AIStreamContext.Provider>
}
