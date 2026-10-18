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
      bg: 'bg-[#ECFDF5]',
      text: 'text-[#065F46]',
      dot: 'bg-[#10B981]',
      border: 'border-[#A7F3D0]',
    },
    warning: {
      bg: 'bg-[#FFFBEB]',
      text: 'text-[#92400E]',
      dot: 'bg-[#F59E0B]',
      border: 'border-[#FDE68A]',
    },
    error: {
      bg: 'bg-[#FEF2F2]',
      text: 'text-[#991B1B]',
      dot: 'bg-[#EF4444]',
      border: 'border-[#FECACA]',
    },
    info: {
      bg: 'bg-[#EAF2FF]',
      text: 'text-[#1769FF]',
      dot: 'bg-[#1769FF]',
      border: 'border-[#BFDBFE]',
    },
    laser: {
      bg: 'bg-[#F0F9FF]',
      text: 'text-[#0284C7]',
      dot: 'bg-[#0284C7]',
      border: 'border-[#BAE6FD]',
    },
    neutral: {
      bg: 'bg-[#F1F5F9]',
      text: 'text-[#475569]',
      dot: 'bg-[#64748B]',
      border: 'border-[#DFE7F3]',
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.neutral

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2',
  }[size]

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full border shadow-2xs ${currentVariant.bg} ${currentVariant.text} ${currentVariant.border} ${sizeClasses} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${currentVariant.dot}`}
          />
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${currentVariant.dot}`}
        />
      </span>
      <span>{label}</span>
    </span>
  )
}
