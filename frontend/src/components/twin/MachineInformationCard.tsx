import React from 'react'
import { Box } from 'lucide-react'

const SPEC_ROWS = [
  { label: 'Machine Type', value: 'Industrial Electric Motor' },
  { label: 'Model', value: 'IE3-160M' },
  { label: 'Power Rating', value: '11 kW (15 HP)' },
  { label: 'Rated Speed', value: '1440 RPM' },
  { label: 'Voltage', value: '415 V' },
  { label: 'Mounting Type', value: 'Foot Mounted' },
  { label: 'Cooling Method', value: 'TEFC (Totally Enclosed)' },
]

export const MachineInformationCard: React.FC = () => {
  return (
    <div className="rounded-2xl dark-panel p-6 shadow-xl space-y-4">
      {/* Header with Cube Icon */}
      <div className="flex items-center gap-3 pb-3 border-b border-slate-800/70">
        <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
          <Box className="w-4 h-4" />
        </div>
        <div className="text-sm font-semibold text-white tracking-wide">
          Machine Information
        </div>
      </div>

      {/* Key-Value Specifications */}
      <div className="space-y-3 font-sans text-xs">
        {SPEC_ROWS.map((row, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between py-1.5 border-b border-slate-800/50 last:border-0"
          >
            <span className="text-slate-400">{row.label}</span>
            <span className="text-slate-100 font-medium text-right">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
