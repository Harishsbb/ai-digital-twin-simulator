import React from 'react'
import { Box, Layers, Eye, Scissors } from 'lucide-react'
import type { TwinViewMode } from '../../types'

interface ViewModeSelectorCardProps {
  currentMode: TwinViewMode
  onSelectMode: (mode: TwinViewMode) => void
}

export const ViewModeSelectorCard: React.FC<ViewModeSelectorCardProps> = ({
  currentMode,
  onSelectMode,
}) => {
  const modes: Array<{
    id: TwinViewMode
    label: string
    icon: typeof Box
    description: string
  }> = [
    {
      id: 'assembled',
      label: 'Assembled',
      icon: Box,
      description: 'Standard motor',
    },
    {
      id: 'exploded',
      label: 'Exploded',
      icon: Layers,
      description: 'Separated parts',
    },
    {
      id: 'xray',
      label: 'X-Ray',
      icon: Eye,
      description: 'Internal see-through',
    },
    {
      id: 'section',
      label: 'Section View',
      icon: Scissors,
      description: 'Cutaway cross-section',
    },
  ]

  return (
    <div className="dark-panel rounded-2xl p-6 shadow-xl border border-white/5 relative overflow-hidden flex flex-col justify-between">
      {/* Subtle top ambient glow */}
      <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

      <div>
        <h3 className="text-sm font-bold text-white tracking-wide">
          Change View Mode
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Explore the motor in different views
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = currentMode === mode.id

          return (
            <button
              key={mode.id}
              type="button"
              onClick={() => onSelectMode(mode.id)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all text-center cursor-pointer group ${
                isActive
                  ? 'bg-[#102542] border-[#38bdf8] text-white shadow-[0_0_16px_rgba(56,189,248,0.3)] ring-1 ring-[#38bdf8]/40'
                  : 'bg-[#0b121e]/80 border-white/5 text-slate-300 hover:bg-[#121c2e] hover:border-slate-700 hover:text-white'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isActive
                    ? 'bg-blue-500/20 text-[#38bdf8]'
                    : 'bg-slate-800/80 text-slate-400 group-hover:text-blue-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold tracking-tight">
                {mode.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
