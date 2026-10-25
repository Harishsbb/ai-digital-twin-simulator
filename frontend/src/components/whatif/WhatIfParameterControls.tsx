import React from 'react'
import {
  AlertCircle,
  FlaskConical,
  Gauge,
  Loader2,
  RotateCcw,
  Thermometer,
  Waves,
  Zap,
} from 'lucide-react'
import type { ParameterValidationErrors, WhatIfParameters } from '../../types/whatIf'
import { WHAT_IF_BOUNDS } from '../../utils/whatIfPresets'

interface WhatIfParameterControlsProps {
  parameters: WhatIfParameters
  errors: ParameterValidationErrors
  onChange: (param: keyof WhatIfParameters, value: number) => void
  onReset: () => void
  onSubmit: () => void
  isLoading: boolean
  isBaselineEvaluating?: boolean
  onEvaluateBaseline?: () => void
  hasBaseline: boolean
}

export const WhatIfParameterControls: React.FC<WhatIfParameterControlsProps> = ({
  parameters,
  errors,
  onChange,
  onReset,
  onSubmit,
  isLoading,
  isBaselineEvaluating = false,
  onEvaluateBaseline,
  hasBaseline,
}) => {
  const hasErrors = Object.keys(errors).length > 0

  const handleNumberInput = (param: keyof WhatIfParameters, valStr: string) => {
    if (valStr === '' || valStr === '-') {
      // Allow user to clear input while typing, defaults to NaN for validation error display
      onChange(param, Number.NaN)
      return
    }
    const parsed = Number.parseFloat(valStr)
    onChange(param, parsed)
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#10213D]">Hypothetical Operating Parameters</h3>
            <span className="text-[11px] text-[#64748B] font-medium">
              Adjust telemetry values to evaluate Isolation Forest tree partitioning
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onEvaluateBaseline && (
            <button
              type="button"
              onClick={onEvaluateBaseline}
              disabled={isBaselineEvaluating}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                hasBaseline
                  ? 'border-[#DFE7F3] text-[#475569] hover:bg-[#F8FAFC]'
                  : 'border-[#1769FF] bg-[#EAF2FF] text-[#1769FF] hover:bg-[#D8E7FF]'
              }`}
              title="Calculate baseline inference from standard nominal operational conditions"
            >
              {isBaselineEvaluating ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 text-[#1769FF]" />
              )}
              <span>{hasBaseline ? 'Re-evaluate Baseline' : 'Establish Baseline'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onReset}
            disabled={isLoading}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-[#64748B] hover:text-[#10213D] rounded-lg hover:bg-[#F1F5F9] border border-[#DFE7F3] transition-all cursor-pointer"
            title="Reset parameters to nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Parameter Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Temperature Control */}
        <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-[#EF4444]" />
              <label htmlFor="input-temp" className="text-xs font-bold text-[#10213D]">
                Temperature
              </label>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
              {WHAT_IF_BOUNDS.temperature.unit}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="slider-temp"
              type="range"
              min={WHAT_IF_BOUNDS.temperature.min}
              max={WHAT_IF_BOUNDS.temperature.max}
              step={WHAT_IF_BOUNDS.temperature.step}
              value={Number.isNaN(parameters.temperature) ? WHAT_IF_BOUNDS.temperature.default : parameters.temperature}
              onChange={(e) => onChange('temperature', Number.parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#1769FF]"
            />
            <input
              id="input-temp"
              type="number"
              step={WHAT_IF_BOUNDS.temperature.step}
              value={Number.isNaN(parameters.temperature) ? '' : parameters.temperature}
              onChange={(e) => handleNumberInput('temperature', e.target.value)}
              disabled={isLoading}
              className={`w-20 px-2 py-1 text-sm font-mono font-bold text-right rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                errors.temperature
                  ? 'border-[#EF4444] text-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#CBD5E1] text-[#10213D] focus:ring-[#1769FF]/20'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
            <span>Min: {WHAT_IF_BOUNDS.temperature.min}°C</span>
            <span>Nominal: {WHAT_IF_BOUNDS.temperature.default}°C</span>
            <span>Max: {WHAT_IF_BOUNDS.temperature.max}°C</span>
          </div>

          {errors.temperature && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#EF4444] pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.temperature}</span>
            </div>
          )}
        </div>

        {/* 2. Vibration Control */}
        <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Waves className="w-4 h-4 text-[#F59E0B]" />
              <label htmlFor="input-vib" className="text-xs font-bold text-[#10213D]">
                Vibration
              </label>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
              {WHAT_IF_BOUNDS.vibration.unit}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="slider-vib"
              type="range"
              min={WHAT_IF_BOUNDS.vibration.min}
              max={WHAT_IF_BOUNDS.vibration.max}
              step={WHAT_IF_BOUNDS.vibration.step}
              value={Number.isNaN(parameters.vibration) ? WHAT_IF_BOUNDS.vibration.default : parameters.vibration}
              onChange={(e) => onChange('vibration', Number.parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#1769FF]"
            />
            <input
              id="input-vib"
              type="number"
              step={WHAT_IF_BOUNDS.vibration.step}
              value={Number.isNaN(parameters.vibration) ? '' : parameters.vibration}
              onChange={(e) => handleNumberInput('vibration', e.target.value)}
              disabled={isLoading}
              className={`w-20 px-2 py-1 text-sm font-mono font-bold text-right rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                errors.vibration
                  ? 'border-[#EF4444] text-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#CBD5E1] text-[#10213D] focus:ring-[#1769FF]/20'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
            <span>Min: {WHAT_IF_BOUNDS.vibration.min} mm/s</span>
            <span>Nominal: {WHAT_IF_BOUNDS.vibration.default} mm/s</span>
            <span>Max: {WHAT_IF_BOUNDS.vibration.max} mm/s</span>
          </div>

          {errors.vibration && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#EF4444] pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.vibration}</span>
            </div>
          )}
        </div>

        {/* 3. RPM Control */}
        <div className="space-y-3 p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-[#10B981]" />
              <label htmlFor="input-rpm" className="text-xs font-bold text-[#10213D]">
                Rotational Speed
              </label>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#F1F5F9] text-[#475569]">
              {WHAT_IF_BOUNDS.rpm.unit}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <input
              id="slider-rpm"
              type="range"
              min={WHAT_IF_BOUNDS.rpm.min}
              max={WHAT_IF_BOUNDS.rpm.max}
              step={WHAT_IF_BOUNDS.rpm.step}
              value={Number.isNaN(parameters.rpm) ? WHAT_IF_BOUNDS.rpm.default : parameters.rpm}
              onChange={(e) => onChange('rpm', Number.parseFloat(e.target.value))}
              disabled={isLoading}
              className="w-full h-2 bg-[#E2E8F0] rounded-lg appearance-none cursor-pointer accent-[#1769FF]"
            />
            <input
              id="input-rpm"
              type="number"
              step={WHAT_IF_BOUNDS.rpm.step}
              value={Number.isNaN(parameters.rpm) ? '' : parameters.rpm}
              onChange={(e) => handleNumberInput('rpm', e.target.value)}
              disabled={isLoading}
              className={`w-20 px-2 py-1 text-sm font-mono font-bold text-right rounded-lg border bg-white focus:outline-none focus:ring-2 ${
                errors.rpm
                  ? 'border-[#EF4444] text-[#EF4444] focus:ring-[#EF4444]/20'
                  : 'border-[#CBD5E1] text-[#10213D] focus:ring-[#1769FF]/20'
              }`}
            />
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#64748B]">
            <span>Min: {WHAT_IF_BOUNDS.rpm.min} RPM</span>
            <span>Nominal: {WHAT_IF_BOUNDS.rpm.default} RPM</span>
            <span>Max: {WHAT_IF_BOUNDS.rpm.max} RPM</span>
          </div>

          {errors.rpm && (
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-[#EF4444] pt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.rpm}</span>
            </div>
          )}
        </div>
      </div>

      {/* Submission CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="text-xs text-[#64748B]">
          <span className="font-semibold text-[#10213D]">Safe Evaluation:</span> Submitting hypothetical
          readings does <span className="font-semibold text-[#1769FF]">not</span> modify the live motor
          telemetry stream or trigger real-time alarm alerts.
        </div>

        <button
          id="btn-run-simulation"
          type="button"
          onClick={onSubmit}
          disabled={isLoading || hasErrors}
          className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-all cursor-pointer ${
            isLoading || hasErrors
              ? 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed shadow-none'
              : 'bg-[#1769FF] text-white hover:bg-[#1255D4] active:scale-[0.98]'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Evaluating Model...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Run What-If Simulation</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}
