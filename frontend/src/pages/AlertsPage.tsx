import React from 'react'
import {
  AlertOctagon,
  Bell,
  CheckCircle2,
  Info,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react'
import {
  AlertCard,
  AlertEmptyState,
  AlertFilters,
  AlertSummaryCards,
} from '../components/alerts'
import { useAlerts } from '../context/useAlerts'
import { useSensorStream } from '../context/useSensorStream'

export const AlertsPage: React.FC = () => {
  const { currentMode, toggleMode, controlSimulator } = useSensorStream()
  const {
    counts,
    filterState,
    setFilterState,
    filteredAlerts,
    acknowledgeAlert,
    dismissAlert,
    acknowledgeAll,
    dismissAll,
    clearHistory,
  } = useAlerts()

  const isFaultMode = currentMode === 'fault'

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* 1. TOP HEADER & TELEMETRY STREAM CONTROL BANNER           */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#1769FF] to-[#0F54D6] flex items-center justify-center text-white shadow-[0_6px_20px_rgba(23,105,255,0.25)] shrink-0 mt-0.5">
            <Bell className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#EAF2FF] text-[#1769FF] border border-[#BFDBFE] font-bold tracking-wider">
                STEP 09 // REAL-TIME AI ALERT SYSTEM
              </span>
              <span className="text-[#475569] font-mono text-xs font-semibold">
                PIPELINE // Isolation Forest Inference Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#10213D] tracking-tight">
              Real-Time AI Alert Center
            </h1>
            <p className="text-xs text-[#475569] mt-1 font-medium">
              Automated anomaly dispatching, ISO 10816 vibration severity classification, and operator acknowledgment lifecycle.
            </p>
          </div>
        </div>

        {/* Right Actions: Test Harness & Simulator Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Normal vs Fault Mode Toggle */}
          <button
            type="button"
            onClick={() => toggleMode()}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer border ${
              isFaultMode
                ? 'bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border-[#FECACA] ring-2 ring-[#EF4444]/20'
                : 'bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border-[#A7F3D0]'
            }`}
            title="Toggle simulator mode to trigger or recover from anomaly alert episodes"
          >
            {isFaultMode ? (
              <>
                <AlertOctagon className="w-4 h-4 text-[#EF4444] animate-bounce" />
                <span>FAULT MODE (Active)</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
                <span>NORMAL MODE</span>
              </>
            )}
          </button>

          {/* Reset Baseline */}
          <button
            type="button"
            onClick={() => controlSimulator('reset')}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-[#F8FAFC] border border-[#DFE7F3] text-xs font-semibold text-[#475569] hover:text-[#10213D] transition-all shadow-xs cursor-pointer"
            title="Reset telemetry stream to pristine nominal baseline"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Baseline</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KPI SUMMARY METRIC CARDS                               */}
      {/* ========================================================= */}
      <AlertSummaryCards
        counts={counts}
        onFilterSeverity={(sev) => {
          if (sev === 'all') {
            setFilterState((prev) => ({ ...prev, status: 'active', severity: 'all' }))
          } else if (sev === 'unacknowledged') {
            setFilterState((prev) => ({ ...prev, status: 'unacknowledged', severity: 'all' }))
          } else {
            setFilterState((prev) => ({ ...prev, severity: sev as any }))
          }
        }}
      />

      {/* ========================================================= */}
      {/* 3. FILTER, SEARCH & BATCH ACTION BAR                      */}
      {/* ========================================================= */}
      <AlertFilters
        filterState={filterState}
        onFilterChange={setFilterState}
        onAcknowledgeAll={acknowledgeAll}
        onDismissAll={dismissAll}
        onClearHistory={clearHistory}
        unacknowledgedCount={counts.unacknowledged}
        activeCount={counts.active}
        totalCount={counts.total}
      />

      {/* ========================================================= */}
      {/* 4. ALERTS LIST & EVENT LOG                                */}
      {/* ========================================================= */}
      <div className="space-y-3.5">
        {filteredAlerts.length === 0 ? (
          <AlertEmptyState
            filterStatus={filterState.status !== 'all' || filterState.severity !== 'all' ? 'filtered' : 'all'}
            onResetFilters={() =>
              setFilterState({ status: 'all', severity: 'all', searchQuery: '' })
            }
          />
        ) : (
          filteredAlerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onAcknowledge={acknowledgeAlert}
              onDismiss={dismissAlert}
            />
          ))
        )}
      </div>

      {/* ========================================================= */}
      {/* 5. SESSION STORAGE & SYNTHETIC DATA DISCLAIMER            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Session In-Memory Storage Note */}
        <div className="p-4 rounded-xl bg-white border border-[#DFE7F3] shadow-xs text-xs text-[#475569] flex items-start gap-3">
          <Info className="w-4 h-4 text-[#1769FF] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#10213D] block">
              In-Memory Session Event Storage (Step 9)
            </span>
            <p className="leading-relaxed text-[11px]">
              Alert history is maintained in-memory during the current browser session (up to 150 events). Bounded FIFO eviction drops oldest events when capacity is reached. Persistent database storage will be integrated in Step 12.
            </p>
          </div>
        </div>

        {/* Mandatory Synthetic Data Disclaimer */}
        <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs text-[#92400E] flex items-start gap-3">
          <ShieldAlert className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-[#78350F] uppercase tracking-wider text-[11px] font-mono block">
              Simulated Telemetry Alert Notice
            </span>
            <p className="leading-relaxed text-[11px] font-medium">
              &ldquo;These alert events are generated from synthetic simulator-generated telemetry and do not establish failure conditions on real industrial equipment.&rdquo;
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
