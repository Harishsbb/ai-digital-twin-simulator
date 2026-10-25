import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  AlertOctagon,
  BarChart3,
  CheckCircle2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import {
  AlertsCorrelationSection,
  AnalyticsEmptyState,
  AnalyticsKpiCards,
  TimeRangeSelector,
  TimeSeriesChart,
} from '../components/analytics'
import { useAIPrediction } from '../context/useAIPrediction'
import { useAlerts } from '../context/useAlerts'
import { useSensorStream } from '../context/useSensorStream'
import { fetchSensorHistory } from '../services/api'
import type { SensorReading } from '../types'
import type { AnalyticsTimeRange } from '../types/analytics'
import {
  computeTelemetryStatistics,
  exportTelemetryToCsv,
  filterReadingsByRange,
  mergeTelemetryReadings,
} from '../utils/analyticsMath'
import { ALERT_THRESHOLDS } from '../utils/alertRules'

export const AnalyticsPage: React.FC = () => {
  // Shared real-time sensor stream from single WebSocket
  const {
    reading: liveReading,
    connectionStatus,
    lastReceivedAt,
    currentMode,
    toggleMode,
    controlSimulator,
  } = useSensorStream()

  // Real-time AI prediction state from Step 8
  const {
    isAnomaly,
    anomalyScore,
    isModelReady,
  } = useAIPrediction()

  // Real-time alerts state from Step 9
  const { alerts } = useAlerts()

  // Local historical telemetry buffer (accumulates up to 1,000 points in memory)
  const [telemetryHistory, setTelemetryHistory] = useState<SensorReading[]>([])
  const [selectedRange, setSelectedRange] = useState<AnalyticsTimeRange>('1m')
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [nowMs, setNowMs] = useState<number>(0)

  const isMountedRef = useRef<boolean>(true)

  // 1. Initial history fetch from REST API
  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchSensorHistory(200)
      if (isMountedRef.current) {
        setTelemetryHistory((prev) => mergeTelemetryReadings(prev, data, 1000))
        setIsLoading(false)
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err.message : 'Failed to load telemetry history')
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    void (async () => {
      try {
        const data = await fetchSensorHistory(200)
        if (isMountedRef.current) {
          setTelemetryHistory((prev) => mergeTelemetryReadings(prev, data, 1000))
          setIsLoading(false)
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load telemetry history')
          setIsLoading(false)
        }
      }
    })()
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // 2. Accumulate live readings into history buffer asynchronously
  useEffect(() => {
    if (liveReading) {
      const timer = window.setTimeout(() => {
        setTelemetryHistory((prev) => mergeTelemetryReadings(prev, [liveReading], 1000))
      }, 0)
      return () => window.clearTimeout(timer)
    }
  }, [liveReading])

  // 3. Regular heartbeat to update relative time calculations every 2 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setNowMs(Date.now())
    }, 2000)
    return () => clearInterval(timer)
  }, [])

  // 4. Time-range filtering
  const { filtered: filteredReadings, coverage } = useMemo(() => {
    const referenceNow =
      nowMs > 0
        ? nowMs
        : telemetryHistory.length > 0
        ? new Date(telemetryHistory[telemetryHistory.length - 1].timestamp).getTime()
        : 0
    return filterReadingsByRange(telemetryHistory, selectedRange, referenceNow || undefined)
  }, [telemetryHistory, selectedRange, nowMs])

  // 5. Summary statistics calculations
  const statistics = useMemo(() => {
    return computeTelemetryStatistics(filteredReadings)
  }, [filteredReadings])

  // 6. Chart point data mapping
  const temperatureChartData = useMemo(() => {
    return filteredReadings.map((r) => ({
      timestamp: r.timestamp,
      timestampMs: new Date(r.timestamp).getTime(),
      value: r.temperature,
      sequence: r.sequence,
      mode: r.mode,
    }))
  }, [filteredReadings])

  const vibrationChartData = useMemo(() => {
    return filteredReadings.map((r) => ({
      timestamp: r.timestamp,
      timestampMs: new Date(r.timestamp).getTime(),
      value: r.vibration,
      sequence: r.sequence,
      mode: r.mode,
    }))
  }, [filteredReadings])

  const rpmChartData = useMemo(() => {
    return filteredReadings.map((r) => ({
      timestamp: r.timestamp,
      timestampMs: new Date(r.timestamp).getTime(),
      value: r.rpm,
      sequence: r.sequence,
      mode: r.mode,
    }))
  }, [filteredReadings])

  // CSV Export action
  const handleExportCsv = useCallback(() => {
    exportTelemetryToCsv(filteredReadings)
  }, [filteredReadings])

  const isStale = lastReceivedAt !== null && nowMs > 0 && nowMs - lastReceivedAt > 4000
  const isFaultMode = currentMode === 'fault'

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & TELEMETRY STREAM STATUS BANNER           */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0F54D6] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(23,105,255,0.25)] shrink-0 mt-0.5">
            <BarChart3 className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
                STEP 10 // TIME-SERIES ANALYTICS
              </span>
              <span className="text-[#475569] font-mono text-xs font-semibold">
                ASSET // SIMOTICS-150KW-01
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
              Historical Telemetry & Reliability Analytics
            </h1>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              Multi-channel time-series trends, ISO 10816 vibration tracking, statistical envelopes, and AI anomaly correlation.
            </p>
          </div>
        </div>

        {/* Right Status Pills & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Stream Connection Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              connectionStatus === 'Connected' && !isStale
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                : isStale
                ? 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
                : 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                connectionStatus === 'Connected' && !isStale
                  ? 'bg-[#10B981]'
                  : isStale
                  ? 'bg-[#F59E0B]'
                  : 'bg-[#EF4444]'
              }`}
            />
            <span>
              {connectionStatus === 'Connected' && !isStale
                ? 'Stream Active'
                : isStale
                ? 'Stream Stale'
                : 'Disconnected'}
            </span>
          </div>

          {/* Mode Switcher */}
          <button
            type="button"
            onClick={() => toggleMode()}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isFaultMode
                ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA]'
                : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
            }`}
            title="Toggle simulator between Normal and Fault mode"
          >
            {isFaultMode ? (
              <>
                <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>FAULT MODE</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                <span>NORMAL MODE</span>
              </>
            )}
          </button>

          {/* Reset Baseline */}
          <button
            type="button"
            onClick={() => controlSimulator('reset')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#475569] hover:text-[#10213D] transition-all shadow-xs cursor-pointer"
            title="Reset telemetry to baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. TIME RANGE SELECTOR & EXPORT ACTION BAR                */}
      {/* ========================================================= */}
      <TimeRangeSelector
        selectedRange={selectedRange}
        onSelectRange={setSelectedRange}
        coverage={coverage}
        startTime={statistics.startTime}
        endTime={statistics.endTime}
        isLoading={isLoading}
        onRefresh={loadHistory}
        onExportCsv={handleExportCsv}
      />

      {/* Error Banner */}
      {error && (
        <AnalyticsEmptyState
          type="error"
          errorMessage={error}
          onRetry={loadHistory}
        />
      )}

      {/* Loading Skeleton */}
      {isLoading && telemetryHistory.length === 0 && (
        <AnalyticsEmptyState type="loading" />
      )}

      {/* Empty State */}
      {!isLoading && telemetryHistory.length === 0 && !error && (
        <AnalyticsEmptyState type="empty" />
      )}

      {/* ========================================================= */}
      {/* 3. SUMMARY KPI DESCRIPTIVE STATISTICS CARDS               */}
      {/* ========================================================= */}
      {telemetryHistory.length > 0 && (
        <>
          <AnalyticsKpiCards stats={statistics} />

          {/* ========================================================= */}
          {/* 4. THREE DEDICATED TIME-SERIES CHARTS                     */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 gap-6">
            {/* Chart 1: Temperature (°C) */}
            <TimeSeriesChart
              title="Stator Winding Temperature Trend"
              unit="°C"
              data={temperatureChartData}
              color="#DC2626"
              gradientColor="#EF4444"
              baselineValue={68.0}
              thresholds={[
                {
                  value: ALERT_THRESHOLDS.TEMP_CRITICAL,
                  label: 'NEMA Class F Thermal Alert',
                  color: '#DC2626',
                  dashed: true,
                },
                {
                  value: ALERT_THRESHOLDS.TEMP_ELEVATED,
                  label: 'Elevated Stator Warning',
                  color: '#D97706',
                  dashed: true,
                },
              ]}
            />

            {/* Chart 2: Vibration (mm/s RMS) */}
            <TimeSeriesChart
              title="Drive-End Bearing Vibration Velocity (ISO 10816)"
              unit="mm/s"
              data={vibrationChartData}
              color="#D97706"
              gradientColor="#F59E0B"
              baselineValue={1.2}
              thresholds={[
                {
                  value: ALERT_THRESHOLDS.VIB_CRITICAL_ZONE_D,
                  label: 'ISO Zone D (Danger)',
                  color: '#DC2626',
                  dashed: true,
                },
                {
                  value: ALERT_THRESHOLDS.VIB_ELEVATED_ZONE_C,
                  label: 'ISO Zone C (Unrestricted Limit)',
                  color: '#D97706',
                  dashed: true,
                },
              ]}
            />

            {/* Chart 3: Shaft Rotational Speed (RPM) */}
            <TimeSeriesChart
              title="Shaft Rotational Speed Velocity"
              unit="RPM"
              data={rpmChartData}
              color="#1769FF"
              gradientColor="#3B82F6"
              baselineValue={1488.0}
              thresholds={[
                {
                  value: ALERT_THRESHOLDS.RPM_BASELINE,
                  label: 'Nominal Synchronous Baseline',
                  color: '#1769FF',
                  dashed: true,
                },
                {
                  value: ALERT_THRESHOLDS.RPM_ELEVATED_DRAG,
                  label: 'Elevated Drag Threshold',
                  color: '#D97706',
                  dashed: true,
                },
                {
                  value: ALERT_THRESHOLDS.RPM_CRITICAL_STALL,
                  label: 'Severe Slip / Stall Limit',
                  color: '#DC2626',
                  dashed: true,
                },
              ]}
            />
          </div>

          {/* ========================================================= */}
          {/* 5. AI ANOMALY & ALERT CORRELATION SECTION                 */}
          {/* ========================================================= */}
          <AlertsCorrelationSection
            alerts={alerts}
            isAnomaly={isAnomaly}
            anomalyScore={anomalyScore}
            isModelReady={isModelReady}
            windowStartTime={statistics.startTime}
            windowEndTime={statistics.endTime}
          />

          {/* ========================================================= */}
          {/* 6. TECHNICAL SPECIFICATIONS & DISCLAIMERS                 */}
          {/* ========================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Descriptive Statistics Details */}
            <div className="p-4 rounded-xl bg-white border border-[#DFE7F3] shadow-xs text-xs text-[#475569] space-y-1">
              <span className="font-bold text-[#10213D] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>Descriptive Statistical Processing</span>
              </span>
              <p className="leading-relaxed text-[11px]">
                Statistical summaries (Min, Max, Mean, Delta) reflect available synthetic telemetry samples within the selected time interval. Samples are chronologically sorted and validated against physical induction motor operating envelopes.
              </p>
            </div>

            {/* Mandatory Synthetic Data Disclaimer */}
            <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
              <span className="font-bold text-[#78350F] uppercase tracking-wider text-[11px] font-mono flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Synthetic Telemetry Disclaimer</span>
              </span>
              <p className="leading-relaxed text-[11px] font-medium">
                &ldquo;These analytics and time-series charts are derived from simulated synthetic motor telemetry. They demonstrate predictive maintenance principles and do not represent physical industrial equipment.&rdquo;
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
