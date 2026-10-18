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

  const lineColor = isSelected ? '#1769FF' : isHovered ? '#2563EB' : '#3B82F6'
  const lineOpacity = isSelected ? 0.95 : isHovered ? 0.8 : 0.55

  if (!visible) {
    return null
  }

  return (
    <group>
      {/* 3D Anchor Pin on Component Surface */}
      <mesh position={[ax, ay, az]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshBasicMaterial
          color={isSelected ? '#1769FF' : '#2563EB'}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Anchor Ring Pulse */}
      {(isSelected || isHovered) && (
        <mesh position={[ax, ay, az]}>
          <ringGeometry args={[0.04, 0.06, 24]} />
          <meshBasicMaterial color="#1769FF" side={THREE.DoubleSide} transparent opacity={0.6} />
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
        <sphereGeometry args={[0.018, 12, 12]} />
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
          className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer select-none ${
            isSelected
              ? 'bg-[#1769FF] text-white border border-[#1769FF] shadow-[0_4px_14px_rgba(23,105,255,0.35)] scale-105'
              : isHovered
              ? 'bg-[#F0F6FF] text-[#1769FF] border border-[#BFDBFE] shadow-[0_2px_10px_rgba(23,105,255,0.12)]'
              : 'bg-white/95 text-[#10213D] border border-[#DFE7F3] hover:border-[#1769FF] hover:text-[#1769FF] shadow-[0_2px_8px_rgba(16,33,61,0.06)]'
          }`}
          title={`Click to inspect ${component.name}`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${
              isSelected
                ? 'bg-white shadow-[0_0_4px_#ffffff]'
                : isHovered
                ? 'bg-[#1769FF]'
                : 'bg-[#3B82F6]'
            }`}
          />
          <span className="tracking-tight">{component.name}</span>
        </button>
      </Html>
    </group>
  )
}
