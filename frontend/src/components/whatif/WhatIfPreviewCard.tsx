import React from 'react'
import {
  AlertOctagon,
  CheckCircle2,
  Cpu,
  Flame,
  Gauge,
  ShieldCheck,
  Waves,
} from 'lucide-react'
import type { AnomalyPredictionResponse } from '../../types'
import type { WhatIfParameters } from '../../types/whatIf'

interface WhatIfPreviewCardProps {
  parameters: WhatIfParameters
  prediction: AnomalyPredictionResponse | null
  isLoading?: boolean
}

export const WhatIfPreviewCard: React.FC<WhatIfPreviewCardProps> = ({
  parameters,
  prediction,
  isLoading = false,
}) => {
  // 1. Thermal status calculation
  const getThermalStatus = (temp: number) => {
    if (temp < 75) return { label: 'Nominal Thermal State', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' }
    if (temp < 90) return { label: 'Elevated Warning (Class B)', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' }
    if (temp < 110) return { label: 'High Heat (Class F Limit)', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA', text: '#9A3412' }
    return { label: 'Critical Overheating (Class H)', color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' }
  }

  // 2. ISO 10816 Vibration severity zone
  const getVibrationZone = (vib: number) => {
    if (vib < 1.8) return { zone: 'Zone A', label: 'Good (New Machine)', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' }
    if (vib < 4.5) return { zone: 'Zone B', label: 'Acceptable (Continuous Run)', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' }
    if (vib < 7.1) return { zone: 'Zone C', label: 'Restricted (Warning)', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' }
    return { zone: 'Zone D', label: 'Dangerous (Spall / Unbalance)', color: '#EF4444', bg: '#FEF2F2', border: '#FCA5A5', text: '#991B1B' }
  }

  // 3. RPM Slip calculation (Synchronous speed for 4-pole 50Hz = 1500 RPM)
  const syncSpeed = 1500
  const slipPct = Math.max(0, ((syncSpeed - parameters.rpm) / syncSpeed) * 100)

  const thermal = getThermalStatus(parameters.temperature)
  const vibZone = getVibrationZone(parameters.vibration)

  // Rotation duration based on RPM (clamped between 0.2s and 2s)
  const rotDuration = Math.max(0.2, Math.min(2.0, (1500 / Math.max(parameters.rpm, 300)) * 0.8))

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-5 relative overflow-hidden">
      {/* Top hypothetical banner */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6] animate-pulse" />
          <h3 className="text-sm font-bold text-[#10213D]">
            Hypothetical Digital Twin State Preview
          </h3>
        </div>

        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#FAF5FF] text-[#7C3AED] border border-[#DDD6FE]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#7C3AED]" />
          <span>ISOLATED SANDBOX — NO LIVE OVERWRITE</span>
        </div>
      </div>

      {/* Visual Simulation Display Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Motor Schematic Visualizer */}
        <div className="lg:col-span-5 bg-gradient-to-b from-[#F8FAFC] to-[#EFF6FF] rounded-2xl p-5 border border-[#E2E8F0] relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
          {/* Watermark in background */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none text-4xl font-black text-[#10213D] rotate-[-15deg]">
            HYPOTHETICAL
          </div>

          {/* SVG Animated Motor Schematic */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Stator Winding Thermal Glow Ring */}
            <div
              className="absolute inset-2 rounded-full border-4 transition-all duration-500"
              style={{
                borderColor: thermal.color,
                boxShadow: `0 0 24px ${thermal.color}40`,
              }}
            />

            {/* Vibration Shockwaves */}
            {parameters.vibration > 4.5 && (
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed animate-ping opacity-30"
                style={{ borderColor: vibZone.color, animationDuration: '1.5s' }}
              />
            )}

            {/* Motor Outer Frame Graphic */}
            <div className="w-36 h-36 rounded-full bg-white border-2 border-[#CBD5E1] shadow-inner flex items-center justify-center relative">
              {/* Cooling Fins notches */}
              <div className="absolute top-1 w-2 h-2 bg-[#94A3B8] rounded-xs" />
              <div className="absolute bottom-1 w-2 h-2 bg-[#94A3B8] rounded-xs" />
              <div className="absolute left-1 w-2 h-2 bg-[#94A3B8] rounded-xs" />
              <div className="absolute right-1 w-2 h-2 bg-[#94A3B8] rounded-xs" />

              {/* Rotating Rotor Shaft */}
              <div
                className="w-24 h-24 rounded-full border-4 border-[#1769FF] border-t-transparent border-b-transparent flex items-center justify-center transition-all"
                style={{
                  animation: `spin ${rotDuration}s linear infinite`,
                }}
              >
                <div className="w-12 h-12 rounded-full bg-[#10213D] border-2 border-[#E2E8F0] flex items-center justify-center text-white text-[10px] font-mono font-bold">
                  {Math.round(parameters.rpm)}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-[11px] font-mono font-bold text-[#475569]">
              Simulated Velocity: {parameters.rpm.toFixed(0)} RPM ({slipPct.toFixed(1)}% slip)
            </span>
          </div>
        </div>

        {/* Operating Stress Breakdown Cards */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Thermal Rating */}
          <div className="p-3.5 rounded-xl border bg-white space-y-1.5" style={{ borderColor: thermal.border }}>
            <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4" style={{ color: thermal.color }} />
                <span>Thermal Stress</span>
              </div>
              <span className="font-mono text-xs">{parameters.temperature}°C</span>
            </div>
            <div
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block border"
              style={{ backgroundColor: thermal.bg, borderColor: thermal.border, color: thermal.text }}
            >
              {thermal.label}
            </div>
            <div className="text-[10px] text-[#64748B] leading-tight">
              Stator coil heat dissipation threshold: 90°C nominal limit.
            </div>
          </div>

          {/* Vibration Zone */}
          <div className="p-3.5 rounded-xl border bg-white space-y-1.5" style={{ borderColor: vibZone.border }}>
            <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
              <div className="flex items-center gap-1.5">
                <Waves className="w-4 h-4" style={{ color: vibZone.color }} />
                <span>Vibration Severity</span>
              </div>
              <span className="font-mono text-xs">{parameters.vibration} mm/s</span>
            </div>
            <div
              className="text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1 border"
              style={{ backgroundColor: vibZone.bg, borderColor: vibZone.border, color: vibZone.text }}
            >
              <strong>{vibZone.zone}:</strong> {vibZone.label}
            </div>
            <div className="text-[10px] text-[#64748B] leading-tight">
              ISO 10816-3 standard: Zone C/D indicates immediate defect risk.
            </div>
          </div>

          {/* Rotational Dynamics */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
              <div className="flex items-center gap-1.5">
                <Gauge className="w-4 h-4 text-[#3B82F6]" />
                <span>Rotor Dynamics</span>
              </div>
              <span className="font-mono text-xs">{parameters.rpm} RPM</span>
            </div>
            <div className="text-[11px] font-semibold px-2 py-0.5 rounded-md inline-block bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF]">
              {slipPct < 2.0 ? 'Synchronous Nominal' : slipPct < 6.0 ? 'Moderate Torque Slip' : 'Severe Rotor Drag / Stall'}
            </div>
            <div className="text-[10px] text-[#64748B] leading-tight">
              Synchronous reference: 1500 RPM (50Hz 4-pole cage design).
            </div>
          </div>

          {/* AI Decision Indicator */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] bg-white space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-[#10213D]">
              <div className="flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-[#1769FF]" />
                <span>Model Classification</span>
              </div>
              <span className="font-mono text-xs">
                {prediction ? `${prediction.anomaly_score >= 0 ? '+' : ''}${prediction.anomaly_score.toFixed(3)}` : '—'}
              </span>
            </div>
            <div>
              {isLoading ? (
                <span className="text-[11px] font-medium text-[#64748B]">Evaluating model...</span>
              ) : !prediction ? (
                <span className="text-[11px] font-medium text-[#94A3B8] italic">Pending simulation run</span>
              ) : prediction.is_anomaly ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
                  <AlertOctagon className="w-3 h-3" />
                  <span>Outlier (Anomaly Detected)</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#ECFDF5] text-[#059669] border border-[#6EE7B7]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Inlier (Nominal Envelope)</span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-[#64748B] leading-tight">
              scikit-learn Isolation Forest hyper-dimensional partitioning.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
