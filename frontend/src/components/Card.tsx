import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface CardProps {
  title?: string
  subtitle?: string
  tag?: string
  icon?: LucideIcon
  action?: React.ReactNode
  badge?: React.ReactNode
  children: React.ReactNode
  className?: string
  headerClassName?: string
}

export const Card: React.FC<CardProps> = ({
  title,
  subtitle,
  tag,
  icon: Icon,
  action,
  badge,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div
      className={`relative rounded-2xl bg-white border border-[#DFE7F3] p-6 shadow-[0_4px_20px_rgba(16,33,61,0.04)] transition-all duration-200 ${className}`}
    >
      {(title || Icon || action || badge || tag) && (
        <div
          className={`flex items-start justify-between gap-3 pb-3.5 border-b border-[#F1F5F9] mb-4 ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {tag && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#1769FF] font-semibold bg-[#EAF2FF] px-1.5 py-0.5 rounded border border-[#BFDBFE]">
                    {tag}
                  </span>
                )}
                {title && (
                  <h3 className="text-sm font-bold text-[#10213D] tracking-tight truncate">
                    {title}
                  </h3>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-[#475569] font-medium mt-0.5 line-clamp-1">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {badge}
            {action}
          </div>
        </div>
      )}

      {children}
    </div>
  )
}
