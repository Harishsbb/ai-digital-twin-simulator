import React, { useRef, useState } from 'react'
import { MotorScene, type MotorSceneHandle } from '../components/twin/MotorScene'
import { TwinControls } from '../components/twin/TwinControls'
import { MachineInfoPanel } from '../components/twin/MachineInfoPanel'
import { MachineStatusBadge } from '../components/twin/MachineStatusBadge'
import { ControlHelpPanel } from '../components/twin/ControlHelpPanel'
import type { TwinViewOptions, TwinVisualStatus } from '../types'

export const DigitalTwinPage: React.FC = () => {
  const sceneRef = useRef<MotorSceneHandle>(null)

  // Machine Status State (Local manual switcher for Step 2)
  const [status, setStatus] = useState<TwinVisualStatus>('Normal')

  // Selected Component for detailed inspection
  const [selectedComponent, setSelectedComponent] = useState<string | null>('de-bearing')

  // 3D View Options
  const [options, setOptions] = useState<TwinViewOptions>({
    autoRotate: true,
    wireframe: false,
    showSensors: true,
    explodedView: false,
    rotationSpeed: 1.0,
  })

  const handleResetCamera = () => {
    sceneRef.current?.resetCamera()
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-5 rounded-xl mech-panel">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold tracking-wider">
              CAD DIGITAL TWIN // 3D VIEWPORT
            </span>
            <span className="text-stone-400 font-mono text-xs">ASSET // MTR-IND-150KW-01</span>
          </div>
          <h2 className="text-2xl font-bold font-mono tracking-tight text-stone-900 uppercase">
            Digital Twin
          </h2>
          <p className="text-xs text-stone-500 font-mono mt-0.5">
            Interactive Industrial Motor Simulation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <MachineStatusBadge status={status} size="md" />
        </div>
      </div>

      {/* 2. Main 3D Viewport & Side Information Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: 3D Viewport & Controls (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          {/* 3D Canvas Box */}
          <div className="relative rounded-xl border border-stone-300 bg-white shadow-xs overflow-hidden h-[480px] sm:h-[540px] md:h-[600px] tech-bracket">
            {/* Viewport Top HUD Overlay */}
            <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
              <span className="text-[10px] font-mono font-bold px-2 py-1 rounded bg-white/90 backdrop-blur-md text-stone-800 border border-stone-200 shadow-2xs">
                WebGL 2.0 // THREE.JS
              </span>
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/90 backdrop-blur-md text-stone-600 border border-stone-200 shadow-2xs">
                FPS: 60 (OPTIMAL)
              </span>
            </div>

            {/* 3D Scene */}
            <MotorScene
              ref={sceneRef}
              status={status}
              options={options}
              onSelectComponent={(compId) => setSelectedComponent(compId)}
            />

            {/* Viewport Floating Status Indicator Pill */}
            <div className="absolute bottom-3 right-3 z-10 pointer-events-none">
              <span className="text-[10px] font-mono px-2 py-1 rounded bg-white/90 backdrop-blur-md text-stone-700 border border-stone-200 shadow-2xs">
                MODE: {options.explodedView ? 'EXPLODED VIEW' : options.wireframe ? 'WIREFRAME' : 'SURFACE RENDER'}
              </span>
            </div>
          </div>

          {/* Interactive Controls Bar */}
          <TwinControls
            status={status}
            options={options}
            onChangeStatus={(newStatus) => setStatus(newStatus)}
            onOptionsChange={setOptions}
            onResetCamera={handleResetCamera}
          />

          {/* Mouse & Touch Controls Guide */}
          <ControlHelpPanel />
        </div>

        {/* Right: Machine Info Panel (4 cols on lg) */}
        <div className="lg:col-span-4">
          <MachineInfoPanel
            status={status}
            selectedComponent={selectedComponent}
          />
        </div>
      </div>
    </div>
  )
}
