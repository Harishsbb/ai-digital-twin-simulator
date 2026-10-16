import React, { useRef, useState } from 'react'
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  Box,
  Layers,
  ChevronDown,
  Eye,
  Scissors,
  Tag,
} from 'lucide-react'
import { MotorScene, type MotorSceneHandle } from './MotorScene'
import type { TwinViewMode, TwinViewOptions, TwinVisualStatus } from '../../types'

interface MotorViewportCardProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  onOptionsChange: (updater: (prev: TwinViewOptions) => TwinViewOptions) => void
  selectedComponentId: string | null
  onSelectComponent?: (componentId: string) => void
  onViewModeChange: (mode: TwinViewMode) => void
}

export const MotorViewportCard: React.FC<MotorViewportCardProps> = ({
  status,
  options,
  onOptionsChange,
  selectedComponentId,
  onSelectComponent,
  onViewModeChange,
}) => {
  const sceneRef = useRef<MotorSceneHandle>(null)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [showModeDropdown, setShowModeDropdown] = useState<boolean>(false)
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

  const viewModeLabels: Record<TwinViewMode, { label: string; icon: typeof Box }> = {
    assembled: { label: 'Assembled', icon: Box },
    exploded: { label: 'Exploded', icon: Layers },
    xray: { label: 'X-Ray', icon: Eye },
    section: { label: 'Section View', icon: Scissors },
  }

  const currentModeInfo = viewModeLabels[options.viewMode] || viewModeLabels.assembled
  const CurrentIcon = currentModeInfo.icon

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl dark-panel overflow-hidden relative shadow-2xl transition-all border border-white/5 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[500px] lg:h-[580px]'
      }`}
    >
      {/* ========================================================= */}
      {/* TOP HEADER CONTROLS (Matching Reference Image)            */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: 3D Motor View Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-6 h-6 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
            <Box className="w-3.5 h-3.5" />
          </div>
          <span className="text-sm font-bold text-white tracking-wide drop-shadow-md">
            3D Motor View
          </span>
        </div>

        {/* Right Action Controls: View Mode Dropdown, Active Pill, Reset, Fullscreen */}
        <div className="flex items-center gap-2 pointer-events-auto relative">
          {/* View Mode Dropdown Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowModeDropdown(!showModeDropdown)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090f1c]/80 hover:bg-[#121c32] backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            >
              <span>View Mode</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showModeDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-[#0b1220] border border-blue-500/20 shadow-2xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
                {(['assembled', 'exploded', 'xray', 'section'] as TwinViewMode[]).map((mode) => {
                  const item = viewModeLabels[mode]
                  const Icon = item.icon
                  const isActive = options.viewMode === mode
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        onViewModeChange(mode)
                        setShowModeDropdown(false)
                      }}
                      className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-blue-600/30 text-blue-200 border border-blue-500/40'
                          : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Active Mode Glowing Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-xs font-semibold text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.25)]">
            <CurrentIcon className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentModeInfo.label}</span>
          </div>

          {/* Toggle Labels Button */}
          <button
            type="button"
            onClick={() =>
              onOptionsChange((prev) => ({ ...prev, showLabels: !prev.showLabels }))
            }
            className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-md hidden md:flex items-center justify-center cursor-pointer ${
              options.showLabels
                ? 'bg-blue-600/30 border-blue-400/50 text-blue-200'
                : 'bg-[#090f1c]/80 hover:bg-[#121c32] border-white/10 text-slate-300 hover:text-white'
            }`}
            title="Toggle Component Labels & Leader Lines"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#090f1c]/80 hover:bg-[#121c32] backdrop-blur-md border border-white/10 text-xs font-medium text-slate-300 hover:text-white transition-all shadow-md active:scale-95 cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-[#090f1c]/80 hover:bg-[#121c32] backdrop-blur-md border border-white/10 text-slate-300 hover:text-white transition-all shadow-md cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3D WEBGL MOTOR SCENE                                      */}
      {/* ========================================================= */}
      <div className="w-full h-full">
        <MotorScene
          ref={sceneRef}
          status={status}
          options={options}
          selectedComponentId={selectedComponentId}
          onSelectComponent={onSelectComponent}
        />
      </div>

      {/* Backdrop overlay dismiss for dropdown */}
      {showModeDropdown && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setShowModeDropdown(false)}
        />
      )}
    </div>
  )
}
