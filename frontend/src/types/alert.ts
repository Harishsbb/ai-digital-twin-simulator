/**
 * Alert System Type Definitions (Step 9)
 * 
 * Provides typed models for real-time AI anomaly alerts, severity categories,
 * sensor snapshots, lifecycle state, and filtering.
 */

export type AlertSeverity = 'critical' | 'high' | 'medium' | 'info'

export type AlertCategory = 'ai_anomaly_engine' | 'telemetry_recovery' | 'system_notice'

export type AlertLifecycleStatus = 'active' | 'acknowledged' | 'dismissed'

export interface AlertSensorSnapshot {
  temperature: number
  vibration: number
  rpm: number
  deviceId: string
}

export interface AlertItem {
  id: string
  timestamp: string // ISO-8601 string
  timestampMs: number // Unix epoch ms for sorting/filtering
  severity: AlertSeverity
  category: AlertCategory
  title: string
  description: string
  aiPredictionLabel: string
  anomalyScore: number | null
  snapshot: AlertSensorSnapshot
  deviations: string[]
  isAcknowledged: boolean
  acknowledgedAt?: string
  isDismissed: boolean
  dismissedAt?: string
}

export interface AlertCounts {
  total: number
  active: number
  unacknowledged: number
  critical: number
  high: number
  medium: number
  info: number
}

export interface AlertFilterState {
  status: 'all' | 'active' | 'unacknowledged' | 'dismissed'
  severity: 'all' | AlertSeverity
  searchQuery: string
}
