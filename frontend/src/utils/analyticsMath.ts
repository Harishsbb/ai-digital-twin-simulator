/**
 * Step 10: Analytics & Sensor History Mathematical Calculations
 * 
 * Provides time-range filtering, descriptive summary statistics,
 * chronological sorting, duplicate sample elimination, and CSV serialization.
 */

import type {
  AnalyticsTimeRange,
  ChannelStats,
  RangeCoverageInfo,
  TelemetrySummaryStatistics,
  TimeRangeOption,
} from '../types/analytics'
import type { SensorReading } from '../types'

export const TIME_RANGE_OPTIONS: TimeRangeOption[] = [
  {
    value: '30s',
    label: 'Last 30s',
    seconds: 30,
    description: 'High-frequency view of the past 30 seconds (~60 samples)',
  },
  {
    value: '1m',
    label: 'Last 1m',
    seconds: 60,
    description: 'Short-term trend over the past 1 minute (~120 samples)',
  },
  {
    value: '2m',
    label: 'Last 2m',
    seconds: 120,
    description: 'Operational buffer over the past 2 minutes (~240 samples)',
  },
  {
    value: '5m',
    label: 'Last 5m',
    seconds: 300,
    description: 'Multi-minute history buffer (~500 samples)',
  },
  {
    value: 'all',
    label: 'All History',
    seconds: null,
    description: 'All recorded samples available in the current session buffer',
  },
]

/**
 * Calculate descriptive statistics for an array of numerical sensor measurements.
 * Handles missing/invalid/NaN values and computes delta (difference between latest and first sample).
 */
export function computeChannelStats(rawValues: (number | null | undefined)[]): ChannelStats {
  const sampleCount = rawValues.length
  const validValues: number[] = []
  let invalidCount = 0

  let firstValid: number | null = null
  let latestValid: number | null = null

  for (const val of rawValues) {
    if (typeof val === 'number' && !Number.isNaN(val) && Number.isFinite(val)) {
      if (firstValid === null) {
        firstValid = val
      }
      latestValid = val
      validValues.push(val)
    } else {
      invalidCount++
    }
  }

  const validCount = validValues.length

  if (validCount === 0) {
    return {
      min: null,
      max: null,
      avg: null,
      latest: null,
      first: null,
      delta: null,
      sampleCount,
      validCount: 0,
      invalidCount,
    }
  }

  let min = validValues[0]
  let max = validValues[0]
  let sum = 0

  for (let i = 0; i < validCount; i++) {
    const v = validValues[i]
    if (v < min) min = v
    if (v > max) max = v
    sum += v
  }

  const avg = Number((sum / validCount).toFixed(2))
  const delta = (latestValid !== null && firstValid !== null) ? Number((latestValid - firstValid).toFixed(2)) : null

  return {
    min: Number(min.toFixed(2)),
    max: Number(max.toFixed(2)),
    avg,
    latest: latestValid !== null ? Number(latestValid.toFixed(2)) : null,
    first: firstValid !== null ? Number(firstValid.toFixed(2)) : null,
    delta,
    sampleCount,
    validCount,
    invalidCount,
  }
}

/**
 * Compute multi-channel statistics across temperature, vibration, and RPM.
 */
export function computeTelemetryStatistics(readings: SensorReading[]): TelemetrySummaryStatistics {
  if (!readings || readings.length === 0) {
    const emptyStats: ChannelStats = {
      min: null,
      max: null,
      avg: null,
      latest: null,
      first: null,
      delta: null,
      sampleCount: 0,
      validCount: 0,
      invalidCount: 0,
    }
    return {
      temperature: { ...emptyStats },
      vibration: { ...emptyStats },
      rpm: { ...emptyStats },
      sampleCount: 0,
      startTime: null,
      endTime: null,
      durationSeconds: 0,
    }
  }

  const temps = readings.map((r) => r.temperature)
  const vibs = readings.map((r) => r.vibration)
  const rpms = readings.map((r) => r.rpm)

  const firstTs = new Date(readings[0].timestamp).getTime()
  const lastTs = new Date(readings[readings.length - 1].timestamp).getTime()
  const durationSeconds = Math.max(0, Number(((lastTs - firstTs) / 1000).toFixed(1)))

  return {
    temperature: computeChannelStats(temps),
    vibration: computeChannelStats(vibs),
    rpm: computeChannelStats(rpms),
    sampleCount: readings.length,
    startTime: readings[0].timestamp,
    endTime: readings[readings.length - 1].timestamp,
    durationSeconds,
  }
}

/**
 * Filter readings chronologically by the selected time range.
 * Returns the matching subset along with coverage status (full vs partial).
 */
export function filterReadingsByRange(
  readings: SensorReading[],
  range: AnalyticsTimeRange,
  nowMs = Date.now()
): { filtered: SensorReading[]; coverage: RangeCoverageInfo } {
  if (!readings || readings.length === 0) {
    return {
      filtered: [],
      coverage: {
        isPartial: false,
        availableSeconds: 0,
        targetSeconds: null,
        sampleCount: 0,
      },
    }
  }

  // Ensure chronological order
  const sorted = [...readings].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  const option = TIME_RANGE_OPTIONS.find((o) => o.value === range)
  const targetSeconds = option?.seconds ?? null

  if (targetSeconds === null) {
    // 'all' range
    const firstTime = new Date(sorted[0].timestamp).getTime()
    const lastTime = new Date(sorted[sorted.length - 1].timestamp).getTime()
    const availableSeconds = Math.max(0, Number(((lastTime - firstTime) / 1000).toFixed(1)))

    return {
      filtered: sorted,
      coverage: {
        isPartial: false,
        availableSeconds,
        targetSeconds: null,
        sampleCount: sorted.length,
      },
    }
  }

  const cutoffMs = nowMs - targetSeconds * 1000
  const filtered = sorted.filter((r) => new Date(r.timestamp).getTime() >= cutoffMs)

  // Determine actual available time span in the filtered set
  const availableSeconds =
    filtered.length > 1
      ? Math.max(
          0,
          Number(
            (
              (new Date(filtered[filtered.length - 1].timestamp).getTime() -
                new Date(filtered[0].timestamp).getTime()) /
              1000
            ).toFixed(1)
          )
        )
      : filtered.length === 1
      ? 0.5
      : 0

  // If available window is less than 85% of target window, mark as partial history
  const isPartial = targetSeconds !== null && availableSeconds < targetSeconds * 0.85

  return {
    filtered,
    coverage: {
      isPartial,
      availableSeconds,
      targetSeconds,
      sampleCount: filtered.length,
    },
  }
}

/**
 * Format timestamp into HH:MM:SS string.
 */
export function formatTimeShort(timestamp: string | Date | number): string {
  try {
    const d = new Date(timestamp)
    if (Number.isNaN(d.getTime())) return '--:--:--'
    return d.toTimeString().split(' ')[0]
  } catch {
    return '--:--:--'
  }
}

/**
 * Merge live reading into historical readings array without duplicating sequence or identical timestamp.
 * Keeps array bounded to maxCapacity.
 */
export function mergeTelemetryReadings(
  existing: SensorReading[],
  incoming: SensorReading[],
  maxCapacity = 1000
): SensorReading[] {
  const seenKeys = new Set<string>()
  const merged: SensorReading[] = []

  // Add existing
  for (const item of existing) {
    const key = `${item.sequence}-${item.timestamp}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(item)
    }
  }

  // Add incoming
  for (const item of incoming) {
    const key = `${item.sequence}-${item.timestamp}`
    if (!seenKeys.has(key)) {
      seenKeys.add(key)
      merged.push(item)
    }
  }

  // Sort chronologically
  merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

  // Bound to maxCapacity (retain newest)
  return merged.length > maxCapacity ? merged.slice(-maxCapacity) : merged
}

/**
 * Serialize sensor readings to standard CSV format and optionally initiate browser file download.
 */
export function exportTelemetryToCsv(readings: SensorReading[], filename?: string): string {
  const headers = [
    'timestamp_iso',
    'sequence',
    'temperature_celsius',
    'vibration_mms_rms',
    'rpm',
    'operating_mode',
    'is_running',
    'device_id',
  ]

  const rows = readings.map((r) => [
    r.timestamp,
    r.sequence ?? '',
    r.temperature.toFixed(2),
    r.vibration.toFixed(2),
    r.rpm.toFixed(1),
    r.mode,
    r.is_running ? 'true' : 'false',
    `"${r.device_id || 'SIMOTICS-150KW-01'}"`,
  ])

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\r\n')

  // If in browser DOM environment, trigger file download
  if (typeof document !== 'undefined' && typeof window !== 'undefined') {
    const defaultFilename = `motor_telemetry_history_${new Date().toISOString().replace(/[:.]/g, '-')}.csv`
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename || defaultFilename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return csvContent
}
