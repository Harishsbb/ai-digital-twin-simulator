import React, { useState } from 'react'
import {
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Layers,
  Thermometer,
  ShieldCheck,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react'
import type { MotorComponentMetadata, TwinVisualStatus } from '../../types'
import { MOTOR_COMPONENTS } from '../../data/motorComponents'

interface ComponentDetailsCardProps {
  component: MotorComponentMetadata
  onSelectComponent: (componentId: string) => void
  machineStatus: TwinVisualStatus
}

export const ComponentDetailsCard: React.FC<ComponentDetailsCardProps> = ({
  component,
  onSelectComponent,
  machineStatus,
}) => {
  const [showComponentList, setShowComponentList] = useState(false)

  const currentIndex = MOTOR_COMPONENTS.findIndex((c) => c.id === component.id)
  const prevComponent =
    MOTOR_COMPONENTS[(currentIndex - 1 + MOTOR_COMPONENTS.length) % MOTOR_COMPONENTS.length]
  const nextComponent =
    MOTOR_COMPONENTS[(currentIndex + 1) % MOTOR_COMPONENTS.length]

  const getStatusBadge = () => {
    switch (machineStatus) {
      case 'Warning':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A]">
            <AlertTriangle className="w-3 h-3 text-[#F59E0B]" />
            Warning
          </span>
        )
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#991B1B] border border-[#FECACA]">
            <AlertOctagon className="w-3 h-3 text-[#EF4444]" />
            Critical
          </span>
        )
      case 'Normal':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ECFDF5] text-[#065F46] border border-[#A7F3D0]">
            <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
            Normal
          </span>
        )
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(16,33,61,0.04)] border border-[#DFE7F3] relative overflow-hidden">
      <div>
        {/* ========================================================= */}
        {/* 1. HEADER WITH COMPONENT LIST TOGGLE                      */}
        {/* ========================================================= */}
        <div className="flex items-center justify-between pb-4 border-b border-[#DFE7F3]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#EAF2FF] border border-[#BFDBFE] flex items-center justify-center text-[#1769FF] shadow-xs">
              <Cpu className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-[#10213D] tracking-tight">
              Component Details
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Quick List Toggle */}
            <button
              type="button"
              onClick={() => setShowComponentList(!showComponentList)}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                showComponentList
                  ? 'bg-[#EAF2FF] border-[#BFDBFE] text-[#1769FF]'
                  : 'bg-white border-[#DFE7F3] text-[#64748B] hover:text-[#10213D] hover:border-[#CBD5E1]'
              }`}
              title="Browse all 14 motor components"
            >
              <Layers className="w-4 h-4" />
            </button>

            {/* Menu button */}
            <button
              type="button"
              onClick={() => setShowComponentList(!showComponentList)}
              className="p-1.5 rounded-lg bg-white border border-[#DFE7F3] text-[#64748B] hover:text-[#10213D] hover:border-[#CBD5E1] transition-all cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* COMPONENT LIST DROPDOWN (Optional Quick Selector)         */}
        {/* ========================================================= */}
        {showComponentList && (
          <div className="my-3 p-3 rounded-xl bg-white border border-[#DFE7F3] max-h-56 overflow-y-auto space-y-1 shadow-xl animate-in fade-in duration-150">
            <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider px-2 pb-1">
              Select Component ({MOTOR_COMPONENTS.length})
            </div>
            {MOTOR_COMPONENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectComponent(item.id)
                  setShowComponentList(false)
                }}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  item.id === component.id
                    ? 'bg-[#EAF2FF] text-[#1769FF] font-semibold'
                    : 'text-[#10213D] hover:bg-[#F8FAFC]'
                }`}
              >
                <span>{item.name}</span>
                <span className="text-[10px] text-[#64748B]">{item.shortName}</span>
              </button>
            ))}
          </div>
        )}

        {/* ========================================================= */}
        {/* 2. COMPONENT PREVIEW IMAGE CARD                           */}
        {/* ========================================================= */}
        <div className="my-4 relative rounded-xl overflow-hidden border border-[#DFE7F3] bg-gradient-to-b from-[#F1F5F9] to-[#E2E8F0] aspect-video flex items-center justify-center group shadow-xs">
          {component.previewImage ? (
            <img
              src={component.previewImage}
              alt={component.name}
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-[#94A3B8] gap-2">
              <Cpu className="w-10 h-10 text-[#1769FF]/50" />
              <span className="text-xs">{component.name}</span>
            </div>
          )}

          {/* Quick cycle left/right buttons inside preview */}
          <div className="absolute inset-x-2 bottom-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => onSelectComponent(prevComponent.id)}
              className="p-1 rounded-lg bg-white/90 hover:bg-white backdrop-blur-md border border-[#DFE7F3] text-[#10213D] shadow-xs transition-all cursor-pointer"
              title={`Previous: ${prevComponent.name}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="text-[11px] font-semibold text-[#10213D] bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md border border-[#DFE7F3] shadow-xs">
              {currentIndex + 1} / {MOTOR_COMPONENTS.length}
            </div>
            <button
              type="button"
              onClick={() => onSelectComponent(nextComponent.id)}
              className="p-1 rounded-lg bg-white/90 hover:bg-white backdrop-blur-md border border-[#DFE7F3] text-[#10213D] shadow-xs transition-all cursor-pointer"
              title={`Next: ${nextComponent.name}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. COMPONENT TITLE & SUBTITLE                             */}
        {/* ========================================================= */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-[#10213D] tracking-tight flex items-center gap-1.5">
              <span>{component.name}</span>
              <ChevronRight className="w-4 h-4 text-[#1769FF]" />
            </h3>
          </div>
          <p className="text-xs text-[#475569] mt-0.5 font-medium">
            {component.subtitle}
          </p>
        </div>

        {/* ========================================================= */}
        {/* 4. METADATA SPECIFICATION TABLE                           */}
        {/* ========================================================= */}
        <div className="space-y-2.5 text-xs">
          {/* Function */}
          <div className="flex items-start justify-between py-1.5 border-b border-[#F1F5F9] gap-3">
            <span className="text-[#475569] font-semibold shrink-0">Function</span>
            <span className="text-[#10213D] text-right leading-relaxed font-medium">
              {component.functionDesc}
            </span>
          </div>

          {/* Material */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] gap-3">
            <span className="text-[#475569] font-semibold shrink-0">Material</span>
            <span className="text-[#10213D] text-right font-bold">
              {component.material}
            </span>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] gap-3">
            <span className="text-[#475569] font-semibold shrink-0">Status</span>
            <div>{getStatusBadge()}</div>
          </div>

          {/* Temperature Rating */}
          <div className="flex items-center justify-between py-1.5 border-b border-[#F1F5F9] gap-3">
            <span className="text-[#475569] font-semibold shrink-0 flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-[#1769FF]" />
              Temperature
            </span>
            <span className="text-[#10213D] text-right font-mono text-[11px] font-bold">
              {component.temperatureRating}
            </span>
          </div>

          {/* Notes */}
          <div className="flex items-start justify-between py-1.5 border-b border-[#F1F5F9] gap-3">
            <span className="text-[#475569] font-semibold shrink-0 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
              Notes
            </span>
            <span className="text-[#334155] text-right text-[11px] leading-relaxed font-medium">
              {component.notes}
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. BOTTOM FAST COMPONENT JUMP CHIPS                       */}
      {/* ========================================================= */}
      <div className="mt-5 pt-3 border-t border-[#DFE7F3]">
        <div className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider mb-2">
          Quick Jump
        </div>
        <div className="flex flex-wrap gap-1.5">
          {['stator-core', 'rotor', 'drive-shaft', 'front-end-shield', 'de-bearing', 'terminal-box'].map(
            (id) => {
              const item = MOTOR_COMPONENTS.find((c) => c.id === id)
              if (!item) return null
              const isSelected = item.id === component.id
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => onSelectComponent(id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#1769FF] text-white font-semibold shadow-xs'
                      : 'bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0] hover:text-[#10213D]'
                  }`}
                >
                  {item.shortName}
                </button>
              )
            }
          )}
        </div>
      </div>
    </div>
  )
}
