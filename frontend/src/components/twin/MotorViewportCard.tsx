import React, { useRef, useState } from 'react'
import {
  Layers,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { MotorScene, type MotorSceneHandle } from './MotorScene'
import type { TwinViewOptions, TwinVisualStatus } from '../../types'

interface MotorViewportCardProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  onOptionsChange: (updater: (prev: TwinViewOptions) => TwinViewOptions) => void
  onSelectComponent?: (componentId: string) => void
}

export const MotorViewportCard: React.FC<MotorViewportCardProps> = ({
  status,
  options,
  onOptionsChange,
  onSelectComponent,
}) => {
  const sceneRef = useRef<MotorSceneHandle>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleResetCamera = () => {
    sceneRef.current?.resetCamera()
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {})
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {})
    }
  }

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl dark-panel overflow-hidden relative shadow-2xl transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[500px] lg:h-[540px]'
      }`}
    >
      {/* Top Overlay: Title & Fullscreen Button */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        <div className="text-sm font-semibold text-white tracking-wide drop-shadow-md">
          3D Motor View
        </div>

        <button
          onClick={toggleFullscreen}
          className="pointer-events-auto p-2 rounded-xl bg-black/40 hover:bg-black/60 backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all shadow-md"
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* 3D WebGL Motor Scene */}
      <div className="w-full h-full">
        <MotorScene
          ref={sceneRef}
          status={status}
          options={options}
          onSelectComponent={onSelectComponent}
        />
      </div>

      {/* Bottom Floating Toolbar matching reference image */}
      <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        {/* Left Action Buttons Pill Group */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Reset Camera */}
          <button
            onClick={handleResetCamera}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0a0f1d]/80 hover:bg-[#131b2e] backdrop-blur-md border border-white/10 text-xs font-medium text-slate-200 hover:text-white transition-all shadow-lg active:scale-95"
            title="Reset Camera View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Reset Camera</span>
          </button>

          {/* Auto Rotate */}
          <button
            onClick={() =>
              onOptionsChange((prev) => ({ ...prev, autoRotate: !prev.autoRotate }))
            }
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md border transition-all shadow-lg text-xs font-medium active:scale-95 ${
              options.autoRotate
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                : 'bg-[#0a0f1d]/80 hover:bg-[#131b2e] border-white/10 text-slate-200 hover:text-white'
            }`}
            title="Toggle Auto Rotation"
          >
            {options.autoRotate ? (
              <Pause className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              <Play className="w-3.5 h-3.5 text-slate-400" />
            )}
            <span>Auto Rotate</span>
          </button>

          {/* Explode View */}
          <button
            onClick={() =>
              onOptionsChange((prev) => ({ ...prev, explodedView: !prev.explodedView }))
            }
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl backdrop-blur-md border transition-all shadow-lg text-xs font-medium active:scale-95 ${
              options.explodedView
                ? 'bg-blue-600/30 border-blue-500/50 text-blue-200'
                : 'bg-[#0a0f1d]/80 hover:bg-[#131b2e] border-white/10 text-slate-200 hover:text-white'
            }`}
            title="Toggle Exploded Component Dissection"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>Explode View</span>
          </button>
        </div>

        {/* Bottom Right Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="pointer-events-auto p-2 rounded-xl bg-[#0a0f1d]/80 hover:bg-[#131b2e] backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all shadow-lg hidden sm:flex items-center justify-center"
          title="Fullscreen"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
