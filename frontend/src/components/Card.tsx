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
      className={`relative rounded-2xl dark-panel p-6 shadow-xl transition-all duration-200 ${className}`}
    >
      {(title || Icon || action || badge || tag) && (
        <div
          className={`flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800/70 mb-4 ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 shadow-[0_0_12px_rgba(59,130,246,0.15)]">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {tag && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-semibold bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-800/40">
                    {tag}
                  </span>
                )}
                {title && (
                  <h3 className="text-sm font-semibold text-white tracking-wide truncate">
                    {title}
                  </h3>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
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
      <div>{children}</div>
    </div>
  )
}
