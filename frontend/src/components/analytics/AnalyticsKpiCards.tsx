import React from 'react'
import {
  Activity,
  Gauge,
  Thermometer,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import type { TelemetrySummaryStatistics } from '../../types/analytics'

interface AnalyticsKpiCardsProps {
  stats: TelemetrySummaryStatistics
}

export const AnalyticsKpiCards: React.FC<AnalyticsKpiCardsProps> = ({ stats }) => {
  const { temperature, vibration, rpm, sampleCount } = stats

  const cards = [
    {
      title: 'Stator Winding Temperature',
      unit: '°C',
      icon: Thermometer,
      stats: temperature,
      baseline: '68.0 °C nominal baseline',
      iconBg: 'bg-[#FEF2F2]',
      iconColor: 'text-[#DC2626]',
      borderColor: 'border-[#FECACA]',
    },
    {
      title: 'Drive-End Bearing Vibration',
      unit: 'mm/s',
      icon: Activity,
      stats: vibration,
      baseline: '1.20 mm/s (ISO 10816 Zone A)',
      iconBg: 'bg-[#FFFBEB]',
      iconColor: 'text-[#D97706]',
      borderColor: 'border-[#FDE68A]',
    },
    {
      title: 'Shaft Rotational Speed',
      unit: 'RPM',
      icon: Gauge,
      stats: rpm,
      baseline: '1488.0 RPM (4-pole 50Hz nominal)',
      iconBg: 'bg-[#EAF2FF]',
      iconColor: 'text-[#1769FF]',
      borderColor: 'border-[#BFDBFE]',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {cards.map((c) => {
        const Icon = c.icon
        const st = c.stats
        const delta = st.delta
        const isUp = delta !== null && delta > 0
        const isDown = delta !== null && delta < 0

        return (
          <div
            key={c.title}
            className="p-5 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between"
          >
            <div>
              {/* Top row: Icon and Channel Title */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${c.iconBg} ${c.iconColor}`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#10213D] leading-tight">
                      {c.title}
                    </h4>
                    <span className="text-[10px] text-[#64748B] font-medium block">
                      {c.baseline}
                    </span>
                  </div>
                </div>

                {/* Delta Pill */}
                {delta !== null && (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                      isUp
                        ? 'bg-[#FEF2F2] text-[#DC2626]'
                        : isDown
                        ? 'bg-[#EAF2FF] text-[#1769FF]'
                        : 'bg-[#F1F5F9] text-[#64748B]'
                    }`}
                    title="Change between latest and first sample in interval"
                  >
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    <span>{delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Latest Value Hero */}
              <div className="my-2">
                <div className="text-2xl font-bold font-mono text-[#10213D] tracking-tight">
                  {st.latest !== null ? st.latest.toFixed(2) : '--'}{' '}
                  <span className="text-sm font-sans font-semibold text-[#64748B]">{c.unit}</span>
                </div>
                <span className="text-[10px] text-[#94A3B8] font-medium">
                  Latest recorded point in interval
                </span>
              </div>
            </div>

            {/* Statistics Grid: Min, Max, Average */}
            <div className="grid grid-cols-3 gap-2 pt-3 mt-2 border-t border-[#F1F5F9] text-center">
              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] font-semibold block uppercase tracking-wider">
                  Min
                </span>
                <span className="text-xs font-mono font-bold text-[#10213D]">
                  {st.min !== null ? `${st.min.toFixed(1)}` : '--'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] font-semibold block uppercase tracking-wider">
                  Average
                </span>
                <span className="text-xs font-mono font-bold text-[#1769FF]">
                  {st.avg !== null ? `${st.avg.toFixed(1)}` : '--'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                <span className="text-[10px] text-[#64748B] font-semibold block uppercase tracking-wider">
                  Max
                </span>
                <span className="text-xs font-mono font-bold text-[#10213D]">
                  {st.max !== null ? `${st.max.toFixed(1)}` : '--'}
                </span>
              </div>
            </div>

            {/* Sample Count note */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] text-[#94A3B8]">
              <span>Valid Samples: {st.validCount} / {sampleCount}</span>
              {st.invalidCount > 0 && (
                <span className="text-[#DC2626] font-semibold">({st.invalidCount} invalid)</span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
