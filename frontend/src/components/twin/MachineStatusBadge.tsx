import React from 'react'
import type { TwinVisualStatus } from '../../types'

interface MachineStatusBadgeProps {
  status: TwinVisualStatus
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showLabel?: boolean
}

export const MachineStatusBadge: React.FC<MachineStatusBadgeProps> = ({
  status,
  size = 'md',
  className = '',
  showLabel = true,
}) => {
  const config: Record<
    TwinVisualStatus,
    { bg: string; text: string; dot: string; border: string; label: string }
  > = {
    Normal: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
      border: 'border-emerald-200',
      label: 'Normal Operation',
    },
    Warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      border: 'border-amber-200',
      label: 'Warning / Elevated Stress',
    },
    Critical: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      dot: 'bg-rose-600',
      border: 'border-rose-200',
      label: 'Critical / Action Required',
    },
  }

  const s = config[status]

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-xs gap-2',
    lg: 'px-3 py-1.5 text-sm gap-2.5 font-semibold',
  }[size]

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono font-medium tracking-wide uppercase border ${s.bg} ${s.text} ${s.border} shadow-2xs ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.dot}`}
        />
        <span className={`relative inline-flex rounded-full h-2 w-2 ${s.dot}`} />
      </span>
      {showLabel && <span>{s.label}</span>}
    </span>
  )
}
