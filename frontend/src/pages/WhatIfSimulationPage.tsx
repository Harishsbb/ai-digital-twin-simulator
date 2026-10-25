import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  Sparkles,
} from 'lucide-react'
import {
  WhatIfComparisonMatrix,
  WhatIfExperimentHistory,
  WhatIfParameterControls,
  WhatIfPresetCards,
  WhatIfPreviewCard,
} from '../components/whatif'
import { fetchAIStatus, predictAnomaly } from '../services/aiApi'
import type { AIModelStatusResponse, AnomalyPredictionResponse } from '../types'
import type {
  ParameterValidationErrors,
  SavedExperiment,
  ScenarioPreset,
  WhatIfParameters,
} from '../types/whatIf'
import {
  calculateParameterDeltas,
  generateComparisonSummary,
  NOMINAL_BASELINE_PARAMETERS,
  validateWhatIfParameters,
} from '../utils/whatIfPresets'

export const WhatIfSimulationPage: React.FC = () => {
  // 1. Model status state
  const [modelStatus, setModelStatus] = useState<AIModelStatusResponse | null>(null)
  const [isModelLoading, setIsModelLoading] = useState<boolean>(true)
  const [modelError, setModelError] = useState<string | null>(null)

  // 2. Active parameters state
  const [parameters, setParameters] = useState<WhatIfParameters>(NOMINAL_BASELINE_PARAMETERS)
  const [validationErrors, setValidationErrors] = useState<ParameterValidationErrors>({})

  // 3. Inference results state
  const [scenarioPrediction, setScenarioPrediction] = useState<AnomalyPredictionResponse | null>(null)
  const [isSimulating, setIsSimulating] = useState<boolean>(false)
  const [simulationError, setSimulationError] = useState<string | null>(null)

  // 4. Baseline state
  const [baselineParameters, setBaselineParameters] = useState<WhatIfParameters | null>(NOMINAL_BASELINE_PARAMETERS)
  const [baselinePrediction, setBaselinePrediction] = useState<AnomalyPredictionResponse | null>(null)
  const [isBaselineLoading, setIsBaselineLoading] = useState<boolean>(false)

  // 5. In-memory session experiment history (bounded to 20)
  const [experiments, setExperiments] = useState<SavedExperiment[]>([])

  // Evaluate baseline parameters
  const evaluateBaselineInference = useCallback(async (baseParams: WhatIfParameters) => {
    setIsBaselineLoading(true)
    try {
      const resp = await predictAnomaly({
        temperature: baseParams.temperature,
        vibration: baseParams.vibration,
        rpm: baseParams.rpm,
        device_id: 'WHATIF-BASELINE-01',
      })
      setBaselineParameters(baseParams)
      setBaselinePrediction(resp)
    } catch {
      // Keep previous baseline or null if failed
    } finally {
      setIsBaselineLoading(false)
    }
  }, [])

  // Load model status and initialize baseline on mount
  useEffect(() => {
    let mounted = true

    const initialize = async () => {
      setIsModelLoading(true)
      setModelError(null)
      try {
        const status = await fetchAIStatus()
        if (mounted) {
          setModelStatus(status)
          // Automatically evaluate nominal baseline once model is verified loaded
          if (status.model_loaded) {
            void evaluateBaselineInference(NOMINAL_BASELINE_PARAMETERS)
          }
        }
      } catch (err) {
        if (mounted) {
          setModelError(
            err instanceof Error ? err.message : 'Failed to reach AI Anomaly Detection service'
          )
        }
      } finally {
        if (mounted) {
          setIsModelLoading(false)
        }
      }
    }

    void initialize()

    return () => {
      mounted = false
    }
  }, [evaluateBaselineInference])

  // Handle parameter adjustment
  const handleParameterChange = (param: keyof WhatIfParameters, value: number) => {
    const updated = { ...parameters, [param]: value }
    setParameters(updated)
    const errors = validateWhatIfParameters(updated)
    setValidationErrors(errors)
  }

  // Reset parameters to baseline
  const handleResetParameters = () => {
    setParameters(NOMINAL_BASELINE_PARAMETERS)
    setValidationErrors({})
    setSimulationError(null)
  }

  // Select preset
  const handleSelectPreset = (preset: ScenarioPreset) => {
    setParameters(preset.parameters)
    setValidationErrors({})
    setSimulationError(null)
  }

  // Run simulation
  const handleRunSimulation = async () => {
    const errors = validateWhatIfParameters(parameters)
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSimulating(true)
    setSimulationError(null)

    try {
      const resp = await predictAnomaly({
        temperature: parameters.temperature,
        vibration: parameters.vibration,
        rpm: parameters.rpm,
        device_id: 'HYPOTHETICAL-WHATIF-01',
      })

      setScenarioPrediction(resp)

      // Add to session experiments (max 20, newest first)
      const now = new Date()
      const newExp: SavedExperiment = {
        id: `exp-${Date.now()}`,
        name: `Experiment @ ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`,
        timestamp: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        timestampMs: now.getTime(),
        inputs: { ...parameters },
        prediction: resp,
        baselineSnapshot: baselineParameters && baselinePrediction
          ? {
              inputs: { ...baselineParameters },
              isAnomaly: baselinePrediction.is_anomaly,
              anomalyScore: baselinePrediction.anomaly_score,
            }
          : null,
      }

      setExperiments((prev) => [newExp, ...prev.slice(0, 19)])
    } catch (err) {
      setSimulationError(
        err instanceof Error ? err.message : 'Failed to evaluate hypothetical scenario'
      )
    } finally {
      setIsSimulating(false)
    }
  }

  // Reload saved experiment
  const handleReloadExperiment = (exp: SavedExperiment) => {
    setParameters(exp.inputs)
    setScenarioPrediction(exp.prediction)
    setValidationErrors({})
    setSimulationError(null)
  }

  // Set experiment as baseline
  const handleSetAsBaseline = (exp: SavedExperiment) => {
    setBaselineParameters(exp.inputs)
    setBaselinePrediction(exp.prediction)
  }

  // Remove single experiment
  const handleRemoveExperiment = (id: string) => {
    setExperiments((prev) => prev.filter((e) => e.id !== id))
  }

  // Clear all experiments
  const handleClearHistory = () => {
    setExperiments([])
  }

  // Memoized deltas and comparison summary
  const deltas = useMemo(() => {
    const base = baselineParameters ?? NOMINAL_BASELINE_PARAMETERS
    return calculateParameterDeltas(base, parameters)
  }, [baselineParameters, parameters])

  const comparison = useMemo(() => {
    return generateComparisonSummary(baselinePrediction, scenarioPrediction, deltas)
  }, [baselinePrediction, scenarioPrediction, deltas])

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#DFE7F3]">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0A4CD8] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-[#10213D] tracking-tight">
                Interactive What-If Simulation Center
              </h1>
              <p className="text-xs md:text-sm text-[#475569] font-medium">
                Evaluate hypothetical motor parameters through the trained Isolation Forest decision engine
              </p>
            </div>
          </div>
        </div>

        {/* Model Status Pill */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          {isModelLoading ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs text-[#64748B]">
              <div className="w-2 h-2 rounded-full bg-[#94A3B8] animate-pulse" />
              <span>Checking AI Model...</span>
            </div>
          ) : modelStatus?.model_loaded ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] text-xs font-semibold text-[#065F46] shadow-2xs">
              <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
              <span>Model Online: {modelStatus.algorithm}</span>
              <span className="font-mono text-[10px] text-[#059669] bg-white/70 px-1.5 py-0.5 rounded">
                v{modelStatus.model_version}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-semibold text-[#991B1B]">
              <AlertCircle className="w-4 h-4 text-[#EF4444]" />
              <span>Model Offline</span>
            </div>
          )}
        </div>
      </div>

      {/* Safety & Synthetic Disclaimer Banner */}
      <div className="p-4 rounded-2xl bg-[#EFF6FF] border border-[#BFDBFE] flex items-start gap-3 shadow-xs">
        <Info className="w-5 h-5 text-[#1769FF] shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs text-[#1E40AF]">
          <div className="font-bold">
            Isolated Hypothetical Sandbox (Zero Live Mutation Guarantee)
          </div>
          <div className="leading-relaxed text-[#2563EB]">
            All sensor inputs in this center are strictly hypothetical and do not alter the live motor telemetry stream, WebSocket broadcasts, or trigger alarm notifications. All ML evaluations use the trained scikit-learn Isolation Forest model.
          </div>
        </div>
      </div>

      {/* Model Error Alert (if backend is down) */}
      {modelError && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-3 text-xs text-[#991B1B]">
          <AlertCircle className="w-5 h-5 text-[#EF4444] shrink-0" />
          <div>
            <strong>AI Service Unreachable:</strong> {modelError}. Ensure the FastAPI backend is running on port 8000.
          </div>
        </div>
      )}

      {/* Simulation Error Alert (if inference fails) */}
      {simulationError && (
        <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FCA5A5] flex items-center gap-3 text-xs text-[#991B1B]">
          <AlertTriangle className="w-5 h-5 text-[#EF4444] shrink-0" />
          <div>
            <strong>Simulation Request Failed:</strong> {simulationError}
          </div>
        </div>
      )}

      {/* Section 1: Scenario Presets */}
      <WhatIfPresetCards
        currentParameters={parameters}
        onSelectPreset={handleSelectPreset}
        disabled={isSimulating}
      />

      {/* Section 2: Parameter Controls */}
      <WhatIfParameterControls
        parameters={parameters}
        errors={validationErrors}
        onChange={handleParameterChange}
        onReset={handleResetParameters}
        onSubmit={handleRunSimulation}
        isLoading={isSimulating}
        isBaselineEvaluating={isBaselineLoading}
        onEvaluateBaseline={() => evaluateBaselineInference(NOMINAL_BASELINE_PARAMETERS)}
        hasBaseline={Boolean(baselinePrediction)}
      />

      {/* Section 3: Hypothetical Digital Twin Preview */}
      <WhatIfPreviewCard
        parameters={parameters}
        prediction={scenarioPrediction}
        isLoading={isSimulating}
      />

      {/* Section 4: Baseline vs Scenario Comparison Matrix */}
      <WhatIfComparisonMatrix
        baselineParameters={baselineParameters}
        baselinePrediction={baselinePrediction}
        scenarioParameters={parameters}
        scenarioPrediction={scenarioPrediction}
        deltas={deltas}
        comparison={comparison}
        onEvaluateBaseline={() => evaluateBaselineInference(NOMINAL_BASELINE_PARAMETERS)}
        isBaselineLoading={isBaselineLoading}
      />

      {/* Section 5: Session Experiment History */}
      <WhatIfExperimentHistory
        experiments={experiments}
        onReloadExperiment={handleReloadExperiment}
        onSetAsBaseline={handleSetAsBaseline}
        onRemoveExperiment={handleRemoveExperiment}
        onClearHistory={handleClearHistory}
      />
    </div>
  )
}
