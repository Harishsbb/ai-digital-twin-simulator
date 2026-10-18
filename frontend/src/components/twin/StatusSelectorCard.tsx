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
    <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(16,33,61,0.04)] border border-[#DFE7F3] flex flex-col justify-between">
      {/* Title & Subtitle */}
      <div>
        <h3 className="text-sm font-bold text-[#10213D] tracking-tight">
          Machine Status (Test)
        </h3>
        <p className="text-xs text-[#475569] font-medium mt-0.5">
          Select a status to see visual changes
        </p>
      </div>

      {/* 3 Interactive Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
        {/* Normal Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Normal')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Normal'
              ? 'bg-[#ECFDF5] border-[#10B981] shadow-xs ring-1 ring-[#10B981]/30'
              : 'bg-white border-[#DFE7F3] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
            <span className={`text-xs ${status === 'Normal' ? 'font-bold text-[#065F46]' : 'font-semibold text-[#10213D]'}`}>
              Normal
            </span>
          </div>
          <div className={`text-[11px] leading-snug ${status === 'Normal' ? 'text-[#047857]' : 'text-[#64748B]'}`}>
            Operating normally
          </div>
        </button>

        {/* Warning Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Warning')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Warning'
              ? 'bg-[#FFFBEB] border-[#F59E0B] shadow-xs ring-1 ring-[#F59E0B]/30'
              : 'bg-white border-[#DFE7F3] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className={`text-xs ${status === 'Warning' ? 'font-bold text-[#92400E]' : 'font-semibold text-[#10213D]'}`}>
              Warning
            </span>
          </div>
          <div className={`text-[11px] leading-snug ${status === 'Warning' ? 'text-[#B45309]' : 'text-[#64748B]'}`}>
            Minor abnormalities
          </div>
        </button>

        {/* Critical Card */}
        <button
          type="button"
          onClick={() => onChangeStatus('Critical')}
          className={`p-3.5 rounded-xl text-left transition-all duration-200 border cursor-pointer ${
            status === 'Critical'
              ? 'bg-[#FEF2F2] border-[#EF4444] shadow-xs ring-1 ring-[#EF4444]/30'
              : 'bg-white border-[#DFE7F3] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]'
          }`}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
            <span className={`text-xs ${status === 'Critical' ? 'font-bold text-[#991B1B]' : 'font-semibold text-[#10213D]'}`}>
              Critical
            </span>
          </div>
          <div className={`text-[11px] leading-snug ${status === 'Critical' ? 'text-[#B91C1C]' : 'text-[#64748B]'}`}>
            Requires immediate attention
          </div>
        </button>
      </div>
    </div>
  )
}
