import React, { useCallback, useId, useMemo, useState } from 'react'
import type { ChartDataPoint } from '../../types/analytics'
import { formatTimeShort } from '../../utils/analyticsMath'

export interface ThresholdLine {
  value: number
  label: string
  color: string
  dashed?: boolean
}

export interface TimeSeriesChartProps {
  title: string
  unit: string
  data: ChartDataPoint[]
  color?: string
  gradientColor?: string
  thresholds?: ThresholdLine[]
  height?: number
  baselineValue?: number
}

export const TimeSeriesChart: React.FC<TimeSeriesChartProps> = ({
  title,
  unit,
  data,
  color = '#1769FF',
  gradientColor = '#1769FF',
  thresholds = [],
  height = 230,
  baselineValue,
}) => {
  const gradientId = useId()
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  // Chart dimensions
  const padding = { top: 24, right: 30, bottom: 32, left: 52 }
  const viewBoxWidth = 640
  const viewBoxHeight = height
  const chartWidth = viewBoxWidth - padding.left - padding.right
  const chartHeight = viewBoxHeight - padding.top - padding.bottom

  // Calculate Y-axis scaling domain
  const { minY, maxY, yTicks } = useMemo(() => {
    if (!data || data.length === 0) {
      return { minY: 0, maxY: 100, yTicks: [0, 25, 50, 75, 100] }
    }

    let min = Infinity
    let max = -Infinity

    for (const d of data) {
      if (d.value < min) min = d.value
      if (d.value > max) max = d.value
    }

    for (const t of thresholds) {
      if (t.value < min) min = t.value
      if (t.value > max) max = t.value
    }

    if (baselineValue !== undefined) {
      if (baselineValue < min) min = baselineValue
      if (baselineValue > max) max = baselineValue
    }

    // Add breathing room
    const span = Math.max(0.1, max - min)
    const margin = span * 0.15
    const computedMin = Math.max(0, Math.floor((min - margin) * 10) / 10)
    const computedMax = Math.ceil((max + margin) * 10) / 10

    // 4 ticks evenly spaced
    const step = (computedMax - computedMin) / 4
    const ticks = [
      computedMin,
      computedMin + step,
      computedMin + step * 2,
      computedMin + step * 3,
      computedMax,
    ].map((val) => Number(val.toFixed(1)))

    return { minY: computedMin, maxY: computedMax, yTicks: ticks }
  }, [data, thresholds, baselineValue])

  // Coordinate conversion helpers
  const getX = useCallback(
    (index: number) => {
      if (data.length <= 1) return padding.left + chartWidth / 2
      return padding.left + (index / (data.length - 1)) * chartWidth
    },
    [data.length, padding.left, chartWidth]
  )

  const getY = useCallback(
    (value: number) => {
      if (maxY === minY) return padding.top + chartHeight / 2
      const normalized = (value - minY) / (maxY - minY)
      return padding.top + chartHeight - normalized * chartHeight
    },
    [maxY, minY, padding.top, chartHeight]
  )

  // Generate SVG path for line and gradient area
  const { linePath, areaPath } = useMemo(() => {
    if (!data || data.length === 0) return { linePath: '', areaPath: '' }

    if (data.length === 1) {
      const x = getX(0)
      const y = getY(data[0].value)
      return {
        linePath: `M ${x - 10} ${y} L ${x + 10} ${y}`,
        areaPath: `M ${x - 10} ${y} L ${x + 10} ${y} L ${x + 10} ${padding.top + chartHeight} L ${x - 10} ${padding.top + chartHeight} Z`,
      }
    }

    const points = data.map((d, i) => `${getX(i).toFixed(1)},${getY(d.value).toFixed(1)}`)
    const line = `M ${points.join(' L ')}`
    const firstX = getX(0).toFixed(1)
    const lastX = getX(data.length - 1).toFixed(1)
    const bottomY = (padding.top + chartHeight).toFixed(1)
    const area = `${line} L ${lastX},${bottomY} L ${firstX},${bottomY} Z`

    return { linePath: line, areaPath: area }
  }, [data, getX, getY, chartHeight, padding.top])

  // Generate 4-5 X-axis time label indices
  const xLabels = useMemo(() => {
    if (!data || data.length === 0) return []
    if (data.length <= 4) {
      return data.map((d, i) => ({ index: i, text: formatTimeShort(d.timestamp) }))
    }

    const indices = [
      0,
      Math.floor(data.length * 0.25),
      Math.floor(data.length * 0.5),
      Math.floor(data.length * 0.75),
      data.length - 1,
    ]
    return indices.map((idx) => ({
      index: idx,
      text: formatTimeShort(data[idx].timestamp),
    }))
  }, [data])

  const latestVal = data.length > 0 ? data[data.length - 1].value : null
  const hoveredPoint = hoverIndex !== null && data[hoverIndex] ? data[hoverIndex] : null

  return (
    <div className="p-5 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)] flex flex-col justify-between">
      {/* Header bar: Title, Current Value, and Sample Count */}
      <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-[#F1F5F9]">
        <div>
          <h3 className="text-sm font-bold text-[#10213D] tracking-tight">{title}</h3>
          <span className="text-[11px] text-[#64748B] font-medium">Unit: {unit}</span>
        </div>

        <div className="flex items-center gap-2">
          {latestVal !== null && (
            <div className="px-2.5 py-1 rounded-lg bg-[#EAF2FF] border border-[#BFDBFE] text-xs font-mono font-bold text-[#1769FF]">
              Latest: {latestVal.toFixed(2)} {unit}
            </div>
          )}
          <span className="text-[10px] text-[#94A3B8] font-mono font-semibold">
            {data.length} pts
          </span>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full">
        {data.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-xs text-[#94A3B8] bg-[#F8FAFC] rounded-xl border border-dashed border-[#DFE7F3]"
            style={{ height }}
          >
            <span>No telemetry samples available in selected interval</span>
          </div>
        ) : (
          <svg
            viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
            className="w-full h-auto overflow-visible select-none"
            onMouseLeave={() => setHoverIndex(null)}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={gradientColor} stopOpacity="0.28" />
                <stop offset="85%" stopColor={gradientColor} stopOpacity="0.02" />
                <stop offset="100%" stopColor={gradientColor} stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines & Y-Axis Labels */}
            {yTicks.map((val) => {
              const y = getY(val)
              return (
                <g key={val}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke="#E2E8F0"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <text
                    x={padding.left - 8}
                    y={y + 3.5}
                    textAnchor="end"
                    className="text-[10px] fill-[#64748B] font-mono"
                  >
                    {val}
                  </text>
                </g>
              )
            })}

            {/* Threshold Reference Lines */}
            {thresholds.map((t, idx) => {
              if (t.value < minY || t.value > maxY) return null
              const y = getY(t.value)
              return (
                <g key={idx}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={padding.left + chartWidth}
                    y2={y}
                    stroke={t.color}
                    strokeWidth="1.5"
                    strokeDasharray={t.dashed ? '6 3' : undefined}
                    opacity="0.85"
                  />
                  <text
                    x={padding.left + chartWidth - 4}
                    y={y - 4}
                    textAnchor="end"
                    fill={t.color}
                    className="text-[9px] font-bold font-mono uppercase tracking-wider"
                  >
                    {t.label} ({t.value} {unit})
                  </text>
                </g>
              )
            })}

            {/* Area Fill */}
            <path d={areaPath} fill={`url(#${gradientId})`} />

            {/* Line Path */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* X-Axis Horizontal Base Line */}
            <line
              x1={padding.left}
              y1={padding.top + chartHeight}
              x2={padding.left + chartWidth}
              y2={padding.top + chartHeight}
              stroke="#CBD5E1"
              strokeWidth="1.2"
            />

            {/* X-Axis Time Labels */}
            {xLabels.map((lbl) => {
              const x = getX(lbl.index)
              return (
                <g key={lbl.index}>
                  <line
                    x1={x}
                    y1={padding.top + chartHeight}
                    x2={x}
                    y2={padding.top + chartHeight + 4}
                    stroke="#94A3B8"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={padding.top + chartHeight + 16}
                    textAnchor="middle"
                    className="text-[9px] fill-[#64748B] font-mono"
                  >
                    {lbl.text}
                  </text>
                </g>
              )
            })}

            {/* Interactive Hover Listener Overlay */}
            {data.map((_d, i) => {
              const x = getX(i)
              const bandWidth = chartWidth / data.length
              return (
                <rect
                  key={i}
                  x={x - bandWidth / 2}
                  y={padding.top}
                  width={bandWidth}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-crosshair"
                  onMouseEnter={() => setHoverIndex(i)}
                />
              )
            })}

            {/* Active Hover Crosshair & Dot */}
            {hoverIndex !== null && data[hoverIndex] && (
              <g>
                {/* Vertical tracking line */}
                <line
                  x1={getX(hoverIndex)}
                  y1={padding.top}
                  x2={getX(hoverIndex)}
                  y2={padding.top + chartHeight}
                  stroke="#64748B"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                />
                {/* Highlight Dot */}
                <circle
                  cx={getX(hoverIndex)}
                  cy={getY(data[hoverIndex].value)}
                  r="4.5"
                  fill={color}
                  stroke="#FFFFFF"
                  strokeWidth="2"
                  className="shadow-md"
                />
              </g>
            )}
          </svg>
        )}

        {/* Hover Tooltip Popup */}
        {hoveredPoint && (
          <div
            className="absolute z-10 pointer-events-none -top-2 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-[#10213D] text-white text-[11px] shadow-lg border border-slate-700 flex items-center gap-3 animate-in fade-in zoom-in-95 duration-100"
          >
            <div>
              <span className="text-[#94A3B8] text-[9px] uppercase tracking-wider block font-medium">
                {formatTimeShort(hoveredPoint.timestamp)} UTC
              </span>
              <span className="font-mono font-bold text-sm text-white">
                {hoveredPoint.value.toFixed(2)} {unit}
              </span>
            </div>
            {hoveredPoint.sequence !== undefined && (
              <div className="pl-2 border-l border-slate-700 text-[10px] text-[#94A3B8] font-mono leading-tight">
                <div>Seq: #{hoveredPoint.sequence}</div>
                {hoveredPoint.mode && (
                  <div className={hoveredPoint.mode === 'fault' ? 'text-[#F87171] font-bold' : 'text-[#34D399]'}>
                    {hoveredPoint.mode.toUpperCase()}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info: Threshold legend */}
      {thresholds.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mt-3 pt-2 border-t border-[#F1F5F9] text-[10px]">
          <span className="text-[#94A3B8] font-semibold">Reference Limits:</span>
          {thresholds.map((t, idx) => (
            <span key={idx} className="flex items-center gap-1.5 font-medium" style={{ color: t.color }}>
              <span className="w-2 h-0.5" style={{ backgroundColor: t.color }} />
              <span>{t.label}: {t.value} {unit}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
