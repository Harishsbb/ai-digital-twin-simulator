import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Box, Layers, ChevronDown, AlertOctagon } from 'lucide-react'
import { MotorViewportCard } from '../components/twin/MotorViewportCard'
import { ComponentDetailsCard } from '../components/twin/ComponentDetailsCard'
import { ViewModeSelectorCard } from '../components/twin/ViewModeSelectorCard'
import { StatusSelectorCard } from '../components/twin/StatusSelectorCard'
import { ControlsHelpCard } from '../components/twin/ControlsHelpCard'
import { AIStatusBadge } from '../components/ai'
import { getComponentById } from '../data/motorComponents'
import { useSensorStream } from '../context/useSensorStream'
import { useAIPrediction } from '../context/useAIPrediction'
import { useAlerts } from '../context/useAlerts'
import { evaluateMachineStatusFromSensors } from '../utils/motorTelemetryMath'
import type { LiveMotorTelemetry, TwinViewMode, TwinViewOptions, TwinVisualStatus } from '../types'

export const DigitalTwinPage: React.FC = () => {
  // Shared Live Telemetry Stream from single WebSocket connection
  const {
    reading,
    connectionStatus,
    lastReceivedAt,
    isSimulatorRunning,
    currentMode,
    controlSimulator,
    toggleMode,
  } = useSensorStream()

  // Step 8: Live AI Anomaly Detection State
  const {
    isAnomaly,
    anomalyScore,
    isModelReady,
    latestPrediction,
  } = useAIPrediction()

  // Step 9: Real-time Alert System State
  const {
    counts: alertCounts,
    latestAlert,
  } = useAlerts()

  // Machine Status State (defaults to live evaluated telemetry status, can be manually tested)
  const [manualStatus, setManualStatus] = useState<TwinVisualStatus | null>(null)

  const liveEvaluatedStatus = useMemo(() => {
    return evaluateMachineStatusFromSensors(
      reading?.temperature,
      reading?.vibration,
      reading?.rpm
    )
  }, [reading?.temperature, reading?.vibration, reading?.rpm])

  const status: TwinVisualStatus = manualStatus ?? liveEvaluatedStatus

  // Memoized live telemetry packet for 3D motor physics animation
  const liveTelemetry: LiveMotorTelemetry | null = useMemo(() => {
    if (!reading) return null
    return {
      rpm: reading.rpm,
      vibration: reading.vibration,
      temperature: reading.temperature,
      isRunning: reading.is_running,
      mode: reading.mode,
      timestamp: reading.timestamp,
    }
  }, [reading])

  // Selected Component for detailed inspection (defaults to Stator Core matching reference)
  const [selectedComponentId, setSelectedComponentId] = useState<string>('stator-core')

  // 3D Viewport Options - Default to Assembled
  const [options, setOptions] = useState<TwinViewOptions>({
    autoRotate: false,
    wireframe: false,
    showSensors: true,
    explodedView: false,
    viewMode: 'assembled',
    showLabels: false,
    rotationSpeed: 1.0,
  })

  // Handlers for switching view mode
  const handleSelectViewMode = (mode: TwinViewMode) => {
    setOptions((prev) => ({
      ...prev,
      viewMode: mode,
      explodedView: mode === 'exploded',
      showLabels: mode === 'exploded',
    }))
  }

  // Active component metadata
  const currentComponent = getComponentById(selectedComponentId)

  // Status badge styling helper
  const getStatusColor = () => {
    switch (status) {
      case 'Warning':
        return {
          text: 'text-[#F59E0B]',
          dot: 'bg-[#F59E0B]',
          container: 'bg-[#FFFBEB] border-[#FDE68A]',
        }
      case 'Critical':
        return {
          text: 'text-[#EF4444]',
          dot: 'bg-[#EF4444]',
          container: 'bg-[#FEF2F2] border-[#FECACA]',
        }
      case 'Normal':
      default:
        return {
          text: 'text-[#10B981]',
          dot: 'bg-[#10B981]',
          container: 'bg-[#ECFDF5] border-[#A7F3D0]',
        }
    }
  }

  const statusStyle = getStatusColor()

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & STATUS METRICS (Matching Reference UI)   */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Royal Blue Cube Icon & Title Block */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0F54D6] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(23,105,255,0.25)] shrink-0 mt-0.5">
            <Box className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
              Digital Twin
            </h1>
            <div className="text-sm text-[#475569] font-medium mt-0.5">
              Interactive Industrial Motor Simulation
            </div>
            <p className="text-xs text-[#64748B] mt-1">
              Explore the 3D model, view component details and understand the assembly structure.
            </p>
          </div>
        </div>

        {/* Right: Quick Telemetry Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* AI Status Badge */}
          <Link
            to="/anomaly-detection"
            className="cursor-pointer transition-transform hover:scale-102"
            title="Inspect AI Anomaly Detection Engine & Diagnostics"
          >
            <AIStatusBadge showScore={true} />
          </Link>

          {/* Step 9: Alert Status Pill */}
          <Link
            to="/alerts"
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl border shadow-xs transition-all cursor-pointer text-left ${
              alertCounts.critical > 0
                ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B] hover:border-[#F87171]'
                : alertCounts.active > 0
                ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E] hover:border-[#FBBF24]'
                : 'bg-white border-[#DFE7F3] text-[#475569] hover:border-[#1769FF]'
            }`}
            title="Real-Time AI Alert Center"
          >
            <div className="relative">
              <AlertOctagon className={`w-4 h-4 ${
                alertCounts.critical > 0 ? 'text-[#EF4444]' : alertCounts.active > 0 ? 'text-[#F59E0B]' : 'text-[#64748B]'
              }`} />
              {alertCounts.unacknowledged > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#EF4444] animate-ping" />
              )}
            </div>
            <div className="leading-tight">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748B] flex items-center gap-1">
                <span>Alerts</span>
                {alertCounts.unacknowledged > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                )}
              </div>
              <div className="text-xs font-bold text-[#10213D]">
                {alertCounts.active === 0 ? '0 Active' : `${alertCounts.active} Active (${alertCounts.critical} Crit)`}
              </div>
            </div>
          </Link>

          {/* Exploded / Assembled View Toggle Button */}
          <button
            type="button"
            onClick={() =>
              handleSelectViewMode(options.viewMode === 'exploded' ? 'assembled' : 'exploded')
            }
            className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border shadow-xs transition-all cursor-pointer text-left ${
              options.viewMode === 'exploded'
                ? 'bg-[#EAF2FF] border-[#1769FF] ring-1 ring-[#1769FF]/30'
                : 'bg-white border-[#DFE7F3] hover:border-[#1769FF] hover:bg-[#F8FAFC]'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
                options.viewMode === 'exploded'
                  ? 'bg-[#1769FF] text-white border-[#1769FF]'
                  : 'bg-[#EAF2FF] text-[#1769FF] border-[#BFDBFE]'
              }`}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-[#10213D] capitalize flex items-center gap-1.5">
                <span>{options.viewMode === 'exploded' ? 'Exploded View (Active)' : 'Exploded View'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
              <div className="text-[11px] text-[#475569]">
                {options.viewMode === 'exploded' ? 'Click to assemble motor' : 'Click to explode parts'}
              </div>
            </div>
          </button>

          {/* Machine Status Pill */}
          <button
            type="button"
            onClick={() => {
              const next: Record<TwinVisualStatus, TwinVisualStatus> = {
                Normal: 'Warning',
                Warning: 'Critical',
                Critical: 'Normal',
              }
              setManualStatus(next[status])
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer text-left"
          >
            <div className={`w-8 h-8 rounded-xl border flex items-center justify-center shrink-0 ${statusStyle.container}`}>
              <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-[#64748B] flex items-center gap-1 font-medium">
                <span>Machine Status</span>
                <ChevronDown className="w-3 h-3 text-[#94A3B8]" />
              </div>
              <div className={`text-xs font-bold ${statusStyle.text}`}>{status}</div>
            </div>
          </button>
        </div>
      </div>

      {/* Subtle AI Anomaly / Alert Notification Ribbon (when active anomaly alert exists) */}
      {latestAlert && !latestAlert.isDismissed && latestAlert.severity !== 'info' && (
        <div className={`p-3.5 px-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs animate-in fade-in duration-200 shadow-2xs ${
          latestAlert.severity === 'critical'
            ? 'bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]'
            : latestAlert.severity === 'high'
            ? 'bg-[#FFF7ED] border-[#FED7AA] text-[#9A3412]'
            : 'bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]'
        }`}>
          <div className="flex items-center gap-2.5">
            <AlertOctagon className={`w-4 h-4 shrink-0 ${
              latestAlert.severity === 'critical' ? 'text-[#EF4444]' : latestAlert.severity === 'high' ? 'text-[#F97316]' : 'text-[#F59E0B]'
            }`} />
            <div>
              <span className="font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded mr-1.5 bg-white/70 border border-current/20">
                {latestAlert.severity}
              </span>
              <span className="font-bold">{latestAlert.title}:</span>{' '}
              <span>{latestAlert.description}</span>
              {latestAlert.anomalyScore !== null && (
                <span className="ml-1.5 font-mono text-[11px] opacity-80">
                  (Score: {latestAlert.anomalyScore >= 0 ? `+${latestAlert.anomalyScore.toFixed(4)}` : latestAlert.anomalyScore.toFixed(4)})
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <Link
              to="/alerts"
              className="underline font-bold hover:opacity-80 text-xs"
            >
              Alert Center &rarr;
            </Link>
            <Link
              to="/anomaly-detection"
              className="opacity-80 hover:opacity-100 text-xs"
            >
              AI Insights &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* Fallback AI Anomaly Notification Ribbon (if anomaly active but alert dismissed) */}
      {(!latestAlert || latestAlert.isDismissed) && isModelReady && isAnomaly && (
        <div className="p-3.5 px-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 text-xs text-[#991B1B] animate-in fade-in duration-200 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <AlertOctagon className="w-4 h-4 text-[#EF4444] shrink-0" />
            <div>
              <span className="font-bold">Isolation Forest Anomaly Alert:</span>{' '}
              <span className="font-mono font-semibold">
                Score {anomalyScore !== null ? (anomalyScore >= 0 ? `+${anomalyScore.toFixed(4)}` : anomalyScore.toFixed(4)) : 'N/A'}
              </span>{' '}
              — {latestPrediction?.diagnostic_context?.summary || 'Telemetry vector partitioned into low-density anomaly region.'}
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto">
            <Link
              to="/alerts"
              className="underline font-bold text-[#DC2626] hover:text-[#7F1D1D] text-xs"
            >
              Alert Center &rarr;
            </Link>
            <Link
              to="/anomaly-detection"
              className="font-medium text-[#DC2626] hover:text-[#7F1D1D] text-xs"
            >
              Inspect AI Insights &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MAIN 3D MOTOR VIEWPORT & COMPONENT DETAILS PANEL       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left (8 cols): 3D Motor View Centerpiece */}
        <div className="lg:col-span-8 flex flex-col">
          <MotorViewportCard
            status={status}
            options={options}
            onOptionsChange={setOptions}
            selectedComponentId={selectedComponentId}
            onSelectComponent={(id) => setSelectedComponentId(id)}
            onViewModeChange={handleSelectViewMode}
            liveTelemetry={liveTelemetry}
            sensorReading={reading}
            connectionStatus={connectionStatus}
            lastReceivedAt={lastReceivedAt}
            isSimulatorRunning={isSimulatorRunning}
            currentMode={currentMode}
            onControl={controlSimulator}
            onToggleMode={toggleMode}
            isAiAnomaly={isModelReady ? isAnomaly : undefined}
            aiAnomalyScore={isModelReady ? anomalyScore : undefined}
          />
        </div>

        {/* Right (4 cols): Component Details Panel */}
        <div className="lg:col-span-4 flex flex-col">
          <ComponentDetailsCard
            component={currentComponent}
            onSelectComponent={(id) => setSelectedComponentId(id)}
            machineStatus={status}
          />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM CARDS: VIEW MODES, STATUS TESTER & GUIDE        */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Card 1: Change View Mode */}
        <ViewModeSelectorCard
          currentMode={options.viewMode}
          onSelectMode={handleSelectViewMode}
        />

        {/* Card 2: Machine Status (Test) */}
        <StatusSelectorCard
          status={status}
          onChangeStatus={(s) => setManualStatus(s)}
        />

        {/* Card 3: Interaction Guide */}
        <ControlsHelpCard />
      </div>
    </div>
  )
}
