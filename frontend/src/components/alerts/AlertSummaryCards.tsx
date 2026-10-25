import React from 'react'
import {
  AlertOctagon,
  AlertTriangle,
  Bell,
  ShieldAlert,
} from 'lucide-react'
import type { AlertCounts } from '../../types/alert'

interface AlertSummaryCardsProps {
  counts: AlertCounts
  onFilterSeverity?: (severity: string) => void
}

export const AlertSummaryCards: React.FC<AlertSummaryCardsProps> = ({
  counts,
  onFilterSeverity,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
      {/* 1. Active Alerts */}
      <button
        type="button"
        onClick={() => onFilterSeverity?.('all')}
        className="p-4 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-left hover:border-[#1769FF] transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#475569]">Active Alerts</span>
          <div className="w-7 h-7 rounded-lg bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF]">
            <Bell className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold font-mono text-[#10213D]">
          {counts.active}
        </div>
        <div className="text-[10px] text-[#64748B] mt-0.5">
          {counts.unacknowledged} unacknowledged
        </div>
      </button>

      {/* 2. Critical Alerts */}
      <button
        type="button"
        onClick={() => onFilterSeverity?.('critical')}
        className="p-4 rounded-2xl bg-white border border-[#FECACA] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-left hover:ring-2 hover:ring-[#EF4444]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#991B1B]">Critical</span>
          <div className="w-7 h-7 rounded-lg bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#EF4444]">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold font-mono text-[#DC2626]">
          {counts.critical}
        </div>
        <div className="text-[10px] text-[#991B1B] mt-0.5">Immediate action req.</div>
      </button>

      {/* 3. High Alerts */}
      <button
        type="button"
        onClick={() => onFilterSeverity?.('high')}
        className="p-4 rounded-2xl bg-white border border-[#FDE68A] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-left hover:ring-2 hover:ring-[#F59E0B]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#92400E]">High</span>
          <div className="w-7 h-7 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#F59E0B]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold font-mono text-[#D97706]">
          {counts.high}
        </div>
        <div className="text-[10px] text-[#92400E] mt-0.5">Significant variance</div>
      </button>

      {/* 4. Medium Alerts */}
      <button
        type="button"
        onClick={() => onFilterSeverity?.('medium')}
        className="p-4 rounded-2xl bg-white border border-[#BBF7D0] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-left hover:ring-2 hover:ring-[#22C55E]/20 transition-all cursor-pointer"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#166534]">Medium</span>
          <div className="w-7 h-7 rounded-lg bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-center text-[#22C55E]">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold font-mono text-[#15803D]">
          {counts.medium}
        </div>
        <div className="text-[10px] text-[#166534] mt-0.5">Statistical anomaly</div>
      </button>

      {/* 5. Unacknowledged Alerts */}
      <button
        type="button"
        onClick={() => onFilterSeverity?.('unacknowledged')}
        className="p-4 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-left hover:border-[#1769FF] transition-all cursor-pointer col-span-2 sm:col-span-1"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-[#475569]">Unacknowledged</span>
          <div className="w-7 h-7 rounded-lg bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF]">
            <ShieldAlert className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold font-mono text-[#1769FF]">
          {counts.unacknowledged}
        </div>
        <div className="text-[10px] text-[#64748B] mt-0.5">Operator review pending</div>
      </button>
    </div>
  )
}
