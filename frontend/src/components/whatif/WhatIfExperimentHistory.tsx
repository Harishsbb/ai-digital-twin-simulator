import React from 'react'
import {
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock,
  History,
  RotateCcw,
  Trash2,
} from 'lucide-react'
import type { SavedExperiment } from '../../types/whatIf'

interface WhatIfExperimentHistoryProps {
  experiments: SavedExperiment[]
  onReloadExperiment: (experiment: SavedExperiment) => void
  onSetAsBaseline: (experiment: SavedExperiment) => void
  onClearHistory: () => void
  onRemoveExperiment: (id: string) => void
}

export const WhatIfExperimentHistory: React.FC<WhatIfExperimentHistoryProps> = ({
  experiments,
  onReloadExperiment,
  onSetAsBaseline,
  onClearHistory,
  onRemoveExperiment,
}) => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-[#1769FF]" />
          <h3 className="text-sm font-bold text-[#10213D]">
            Session Experiment History
          </h3>
          <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#475569]">
            {experiments.length} / 20
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-[#94A3B8] italic hidden sm:inline">
            In-memory session log (resets on reload)
          </span>
          {experiments.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#EF4444] hover:bg-[#FEF2F2] rounded-lg border border-[#FEE2E2] transition-colors cursor-pointer"
              title="Clear all saved experiments in this session"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}
        </div>
      </div>

      {/* Empty State */}
      {experiments.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8]">
            <History className="w-6 h-6" />
          </div>
          <div className="text-xs font-bold text-[#475569]">No Experiments Logged Yet</div>
          <p className="text-[11px] text-[#94A3B8] max-w-sm mx-auto">
            Adjust hypothetical parameters and click "Run What-If Simulation" to record and compare evaluation runs in this session.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-[460px] overflow-y-auto pr-1">
          {experiments.map((exp) => {
            const isAnomaly = exp.prediction.is_anomaly
            return (
              <div
                key={exp.id}
                className="p-4 rounded-xl border border-[#E2E8F0] hover:border-[#BFDBFE] bg-white hover:bg-[#F8FAFC]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
              >
                {/* Left: Info */}
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-[#10213D]">{exp.name}</span>
                    <span className="flex items-center gap-1 text-[10px] text-[#64748B] font-medium">
                      <Clock className="w-3 h-3 text-[#94A3B8]" />
                      <span>{exp.timestamp}</span>
                    </span>

                    {/* Result Badge */}
                    {isAnomaly ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
                        <AlertOctagon className="w-3 h-3" />
                        <span>Anomaly (Outlier)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#6EE7B7]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Nominal (Inlier)</span>
                      </span>
                    )}
                  </div>

                  {/* Parameter chips */}
                  <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                    <span className="text-[#475569]">
                      T: <strong className="text-[#10213D]">{exp.inputs.temperature}°C</strong>
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-[#475569]">
                      Vib: <strong className="text-[#10213D]">{exp.inputs.vibration} mm/s</strong>
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-[#475569]">
                      Speed: <strong className="text-[#10213D]">{exp.inputs.rpm} RPM</strong>
                    </span>
                    <span className="text-[#CBD5E1]">•</span>
                    <span className="text-[#475569]">
                      Score:{' '}
                      <strong
                        className={
                          exp.prediction.anomaly_score < 0
                            ? 'text-[#DC2626]'
                            : 'text-[#059669]'
                        }
                      >
                        {exp.prediction.anomaly_score >= 0 ? '+' : ''}
                        {exp.prediction.anomaly_score.toFixed(4)}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onReloadExperiment(exp)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#1769FF] bg-[#EAF2FF] hover:bg-[#D8E7FF] border border-[#BFDBFE] transition-colors cursor-pointer"
                    title="Reload these parameters into the simulation controls"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reload</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSetAsBaseline(exp)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#475569] bg-white hover:bg-[#F1F5F9] border border-[#CBD5E1] transition-colors cursor-pointer"
                    title="Use this experiment as the baseline comparison scenario"
                  >
                    <ArrowRight className="w-3 h-3" />
                    <span>Set as Baseline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveExperiment(exp.id)}
                    className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors cursor-pointer opacity-80 group-hover:opacity-100"
                    title="Remove from session history"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
