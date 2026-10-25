import React from 'react'
import {
  AlertCircle,
  Brain,
  CheckCircle2,
  Clock,
  Layers,
  RefreshCw,
  ShieldCheck,
  WifiOff,
} from 'lucide-react'
import { useAIPrediction } from '../../context/useAIPrediction'

export const AIModelStatusCard: React.FC = () => {
  const {
    modelStatus,
    modelReadiness,
    modelError,
    refreshStatus,
  } = useAIPrediction()

  const [polledAt, setPolledAt] = React.useState<string>(() => new Date().toLocaleTimeString())

  const handleRefresh = React.useCallback(async () => {
    await refreshStatus()
    setPolledAt(new Date().toLocaleTimeString())
  }, [refreshStatus])

  const getStatusBadge = () => {
    switch (modelReadiness) {
      case 'ready':
        return {
          label: 'OPERATIONAL // READY',
          badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
          dotClass: 'bg-[#10B981]',
          icon: CheckCircle2,
        }
      case 'loading':
        return {
          label: 'INITIALIZING MODEL',
          badgeClass: 'bg-[#EAF2FF] text-[#1769FF] border-[#BFDBFE]',
          dotClass: 'bg-[#1769FF] animate-ping',
          icon: RefreshCw,
        }
      case 'unavailable':
        return {
          label: 'ARTIFACT UNLOADED',
          badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
          dotClass: 'bg-[#F59E0B]',
          icon: AlertCircle,
        }
      case 'error':
      default:
        return {
          label: 'SERVICE OFFLINE',
          badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
          dotClass: 'bg-[#EF4444]',
          icon: WifiOff,
        }
    }
  }

  const badge = getStatusBadge()
  const BadgeIcon = badge.icon

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213D]">AI Model Specification</h3>
              <span className="text-[10px] font-mono text-[#475569] font-semibold">
                ML ENGINE // {modelStatus?.model_name || 'IsolationForest-Motor-AnomalyDetector'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border flex items-center gap-1.5 ${badge.badgeClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dotClass}`} />
              <BadgeIcon className="w-3 h-3" />
              <span>{badge.label}</span>
            </span>

            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg border border-[#DFE7F3] text-[#475569] hover:text-[#10213D] hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              title="Refresh AI Model Status"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Error Notice */}
        {modelError && (
          <div className="mb-4 p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>AI Status Notice: {modelError}</span>
          </div>
        )}

        {/* Key Model Attributes Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Algorithm</div>
            <div className="text-xs font-bold text-[#10213D]">
              {modelStatus?.algorithm || 'Isolation Forest (scikit-learn)'}
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Unsupervised Tree Ensemble</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Model Version</div>
            <div className="text-xs font-mono font-bold text-[#1769FF]">
              v{modelStatus?.model_version || '1.0.0'}
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Production Artifact</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Contamination Prior</div>
            <div className="text-xs font-mono font-bold text-[#10213D]">
              {modelStatus?.contamination !== undefined ? `${(modelStatus.contamination * 100).toFixed(1)}%` : '3.0%'}
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Assumed Outlier Ratio</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Baseline Training Set</div>
            <div className="text-xs font-mono font-bold text-[#10213D]">
              {modelStatus?.training_sample_count?.toLocaleString() || '6,000'} samples
            </div>
            <div className="text-[10px] text-[#64748B] mt-0.5">Strictly Normal Telemetry</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Ensemble Trees</div>
            <div className="text-xs font-mono font-bold text-[#10213D]">150 Estimators</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">256 samples / partition</div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
            <div className="text-[11px] font-semibold text-[#475569] mb-0.5">Persistence Format</div>
            <div className="text-xs font-mono font-bold text-[#059669]">joblib (lz4/zlib)</div>
            <div className="text-[10px] text-[#64748B] mt-0.5">With JSON Metadata</div>
          </div>
        </div>

        {/* Feature Space */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#10213D]">
            <span className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#1769FF]" />
              <span>Learned 3D Feature Space</span>
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">3 Features (N=3)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-between">
              <span className="font-medium text-[#334155]">1. Temperature</span>
              <span className="font-mono font-bold text-[#1769FF]">
                {modelStatus?.feature_units?.temperature || '°C'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-between">
              <span className="font-medium text-[#334155]">2. Vibration</span>
              <span className="font-mono font-bold text-[#1769FF]">
                {modelStatus?.feature_units?.vibration || 'mm/s RMS'}
              </span>
            </div>
            <div className="p-2 rounded-lg bg-white border border-[#DFE7F3] flex items-center justify-between">
              <span className="font-medium text-[#334155]">3. Shaft Speed</span>
              <span className="font-mono font-bold text-[#1769FF]">
                {modelStatus?.feature_units?.rpm || 'RPM'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center justify-between text-xs text-[#475569] gap-2">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#94A3B8]" />
          <span>Status Polled: {polledAt}</span>
        </div>
        <div className="font-mono text-[11px] text-[#059669] font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Artifact: backend/app/ml/artifacts/</span>
        </div>
      </div>
    </div>
  )
}
