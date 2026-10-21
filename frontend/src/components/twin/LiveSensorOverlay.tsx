import React, { useState } from 'react'
import {
  Activity,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Flame,
  Gauge,
  Pause,
  Play,
  RotateCcw,
  Wifi,
  WifiOff,
} from 'lucide-react'
import type {
  SensorReading,
  SimulatorAction,
  SimulatorMode,
  TelemetryConnectionStatus,
} from '../../types'

interface LiveSensorOverlayProps {
  reading: SensorReading | null
  connectionStatus: TelemetryConnectionStatus
  lastReceivedAt: number | null
  isSimulatorRunning: boolean
  currentMode: SimulatorMode
  onControl: (action: SimulatorAction, mode?: SimulatorMode) => Promise<void>
  onToggleMode: () => Promise<void>
}

export const LiveSensorOverlay: React.FC<LiveSensorOverlayProps> = ({
  reading,
  connectionStatus,
  lastReceivedAt,
  isSimulatorRunning,
  currentMode,
  onControl,
  onToggleMode,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const handleAction = async (action: SimulatorAction, mode?: SimulatorMode) => {
    setActionLoading(action)
    try {
      await onControl(action, mode)
    } finally {
      setActionLoading(null)
    }
  }

  // Connection Status styling
  const getConnectionBadge = () => {
    switch (connectionStatus) {
      case 'Connected':
        return {
          label: 'Connected',
          dotClass: 'bg-[#10B981] animate-pulse',
          badgeClass: 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]',
          icon: Wifi,
        }
      case 'Stale Data':
        return {
          label: 'Stale Data',
          dotClass: 'bg-[#F59E0B] animate-ping',
          badgeClass: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
          icon: Wifi,
        }
      case 'Disconnected':
      default:
        return {
          label: 'Disconnected',
          dotClass: 'bg-[#EF4444]',
          badgeClass: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
          icon: WifiOff,
        }
    }
  }

  const connBadge = getConnectionBadge()
  const ConnIcon = connBadge.icon

  // Format last received timestamp
  const formatTime = (timestampMs: number | null) => {
    if (!timestampMs) return 'No sync'
    const d = new Date(timestampMs)
    return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }

  // Threshold colors
  const temp = reading?.temperature ?? 68.0
  const tempColor =
    temp >= 95
      ? 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'
      : temp >= 80
      ? 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]'
      : 'text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]'

  const vib = reading?.vibration ?? 1.8
  const vibColor =
    vib >= 7.1
      ? 'text-[#DC2626] bg-[#FEF2F2] border-[#FECACA]'
      : vib >= 3.2
      ? 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]'
      : 'text-[#10B981] bg-[#ECFDF5] border-[#A7F3D0]'

  const rpm = reading?.rpm ?? 1488
  const rpmColor =
    !isSimulatorRunning || rpm === 0
      ? 'text-[#64748B] bg-[#F1F5F9] border-[#CBD5E1]'
      : rpm < 1300
      ? 'text-[#D97706] bg-[#FFFBEB] border-[#FDE68A]'
      : 'text-[#1769FF] bg-[#EAF2FF] border-[#BFDBFE]'

  return (
    <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none transition-all">
      <div className="max-w-4xl mx-auto rounded-2xl bg-white/95 backdrop-blur-md border border-[#DFE7F3] shadow-[0_8px_30px_rgba(16,33,61,0.08)] p-3.5 pointer-events-auto transition-all">
        {/* ========================================================= */}
        {/* TOP STATUS BAR: Connection, Mode, Timestamp & Collapse    */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between gap-3 pb-2.5 border-b border-[#F1F5F9]">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Connection Status Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${connBadge.badgeClass}`}
            >
              <span className={`w-2 h-2 rounded-full ${connBadge.dotClass}`} />
              <ConnIcon className="w-3.5 h-3.5" />
              <span>{connBadge.label}</span>
            </div>

            {/* Mode Indicator Pill */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border transition-all ${
                currentMode === 'fault'
                  ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                  : 'bg-[#EFF6FF] text-[#1D4ED8] border-[#BFDBFE]'
              }`}
            >
              {currentMode === 'fault' ? (
                <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              ) : (
                <Activity className="w-3.5 h-3.5 text-[#1D4ED8]" />
              )}
              <span className="uppercase tracking-wider text-[11px]">
                {currentMode === 'fault' ? 'Fault Mode Active' : 'Normal Physics Mode'}
              </span>
            </div>

            {/* Running/Paused Pill */}
            <div
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${
                isSimulatorRunning
                  ? 'bg-[#F0FDF4] text-[#16A34A] border-[#DCFCE7]'
                  : 'bg-[#FFF7ED] text-[#EA580C] border-[#FFEDD5]'
              }`}
            >
              {isSimulatorRunning ? 'Simulator Running' : 'Simulator Paused'}
            </div>
          </div>

          {/* Right: Last Synced Time & Expand/Collapse Toggle */}
          <div className="flex items-center gap-2 text-xs text-[#64748B]">
            <span className="hidden sm:inline font-mono text-[11px]">
              Sync: {formatTime(lastReceivedAt)}
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#10213D] transition-colors cursor-pointer"
              title={isExpanded ? 'Collapse telemetry overlay' : 'Expand telemetry overlay'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* EXPANDABLE BODY: Live Telemetry Gauges + Direct Controls  */}
        {/* ========================================================= */}
        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pt-3 items-center">
            {/* Telemetry Metric Chips (8 Cols) */}
            <div className="md:col-span-8 grid grid-cols-3 gap-2.5">
              {/* 1. Temperature Chip */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${tempColor}`}>
                  <Flame className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider truncate">
                    Temperature
                  </div>
                  <div className="text-sm font-extrabold text-[#10213D] font-mono leading-tight">
                    {temp.toFixed(1)} <span className="text-[11px] font-sans font-semibold text-[#475569]">°C</span>
                  </div>
                </div>
              </div>

              {/* 2. Vibration Chip */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${vibColor}`}>
                  <Activity className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider truncate">
                    Vibration
                  </div>
                  <div className="text-sm font-extrabold text-[#10213D] font-mono leading-tight">
                    {vib.toFixed(2)} <span className="text-[11px] font-sans font-semibold text-[#475569]">mm/s</span>
                  </div>
                </div>
              </div>

              {/* 3. RPM Chip */}
              <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border shrink-0 ${rpmColor}`}>
                  <Gauge className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider truncate">
                    Speed (RPM)
                  </div>
                  <div className="text-sm font-extrabold text-[#10213D] font-mono leading-tight">
                    {Math.round(rpm)} <span className="text-[11px] font-sans font-semibold text-[#475569]">RPM</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Interactive Simulation Controls (4 Cols) */}
            <div className="md:col-span-4 flex items-center justify-end gap-2">
              {/* Mode Toggle Button */}
              <button
                type="button"
                onClick={onToggleMode}
                disabled={actionLoading !== null}
                className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 border ${
                  currentMode === 'fault'
                    ? 'bg-[#10B981] hover:bg-[#059669] text-white border-[#059669]'
                    : 'bg-[#DC2626] hover:bg-[#B91C1C] text-white border-[#B91C1C]'
                }`}
                title={currentMode === 'fault' ? 'Switch back to Normal Physics mode' : 'Inject Fault into 3D Digital Twin'}
              >
                {currentMode === 'fault' ? (
                  <>
                    <Activity className="w-3.5 h-3.5" />
                    <span>Set Normal</span>
                  </>
                ) : (
                  <>
                    <Flame className="w-3.5 h-3.5" />
                    <span>Inject Fault</span>
                  </>
                )}
              </button>

              {/* Play / Pause Toggle Button */}
              <button
                type="button"
                onClick={() => handleAction(isSimulatorRunning ? 'pause' : 'start')}
                disabled={actionLoading !== null}
                className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#10213D] border border-[#DFE7F3] shadow-xs transition-all active:scale-95 cursor-pointer"
                title={isSimulatorRunning ? 'Pause simulator' : 'Start simulator'}
              >
                {isSimulatorRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-[#10B981]" />}
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={() => handleAction('reset')}
                disabled={actionLoading !== null}
                className="p-2 rounded-xl bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] hover:text-[#10213D] border border-[#DFE7F3] shadow-xs transition-all active:scale-95 cursor-pointer"
                title="Reset simulation to baseline parameters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
