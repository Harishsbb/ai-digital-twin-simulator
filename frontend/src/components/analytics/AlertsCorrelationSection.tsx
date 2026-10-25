import React from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import type { AlertItem } from '../../types/alert'
import { getSeverityStyles } from '../../utils/alertRules'
import { formatTimeShort } from '../../utils/analyticsMath'

interface AlertsCorrelationSectionProps {
  alerts: AlertItem[]
  isAnomaly: boolean
  anomalyScore: number | null
  isModelReady: boolean
  windowStartTime: string | null
  windowEndTime: string | null
}

export const AlertsCorrelationSection: React.FC<AlertsCorrelationSectionProps> = ({
  alerts,
  isAnomaly,
  anomalyScore,
  isModelReady,
  windowStartTime,
  windowEndTime,
}) => {
  // Filter alerts that fall within the active window (if window timestamps exist)
  const windowAlerts = React.useMemo(() => {
    if (!windowStartTime) return alerts.slice(0, 5)
    const startMs = new Date(windowStartTime).getTime()
    const endMs = windowEndTime ? new Date(windowEndTime).getTime() : startMs + 3600000

    const matching = alerts.filter(
      (a) => a.timestampMs >= startMs - 2000 && a.timestampMs <= endMs + 2000
    )
    return matching.length > 0 ? matching : alerts.slice(0, 5)
  }, [alerts, windowStartTime, windowEndTime])

  const criticalCount = windowAlerts.filter((a) => a.severity === 'critical').length
  const highCount = windowAlerts.filter((a) => a.severity === 'high').length
  const mediumCount = windowAlerts.filter((a) => a.severity === 'medium').length

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F1F5F9]">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#EAF2FF] text-[#1769FF]">
              <Brain className="w-4 h-4" />
            </span>
            <h3 className="text-sm font-bold text-[#10213D] tracking-tight">
              AI Anomaly & Alert Event Correlation
            </h3>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">
            Correlation of Isolation Forest anomaly detections with telemetry trends across the selected interval.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/anomaly-detection"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1769FF] hover:underline"
          >
            <span>Model Diagnostics</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
          <span className="text-[#CBD5E1]">|</span>
          <Link
            to="/alerts"
            className="flex items-center gap-1.5 text-xs font-semibold text-[#1769FF] hover:underline"
          >
            <span>Alert Center</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Grid: Live AI Status & Interval Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Current ML State Card */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block mb-1">
              Live AI Inference State
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  !isModelReady
                    ? 'bg-[#94A3B8]'
                    : isAnomaly
                    ? 'bg-[#EF4444] animate-ping'
                    : 'bg-[#10B981]'
                }`}
              />
              <span className="text-xs font-bold text-[#10213D]">
                {!isModelReady
                  ? 'Model Initializing'
                  : isAnomaly
                  ? 'Active Anomaly Outlier'
                  : 'Nominal Inlier Space'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-[11px] font-mono text-[#64748B]">
            Decision Score: {anomalyScore !== null ? (anomalyScore >= 0 ? `+${anomalyScore.toFixed(4)}` : anomalyScore.toFixed(4)) : 'N/A'}
          </div>
        </div>

        {/* Critical Alerts Count */}
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col justify-between">
          <span className="text-[10px] text-[#991B1B] uppercase font-bold tracking-wider block">
            Critical Events
          </span>
          <div className="text-2xl font-bold font-mono text-[#DC2626]">
            {criticalCount}
          </div>
          <span className="text-[10px] text-[#991B1B]">
            Thermal / Zone D breaches
          </span>
        </div>

        {/* High Severity Count */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col justify-between">
          <span className="text-[10px] text-[#92400E] uppercase font-bold tracking-wider block">
            High Severity
          </span>
          <div className="text-2xl font-bold font-mono text-[#D97706]">
            {highCount}
          </div>
          <span className="text-[10px] text-[#92400E]">
            Zone C / 85°C elevations
          </span>
        </div>

        {/* Medium Severity Count */}
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex flex-col justify-between">
          <span className="text-[10px] text-[#166534] uppercase font-bold tracking-wider block">
            Medium Severity
          </span>
          <div className="text-2xl font-bold font-mono text-[#15803D]">
            {mediumCount}
          </div>
          <span className="text-[10px] text-[#166534]">
            Unsupervised tree outliers
          </span>
        </div>
      </div>

      {/* Recent Correlated Alert Events List */}
      <div className="pt-2">
        <h4 className="text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
          Recorded Alert Events in Interval ({windowAlerts.length})
        </h4>

        {windowAlerts.length === 0 ? (
          <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-center text-xs text-[#64748B] flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
            <span>No anomaly alerts recorded during this time window. Telemetry operated within nominal baseline.</span>
          </div>
        ) : (
          <div className="space-y-2">
            {windowAlerts.slice(0, 4).map((alert) => {
              const styles = getSeverityStyles(alert.severity)
              return (
                <div
                  key={alert.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${styles.badge}`}
                    >
                      {styles.label}
                    </span>
                    <span className="font-semibold text-[#10213D]">{alert.title}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[11px] font-mono text-[#64748B]">
                    <span>
                      {alert.snapshot.temperature.toFixed(1)}°C | {alert.snapshot.vibration.toFixed(2)} mm/s | {alert.snapshot.rpm.toFixed(0)} RPM
                    </span>
                    <span className="text-[#94A3B8]">
                      {formatTimeShort(alert.timestamp)} UTC
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
