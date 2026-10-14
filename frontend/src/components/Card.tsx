import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface CardProps {
  title?: string
  subtitle?: string
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
  icon: Icon,
  action,
  badge,
  children,
  className = '',
  headerClassName = '',
}) => {
  return (
    <div
      className={`relative rounded-xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-md p-5 shadow-lg shadow-black/40 transition-all duration-200 hover:border-slate-700/80 ${className}`}
    >
      {(title || Icon || action || badge) && (
        <div
          className={`flex items-start justify-between gap-4 pb-4 border-b border-slate-800/60 mb-4 ${headerClassName}`}
        >
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-cyan-400">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              {title && (
                <h3 className="text-sm font-semibold text-slate-100 tracking-wide uppercase font-mono">
                  {title}
                </h3>
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badge}
            {action}
          </div>
        </div>
      )}
      <div>{children}</div>
    </div>
  )
}
