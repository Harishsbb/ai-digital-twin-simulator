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
      bg: 'bg-emerald-50',
      text: 'text-emerald-800',
      dot: 'bg-emerald-600',
      border: 'border-emerald-200',
    },
    warning: {
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      dot: 'bg-amber-600',
      border: 'border-amber-200',
    },
    error: {
      bg: 'bg-rose-50',
      text: 'text-rose-800',
      dot: 'bg-rose-600',
      border: 'border-rose-200',
    },
    info: {
      bg: 'bg-sky-50',
      text: 'text-sky-800',
      dot: 'bg-sky-600',
      border: 'border-sky-200',
    },
    laser: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-800',
      dot: 'bg-indigo-600',
      border: 'border-indigo-200',
    },
    neutral: {
      bg: 'bg-stone-100',
      text: 'text-stone-700',
      dot: 'bg-stone-500',
      border: 'border-stone-200',
    },
  }

  const s = variantStyles[variant]
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[10px] gap-1.5'
      : 'px-2.5 py-1 text-xs gap-2'

  return (
    <span
      className={`inline-flex items-center rounded-md font-mono font-medium tracking-wide uppercase border ${s.bg} ${s.text} ${s.border} shadow-2xs ${sizeClasses} ${className}`}
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
