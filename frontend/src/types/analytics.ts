/**
 * Step 10: Analytics & Sensor History Types
 * 
 * Defines contracts for time-series analytics, selectable time ranges,
 * summary statistical metrics, and CSV export payloads.
 */

export type AnalyticsTimeRange = '30s' | '1m' | '2m' | '5m' | 'all'

export interface ChannelStats {
  min: number | null
  max: number | null
  avg: number | null
  latest: number | null
  first: number | null
  delta: number | null
  sampleCount: number
  validCount: number
  invalidCount: number
}

export interface TelemetrySummaryStatistics {
  temperature: ChannelStats
  vibration: ChannelStats
  rpm: ChannelStats
  sampleCount: number
  startTime: string | null
  endTime: string | null
  durationSeconds: number
}

export interface ChartDataPoint {
  timestamp: string
  timestampMs: number
  value: number
  sequence?: number
  mode?: string
}

export interface TimeRangeOption {
  value: AnalyticsTimeRange
  label: string
  seconds: number | null // null for 'all'
  description: string
}

export interface RangeCoverageInfo {
  isPartial: boolean
  availableSeconds: number
  targetSeconds: number | null
  sampleCount: number
}
