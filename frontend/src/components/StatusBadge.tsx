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
    { bg: string; text: string; dot: string; border: string; glow: string }
  > = {
    success: {
      bg: 'bg-emerald-950/60',
      text: 'text-emerald-300',
      dot: 'bg-emerald-400',
      border: 'border-emerald-600/30',
      glow: 'shadow-emerald-950/50',
    },
    warning: {
      bg: 'bg-amber-950/60',
      text: 'text-amber-300',
      dot: 'bg-amber-400',
      border: 'border-amber-600/30',
      glow: 'shadow-amber-950/50',
    },
    error: {
      bg: 'bg-rose-950/60',
      text: 'text-rose-300',
      dot: 'bg-rose-400',
      border: 'border-rose-600/30',
      glow: 'shadow-rose-950/50',
    },
    info: {
      bg: 'bg-cyan-950/60',
      text: 'text-cyan-300',
      dot: 'bg-cyan-400',
      border: 'border-cyan-600/30',
      glow: 'shadow-cyan-950/50',
    },
    laser: {
      bg: 'bg-sky-950/60',
      text: 'text-sky-200',
      dot: 'bg-sky-400',
      border: 'border-sky-500/40',
      glow: 'shadow-sky-950/50',
    },
    neutral: {
      bg: 'bg-slate-900/80',
      text: 'text-slate-300',
      dot: 'bg-slate-400',
      border: 'border-slate-700/50',
      glow: 'shadow-black/50',
    },
  }

  const s = variantStyles[variant]
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2'

  return (
    <span
      className={`inline-flex items-center rounded font-mono font-medium tracking-wide uppercase border ${s.bg} ${s.text} ${s.border} shadow-sm ${s.glow} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-1.5 w-1.5 shrink-0">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${s.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${s.dot}`} />
      </span>
      <span>{label}</span>
    </span>
  )
}
