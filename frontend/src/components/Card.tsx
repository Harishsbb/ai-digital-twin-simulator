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
  techBracket?: boolean
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
  techBracket = false,
}) => {
  return (
    <div
      className={`relative rounded-xl mech-panel p-5 transition-all duration-300 ${
        techBracket ? 'tech-bracket' : ''
      } ${className}`}
    >
      {(title || Icon || action || badge || tag) && (
        <div
          className={`flex items-start justify-between gap-3 pb-3.5 border-b border-slate-800/80 mb-4 ${headerClassName}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400 shrink-0 shadow-inner">
                <Icon className="w-4 h-4" />
              </div>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {tag && (
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-semibold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                    {tag}
                  </span>
                )}
                {title && (
                  <h3 className="text-xs font-semibold text-slate-100 tracking-wider uppercase font-mono truncate">
                    {title}
                  </h3>
                )}
              </div>
              {subtitle && (
                <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
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
