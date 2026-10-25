import React from 'react'
import {
  Activity,
  AlertTriangle,
  RefreshCw,
  WifiOff,
} from 'lucide-react'

interface AnalyticsEmptyStateProps {
  type: 'loading' | 'disconnected' | 'error' | 'empty'
  errorMessage?: string | null
  onRetry?: () => void
}

export const AnalyticsEmptyState: React.FC<AnalyticsEmptyStateProps> = ({
  type,
  errorMessage,
  onRetry,
}) => {
  if (type === 'loading') {
    return (
      <div className="p-12 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] animate-pulse">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#10213D]">
            Loading Sensor History & Analytics
          </h3>
          <p className="text-xs text-[#64748B] max-w-sm">
            Fetching chronological telemetry buffer from FastAPI simulator backend...
          </p>
        </div>
      </div>
    )
  }

  if (type === 'disconnected') {
    return (
      <div className="p-10 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
          <WifiOff className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#991B1B]">
            Sensor Stream Disconnected
          </h3>
          <p className="text-xs text-[#7F1D1D] max-w-sm">
            Live telemetry stream is currently offline. Real-time chart updates will resume automatically when backend reconnects.
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#DC2626] transition-all cursor-pointer shadow-xs"
          >
            Reconnect Stream
          </button>
        )}
      </div>
    )
  }

  if (type === 'error') {
    return (
      <div className="p-10 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-white border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-[#991B1B]">
            Failed to Fetch Telemetry History
          </h3>
          <p className="text-xs text-[#7F1D1D] max-w-sm">
            {errorMessage || 'Unable to retrieve historical sensor data from REST API endpoint.'}
          </p>
        </div>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="px-4 py-2 rounded-xl bg-white hover:bg-[#FEE2E2] border border-[#FECACA] text-xs font-bold text-[#DC2626] transition-all cursor-pointer shadow-xs"
          >
            Retry Request
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="p-12 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs flex flex-col items-center justify-center text-center space-y-3">
      <div className="w-12 h-12 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
        <Activity className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-[#10213D]">
          No Telemetry Readings Recorded Yet
        </h3>
        <p className="text-xs text-[#64748B] max-w-sm">
          The sensor simulator is initializing. Readings will appear here as soon as packets are generated.
        </p>
      </div>
    </div>
  )
}
