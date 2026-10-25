import React from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  EyeOff,
  Gauge,
  Thermometer,
} from 'lucide-react'
import type { AlertItem } from '../../types/alert'
import { getSeverityStyles } from '../../utils/alertRules'

interface AlertCardProps {
  alert: AlertItem
  onAcknowledge: (id: string) => void
  onDismiss: (id: string) => void
}

export const AlertCard: React.FC<AlertCardProps> = ({
  alert,
  onAcknowledge,
  onDismiss,
}) => {
  const styles = getSeverityStyles(alert.severity)

  const getSeverityIcon = () => {
    switch (alert.severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-[#22C55E]" />
      case 'info':
      default:
        return <CheckCircle2 className="w-5 h-5 text-[#1769FF]" />
    }
  }

  return (
    <div
      className={`p-5 rounded-2xl bg-white border transition-all ${
        alert.isDismissed
          ? 'border-[#E2E8F0] opacity-60 bg-[#F8FAFC]'
          : alert.isAcknowledged
          ? 'border-[#DFE7F3] shadow-xs'
          : `${styles.border} shadow-[0_4px_20px_rgba(16,33,61,0.04)]`
      }`}
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-[#F1F5F9] mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-8 h-8 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-center shrink-0`}
          >
            {getSeverityIcon()}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${styles.badge}`}
              >
                {styles.label}
              </span>
              <span className="text-[10px] font-mono text-[#64748B]">
                ID: {alert.id.slice(0, 16)}...
              </span>
              {alert.isAcknowledged && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
                  <span>ACK</span>
                </span>
              )}
              {alert.isDismissed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] border border-[#E2E8F0] flex items-center gap-1 font-semibold">
                  <EyeOff className="w-3 h-3" />
                  <span>DISMISSED</span>
                </span>
              )}
            </div>
            <h4 className="text-sm font-bold text-[#10213D] leading-tight">
              {alert.title}
            </h4>
          </div>
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-[#64748B] shrink-0 font-mono">
          <Clock className="w-3.5 h-3.5" />
          <span>
            {new Date(alert.timestampMs).toLocaleTimeString([], {
              hour12: false,
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-xs text-[#334155] leading-relaxed mb-4">
        {alert.description}
      </p>

      {/* Sensor Snapshot Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        {/* Temp Chip */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Thermometer className="w-3.5 h-3.5 text-[#EF4444]" />
            <span className="text-[11px] font-medium">Temp</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-[#10213D]">
            {alert.snapshot.temperature.toFixed(1)}°C
          </span>
        </div>

        {/* Vibration Chip */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Activity className="w-3.5 h-3.5 text-[#1769FF]" />
            <span className="text-[11px] font-medium">Vibration</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-[#10213D]">
            {alert.snapshot.vibration.toFixed(2)} mm/s
          </span>
        </div>

        {/* RPM Chip */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Gauge className="w-3.5 h-3.5 text-[#059669]" />
            <span className="text-[11px] font-medium">Speed</span>
          </div>
          <span className="text-xs font-mono font-extrabold text-[#10213D]">
            {alert.snapshot.rpm.toFixed(0)} RPM
          </span>
        </div>

        {/* Score Chip */}
        <div className="p-2.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center justify-between">
          <span className="text-[11px] font-medium text-[#475569]">AI Score</span>
          <span className="text-xs font-mono font-extrabold text-[#1769FF]">
            {alert.anomalyScore !== null
              ? `${alert.anomalyScore >= 0 ? '+' : ''}${alert.anomalyScore.toFixed(3)}`
              : 'N/A'}
          </span>
        </div>
      </div>

      {/* Deviations List */}
      {alert.deviations.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-[#FFFBEB]/50 border border-[#FDE68A] text-xs text-[#92400E] space-y-1">
          <span className="font-bold text-[11px] block uppercase font-mono tracking-wider">
            Flagged Deviations:
          </span>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            {alert.deviations.map((dev, idx) => (
              <li key={idx}>{dev}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Controls & Audit Details */}
      <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="text-[11px] text-[#64748B] flex items-center gap-2">
          <span>Asset: {alert.snapshot.deviceId}</span>
          {alert.acknowledgedAt && (
            <span>
              • Ack at: {new Date(alert.acknowledgedAt).toLocaleTimeString()}
            </span>
          )}
        </div>

        {/* Interactive Action Buttons */}
        <div className="flex items-center gap-2">
          {!alert.isAcknowledged && (
            <button
              type="button"
              onClick={() => onAcknowledge(alert.id)}
              className="px-3 py-1.5 rounded-lg border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] font-bold text-xs transition-colors cursor-pointer"
            >
              Acknowledge
            </button>
          )}

          {!alert.isDismissed && (
            <button
              type="button"
              onClick={() => onDismiss(alert.id)}
              className="px-3 py-1.5 rounded-lg border border-[#DFE7F3] bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#10213D] font-semibold text-xs transition-colors cursor-pointer"
            >
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
