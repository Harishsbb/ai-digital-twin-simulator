import React, { useState } from 'react'
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Gauge,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Server,
  Thermometer,
  Zap,
} from 'lucide-react'
import { Card } from '../components/Card'
import { StatusBadge } from '../components/StatusBadge'
import { useSensorStream } from '../context/useSensorStream'
import type { SimulatorAction } from '../types'

export const SensorsPage: React.FC = () => {
  const {
    reading,
    history,
    simState,
    connectionStatus,
    error: contextError,
    controlSimulator,
  } = useSensorStream()

  const [loadingAction, setLoadingAction] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const error = actionError || contextError
  const wsConnected = connectionStatus === 'Connected'

  // Simulator Control Handlers using shared context
  const handleControl = async (action: 'start' | 'pause' | 'reset' | 'toggle_mode') => {
    setLoadingAction(action)
    try {
      await controlSimulator(action as SimulatorAction)
      setActionError(null)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Control action failed')
    } finally {
      setLoadingAction(null)
    }
  }

  const isFaultMode = (reading?.mode || simState?.mode) === 'fault'
  const isRunning = simState ? simState.is_running : (reading?.is_running ?? true)

  // Current values or sensible defaults
  const currentTemp = reading?.temperature ?? 68.0
  const currentVib = reading?.vibration ?? 1.2
  const currentRpm = reading?.rpm ?? 1488.0

  // Helper status levels
  const getTempStatus = (t: number) => {
    if (t >= 105) return { label: 'CRITICAL OVERHEAT', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', bar: 'bg-[#EF4444]' }
    if (t >= 85) return { label: 'ELEVATED TEMP', color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', bar: 'bg-[#F59E0B]' }
    return { label: 'NORMAL THERMAL', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', bar: 'bg-[#10B981]' }
  }

  const getVibStatus = (v: number) => {
    if (v >= 7.1) return { label: 'ISO ZONE D (CRITICAL)', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', bar: 'bg-[#EF4444]' }
    if (v >= 4.5) return { label: 'ISO ZONE C (UNRESTRICTED)', color: 'text-[#DC2626]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', bar: 'bg-[#EF4444]' }
    if (v >= 2.3) return { label: 'ISO ZONE B (ACCEPTABLE)', color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', bar: 'bg-[#F59E0B]' }
    return { label: 'ISO ZONE A (GOOD)', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', bar: 'bg-[#10B981]' }
  }

  const getRpmStatus = (rpm: number) => {
    if (rpm < 1350) return { label: 'SEVERE ROTOR SLIP', color: 'text-[#EF4444]', bg: 'bg-[#FEF2F2]', border: 'border-[#FECACA]', bar: 'bg-[#EF4444]' }
    if (rpm < 1460) return { label: 'HIGH MECHANICAL DRAG', color: 'text-[#D97706]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', bar: 'bg-[#F59E0B]' }
    return { label: 'NOMINAL VELOCITY', color: 'text-[#059669]', bg: 'bg-[#ECFDF5]', border: 'border-[#A7F3D0]', bar: 'bg-[#1769FF]' }
  }

  const tempStatus = getTempStatus(currentTemp)
  const vibStatus = getVibStatus(currentVib)
  const rpmStatus = getRpmStatus(currentRpm)

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & TELEMETRY STREAM CONTROL BANNER           */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div>
          <div className="flex items-center gap-2.5 mb-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
              STEP 05 // SENSOR DATA SIMULATOR
            </span>
            <span className="text-[#475569] font-mono text-xs font-semibold">
              DEVICE // {reading?.device_id || 'SIMOTICS-150KW-01'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
            Continuous Sensor Telemetry Stream
          </h1>
          <p className="text-xs text-[#475569] mt-1 font-medium">
            Physics-based real-time telemetry generation for high-voltage induction motor supervision.
          </p>
        </div>

        {/* Right Actions: WebSocket Status & Simulation Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* WebSocket Status Indicator */}
          <div
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${
              wsConnected
                ? 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
                : 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                wsConnected ? 'bg-[#10B981] animate-pulse' : 'bg-[#F59E0B]'
              }`}
            />
            <span>{wsConnected ? 'WebSocket Live (500ms)' : 'Polling REST API'}</span>
          </div>

          {/* Normal vs Fault Mode Toggle Button */}
          <button
            type="button"
            onClick={() => handleControl('toggle_mode')}
            disabled={loadingAction === 'toggle_mode'}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isFaultMode
                ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] ring-2 ring-[#EF4444]/20'
                : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
            }`}
            title="Click to toggle between Normal operation and Fault scenario simulation"
          >
            {isFaultMode ? (
              <>
                <AlertOctagon className="w-4 h-4 text-[#EF4444] animate-bounce" />
                <span>FAULT MODE (Active)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>NORMAL MODE</span>
              </>
            )}
          </button>

          {/* Start / Pause Button */}
          <button
            type="button"
            onClick={() => handleControl(isRunning ? 'pause' : 'start')}
            disabled={loadingAction === 'start' || loadingAction === 'pause'}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all shadow-xs cursor-pointer ${
              isRunning
                ? 'bg-white hover:bg-[#F8FAFC] text-[#475569] border-[#DFE7F3]'
                : 'bg-[#1769FF] hover:bg-[#0F54D6] text-white border-[#1769FF] shadow-sm'
            }`}
            title={isRunning ? 'Pause telemetry stream' : 'Resume telemetry stream'}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" />
                <span>Resume</span>
              </>
            )}
          </button>

          {/* Reset Baseline Button */}
          <button
            type="button"
            onClick={() => handleControl('reset')}
            disabled={loadingAction === 'reset'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#475569] hover:text-[#10213D] transition-all shadow-xs cursor-pointer"
            title="Reset telemetry to pristine nominal baseline"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${loadingAction === 'reset' ? 'animate-spin' : ''}`} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#EF4444] shrink-0" />
            <span>Telemetry Notice: {error}</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="underline font-bold hover:text-[#7F1D1D]"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. THREE PRIMARY SENSOR METRIC CARDS (Req 1 & 2)         */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. TEMPERATURE CARD */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
                  <Thermometer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#10213D]">Stator Temperature</h3>
                  <span className="text-[10px] font-mono text-[#475569] font-semibold">TMP-ST-UVW (RTD)</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tempStatus.bg} ${tempStatus.color} ${tempStatus.border}`}>
                {tempStatus.label}
              </span>
            </div>

            {/* Big Digital Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-[#10213D] tracking-tight font-mono">
                {currentTemp.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-[#475569]">°C</span>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-semibold text-[#475569]">
                <span>Ambient (25°C)</span>
                <span>Class F Limit (155°C)</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#DFE7F3]">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${tempStatus.bar}`}
                  style={{
                    width: `${Math.min(100, Math.max(5, ((currentTemp - 20) / (155 - 20)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#475569]">
            <span className="font-medium">Normal Operating Range:</span>
            <span className="font-bold text-[#10213D] font-mono">58.0°C – 78.0°C</span>
          </div>
        </div>

        {/* 2. VIBRATION CARD */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#10213D]">Bearing Vibration</h3>
                  <span className="text-[10px] font-mono text-[#475569] font-semibold">VIB-DE-01 (IEPE Tri-Axial)</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vibStatus.bg} ${vibStatus.color} ${vibStatus.border}`}>
                {vibStatus.label}
              </span>
            </div>

            {/* Big Digital Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-[#10213D] tracking-tight font-mono">
                {currentVib.toFixed(2)}
              </span>
              <span className="text-lg font-bold text-[#475569]">mm/s RMS</span>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-semibold text-[#475569]">
                <span>Zone A (&lt;2.3)</span>
                <span>Zone D (&gt;7.1)</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#DFE7F3]">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${vibStatus.bar}`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (currentVib / 9.0) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#475569]">
            <span className="font-medium">ISO 10816 Zone A Limit:</span>
            <span className="font-bold text-[#10213D] font-mono">&lt; 2.3 mm/s</span>
          </div>
        </div>

        {/* 3. RPM CARD */}
        <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between relative overflow-hidden group">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#F1F5F9] mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-2xs">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#10213D]">Rotational Speed</h3>
                  <span className="text-[10px] font-mono text-[#475569] font-semibold">HALL-RPM-01 (Tachometer)</span>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rpmStatus.bg} ${rpmStatus.color} ${rpmStatus.border}`}>
                {rpmStatus.label}
              </span>
            </div>

            {/* Big Digital Value */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-4xl font-extrabold text-[#10213D] tracking-tight font-mono">
                {currentRpm.toFixed(1)}
              </span>
              <span className="text-lg font-bold text-[#475569]">RPM</span>
            </div>

            {/* Gauge Bar */}
            <div className="space-y-1.5 mb-4">
              <div className="flex justify-between text-[11px] font-semibold text-[#475569]">
                <span>1000 RPM</span>
                <span>1500 Synchronous</span>
              </div>
              <div className="w-full h-2.5 bg-[#F1F5F9] rounded-full overflow-hidden border border-[#DFE7F3]">
                <div
                  className={`h-full transition-all duration-300 rounded-full ${rpmStatus.bar}`}
                  style={{
                    width: `${Math.min(100, Math.max(5, (currentRpm / 1520) * 100))}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-[#F1F5F9] flex items-center justify-between text-xs text-[#475569]">
            <span className="font-medium">Rated Slip Velocity:</span>
            <span className="font-bold text-[#10213D] font-mono">1488.0 RPM (0.8% Slip)</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. REAL-TIME MULTI-CHANNEL TELEMETRY CHART               */}
      {/* ========================================================= */}
      <Card
        title="Live Telemetry Waveform Oscilloscope"
        subtitle="Continuous 500ms time-series stream of Stator Temperature, Bearing Vibration, and Shaft Speed"
        tag="REAL-TIME"
        icon={Radio}
        badge={
          <StatusBadge
            label={isRunning ? (isFaultMode ? 'FAULT INJECTION' : 'NOMINAL STREAM') : 'STREAM PAUSED'}
            variant={isRunning ? (isFaultMode ? 'error' : 'success') : 'neutral'}
            pulse={isRunning}
            size="sm"
          />
        }
      >
        <div className="space-y-4">
          {/* Chart Canvas Area */}
          <div className="relative h-64 w-full bg-[#0B1528] rounded-xl border border-[#1E293B] p-4 overflow-hidden shadow-inner">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(56,189,248,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.05)_1px,transparent_1px)] bg-[size:30px_30px]" />

            {/* SVG Waveforms */}
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200" preserveAspectRatio="none">
              {/* Midline Guide */}
              <line x1="0" y1="100" x2="800" y2="100" stroke="#334155" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

              {history.length > 1 && (
                <>
                  {/* 1. Temperature Line (Amber / Rose) */}
                  <polyline
                    fill="none"
                    stroke={isFaultMode ? '#F43F5E' : '#F59E0B'}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history
                      .map((pt, idx) => {
                        const x = (idx / (history.length - 1)) * 800
                        // Map 40°C - 130°C to 180 - 20 (inverted y)
                        const y = 180 - ((pt.temperature - 40) / (130 - 40)) * 160
                        return `${x.toFixed(1)},${Math.max(10, Math.min(190, y)).toFixed(1)}`
                      })
                      .join(' ')}
                  />

                  {/* 2. Vibration Line (Cyan / Magenta) */}
                  <polyline
                    fill="none"
                    stroke="#38BDF8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history
                      .map((pt, idx) => {
                        const x = (idx / (history.length - 1)) * 800
                        // Map 0 - 8 mm/s to 180 - 20
                        const y = 180 - (pt.vibration / 8.0) * 160
                        return `${x.toFixed(1)},${Math.max(10, Math.min(190, y)).toFixed(1)}`
                      })
                      .join(' ')}
                  />

                  {/* 3. RPM Line (Emerald / Royal Blue) */}
                  <polyline
                    fill="none"
                    stroke="#10B981"
                    strokeWidth="1.8"
                    strokeDasharray="5 3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={history
                      .map((pt, idx) => {
                        const x = (idx / (history.length - 1)) * 800
                        // Map 1100 - 1520 RPM to 180 - 20
                        const y = 180 - ((pt.rpm - 1100) / (1520 - 1100)) * 160
                        return `${x.toFixed(1)},${Math.max(10, Math.min(190, y)).toFixed(1)}`
                      })
                      .join(' ')}
                  />
                </>
              )}
            </svg>

            {/* Overlay Current Values Corner */}
            <div className="absolute top-3 right-4 flex items-center gap-4 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
                <span className="text-slate-200 font-bold">Temp: {currentTemp.toFixed(1)}°C</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]" />
                <span className="text-slate-200 font-bold">Vib: {currentVib.toFixed(2)} mm/s</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                <span className="text-slate-200 font-bold">Speed: {currentRpm.toFixed(1)} RPM</span>
              </div>
            </div>
          </div>

          {/* Legend and Physics Description */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                <span className="text-[#10213D] font-bold">Thermal Continuity Model</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Stochastic mean-reverting thermal conduction. Slow thermal inertia prevents sudden unrealistic step jumps.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#38BDF8]" />
                <span className="text-[#10213D] font-bold">Mechanical Vibration Waves</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Combines rotational harmonics with Gaussian noise. Spikes and accelerates in Fault mode to simulate bearing spalling.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-[#10213D] font-bold">Tachometer Slip Dynamics</span>
              </div>
              <p className="text-[11px] text-[#475569] leading-relaxed">
                Nominal 50Hz synchronous slip speed (1488 RPM). Slips downwards during thermal overload and mechanical resistance.
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* ========================================================= */}
      {/* 4. SUBSYSTEM ARCHITECTURE & PROTOCOL SPECS               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Telemetry Architecture & Specifications"
          subtitle="FastAPI backend simulator parameters and transport protocol"
          tag="ARCHITECTURE"
          icon={Server}
        >
          <div className="font-sans text-xs space-y-2.5">
            <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#475569] font-medium">Device Asset ID</span>
              <span className="text-[#10213D] font-mono font-bold">{reading?.device_id || 'SIMOTICS-150KW-01'}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#475569] font-medium">Simulator Engine Mode</span>
              <span className={`font-mono font-bold uppercase ${isFaultMode ? 'text-[#DC2626]' : 'text-[#059669]'}`}>
                {reading?.mode || 'NORMAL'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#475569] font-medium">Broadcast Sampling Rate</span>
              <span className="text-[#10213D] font-mono font-bold">500 ms (2.0 Hz)</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#475569] font-medium">Packets Streamed</span>
              <span className="text-[#1769FF] font-mono font-bold">#{reading?.sequence ?? 0}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9]">
              <span className="text-[#475569] font-medium">Active WebSocket Subscribers</span>
              <span className="text-[#10213D] font-mono font-bold">{simState?.connected_clients ?? 1} client(s)</span>
            </div>
            <div className="flex items-center justify-between pt-1 text-[11px] text-[#475569]">
              <span className="font-medium">WebSocket Endpoint:</span>
              <span className="text-[#059669] font-mono font-bold">/api/v1/sensors/ws</span>
            </div>
          </div>
        </Card>

        <Card
          title="Fault Injection Control & Verification"
          subtitle="Simulate progressive mechanical defect scenarios for Step 5"
          tag="TEST HARNESS"
          icon={Zap}
        >
          <div className="space-y-3 text-xs">
            <p className="text-[#334155] leading-relaxed font-medium">
              Toggle between Normal and Fault modes to verify continuous physics progression without hardcoded classifications.
            </p>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => handleControl('toggle_mode')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !isFaultMode
                    ? 'bg-[#ECFDF5] border-[#10B981] shadow-2xs ring-1 ring-[#10B981]/30'
                    : 'bg-white border-[#DFE7F3] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#065F46]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>Normal Mode</span>
                </div>
                <div className="text-[11px] text-[#047857]">
                  Steady state: 68°C, 1.2 mm/s, 1488 RPM
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleControl('toggle_mode')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isFaultMode
                    ? 'bg-[#FEF2F2] border-[#EF4444] shadow-2xs ring-1 ring-[#EF4444]/30'
                    : 'bg-white border-[#DFE7F3] hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1 text-xs font-bold text-[#991B1B]">
                  <AlertOctagon className="w-3.5 h-3.5 text-[#EF4444]" />
                  <span>Fault Mode</span>
                </div>
                <div className="text-[11px] text-[#B91C1C]">
                  Rising Temp, Rising Vib, Slipping RPM
                </div>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] flex items-center justify-between text-xs">
              <span className="text-[#475569] font-medium">Reset Simulator Baseline:</span>
              <button
                onClick={() => handleControl('reset')}
                className="px-3 py-1 rounded-lg bg-[#EAF2FF] hover:bg-[#D9E8FF] border border-[#BFDBFE] text-[#1769FF] font-bold text-xs transition-colors"
              >
                Reset to 0.0s Baseline
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
