import React from 'react'
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  FileText,
  Info,
  ListFilter,
  Sparkles,
} from 'lucide-react'
import { useAIPrediction } from '../../context/useAIPrediction'

export const AIInsightsPanel: React.FC = () => {
  const { latestPrediction, isAnomaly } = useAIPrediction()

  const diagnosticContext = latestPrediction?.diagnostic_context
  const deviations = diagnosticContext?.deviations ?? []
  const summary = diagnosticContext?.summary

  // Telemetry reference values (nominal baseline)
  const temp = latestPrediction?.features_evaluated?.temperature ?? 68.0
  const vib = latestPrediction?.features_evaluated?.vibration ?? 1.20
  const rpm = latestPrediction?.features_evaluated?.rpm ?? 1488.0

  const deltaTemp = temp - 68.0
  const deltaVib = vib - 1.20
  const deltaRpm = rpm - 1488.0

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#10213D]">Diagnostic Context & Patterns</h3>
              <span className="text-[10px] font-mono text-[#475569] font-semibold">
                STATISTICAL BASELINE COMPARISON
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold font-mono px-2.5 py-1 rounded-full border ${
              isAnomaly
                ? 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]'
                : 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
            }`}
          >
            {diagnosticContext?.inlier_status || (isAnomaly ? 'Outlier State' : 'Inlier State')}
          </span>
        </div>

        {/* Human-readable Pattern Summary */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] mb-4">
          <div className="flex items-center gap-2 text-xs font-bold text-[#10213D] mb-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#1769FF]" />
            <span>Observed Sensor Pattern Summary:</span>
          </div>
          <p className="text-xs text-[#334155] leading-relaxed">
            {summary ||
              'Awaiting live telemetry packet from continuous simulation stream. Telemetry will be dynamically matched against nominal operating distributions.'}
          </p>
        </div>

        {/* Baseline Deviations List */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#10213D]">
            <span className="flex items-center gap-1.5">
              <ListFilter className="w-3.5 h-3.5 text-[#1769FF]" />
              <span>Identified Parameter Deviations:</span>
            </span>
            <span className="text-[11px] font-mono text-[#64748B]">
              {deviations.length} flag(s)
            </span>
          </div>

          {deviations.length === 0 ? (
            <div className="p-3.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs text-[#065F46] flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0" />
              <span>All 3 sensor channels are currently within nominal operating bounds.</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {deviations.map((dev, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-start gap-2.5"
                >
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
                  <span className="font-medium leading-relaxed">{dev}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Baseline Reference Offsets Table */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] space-y-2">
          <div className="text-xs font-semibold text-[#10213D]">
            Deviations from 68°C / 1.2 mm/s / 1488 RPM Baseline:
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs">
            {/* Temp Delta */}
            <div className="p-2.5 rounded-lg bg-white border border-[#DFE7F3]">
              <div className="text-[10px] text-[#64748B]">Temp Offset</div>
              <div
                className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                  Math.abs(deltaTemp) > 10 ? 'text-[#DC2626]' : 'text-[#059669]'
                }`}
              >
                {deltaTemp >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{deltaTemp >= 0 ? `+${deltaTemp.toFixed(1)}` : deltaTemp.toFixed(1)}°C</span>
              </div>
            </div>

            {/* Vibration Delta */}
            <div className="p-2.5 rounded-lg bg-white border border-[#DFE7F3]">
              <div className="text-[10px] text-[#64748B]">Vib Offset</div>
              <div
                className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                  Math.abs(deltaVib) > 1.5 ? 'text-[#DC2626]' : 'text-[#059669]'
                }`}
              >
                {deltaVib >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{deltaVib >= 0 ? `+${deltaVib.toFixed(2)}` : deltaVib.toFixed(2)} mm/s</span>
              </div>
            </div>

            {/* RPM Delta */}
            <div className="p-2.5 rounded-lg bg-white border border-[#DFE7F3]">
              <div className="text-[10px] text-[#64748B]">RPM Offset</div>
              <div
                className={`text-xs font-bold font-mono flex items-center gap-0.5 ${
                  Math.abs(deltaRpm) > 50 ? 'text-[#DC2626]' : 'text-[#059669]'
                }`}
              >
                {deltaRpm >= 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                <span>{deltaRpm >= 0 ? `+${deltaRpm.toFixed(1)}` : deltaRpm.toFixed(1)} RPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Engineering Clarification Guardrail */}
      <div className="pt-3 border-t border-[#F1F5F9] mt-4 text-[11px] text-[#64748B] flex items-start gap-1.5 leading-relaxed">
        <Info className="w-3.5 h-3.5 text-[#94A3B8] shrink-0 mt-0.5" />
        <span>
          <strong>Scope Boundary:</strong> Statistical deviations reflect deviation from nominal operational states. They do not constitute root-cause component diagnoses or remaining-useful-life forecasts.
        </span>
      </div>
    </div>
  )
}
