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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 rounded-2xl bg-white border border-[#DFE7F3] shadow-[0_4px_20px_rgba(16,33,61,0.04)]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shrink-0 shadow-xs">
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-[#10213D] tracking-tight">
                {title}
              </h1>
              <StatusBadge label={phase} variant="info" pulse={false} size="sm" />
            </div>
            <p className="text-xs text-[#64748B] mt-1">{description}</p>
          </div>
        </div>
      </div>

      {/* Specification / Planned Implementation Card */}
      <Card
        title="Subsystem Architecture & Capabilities"
        subtitle="Hardware abstraction layer and scheduled implementation capabilities"
        tag="SCHEDULED"
        icon={Icon}
        badge={
          <span className="text-xs font-mono text-[#1769FF] font-bold bg-[#EAF2FF] px-2 py-0.5 rounded-lg border border-[#BFDBFE]">
            {phase}
          </span>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-[#475569] leading-relaxed">
            In accordance with the project milestone boundaries, this subsystem is currently staged in standby mode.
            Baseline infrastructure and communication bridges have been configured.
          </p>

          <div className="pt-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-[#64748B] font-bold mb-3">
              PLANNED CAPABILITIES & INTERFACES:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {plannedFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-[#F8FAFC] border border-[#DFE7F3] text-xs text-[#10213D] font-medium"
                >
                  <span className="w-2 h-2 rounded-full bg-[#1769FF]" />
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
