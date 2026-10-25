import React from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Gauge,
  HelpCircle,
  Info,
  RefreshCw,
  Thermometer,
} from 'lucide-react'
import { useAIPrediction } from '../../context/useAIPrediction'
import { interpretAnomalyScore } from '../../services/aiApi'

export const AIPredictionCard: React.FC = () => {
  const {
    latestPrediction,
    isAnomaly,
    anomalyScore,
    rawPrediction,
    predictionLoading,
    predictionError,
    lastPredictionAt,
    isStale,
    isModelReady,
    refreshLatest,
  } = useAIPrediction()

  // Score interpretation
  const interpretation = interpretAnomalyScore(
    rawPrediction ?? 1,
    anomalyScore ?? 0.1
  )

  // Current evaluated telemetry
  const temp = latestPrediction?.features_evaluated?.temperature ?? 68.0
  const vib = latestPrediction?.features_evaluated?.vibration ?? 1.20
  const rpm = latestPrediction?.features_evaluated?.rpm ?? 1488.0

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between relative overflow-hidden group">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2.5">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-2xs transition-colors ${
                isAnomaly
                  ? 'bg-[#FEF2F2] border border-[#FECACA] text-[#EF4444]'
                  : 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669]'
              }`}
            >
              {isAnomaly ? <AlertOctagon className="w-5 h-5" /> : <Brain className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213D]">Live AI Anomaly Detection</h3>
              <span className="text-[10px] font-mono text-[#475569] font-semibold">
                INFERENCE PIPELINE // Isolation Forest v{latestPrediction?.model_version || '1.0.0'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Stale Warning Badge */}
            {isStale && (
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
                <span>STALE</span>
              </span>
            )}

            {/* Prediction Refresh Button */}
            <button
              type="button"
              onClick={() => refreshLatest()}
              disabled={predictionLoading || !isModelReady}
              className="p-1.5 rounded-lg border border-[#DFE7F3] text-[#475569] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors cursor-pointer disabled:opacity-50"
              title="Query latest simulator telemetry inference"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${predictionLoading ? 'animate-spin text-[#1769FF]' : ''}`} />
            </button>
          </div>
        </div>

        {/* Prediction Error Alert */}
        {predictionError && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>Inference Warning: {predictionError}</span>
          </div>
        )}

        {/* Primary Status Banner */}
        <div
          className={`p-4 rounded-xl border mb-4 transition-all ${
            isAnomaly
              ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
              : 'bg-[#ECFDF5] border-[#A7F3D0] text-[#065F46]'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  isAnomaly ? 'bg-[#EF4444] text-white' : 'bg-[#10B981] text-white'
                }`}
              >
                {isAnomaly ? (
                  <AlertOctagon className="w-5 h-5 animate-pulse" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
              <div>
                <div className="text-[10px] font-mono uppercase font-bold tracking-wider opacity-80">
                  Model Output Classification
                </div>
                <div className="text-lg font-extrabold tracking-tight">
                  {isAnomaly ? 'ANOMALY DETECTED' : 'NORMAL (INLIER)'}
                </div>
              </div>
            </div>

            {/* Raw Prediction & Score Pill */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-current text-right">
                <div className="text-[10px] font-mono uppercase opacity-75">Raw Class</div>
                <div className="text-xs font-mono font-extrabold">
                  {rawPrediction !== null ? (rawPrediction === 1 ? '1 (Inlier)' : '-1 (Outlier)') : 'N/A'}
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-lg bg-white/80 border border-current text-right">
                <div className="text-[10px] font-mono uppercase opacity-75">Decision Score</div>
                <div className="text-xs font-mono font-extrabold">
                  {anomalyScore !== null
                    ? `${anomalyScore >= 0 ? '+' : ''}${anomalyScore.toFixed(4)}`
                    : 'N/A'}
                </div>
              </div>
            </div>
          </div>

          {/* Explanation note */}
          <div className="mt-3 pt-2.5 border-t border-current/15 text-xs opacity-90 flex items-start gap-1.5">
            <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>{interpretation.scoreDescription}</span>
          </div>
        </div>

        {/* Telemetry Feature Values Evaluated */}
        <div className="space-y-1.5 mb-4">
          <div className="text-xs font-semibold text-[#10213D] flex items-center justify-between">
            <span>Features Evaluated at Inference Time:</span>
            <span className="text-[11px] font-mono text-[#64748B]">
              Source: {latestPrediction?.source || 'simulated_sensor_data'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            {/* Temp Feature */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#475569] mb-1">
                <Thermometer className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>Temperature</span>
              </div>
              <div className="text-base font-extrabold font-mono text-[#10213D]">
                {temp.toFixed(1)} <span className="text-xs font-medium text-[#64748B]">°C</span>
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Baseline: 68.0°C</div>
            </div>

            {/* Vibration Feature */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#475569] mb-1">
                <Activity className="w-3.5 h-3.5 text-[#1769FF]" />
                <span>Vibration</span>
              </div>
              <div className="text-base font-extrabold font-mono text-[#10213D]">
                {vib.toFixed(2)} <span className="text-xs font-medium text-[#64748B]">mm/s</span>
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Baseline: 1.20 mm/s</div>
            </div>

            {/* RPM Feature */}
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#475569] mb-1">
                <Gauge className="w-3.5 h-3.5 text-[#059669]" />
                <span>Shaft Velocity</span>
              </div>
              <div className="text-base font-extrabold font-mono text-[#10213D]">
                {rpm.toFixed(1)} <span className="text-xs font-medium text-[#64748B]">RPM</span>
              </div>
              <div className="text-[10px] text-[#64748B] mt-0.5">Baseline: 1488.0 RPM</div>
            </div>
          </div>
        </div>

        {/* Statistical Model Guardrail Warning */}
        <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] text-xs text-[#475569] flex items-start gap-2">
          <HelpCircle className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed">
            <strong className="text-[#10213D]">Mathematical Interpretation:</strong> The anomaly score represents the average path length across 150 isolation trees minus the offset threshold. It is <em>not</em> an engineered failure probability and does not guarantee hardware damage.
          </div>
        </div>
      </div>

      {/* Footer Timestamp */}
      <div className="pt-3 border-t border-[#F1F5F9] mt-4 flex flex-wrap items-center justify-between text-xs text-[#475569] gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>
            Last Inference:{' '}
            {lastPredictionAt
              ? new Date(lastPredictionAt).toLocaleTimeString([], {
                  hour12: false,
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : 'Waiting for stream...'}
          </span>
        </div>
        <div className="font-mono text-[11px] text-[#1769FF] font-semibold">
          Asset: {latestPrediction?.device_id || 'SIMOTICS-150KW-01'}
        </div>
      </div>
    </div>
  )
}
