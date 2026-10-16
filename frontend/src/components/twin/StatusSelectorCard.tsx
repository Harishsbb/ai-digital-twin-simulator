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
    <div className="rounded-2xl dark-panel p-6 shadow-xl space-y-4">
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm font-semibold text-white tracking-wide">
          Change Machine Status (Test)
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Select a status to see visual changes in the 3D model.
        </p>
      </div>

      {/* 3 Large Interactive Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-1">
        {/* Normal Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Normal')}
          className={`p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Normal'
              ? 'bg-[#0b1c1d] border-emerald-500/80 shadow-[0_0_20px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
              : 'bg-[#0c121e]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
            <span className="font-semibold text-white text-sm">Normal</span>
          </div>
          <div className="text-xs text-slate-400 leading-snug">
            Standard operating condition
          </div>
        </button>

        {/* Warning Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Warning')}
          className={`p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Warning'
              ? 'bg-[#1e1910] border-amber-500/80 shadow-[0_0_20px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
              : 'bg-[#0c121e]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.9)]" />
            <span className="font-semibold text-white text-sm">Warning</span>
          </div>
          <div className="text-xs text-slate-400 leading-snug">
            Minor abnormalities detected
          </div>
        </button>

        {/* Critical Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Critical')}
          className={`p-4 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Critical'
              ? 'bg-[#201015] border-rose-500/80 shadow-[0_0_20px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50'
              : 'bg-[#0c121e]/80 border-slate-800/80 hover:border-slate-700 hover:bg-[#0f1726]'
          }`}
        >
          <div className="flex items-center gap-2.5 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.9)]" />
            <span className="font-semibold text-white text-sm">Critical</span>
          </div>
          <div className="text-xs text-slate-400 leading-snug">
            Severe condition requires attention
          </div>
        </button>
      </div>
    </div>
  )
}
