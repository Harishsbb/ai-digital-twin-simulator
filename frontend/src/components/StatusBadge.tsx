import React from 'react'

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'laser'

interface StatusBadgeProps {
  label: string
  variant?: BadgeVariant
  pulse?: boolean
  size?: 'sm' | 'md'
  className?: string
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = 'info',
  pulse = true,
  size = 'md',
  className = '',
}) => {
  const variantStyles: Record<
    BadgeVariant,
    { bg: string; text: string; dot: string; border: string }
  > = {
    success: {
      bg: 'bg-emerald-950/40',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500',
      border: 'border-emerald-800/50',
    },
    warning: {
      bg: 'bg-amber-950/40',
      text: 'text-amber-400',
      dot: 'bg-amber-500',
      border: 'border-amber-800/50',
    },
    error: {
      bg: 'bg-rose-950/40',
      text: 'text-rose-400',
      dot: 'bg-rose-500',
      border: 'border-rose-800/50',
    },
    info: {
      bg: 'bg-blue-950/40',
      text: 'text-blue-400',
      dot: 'bg-blue-500',
      border: 'border-blue-800/50',
    },
    laser: {
      bg: 'bg-sky-950/40',
      text: 'text-sky-400',
      dot: 'bg-sky-400',
      border: 'border-sky-800/50',
    },
    neutral: {
      bg: 'bg-slate-900',
      text: 'text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-800',
    },
  }

  const s = variantStyles[variant]
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium tracking-wide border ${s.bg} ${s.text} ${s.border} shadow-sm ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2 shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${s.dot}`} />
      </span>
      <span>{label}</span>
    </span>
  )
}
