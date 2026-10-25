import React from 'react'
import {
  AlertTriangle,
  CheckCircle2,
  Flame,
  Gauge,
  Sparkles,
  Waves,
} from 'lucide-react'
import type { ScenarioPreset, WhatIfParameters } from '../../types/whatIf'
import { SCENARIO_PRESETS } from '../../utils/whatIfPresets'

interface WhatIfPresetCardsProps {
  currentParameters: WhatIfParameters
  onSelectPreset: (preset: ScenarioPreset) => void
  disabled?: boolean
}

export const WhatIfPresetCards: React.FC<WhatIfPresetCardsProps> = ({
  currentParameters,
  onSelectPreset,
  disabled = false,
}) => {
  const getCategoryIcon = (category: ScenarioPreset['category']) => {
    switch (category) {
      case 'nominal':
        return <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
      case 'thermal':
        return <Flame className="w-4 h-4 text-[#F59E0B]" />
      case 'vibration':
        return <Waves className="w-4 h-4 text-[#8B5CF6]" />
      case 'mechanical':
        return <Gauge className="w-4 h-4 text-[#3B82F6]" />
      case 'compound':
        return <AlertTriangle className="w-4 h-4 text-[#EF4444]" />
      default:
        return <Sparkles className="w-4 h-4 text-[#64748B]" />
    }
  }

  const getCategoryBadgeClass = (category: ScenarioPreset['category']) => {
    switch (category) {
      case 'nominal':
        return 'bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]'
      case 'thermal':
        return 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]'
      case 'vibration':
        return 'bg-[#FAF5FF] text-[#6B21A8] border-[#E9D5FF]'
      case 'mechanical':
        return 'bg-[#EFF6FF] text-[#1E40AF] border-[#BFDBFE]'
      case 'compound':
        return 'bg-[#FFF1F2] text-[#9F1239] border-[#FECDD3]'
      default:
        return 'bg-[#F1F5F9] text-[#475569] border-[#E2E8F0]'
    }
  }

  const isPresetActive = (preset: ScenarioPreset) => {
    return (
      Math.abs(preset.parameters.temperature - currentParameters.temperature) < 0.05 &&
      Math.abs(preset.parameters.vibration - currentParameters.vibration) < 0.05 &&
      Math.abs(preset.parameters.rpm - currentParameters.rpm) < 0.5
    )
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#F1F5F9]">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#1769FF]" />
          <h3 className="text-sm font-bold text-[#10213D]">Operating & Fault Scenario Presets</h3>
        </div>
        <span className="text-xs text-[#64748B]">
          Choose an operational scenario to populate input controls
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {SCENARIO_PRESETS.map((preset) => {
          const active = isPresetActive(preset)
          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelectPreset(preset)}
              className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                active
                  ? 'border-[#1769FF] bg-[#EAF2FF]/50 ring-2 ring-[#1769FF]/20 shadow-xs'
                  : 'border-[#E2E8F0] bg-white hover:border-[#BFDBFE] hover:bg-[#F8FAFC]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wide ${getCategoryBadgeClass(
                      preset.category
                    )}`}
                  >
                    {getCategoryIcon(preset.category)}
                    <span>{preset.category}</span>
                  </span>
                  {active && (
                    <span className="text-[10px] font-bold text-[#1769FF] bg-[#EAF2FF] px-2 py-0.5 rounded-full border border-[#BFDBFE]">
                      Active
                    </span>
                  )}
                </div>

                <div className="font-bold text-xs text-[#10213D] leading-snug group-hover:text-[#1769FF] transition-colors">
                  {preset.name}
                </div>

                <p className="text-[11px] text-[#64748B] line-clamp-2 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              {/* Parameter Badges */}
              <div className="mt-3 pt-3 border-t border-[#F1F5F9] flex flex-wrap items-center gap-1.5 text-[10px] font-mono font-semibold">
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#1E293B]">
                  {preset.parameters.temperature}°C
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#1E293B]">
                  {preset.parameters.vibration} mm/s
                </span>
                <span className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#1E293B]">
                  {preset.parameters.rpm} RPM
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
