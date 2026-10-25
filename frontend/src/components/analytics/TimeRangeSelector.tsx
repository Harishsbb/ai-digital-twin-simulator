import React from 'react'
import {
  Clock,
  Download,
  Info,
  RefreshCw,
} from 'lucide-react'
import type { AnalyticsTimeRange, RangeCoverageInfo } from '../../types/analytics'
import { TIME_RANGE_OPTIONS, formatTimeShort } from '../../utils/analyticsMath'

interface TimeRangeSelectorProps {
  selectedRange: AnalyticsTimeRange
  onSelectRange: (range: AnalyticsTimeRange) => void
  coverage: RangeCoverageInfo
  startTime: string | null
  endTime: string | null
  isLoading: boolean
  onRefresh: () => void
  onExportCsv: () => void
}

export const TimeRangeSelector: React.FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onSelectRange,
  coverage,
  startTime,
  endTime,
  isLoading,
  onRefresh,
  onExportCsv,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-4 rounded-2xl bg-white border border-[#DFE7F3] shadow-xs">
      {/* Left: Time Range Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-bold text-[#10213D] mr-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#1769FF]" />
          <span>Interval:</span>
        </span>

        {TIME_RANGE_OPTIONS.map((opt) => {
          const isSelected = selectedRange === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onSelectRange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1769FF] text-white shadow-xs'
                  : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9] hover:text-[#10213D] border border-[#E2E8F0]'
              }`}
              title={opt.description}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* Right: Coverage Status, Timestamps, and Actions */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Coverage Note */}
        {coverage.isPartial ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FFFBEB] border border-[#FDE68A] text-[11px] text-[#92400E] font-medium"
            title="Available history is shorter than requested interval because simulator started recently"
          >
            <Info className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>
              Partial History: {coverage.availableSeconds}s of {coverage.targetSeconds}s available
            </span>
          </div>
        ) : (
          <div className="text-[11px] text-[#64748B] font-mono">
            {startTime && endTime ? (
              <span>
                {formatTimeShort(startTime)} &rarr; {formatTimeShort(endTime)} UTC ({coverage.sampleCount} pts)
              </span>
            ) : (
              <span>{coverage.sampleCount} samples recorded</span>
            )}
          </div>
        )}

        {/* Refresh Action */}
        <button
          type="button"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#DFE7F3] text-xs font-semibold text-[#475569] hover:text-[#10213D] transition-all shadow-xs cursor-pointer disabled:opacity-50"
          title="Manually fetch latest history window from backend"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#1769FF] ${isLoading ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        {/* Export CSV Action */}
        <button
          type="button"
          onClick={onExportCsv}
          disabled={coverage.sampleCount === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#1769FF] hover:border-[#1769FF] transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          title="Export displayed sensor history to CSV file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export CSV</span>
        </button>
      </div>
    </div>
  )
}
