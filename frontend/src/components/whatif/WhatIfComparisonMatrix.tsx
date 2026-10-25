import React from 'react'
import {
  AlertOctagon,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle2,
  GitCompare,
  HelpCircle,
  Info,
  Minus,
} from 'lucide-react'
import type { AnomalyPredictionResponse } from '../../types'
import type { BaselineComparisonDelta, ModelComparisonResult, WhatIfParameters } from '../../types/whatIf'

interface WhatIfComparisonMatrixProps {
  baselineParameters: WhatIfParameters | null
  baselinePrediction: AnomalyPredictionResponse | null
  scenarioParameters: WhatIfParameters
  scenarioPrediction: AnomalyPredictionResponse | null
  deltas: BaselineComparisonDelta[]
  comparison: ModelComparisonResult
  onEvaluateBaseline?: () => void
  isBaselineLoading?: boolean
}

export const WhatIfComparisonMatrix: React.FC<WhatIfComparisonMatrixProps> = ({
  baselineParameters,
  baselinePrediction,
  scenarioParameters,
  scenarioPrediction,
  deltas,
  comparison,
  onEvaluateBaseline,
  isBaselineLoading = false,
}) => {
  const renderDeltaBadge = (delta: BaselineComparisonDelta) => {
    if (delta.status === 'increased') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#EF4444] bg-[#FEF2F2] px-2 py-0.5 rounded-md border border-[#FEE2E2]">
          <ArrowUp className="w-3 h-3" />
          <span>+{delta.difference} {delta.unit}</span>
        </span>
      )
    }
    if (delta.status === 'decreased') {
      return (
        <span className="inline-flex items-center gap-1 font-mono text-xs font-bold text-[#3B82F6] bg-[#EFF6FF] px-2 py-0.5 rounded-md border border-[#DBEAFE]">
          <ArrowDown className="w-3 h-3" />
          <span>{delta.difference} {delta.unit}</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md border border-[#E2E8F0]">
        <Minus className="w-3 h-3" />
        <span>0 {delta.unit}</span>
      </span>
    )
  }

  const renderClassificationBadge = (pred: AnomalyPredictionResponse | null) => {
    if (!pred) {
      return <span className="text-xs text-[#94A3B8] italic">Not evaluated</span>
    }
    if (pred.is_anomaly) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
          <AlertOctagon className="w-3.5 h-3.5" />
          <span>Anomaly (Outlier, -1)</span>
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-[#ECFDF5] text-[#059669] border border-[#6EE7B7]">
        <CheckCircle2 className="w-3.5 h-3.5" />
        <span>Nominal (Inlier, +1)</span>
      </span>
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-[#1769FF]" />
          <h3 className="text-sm font-bold text-[#10213D]">
            Baseline vs. Hypothetical Scenario Comparison
          </h3>
        </div>
        <div className="text-xs text-[#64748B]">
          Decision score difference represents isolation path divergence
        </div>
      </div>

      {/* Baseline Missing Warning */}
      {!baselinePrediction && (
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Info className="w-5 h-5 text-[#D97706] shrink-0" />
            <div>
              <div className="text-xs font-bold text-[#92400E]">
                Baseline model inference not yet recorded
              </div>
              <div className="text-[11px] text-[#B45309]">
                Evaluate standard nominal parameters (68°C, 1.2 mm/s, 1488 RPM) to compute decision score shifts.
              </div>
            </div>
          </div>
          {onEvaluateBaseline && (
            <button
              type="button"
              disabled={isBaselineLoading}
              onClick={onEvaluateBaseline}
              className="px-3 py-1.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              {isBaselineLoading ? 'Evaluating...' : 'Evaluate Nominal Baseline'}
            </button>
          )}
        </div>
      )}

      {/* Comparison Table */}
      <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Parameter / Metric</th>
              <th className="py-3 px-4">Baseline Scenario</th>
              <th className="py-3 px-4">Hypothetical Scenario</th>
              <th className="py-3 px-4">Difference (Delta)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#F1F5F9]">
            {/* Temperature */}
            <tr className="hover:bg-[#F8FAFC]/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-[#10213D]">
                Temperature (°C)
              </td>
              <td className="py-3 px-4 font-mono font-medium text-[#475569]">
                {baselineParameters ? `${baselineParameters.temperature} °C` : '—'}
              </td>
              <td className="py-3 px-4 font-mono font-bold text-[#10213D]">
                {scenarioParameters.temperature} °C
              </td>
              <td className="py-3 px-4">
                {baselineParameters
                  ? renderDeltaBadge(deltas.find((d) => d.parameter === 'temperature')!)
                  : '—'}
              </td>
            </tr>

            {/* Vibration */}
            <tr className="hover:bg-[#F8FAFC]/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-[#10213D]">
                Vibration (mm/s)
              </td>
              <td className="py-3 px-4 font-mono font-medium text-[#475569]">
                {baselineParameters ? `${baselineParameters.vibration} mm/s` : '—'}
              </td>
              <td className="py-3 px-4 font-mono font-bold text-[#10213D]">
                {scenarioParameters.vibration} mm/s
              </td>
              <td className="py-3 px-4">
                {baselineParameters
                  ? renderDeltaBadge(deltas.find((d) => d.parameter === 'vibration')!)
                  : '—'}
              </td>
            </tr>

            {/* RPM */}
            <tr className="hover:bg-[#F8FAFC]/50 transition-colors">
              <td className="py-3 px-4 font-semibold text-[#10213D]">
                Rotational Speed (RPM)
              </td>
              <td className="py-3 px-4 font-mono font-medium text-[#475569]">
                {baselineParameters ? `${baselineParameters.rpm} RPM` : '—'}
              </td>
              <td className="py-3 px-4 font-mono font-bold text-[#10213D]">
                {scenarioParameters.rpm} RPM
              </td>
              <td className="py-3 px-4">
                {baselineParameters
                  ? renderDeltaBadge(deltas.find((d) => d.parameter === 'rpm')!)
                  : '—'}
              </td>
            </tr>

            {/* AI Classification */}
            <tr className="bg-[#FAFBFD] font-medium">
              <td className="py-3 px-4 font-bold text-[#10213D]">
                AI Model Classification
              </td>
              <td className="py-3 px-4">
                {renderClassificationBadge(baselinePrediction)}
              </td>
              <td className="py-3 px-4">
                {renderClassificationBadge(scenarioPrediction)}
              </td>
              <td className="py-3 px-4 font-semibold">
                {!scenarioPrediction ? (
                  <span className="text-[#94A3B8]">Pending simulation</span>
                ) : !baselinePrediction ? (
                  <span className="text-[#94A3B8]">Baseline needed</span>
                ) : comparison.isClassificationChanged ? (
                  <span className="inline-flex items-center gap-1 text-[#DC2626] font-bold">
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Classification Changed</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[#059669] font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unchanged</span>
                  </span>
                )}
              </td>
            </tr>

            {/* Anomaly Decision Score */}
            <tr className="bg-[#FAFBFD]">
              <td className="py-3 px-4 font-bold text-[#10213D]">
                <div className="flex items-center gap-1">
                  <span>Decision Function Score</span>
                  <div
                    className="cursor-help text-[#94A3B8] hover:text-[#64748B]"
                    title="Isolation Forest decision score. Positive values indicate higher density / normal inliers; negative values indicate isolation depth / outliers. Not a probability."
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
              </td>
              <td className="py-3 px-4 font-mono font-medium text-[#475569]">
                {baselinePrediction
                  ? `${baselinePrediction.anomaly_score >= 0 ? '+' : ''}${baselinePrediction.anomaly_score.toFixed(4)}`
                  : '—'}
              </td>
              <td className="py-3 px-4 font-mono font-bold text-[#10213D]">
                {scenarioPrediction
                  ? `${scenarioPrediction.anomaly_score >= 0 ? '+' : ''}${scenarioPrediction.anomaly_score.toFixed(4)}`
                  : '—'}
              </td>
              <td className="py-3 px-4 font-mono font-bold">
                {comparison.scoreDifference !== null ? (
                  <span
                    className={
                      comparison.scoreDifference < 0
                        ? 'text-[#DC2626]'
                        : comparison.scoreDifference > 0
                        ? 'text-[#059669]'
                        : 'text-[#64748B]'
                    }
                  >
                    {comparison.scoreDifference > 0 ? `+${comparison.scoreDifference}` : comparison.scoreDifference}
                  </span>
                ) : (
                  <span className="text-[#94A3B8] font-normal">N/A</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Summary Explanation Box */}
      <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-[#10213D]">
          <Info className="w-4 h-4 text-[#1769FF]" />
          <span>Model Analysis & Decision Summary</span>
        </div>
        <p className="text-xs text-[#475569] leading-relaxed">
          {comparison.summaryExplanation}
        </p>
        <div className="text-[10px] text-[#64748B] pt-1 border-t border-[#EDF2F7]">
          * Note: Decision function scores reflect average tree depth isolation partitioning under scikit-learn Isolation Forest. They do not constitute real-world failure probabilities or remaining useful life (RUL) projections.
        </div>
      </div>
    </div>
  )
}
