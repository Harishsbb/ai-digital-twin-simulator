import React from 'react'
import { ShieldCheck } from 'lucide-react'

interface AlertEmptyStateProps {
  filterStatus?: string
  onResetFilters?: () => void
}

export const AlertEmptyState: React.FC<AlertEmptyStateProps> = ({
  filterStatus = 'all',
  onResetFilters,
}) => {
  const isFiltered = filterStatus !== 'all'

  return (
    <div className="p-12 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] text-center flex flex-col items-center justify-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#10B981] shadow-2xs">
        <ShieldCheck className="w-8 h-8" />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-base font-bold text-[#10213D]">
          {isFiltered ? 'No Alerts Match Your Active Filters' : 'No Active AI Anomaly Alerts'}
        </h3>
        <p className="text-xs text-[#475569] leading-relaxed">
          {isFiltered
            ? 'Try adjusting your severity or status filters to view historical events.'
            : 'Telemetry conforms to learned nominal operational bounds. The Isolation Forest unsupervised model is continuously monitoring the sensor stream.'}
        </p>
      </div>

      {isFiltered && onResetFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="px-4 py-2 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] text-[#1769FF] text-xs font-bold hover:bg-[#D9E8FF] transition-colors cursor-pointer"
        >
          Reset All Filters
        </button>
      )}
    </div>
  )
}
