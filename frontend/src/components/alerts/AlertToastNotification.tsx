import React from 'react'
import { Link } from 'react-router-dom'
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  X,
} from 'lucide-react'
import { useAlerts } from '../../context/useAlerts'
import { getSeverityStyles } from '../../utils/alertRules'

export const AlertToastNotification: React.FC = () => {
  const { activeToast, dismissToast, acknowledgeAlert } = useAlerts()

  if (!activeToast) return null

  const styles = getSeverityStyles(activeToast.severity)

  const getIcon = () => {
    switch (activeToast.severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-[#EF4444] animate-pulse" />
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
      role="alert"
      aria-live="assertive"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
    >
      <div
        className={`p-4 rounded-2xl bg-white border ${styles.border} shadow-[0_10px_30px_rgba(16,33,61,0.12)] space-y-3 relative overflow-hidden`}
      >
        {/* Severity Indicator Top Accent Strip */}
        <div className={`absolute top-0 left-0 right-0 h-1 ${styles.dot}`} />

        {/* Header: Severity Badge, Title, Close Button */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-start gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl ${styles.bg} border ${styles.border} flex items-center justify-center shrink-0 mt-0.5`}
            >
              {getIcon()}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${styles.badge}`}
                >
                  {styles.label} ALERT
                </span>
                <span className="text-[11px] font-mono text-[#64748B]">
                  {new Date(activeToast.timestampMs).toLocaleTimeString([], {
                    hour12: false,
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <h4 className="text-xs font-bold text-[#10213D] leading-snug">
                {activeToast.title}
              </h4>
            </div>
          </div>

          <button
            type="button"
            onClick={dismissToast}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            title="Close Notification"
            aria-label="Close Notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Telemetry Snapshot Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-mono">
          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#DFE7F3] text-[#334155]">
            T: <strong>{activeToast.snapshot.temperature.toFixed(1)}°C</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#DFE7F3] text-[#334155]">
            V: <strong>{activeToast.snapshot.vibration.toFixed(2)} mm/s</strong>
          </span>
          <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#DFE7F3] text-[#334155]">
            RPM: <strong>{activeToast.snapshot.rpm.toFixed(0)}</strong>
          </span>
          {activeToast.anomalyScore !== null && (
            <span className="px-2 py-0.5 rounded-md bg-[#F8FAFC] border border-[#DFE7F3] text-[#1769FF] font-bold">
              Score: {activeToast.anomalyScore >= 0 ? '+' : ''}
              {activeToast.anomalyScore.toFixed(3)}
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="pt-2 border-t border-[#F1F5F9] flex items-center justify-between text-xs">
          {!activeToast.isAcknowledged ? (
            <button
              type="button"
              onClick={() => {
                acknowledgeAlert(activeToast.id)
                dismissToast()
              }}
              className="text-xs font-semibold text-[#1769FF] hover:underline cursor-pointer"
            >
              Acknowledge Alert
            </button>
          ) : (
            <span className="text-xs text-[#059669] font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Acknowledged
            </span>
          )}

          <Link
            to="/alerts"
            onClick={dismissToast}
            className="text-xs font-bold text-[#10213D] hover:text-[#1769FF] transition-colors"
          >
            Open Alert Center &rarr;
          </Link>
        </div>
      </div>
    </div>
  )
}
