import React from 'react'
import {
  Cpu,
  Layers,
  Radio,
} from 'lucide-react'
import { Card } from '../Card'
import { MachineStatusBadge } from './MachineStatusBadge'
import type { TwinVisualStatus } from '../../types'

interface MachineInfoPanelProps {
  status: TwinVisualStatus
  selectedComponent: string | null
}

const COMPONENT_DETAILS: Record<
  string,
  { name: string; tag: string; description: string; nominal: string; failureMode: string }
> = {
  'stator-casing': {
    name: 'Cast Iron Stator Frame',
    tag: 'FRAME-315M',
    description: 'Heavy cast-iron ribbed housing with 14 longitudinal cooling fins for natural convection.',
    nominal: 'Surface Temp: 65°C to 80°C (Class 155 F limit)',
    failureMode: 'Cooling fin blockage, stator winding insulation breakdown, phase-to-phase short.',
  },
  'de-bearing': {
    name: 'Drive-End (DE) Bearing Assembly',
    tag: 'SKF-6319-C3',
    description: 'Deep groove ball bearing supporting the drive output shaft extension. Fitted with tri-axial IEPE accelerometer.',
    nominal: 'Vibration: <1.8 mm/s RMS (ISO 10816 Zone A)',
    failureMode: 'Inner/outer raceway flaking, ball fatigue, lubrication failure (BPFO/BPFI harmonics).',
  },
  'nde-bearing': {
    name: 'Non-Drive-End (NDE) Bearing Assembly',
    tag: 'SKF-6316-C3',
    description: 'Rear bearing housing adjacent to cooling fan shroud. Fitted with auxiliary IEPE vibration transducer.',
    nominal: 'Vibration: <1.8 mm/s RMS (ISO 10816 Zone A)',
    failureMode: 'Axial looseness, mechanical imbalance, thermal expansion binding.',
  },
  'drive-shaft': {
    name: 'Precision Stepped Drive Shaft',
    tag: 'SHAFT-42CrMo4',
    description: 'High-tensile alloy steel rotor shaft with milled keyway coupling for mechanical load transmission.',
    nominal: 'Speed: 1488 RPM @ 50 Hz (Slip: 0.8%)',
    failureMode: 'Shaft misalignment, dynamic unbalance, torsional resonance oscillation.',
  },
  'terminal-box': {
    name: '3-Phase Power Terminal Enclosure',
    tag: 'IP55-JUNCTION',
    description: 'Cast terminal enclosure with dual brass cable glands and embedded Hall-effect current/voltage sensors.',
    nominal: '400V AC Delta / 265A Full Load Current',
    failureMode: 'Terminal lug loose connection, phase unbalance, voltage surge degradation.',
  },
  'cooling-fan': {
    name: 'Radial Impeller & Protective Cowl',
    tag: 'FAN-IC411',
    description: 'Bi-directional polypropylene cooling fan enclosed within a perforated steel protective cowl.',
    nominal: 'Airflow: 18.5 m³/min @ rated motor speed',
    failureMode: 'Fan blade breakage, air intake obstruction, aerodynamic whistling.',
  },
}

export const MachineInfoPanel: React.FC<MachineInfoPanelProps> = ({
  status,
  selectedComponent,
}) => {
  const activeComp =
    selectedComponent && COMPONENT_DETAILS[selectedComponent]
      ? COMPONENT_DETAILS[selectedComponent]
      : COMPONENT_DETAILS['de-bearing']

  return (
    <div className="space-y-4">
      {/* 1. Machine Asset Summary Card */}
      <Card
        title="Asset Identification & State"
        subtitle="Virtual induction motor status and operating parameters"
        tag="ASSET // 01"
        icon={Cpu}
        badge={<MachineStatusBadge status={status} size="sm" />}
      >
        <div className="font-mono text-xs space-y-2.5">
          <div className="flex items-center justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Asset Identifier</span>
            <span className="text-stone-900 font-bold">MTR-IND-150KW-01</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Model Series</span>
            <span className="text-stone-800">Siemens Simotics GP 1LE1</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Rated Output / Duty</span>
            <span className="text-stone-800">150 kW (200 HP) // S1 Cont</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Speed / Frequency</span>
            <span className="text-stone-800">1,488 RPM @ 50 Hz</span>
          </div>

          <div className="flex items-center justify-between py-1 border-b border-stone-100">
            <span className="text-stone-500">Insulation / Enclosure</span>
            <span className="text-stone-800">Class 155(F) // IP55 TEFC</span>
          </div>

          <div className="flex items-center justify-between pt-1 text-[11px]">
            <span className="text-stone-500 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-stone-600" />
              <span>Connection Bridge:</span>
            </span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              OPC-UA Standby
            </span>
          </div>
        </div>
      </Card>

      {/* 2. Interactive Component Inspection Card */}
      <Card
        title="Component Inspector"
        subtitle="Click any motor part in the 3D viewport to inspect its engineering specs"
        tag="INSPECTION"
        icon={Layers}
        badge={
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 font-semibold">
            {activeComp.tag}
          </span>
        }
      >
        <div className="font-mono text-xs space-y-2">
          <div className="text-stone-900 font-bold text-sm">
            {activeComp.name}
          </div>

          <p className="text-[11px] text-stone-600 font-sans leading-relaxed">
            {activeComp.description}
          </p>

          <div className="pt-2 space-y-1.5 text-[11px]">
            <div className="p-2 rounded bg-stone-50 border border-stone-200/90">
              <div className="text-[10px] text-stone-500 font-bold uppercase tracking-wider mb-0.5">
                NOMINAL OPERATING SPEC:
              </div>
              <div className="text-stone-800">{activeComp.nominal}</div>
            </div>

            <div className="p-2 rounded bg-stone-50 border border-stone-200/90">
              <div className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mb-0.5">
                TARGET FAILURE MODES:
              </div>
              <div className="text-stone-700 font-sans">{activeComp.failureMode}</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
