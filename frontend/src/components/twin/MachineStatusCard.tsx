import React from 'react'
import { StatusPulseGraph } from './StatusPulseGraph'
import type { TwinVisualStatus } from '../../types'

interface MachineStatusCardProps {
  status: TwinVisualStatus
}

export const MachineStatusCard: React.FC<MachineStatusCardProps> = ({ status }) => {
  const statusDetails = {
    Normal: {
      title: 'Normal',
      subtitle: 'Machine is operating normally.',
      dotBg: 'bg-emerald-500',
      dotRing: 'bg-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.6)]',
    },
    Warning: {
      title: 'Warning',
      subtitle: 'Minor abnormalities detected.',
      dotBg: 'bg-amber-500',
      dotRing: 'bg-amber-500/20 shadow-[0_0_20px_rgba(245,158,11,0.6)]',
    },
    Critical: {
      title: 'Critical',
      subtitle: 'Severe condition requires attention.',
      dotBg: 'bg-rose-500',
      dotRing: 'bg-rose-500/20 shadow-[0_0_20px_rgba(244,63,94,0.6)]',
    },
  }[status]

  return (
    <div className="rounded-2xl dark-panel p-6 shadow-xl">
      <div className="text-xs font-semibold text-slate-300 tracking-wide mb-4 uppercase font-sans">
        Machine Status
      </div>

      <div className="flex items-center justify-between gap-4">
        {/* Left: Glowing Status Disc & Text */}
        <div className="flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${statusDetails.dotRing} transition-all duration-300`}
          >
            <div className={`w-6 h-6 rounded-full ${statusDetails.dotBg} shadow-md`} />
          </div>

          <div>
            <div className="text-xl font-bold text-white tracking-tight">
              {statusDetails.title}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {statusDetails.subtitle}
            </div>
          </div>
        </div>

        {/* Right: ECG Heartbeat Waveform */}
        <StatusPulseGraph status={status} />
      </div>
    </div>
  )
}
