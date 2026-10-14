import React from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from './Card'
import { StatusBadge } from './StatusBadge'

interface PlaceholderViewProps {
  title: string
  phase: string
  icon: LucideIcon
  description: string
  plannedFeatures: string[]
}

export const PlaceholderView: React.FC<PlaceholderViewProps> = ({
  title,
  phase,
  icon: Icon,
  description,
  plannedFeatures,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-xl border border-slate-800 bg-slate-900/50 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
            <Icon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-100 font-mono tracking-wide">{title}</h2>
              <StatusBadge label={phase} variant="info" pulse={false} />
            </div>
            <p className="text-sm text-slate-400 mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Specification / Planned Implementation Card */}
      <Card
        title="Implementation Status: Coming Soon"
        subtitle="This module is scheduled for future project phases."
        icon={Icon}
        badge={<span className="text-xs font-mono text-cyan-400">Scheduled: {phase}</span>}
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-300 leading-relaxed">
            In accordance with Step 1 requirements, this subsystem is currently staged in standby mode.
            Project scaffolding and baseline communication infrastructure have been initialized.
          </p>

          <div className="pt-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3">
              Planned Capabilities in Future Steps:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 p-3 rounded-lg border border-slate-800/80 bg-slate-950/40 text-xs text-slate-300"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
