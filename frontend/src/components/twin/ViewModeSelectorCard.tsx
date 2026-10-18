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
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(16,33,61,0.04)] border border-[#DFE7F3] flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-[#10213D] tracking-tight">
          Change View Mode
        </h3>
        <p className="text-xs text-[#475569] font-medium mt-0.5">
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
                  ? 'bg-[#EAF2FF] border-[#1769FF] text-[#1769FF] shadow-[0_2px_8px_rgba(23,105,255,0.15)] ring-1 ring-[#1769FF]/30'
                  : 'bg-white border-[#DFE7F3] text-[#475569] hover:bg-[#F8FAFC] hover:border-[#CBD5E1] hover:text-[#10213D]'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors ${
                  isActive
                    ? 'bg-[#1769FF]/15 text-[#1769FF]'
                    : 'bg-[#F1F5F9] text-[#64748B] group-hover:text-[#1769FF]'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className={`text-xs tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {mode.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
