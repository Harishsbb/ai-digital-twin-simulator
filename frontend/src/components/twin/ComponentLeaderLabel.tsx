import React, { useMemo } from 'react'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { MotorComponentMetadata } from '../../types'

interface ComponentLeaderLabelProps {
  component: MotorComponentMetadata
  anchorPos?: [number, number, number]
  labelOffset?: [number, number, number]
  isSelected: boolean
  isHovered: boolean
  onSelect: (id: string) => void
  onHover: (id: string | null) => void
  visible: boolean
}

export const ComponentLeaderLabel: React.FC<ComponentLeaderLabelProps> = ({
  component,
  anchorPos,
  labelOffset,
  isSelected,
  isHovered,
  onSelect,
  onHover,
  visible,
}) => {
  const ax = anchorPos ? anchorPos[0] : component.anchorPosition[0]
  const ay = anchorPos ? anchorPos[1] : component.anchorPosition[1]
  const az = anchorPos ? anchorPos[2] : component.anchorPosition[2]

  const ox = labelOffset ? labelOffset[0] : component.labelOffset[0]
  const oy = labelOffset ? labelOffset[1] : component.labelOffset[1]
  const oz = labelOffset ? labelOffset[2] : component.labelOffset[2]

  const lx = ax + ox
  const ly = ay + oy
  const lz = az + oz

  const lineGeo = useMemo(() => {
    const pts = [new THREE.Vector3(ax, ay, az), new THREE.Vector3(lx, ly, lz)]
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [ax, ay, az, lx, ly, lz])

  const lineColor = isSelected ? '#38bdf8' : isHovered ? '#60a5fa' : '#3b82f6'
  const lineOpacity = isSelected ? 0.95 : isHovered ? 0.8 : 0.45

  if (!visible) {
    return null
  }

  return (
    <group>
      {/* 3D Anchor Pin on Component Surface */}
      <mesh position={[ax, ay, az]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#38bdf8' : isHovered ? '#60a5fa' : '#38bdf8'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Anchor Ring Pulse */}
      {(isSelected || isHovered) && (
        <mesh position={[ax, ay, az]}>
          <ringGeometry args={[0.045, 0.065, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} transparent opacity={0.7} />
        </mesh>
      )}

      {/* 3D Connecting Leader Line */}
      <primitive
        object={
          new THREE.Line(
            lineGeo,
            new THREE.LineBasicMaterial({
              color: new THREE.Color(lineColor),
              transparent: true,
              opacity: lineOpacity,
            })
          )
        }
      />

      {/* End Terminal Dot near the Label */}
      <mesh position={[lx, ly, lz]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={lineColor} transparent opacity={lineOpacity} />
      </mesh>

      {/* 2D HTML Badge Overlay anchored at the end of the leader line */}
      <Html
        position={[lx, ly, lz]}
        center
        distanceFactor={7}
        zIndexRange={[100, 0]}
        style={{ pointerEvents: 'auto' }}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onSelect(component.id)
          }}
          onMouseEnter={() => onHover(component.id)}
          onMouseLeave={() => onHover(null)}
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 shadow-xl backdrop-blur-md cursor-pointer select-none ${
            isSelected
              ? 'bg-[#133056] text-white border border-[#38bdf8] shadow-[0_0_18px_rgba(56,189,248,0.5)] scale-105'
              : isHovered
              ? 'bg-[#0f1e36] text-[#7dd3fc] border border-blue-400/80 shadow-[0_0_12px_rgba(56,189,248,0.3)]'
              : 'bg-[#0a111e]/90 text-slate-300 border border-blue-500/35 hover:border-blue-400 hover:text-white'
          }`}
          title={`Click to inspect ${component.name}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
              isSelected
                ? 'bg-[#38bdf8] shadow-[0_0_6px_#38bdf8]'
                : isHovered
                ? 'bg-blue-400'
                : 'bg-blue-500/50'
            }`}
          />
          <span className="tracking-tight">{component.name}</span>
        </button>
      </Html>
    </group>
  )
}
