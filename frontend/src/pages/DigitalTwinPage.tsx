import React, { useState } from 'react'
import { Box, Layers, ChevronDown } from 'lucide-react'
import { MotorViewportCard } from '../components/twin/MotorViewportCard'
import { ComponentDetailsCard } from '../components/twin/ComponentDetailsCard'
import { ViewModeSelectorCard } from '../components/twin/ViewModeSelectorCard'
import { StatusSelectorCard } from '../components/twin/StatusSelectorCard'
import { ControlsHelpCard } from '../components/twin/ControlsHelpCard'
import { getComponentById } from '../data/motorComponents'
import type { TwinViewMode, TwinViewOptions, TwinVisualStatus } from '../types'

export const DigitalTwinPage: React.FC = () => {
  // Machine Status State (Normal / Warning / Critical)
  const [status, setStatus] = useState<TwinVisualStatus>('Normal')

  // Selected Component for detailed inspection (defaults to Stator Core matching reference)
  const [selectedComponentId, setSelectedComponentId] = useState<string>('stator-core')

  // 3D Viewport Options
  const [options, setOptions] = useState<TwinViewOptions>({
    autoRotate: false,
    wireframe: false,
    showSensors: true,
    explodedView: true,
    viewMode: 'exploded',
    showLabels: true,
    rotationSpeed: 1.0,
  })

  // Handlers for switching view mode
  const handleSelectViewMode = (mode: TwinViewMode) => {
    setOptions((prev) => ({
      ...prev,
      viewMode: mode,
      explodedView: mode === 'exploded',
      showLabels: mode === 'exploded' ? true : prev.showLabels,
    }))
  }

  // Active component metadata
  const currentComponent = getComponentById(selectedComponentId)

  // Status badge styling helper
  const getStatusColor = () => {
    switch (status) {
      case 'Warning':
        return { text: 'text-amber-400', dot: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]' }
      case 'Critical':
        return { text: 'text-rose-400', dot: 'bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.9)]' }
      case 'Normal':
      default:
        return { text: 'text-emerald-400', dot: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.9)]' }
    }
  }

  const statusStyle = getStatusColor()

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & STATUS METRICS (Matching Reference UI)   */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
        {/* Left: Cube Icon & Title Block */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#132238] border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.15)] shrink-0 mt-0.5">
            <Box className="w-6 h-6" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              Digital Twin
            </h1>
            <div className="text-sm text-slate-300 font-medium mt-0.5">
              Interactive Industrial Motor Simulation
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Explore the 3D model, view component details and understand the assembly structure.
            </p>
          </div>
        </div>

        {/* Right: Quick Telemetry Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Exploded View Active Pill */}
          <button
            type="button"
            onClick={() =>
              handleSelectViewMode(options.viewMode === 'exploded' ? 'assembled' : 'exploded')
            }
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl dark-panel shadow-md border border-white/5 hover:border-blue-500/30 transition-all cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-white capitalize flex items-center gap-1.5">
                <span>{options.viewMode === 'exploded' ? 'Exploded View Active' : `${options.viewMode} Mode`}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </div>
              <div className="text-[11px] text-slate-400">
                {options.viewMode === 'exploded' ? 'Motor components separated' : 'Click to toggle view'}
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
              setStatus(next[status])
            }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl dark-panel shadow-md border border-white/5 hover:border-slate-700 transition-all cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center shrink-0">
              <span className={`w-2.5 h-2.5 rounded-full ${statusStyle.dot}`} />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-slate-400 flex items-center gap-1">
                <span>Machine Status</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
              <div className={`text-xs font-semibold ${statusStyle.text}`}>{status}</div>
            </div>
          </button>
        </div>
      </div>

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
          onChangeStatus={(s) => setStatus(s)}
        />

        {/* Card 3: Interaction Guide */}
        <ControlsHelpCard />
      </div>
    </div>
  )
}
