import React from 'react'
import {
  CheckCheck,
  Filter,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react'
import type { AlertFilterState } from '../../types/alert'

interface AlertFiltersProps {
  filterState: AlertFilterState
  onFilterChange: React.Dispatch<React.SetStateAction<AlertFilterState>>
  onAcknowledgeAll: () => void
  onDismissAll: () => void
  onClearHistory: () => void
  unacknowledgedCount: number
  activeCount: number
  totalCount: number
}

export const AlertFilters: React.FC<AlertFiltersProps> = ({
  filterState,
  onFilterChange,
  onAcknowledgeAll,
  onDismissAll,
  onClearHistory,
  unacknowledgedCount,
  activeCount,
  totalCount,
}) => {
  const statusTabs: Array<{ id: AlertFilterState['status']; label: string }> = [
    { id: 'all', label: `All Events (${totalCount})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'unacknowledged', label: `Unacknowledged (${unacknowledgedCount})` },
    { id: 'dismissed', label: 'Dismissed' },
  ]

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the session alert history? This cannot be undone.')) {
      onClearHistory()
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] space-y-4">
      {/* Top Filter Controls: Status Tabs & Batch Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Status Pill Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3]">
          {statusTabs.map((tab) => {
            const isActive = filterState.status === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  onFilterChange((prev) => ({ ...prev, status: tab.id }))
                }
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#1769FF] shadow-xs font-bold'
                    : 'text-[#64748B] hover:text-[#10213D]'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Batch Operations */}
        <div className="flex flex-wrap items-center gap-2">
          {unacknowledgedCount > 0 && (
            <button
              type="button"
              onClick={onAcknowledgeAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#065F46] text-xs font-bold transition-all shadow-xs cursor-pointer"
              title="Acknowledge all unacknowledged active alerts"
            >
              <CheckCheck className="w-3.5 h-3.5 text-[#10B981]" />
              <span>Acknowledge All ({unacknowledgedCount})</span>
            </button>
          )}

          {activeCount > 0 && (
            <button
              type="button"
              onClick={onDismissAll}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFE7F3] bg-white hover:bg-[#F8FAFC] text-[#475569] hover:text-[#10213D] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Dismiss all active alerts from main view"
            >
              <XCircle className="w-3.5 h-3.5 text-[#94A3B8]" />
              <span>Dismiss All</span>
            </button>
          )}

          {totalCount > 0 && (
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#DFE7F3] bg-white hover:bg-[#FEF2F2] hover:border-[#FECACA] hover:text-[#DC2626] text-[#64748B] text-xs font-semibold transition-all shadow-xs cursor-pointer"
              title="Clear all session alert history"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Filter Controls: Search & Severity Dropdown */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-3 border-t border-[#F1F5F9]">
        {/* Search Input (8 cols) */}
        <div className="sm:col-span-8 relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by title, description, or parameter deviation..."
            value={filterState.searchQuery}
            onChange={(e) =>
              onFilterChange((prev) => ({ ...prev, searchQuery: e.target.value }))
            }
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-medium text-[#10213D] placeholder-[#94A3B8] focus:bg-white focus:border-[#1769FF] focus:outline-hidden transition-all"
          />
        </div>

        {/* Severity Select Dropdown (4 cols) */}
        <div className="sm:col-span-4 relative flex items-center">
          <Filter className="w-4 h-4 text-[#64748B] absolute left-3.5 pointer-events-none" />
          <select
            value={filterState.severity}
            onChange={(e) =>
              onFilterChange((prev) => ({
                ...prev,
                severity: e.target.value as AlertFilterState['severity'],
              }))
            }
            className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#10213D] focus:bg-white focus:border-[#1769FF] focus:outline-hidden transition-all cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Severity Only</option>
            <option value="high">High Severity Only</option>
            <option value="medium">Medium Severity Only</option>
            <option value="info">Info Notices Only</option>
          </select>
        </div>
      </div>
    </div>
  )
}
