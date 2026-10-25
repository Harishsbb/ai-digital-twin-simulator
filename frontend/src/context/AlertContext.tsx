import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertContext,
  type AlertContextValue,
} from './AlertContextDef'
import { useAIPrediction } from './useAIPrediction'
import type { AlertCounts, AlertFilterState, AlertItem } from '../types/alert'
import { createAlertFromPrediction } from '../utils/alertRules'

const MAX_ALERT_HISTORY = 150
const TOAST_DURATION_MS = 6000

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    latestPrediction,
    isModelReady,
    isStale,
    predictionError,
  } = useAIPrediction()

  // In-memory alert event history (bounded to MAX_ALERT_HISTORY)
  const [alerts, setAlerts] = useState<AlertItem[]>([])

  // Active in-app floating notification toast
  const [activeToast, setActiveToast] = useState<AlertItem | null>(null)

  // Episode tracking state for reactive consumer re-renders
  const [isAnomalyActive, setIsAnomalyActive] = useState<boolean>(false)

  // Filter & Search State
  const [filterState, setFilterState] = useState<AlertFilterState>({
    status: 'all',
    severity: 'all',
    searchQuery: '',
  })

  // Concurrency and Episode Deduplication Tracking
  const isAnomalyActiveRef = useRef<boolean>(false)
  const lastProcessedTimestampRef = useRef<string | null>(null)
  const toastTimeoutRef = useRef<number | null>(null)

  // Trigger floating toast with auto-dismiss
  const triggerToast = useCallback((alert: AlertItem, durationMs = TOAST_DURATION_MS) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = null
    }

    setActiveToast(alert)

    toastTimeoutRef.current = window.setTimeout(() => {
      setActiveToast(null)
      toastTimeoutRef.current = null
    }, durationMs)
  }, [])

  // Dismiss toast helper
  const dismissToast = useCallback(() => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current)
      toastTimeoutRef.current = null
    }
    setActiveToast(null)
  }, [])

  // Main Anomaly Detection and Deduplication Effect
  useEffect(() => {
    // 1. Guard against invalid, unready, stale, or errored states
    if (!isModelReady || isStale || predictionError !== null || !latestPrediction) {
      return
    }

    const currentTimestamp = latestPrediction.timestamp

    // 2. Guard against duplicate processing of the exact same prediction payload
    if (currentTimestamp === lastProcessedTimestampRef.current) {
      return
    }
    lastProcessedTimestampRef.current = currentTimestamp

    const isCurrentAnomaly = latestPrediction.is_anomaly

    // 3. New Anomaly Event Transition: Normal -> Anomaly
    if (isCurrentAnomaly) {
      if (!isAnomalyActiveRef.current) {
        // First occurrence: mark episode active and generate exactly ONE alert
        isAnomalyActiveRef.current = true
        setIsAnomalyActive(true)

        const newAlert = createAlertFromPrediction(latestPrediction, 'ai_anomaly_engine')

        setAlerts((prev) => {
          const updated = [newAlert, ...prev]
          return updated.length > MAX_ALERT_HISTORY ? updated.slice(0, MAX_ALERT_HISTORY) : updated
        })

        // Notify user via in-app toast
        triggerToast(newAlert)
      }
      // If isAnomalyActiveRef.current is already true, this is an ongoing anomaly poll.
      // DEDUPLICATION RULE: Suppress duplicate alerts while the same anomaly episode continues.
    } else {
      // 4. Recovery Transition: Anomaly -> Normal
      if (isAnomalyActiveRef.current) {
        // Episode ended: reset tracking flag so future anomalies create new alerts
        isAnomalyActiveRef.current = false
        setIsAnomalyActive(false)

        const recoveryNotice = createAlertFromPrediction(latestPrediction, 'telemetry_recovery')

        setAlerts((prev) => {
          const updated = [recoveryNotice, ...prev]
          return updated.length > MAX_ALERT_HISTORY ? updated.slice(0, MAX_ALERT_HISTORY) : updated
        })

        triggerToast(recoveryNotice, 4000)
      }
    }
  }, [
    latestPrediction,
    isModelReady,
    isStale,
    predictionError,
    triggerToast,
  ])

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current)
      }
    }
  }, [])

  // Lifecycle Action Handlers
  const acknowledgeAlert = useCallback((id: string) => {
    const nowIso = new Date().toISOString()
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, isAcknowledged: true, acknowledgedAt: nowIso }
          : alert
      )
    )
  }, [])

  const dismissAlert = useCallback((id: string) => {
    const nowIso = new Date().toISOString()
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id
          ? { ...alert, isDismissed: true, dismissedAt: nowIso }
          : alert
      )
    )
    // If the dismissed alert was showing on toast, clear toast
    setActiveToast((current) => (current?.id === id ? null : current))
  }, [])

  const acknowledgeAll = useCallback(() => {
    const nowIso = new Date().toISOString()
    setAlerts((prev) =>
      prev.map((alert) =>
        !alert.isAcknowledged
          ? { ...alert, isAcknowledged: true, acknowledgedAt: nowIso }
          : alert
      )
    )
  }, [])

  const dismissAll = useCallback(() => {
    const nowIso = new Date().toISOString()
    setAlerts((prev) =>
      prev.map((alert) =>
        !alert.isDismissed
          ? { ...alert, isDismissed: true, dismissedAt: nowIso }
          : alert
      )
    )
    dismissToast()
  }, [dismissToast])

  const clearHistory = useCallback(() => {
    setAlerts([])
    dismissToast()
  }, [dismissToast])

  // Filtered views
  const activeAlerts = useMemo(() => alerts.filter((a) => !a.isDismissed), [alerts])
  const unacknowledgedAlerts = useMemo(
    () => alerts.filter((a) => !a.isAcknowledged && !a.isDismissed),
    [alerts]
  )

  const counts: AlertCounts = useMemo(() => {
    let critical = 0
    let high = 0
    let medium = 0
    let info = 0
    let unacknowledged = 0

    for (const a of activeAlerts) {
      if (!a.isAcknowledged) unacknowledged++
      if (a.severity === 'critical') critical++
      else if (a.severity === 'high') high++
      else if (a.severity === 'medium') medium++
      else if (a.severity === 'info') info++
    }

    return {
      total: alerts.length,
      active: activeAlerts.length,
      unacknowledged,
      critical,
      high,
      medium,
      info,
    }
  }, [alerts, activeAlerts])

  // Filtered alert list matching current filter controls
  const filteredAlerts = useMemo(() => {
    return alerts.filter((alert) => {
      // 1. Status Filter
      if (filterState.status === 'active' && alert.isDismissed) return false
      if (filterState.status === 'unacknowledged' && (alert.isAcknowledged || alert.isDismissed)) return false
      if (filterState.status === 'dismissed' && !alert.isDismissed) return false

      // 2. Severity Filter
      if (filterState.severity !== 'all' && alert.severity !== filterState.severity) return false

      // 3. Search Query Filter
      if (filterState.searchQuery.trim().length > 0) {
        const query = filterState.searchQuery.toLowerCase()
        const matchesTitle = alert.title.toLowerCase().includes(query)
        const matchesDesc = alert.description.toLowerCase().includes(query)
        const matchesDeviations = alert.deviations.some((d) => d.toLowerCase().includes(query))
        if (!matchesTitle && !matchesDesc && !matchesDeviations) return false
      }

      return true
    })
  }, [alerts, filterState])

  const latestActiveAlert = useMemo(
    () => activeAlerts.find((a) => a.category === 'ai_anomaly_engine') ?? null,
    [activeAlerts]
  )

  const latestAlert = useMemo(
    () => alerts[0] ?? null,
    [alerts]
  )

  const value: AlertContextValue = {
    alerts,
    activeAlerts,
    unacknowledgedAlerts,
    counts,
    isAnomalyActive,
    latestActiveAlert,
    latestAlert,
    acknowledgeAlert,
    dismissAlert,
    acknowledgeAll,
    dismissAll,
    clearHistory,
    filterState,
    setFilterState,
    filteredAlerts,
    activeToast,
    dismissToast,
  }

  return <AlertContext.Provider value={value}>{children}</AlertContext.Provider>
}
