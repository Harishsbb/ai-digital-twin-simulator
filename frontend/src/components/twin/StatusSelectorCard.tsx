import React from 'react'
import type { TwinVisualStatus } from '../../types'

interface StatusSelectorCardProps {
  status: TwinVisualStatus
  onChangeStatus: (status: TwinVisualStatus) => void
}

export const StatusSelectorCard: React.FC<StatusSelectorCardProps> = ({
  status,
  onChangeStatus,
}) => {
  return (
    <div className="rounded-2xl dark-panel p-6 shadow-xl space-y-4 border border-white/5 relative overflow-hidden flex flex-col justify-between">
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm font-bold text-white tracking-wide">
          Machine Status (Test)
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">
          Select a status to see visual changes
        </p>
      </div>

      {/* 3 Interactive Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-2">
        {/* Normal Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Normal')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Normal'
              ? 'bg-[#0b1c1d] border-emerald-500/80 shadow-[0_0_16px_rgba(16,185,129,0.2)] ring-1 ring-emerald-500/50'
              : 'bg-[#0c121e]/80 border-white/5 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            <span className="font-semibold text-white text-xs">Normal</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Operating normally
          </div>
        </button>

        {/* Warning Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Warning')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Warning'
              ? 'bg-[#1e1910] border-amber-500/80 shadow-[0_0_16px_rgba(245,158,11,0.2)] ring-1 ring-amber-500/50'
              : 'bg-[#0c121e]/80 border-white/5 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            <span className="font-semibold text-white text-xs">Warning</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Minor abnormalities
          </div>
        </button>

        {/* Critical Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Critical')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Critical'
              ? 'bg-[#201015] border-rose-500/80 shadow-[0_0_16px_rgba(244,63,94,0.2)] ring-1 ring-rose-500/50'
              : 'bg-[#0c121e]/80 border-white/5 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <span className="font-semibold text-white text-xs">Critical</span>
          </div>
          <div className="text-[11px] text-slate-400 leading-snug">
            Requires immediate attention
          </div>
        </button>
      </div>
    </div>
  )
}
