import React, { useState } from 'react'
import { Box, Clock, Wifi } from 'lucide-react'
import { MotorViewportCard } from '../components/twin/MotorViewportCard'
import { MachineStatusCard } from '../components/twin/MachineStatusCard'
import { MachineInformationCard } from '../components/twin/MachineInformationCard'
import { StatusSelectorCard } from '../components/twin/StatusSelectorCard'
import { ControlsHelpCard } from '../components/twin/ControlsHelpCard'
import type { TwinViewOptions, TwinVisualStatus } from '../types'

export const DigitalTwinPage: React.FC = () => {
  // Machine Status State (Normal / Warning / Critical)
  const [status, setStatus] = useState<TwinVisualStatus>('Normal')

  // Selected Component for detailed inspection
  const [, setSelectedComponent] = useState<string | null>('de-bearing')

  // 3D Viewport Options
  const [options, setOptions] = useState<TwinViewOptions>({
    autoRotate: false,
    wireframe: false,
    showSensors: true,
    explodedView: false,
    rotationSpeed: 1.0,
  })

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. PAGE HEADER & STATUS METRICS (Matching Reference)      */}
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
              Explore the 3D model, view machine details and change the status to see visual behavior.
            </p>
          </div>
        </div>

        {/* Right: Quick Telemetry Status Pills */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Connected / Virtual Machine */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl dark-panel shadow-md">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wifi className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-xs font-semibold text-white">Connected</div>
              <div className="text-[11px] text-slate-400">Virtual Machine</div>
            </div>
          </div>

          {/* Last Updated Timestamp */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-2xl dark-panel shadow-md">
            <div className="w-8 h-8 rounded-xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-300 shrink-0">
              <Clock className="w-4 h-4" />
            </div>
            <div className="leading-tight">
              <div className="text-[11px] text-slate-400">Last Updated</div>
              <div className="text-xs font-semibold text-white">Jun 23, 2025 10:24 AM</div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. MAIN 3D MOTOR VIEWPORT & MACHINE METRICS               */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left (8 cols): 3D Motor View Centerpiece */}
        <div className="lg:col-span-8">
          <MotorViewportCard
            status={status}
            options={options}
            onOptionsChange={setOptions}
            onSelectComponent={(id) => setSelectedComponent(id)}
          />
        </div>

        {/* Right (4 cols): Machine Status & Machine Information */}
        <div className="lg:col-span-4 space-y-6">
          <MachineStatusCard status={status} />
          <MachineInformationCard />
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. BOTTOM CARDS: STATUS TESTER & CONTROLS HELP            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Bottom Left (6 cols): Change Machine Status (Test) */}
        <div className="lg:col-span-6">
          <StatusSelectorCard
            status={status}
            onChangeStatus={(s) => setStatus(s)}
          />
        </div>

        {/* Bottom Right (6 cols): Controls & Navigation */}
        <div className="lg:col-span-6">
          <ControlsHelpCard />
        </div>
      </div>
    </div>
  )
}
