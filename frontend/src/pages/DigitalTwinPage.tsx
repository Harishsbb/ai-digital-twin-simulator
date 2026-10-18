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
          {/* Exploded View Active Pill */}
          <button
            type="button"
            onClick={() =>
              handleSelectViewMode(options.viewMode === 'exploded' ? 'assembled' : 'exploded')
            }
            className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-bold text-[#10213D] capitalize flex items-center gap-1.5">
                <span>{options.viewMode === 'exploded' ? 'Exploded View Active' : `${options.viewMode} Mode`}</span>
                <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
              </div>
              <div className="text-[11px] text-[#64748B]">
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
