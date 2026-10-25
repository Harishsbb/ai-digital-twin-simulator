import React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  WifiOff,
} from 'lucide-react'
import { useAIPrediction } from '../../context/useAIPrediction'

interface AIStatusBadgeProps {
  showScore?: boolean
  className?: string
  onClick?: () => void
}

export const AIStatusBadge: React.FC<AIStatusBadgeProps> = ({
  showScore = false,
  className = '',
  onClick,
}) => {
  const {
    modelReadiness,
    isModelReady,
    isAnomaly,
    anomalyScore,
    isStale,
    predictionError,
  } = useAIPrediction()

  // 1. Model Loading
  if (modelReadiness === 'loading') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] text-xs font-semibold ${className}`}
      >
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>AI Initializing...</span>
      </div>
    )
  }

  // 2. Model Error or Offline
  if (modelReadiness === 'error' || modelReadiness === 'unavailable' || !isModelReady) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA] text-xs font-semibold ${className}`}
        title={predictionError || 'AI model artifact offline'}
      >
        <WifiOff className="w-3.5 h-3.5 text-[#EF4444]" />
        <span>AI Offline</span>
      </div>
    )
  }

  // 3. Stale Data
  if (isStale) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] text-xs font-semibold ${className}`}
        title="Prediction stream paused or delayed (> 4s)"
      >
        <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />
        <span>AI: Stale Telemetry</span>
      </div>
    )
  }

  // 4. Anomaly Detected (IsolationForest score < 0)
  if (isAnomaly) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA] shadow-xs text-xs font-bold transition-all ${
          onClick ? 'cursor-pointer hover:bg-[#FEE2E2]' : ''
        } ${className}`}
        title={`Isolation Forest anomaly score: ${anomalyScore?.toFixed(4) ?? 'N/A'}`}
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#EF4444]" />
        </span>
        <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />
        <span>AI: Anomaly Detected</span>
        {showScore && anomalyScore !== null && (
          <span className="font-mono text-[11px] text-[#991B1B] bg-white/70 px-1.5 py-0.5 rounded border border-[#FECACA]">
            {anomalyScore.toFixed(3)}
          </span>
        )}
      </button>
    )
  }

  // 5. Normal Inlier
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0] shadow-xs text-xs font-semibold transition-all ${
        onClick ? 'cursor-pointer hover:bg-[#D1FAE5]' : ''
      } ${className}`}
      title={`Conforms to baseline distribution (Score: ${anomalyScore?.toFixed(4) ?? 'N/A'})`}
    >
      <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
      <span>AI: Normal (Inlier)</span>
      {showScore && anomalyScore !== null && (
        <span className="font-mono text-[11px] text-[#065F46] bg-white/70 px-1.5 py-0.5 rounded border border-[#A7F3D0]">
          +{anomalyScore.toFixed(3)}
        </span>
      )}
    </button>
  )
}
