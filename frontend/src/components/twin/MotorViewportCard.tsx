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


  return (
    <div
      ref={containerRef}
      className={`rounded-2xl bg-white overflow-hidden relative shadow-[0_4px_20px_rgba(16,33,61,0.04)] transition-all border border-[#DFE7F3] ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : 'h-[500px] lg:h-[580px]'
      }`}
    >
      {/* ========================================================= */}
      {/* TOP HEADER CONTROLS (Matching Reference Image)            */}
      {/* ========================================================= */}
      <div className="absolute top-4 left-5 right-5 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: 3D Motor View Title */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="w-7 h-7 rounded-lg bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-xs">
            <Box className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold text-[#10213D] tracking-tight">
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
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md border border-[#DFE7F3] text-xs font-semibold text-[#10213D] hover:border-[#CBD5E1] transition-all shadow-xs cursor-pointer"
            >
              <span>View Mode</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#64748B]" />
            </button>

            {/* Dropdown Menu */}
            {showModeDropdown && (
              <div className="absolute right-0 top-full mt-2 w-44 rounded-xl bg-white border border-[#DFE7F3] shadow-xl p-1.5 z-30 space-y-1 animate-in fade-in duration-150">
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
                          ? 'bg-[#EAF2FF] text-[#1769FF] font-semibold'
                          : 'text-[#10213D] hover:bg-[#F8FAFC]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5 text-[#1769FF]" />
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Interactive Explode / Assemble View Toggle Button */}
          <button
            type="button"
            onClick={() =>
              onViewModeChange(options.viewMode === 'exploded' ? 'assembled' : 'exploded')
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 ${
              options.viewMode === 'exploded'
                ? 'bg-[#1769FF] text-white hover:bg-[#0F54D6] shadow-[0_2px_8px_rgba(23,105,255,0.25)]'
                : 'bg-[#EAF2FF] hover:bg-[#D9E8FF] text-[#1769FF] border border-[#BFDBFE] hover:border-[#1769FF]'
            }`}
            title={options.viewMode === 'exploded' ? 'Click to assemble motor back together' : 'Click to explode 3D motor view'}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{options.viewMode === 'exploded' ? 'Assemble Motor' : 'Exploded View'}</span>
          </button>

          {/* Toggle Labels Button */}
          <button
            type="button"
            onClick={() =>
              onOptionsChange((prev) => ({ ...prev, showLabels: !prev.showLabels }))
            }
            className={`p-2 rounded-xl backdrop-blur-md border transition-all shadow-xs hidden md:flex items-center justify-center cursor-pointer ${
              options.showLabels
                ? 'bg-[#EAF2FF] border-[#BFDBFE] text-[#1769FF]'
                : 'bg-white/95 hover:bg-white border-[#DFE7F3] text-[#64748B] hover:text-[#10213D]'
            }`}
            title="Toggle Component Labels & Leader Lines"
          >
            <Tag className="w-3.5 h-3.5" />
          </button>

          {/* Reset Camera Button */}
          <button
            type="button"
            onClick={handleResetCamera}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md border border-[#DFE7F3] text-xs font-semibold text-[#10213D] hover:border-[#CBD5E1] transition-all shadow-xs active:scale-95 cursor-pointer"
            title="Reset View"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#64748B]" />
            <span className="hidden sm:inline">Reset View</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-white/95 hover:bg-white backdrop-blur-md border border-[#DFE7F3] text-[#64748B] hover:text-[#10213D] transition-all shadow-xs cursor-pointer"
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
