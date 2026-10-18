import React, { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TwinViewOptions, TwinVisualStatus } from '../../types'
import { getComponentById } from '../../data/motorComponents'
import { ComponentLeaderLabel } from './ComponentLeaderLabel'

interface IndustrialMotorProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  selectedComponentId: string | null
  onSelectComponent?: (componentId: string) => void
}

export const IndustrialMotor: React.FC<IndustrialMotorProps> = ({
  status,
  options,
  selectedComponentId,
  onSelectComponent,
}) => {
  const motorGroupRef = useRef<THREE.Group>(null)
  const shaftRotationRef = useRef<THREE.Group>(null)
  const fanRotationRef = useRef<THREE.Group>(null)

  // Individual component group refs for smooth 60fps animated separation
  const housingGroupRef = useRef<THREE.Group>(null)
  const coolingFinsGroupRef = useRef<THREE.Group>(null)
  const mountingFeetGroupRef = useRef<THREE.Group>(null)
  const statorCoreGroupRef = useRef<THREE.Group>(null)
  const rotorGroupRef = useRef<THREE.Group>(null)
  const driveShaftGroupRef = useRef<THREE.Group>(null)
  const frontEndShieldGroupRef = useRef<THREE.Group>(null)
  const deBearingGroupRef = useRef<THREE.Group>(null)
  const ndeBearingGroupRef = useRef<THREE.Group>(null)
  const coolingFanGroupRef = useRef<THREE.Group>(null)
  const fanCoverGroupRef = useRef<THREE.Group>(null)
  const terminalBoxGroupRef = useRef<THREE.Group>(null)
  const liftingEyeGroupRef = useRef<THREE.Group>(null)
  const fastenersGroupRef = useRef<THREE.Group>(null)

  // Hover state for 3D meshes & labels
  const [hoveredId, setHoveredId] = useState<string | null>(null)

  // Animated exploded interpolation factor (0 = assembled, 1 = exploded)
  const progressRef = useRef(options.viewMode === 'exploded' || options.explodedView ? 1 : 0)

  // Section clipping plane for CAD Section View
  const sectionPlane = useMemo(() => {
    return new THREE.Plane(new THREE.Vector3(0, -1, 0.4).normalize(), 0.15)
  }, [])

  // Photorealistic industrial colors matching reference
  const colors = useMemo(() => {
    switch (status) {
      case 'Warning':
        return {
          stator: '#3b382d',
          statorDark: '#2a281e',
          accent: '#d97706',
          bearingHub: '#2e2c22',
          shaft: '#cbd5e1',
          fanCowl: '#26241c',
          copper: '#c2410c',
          steel: '#94a3b8',
        }
      case 'Critical':
        return {
          stator: '#4a242a',
          statorDark: '#35181e',
          accent: '#dc2626',
          bearingHub: '#3a1b20',
          shaft: '#fca5a5',
          fanCowl: '#30161b',
          copper: '#991b1b',
          steel: '#cbd5e1',
        }
      case 'Normal':
      default:
        return {
          stator: '#1c5cb8',
          statorDark: '#15458a',
          accent: '#1769FF',
          bearingHub: '#18478c',
          shaft: '#f8fafc',
          fanCowl: '#1a52a3',
          copper: '#ea580c',
          steel: '#cbd5e1',
        }
    }
  }, [status])

  // 32 High-Density Stator Cooling Fins
  const finAngles = useMemo(() => {
    const fins: number[] = []
    const count = 32
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      const distFromTop = Math.abs(angle - Math.PI / 2)
      const distFromBottom = Math.abs(angle - (3 * Math.PI) / 2)
      if (distFromTop > 0.32 && distFromBottom > 0.35) {
        fins.push(angle)
      }
    }
    return fins
  }, [])

  // 8 Fan Blades
  const fanBladeAngles = useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => (i / 8) * Math.PI * 2)
  }, [])

  // 12 Cowl Air-Intake Vent Slots
  const ventAngles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
  }, [])

  // 6 End-Shield Bolt Angles
  const boltAngles = useMemo(() => {
    return Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2)
  }, [])

  // Continuous animation loop (shaft spin, fan rotation, vibrations, exploded view lerp)
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()
    const targetProgress = (options.viewMode === 'exploded' || options.explodedView) ? 1 : 0
    progressRef.current = THREE.MathUtils.damp(progressRef.current, targetProgress, 6, delta)
    const p = progressRef.current

    // Shaft & Cooling Fan Rotation
    if (shaftRotationRef.current) {
      const speed = options.autoRotate ? 5.0 * options.rotationSpeed : 1.2
      shaftRotationRef.current.rotation.z += speed * delta
    }
    if (fanRotationRef.current && shaftRotationRef.current) {
      fanRotationRef.current.rotation.z = shaftRotationRef.current.rotation.z
    }

    // Status Vibrations
    if (motorGroupRef.current) {
      if (status === 'Critical') {
        motorGroupRef.current.position.x = Math.sin(time * 65) * 0.012
        motorGroupRef.current.position.y = Math.cos(time * 55) * 0.01
      } else if (status === 'Warning') {
        motorGroupRef.current.position.x = Math.sin(time * 35) * 0.004
        motorGroupRef.current.position.y = Math.cos(time * 30) * 0.003
      } else {
        motorGroupRef.current.position.x = 0
        motorGroupRef.current.position.y = 0
      }
    }

    // Direct 3D Group Translations (smooth exploded assembly)
    if (housingGroupRef.current) {
      housingGroupRef.current.position.z = THREE.MathUtils.lerp(0, -0.2, p)
    }
    if (coolingFinsGroupRef.current) {
      coolingFinsGroupRef.current.position.z = THREE.MathUtils.lerp(0, -0.2, p)
    }
    if (mountingFeetGroupRef.current) {
      mountingFeetGroupRef.current.position.z = THREE.MathUtils.lerp(0, -0.2, p)
    }
    if (statorCoreGroupRef.current) {
      statorCoreGroupRef.current.position.z = THREE.MathUtils.lerp(0, 0.45, p)
    }
    if (rotorGroupRef.current) {
      rotorGroupRef.current.position.z = THREE.MathUtils.lerp(0, 1.3, p)
    }
    if (driveShaftGroupRef.current) {
      driveShaftGroupRef.current.position.z = THREE.MathUtils.lerp(0, 2.1, p)
    }
    if (frontEndShieldGroupRef.current) {
      frontEndShieldGroupRef.current.position.z = THREE.MathUtils.lerp(1.18, 2.7, p)
    }
    if (deBearingGroupRef.current) {
      deBearingGroupRef.current.position.z = THREE.MathUtils.lerp(1.05, 2.05, p)
    }
    if (ndeBearingGroupRef.current) {
      ndeBearingGroupRef.current.position.z = THREE.MathUtils.lerp(-1.18, -1.25, p)
    }
    if (coolingFanGroupRef.current) {
      coolingFanGroupRef.current.position.z = THREE.MathUtils.lerp(-1.55, -1.95, p)
    }
    if (fanCoverGroupRef.current) {
      fanCoverGroupRef.current.position.z = THREE.MathUtils.lerp(-1.35, -2.75, p)
    }
    if (terminalBoxGroupRef.current) {
      terminalBoxGroupRef.current.position.y = THREE.MathUtils.lerp(1.28, 2.05, p)
      terminalBoxGroupRef.current.position.z = THREE.MathUtils.lerp(0, -0.2, p)
    }
    if (liftingEyeGroupRef.current) {
      liftingEyeGroupRef.current.position.y = THREE.MathUtils.lerp(1.25, 2.25, p)
      liftingEyeGroupRef.current.position.z = THREE.MathUtils.lerp(-0.72, -0.65, p)
    }
    if (fastenersGroupRef.current) {
      fastenersGroupRef.current.position.y = THREE.MathUtils.lerp(-0.3, -0.85, p)
      fastenersGroupRef.current.position.z = THREE.MathUtils.lerp(1.3, 2.85, p)
    }
  })

  const isXray = options.viewMode === 'xray'
  const isSection = options.viewMode === 'section'
  const wireframe = options.wireframe
  const isLabelsVisible = options.showLabels || options.viewMode === 'exploded'

  // Helper function to calculate highlight props for any component
  const getHighlightProps = (id: string) => {
    const isSelected = selectedComponentId === id
    const isHovered = hoveredId === id
    return {
      emissive: isSelected ? '#0284c7' : isHovered ? '#0369a1' : '#000000',
      emissiveIntensity: isSelected ? 0.75 : isHovered ? 0.35 : 0,
    }
  }

  // Material generator for shell components (Housing, Fins, Shields, Cowl)
  const renderShellMaterial = (baseColor: string, id: string) => {
    const hp = getHighlightProps(id)
    if (isXray) {
      return (
        <meshPhysicalMaterial
          color="#38bdf8"
          roughness={0.15}
          metalness={0.1}
          transmission={0.85}
          transparent={true}
          opacity={0.22}
          depthWrite={false}
          wireframe={wireframe}
          emissive={hp.emissive}
          emissiveIntensity={hp.emissiveIntensity}
        />
      )
    }
    return (
      <meshPhysicalMaterial
        color={baseColor}
        roughness={0.34}
        metalness={0.44}
        clearcoat={0.62}
        clearcoatRoughness={0.25}
        reflectivity={0.65}
        wireframe={wireframe}
        clippingPlanes={isSection ? [sectionPlane] : undefined}
        clipShadows={true}
        emissive={hp.emissive}
        emissiveIntensity={hp.emissiveIntensity}
      />
    )
  }

  return (
    <group ref={motorGroupRef} position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. MOTOR HOUSING & STATOR CASING                          */}
      {/* ========================================================= */}
      <group
        ref={housingGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('motor-housing')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('motor-housing')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.08, 1.08, 2.26, 48]} />
          {renderShellMaterial(colors.stator, 'motor-housing')}
        </mesh>
        {[-1.08, 1.08].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.14, 1.14, 0.1, 48]} />
            {renderShellMaterial(colors.statorDark, 'motor-housing')}
          </mesh>
        ))}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.018, 16, 48]} />
          {renderShellMaterial(colors.statorDark, 'motor-housing')}
        </mesh>

        <ComponentLeaderLabel
          component={getComponentById('motor-housing')}
          anchorPos={[0, 1.15, 0]}
          labelOffset={[0.85, 0.7, 0]}
          isSelected={selectedComponentId === 'motor-housing'}
          isHovered={hoveredId === 'motor-housing'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 2. COOLING FINS ARRAY                                     */}
      {/* ========================================================= */}
      <group
        ref={coolingFinsGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('cooling-fins')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('cooling-fins')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        {finAngles.map((angle, idx) => {
          const radius = 1.12
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          return (
            <group key={idx} position={[x, y, 0]} rotation={[0, 0, angle]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.22, 0.02, 2.12]} />
                {renderShellMaterial(colors.stator, 'cooling-fins')}
              </mesh>
              <mesh position={[0.11, 0, 0]}>
                <boxGeometry args={[0.015, 0.014, 2.12]} />
                <meshStandardMaterial color="#3a5a7e" roughness={0.25} metalness={0.6} />
              </mesh>
            </group>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('cooling-fins')}
          anchorPos={[0.8, 0.8, 0]}
          labelOffset={[0.95, 0.65, 0]}
          isSelected={selectedComponentId === 'cooling-fins'}
          isHovered={hoveredId === 'cooling-fins'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 3. BASE MOUNTING FEET                                     */}
      {/* ========================================================= */}
      <group
        ref={mountingFeetGroupRef}
        position={[0, -1.05, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('mounting-feet')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('mounting-feet')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        {/* Left Foot */}
        <group position={[-0.92, -0.14, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.18, 2.05]} />
            {renderShellMaterial(colors.statorDark, 'mounting-feet')}
          </mesh>
          {[-0.6, 0.6].map((z, i) => (
            <mesh key={i} position={[0.12, 0.16, z]} rotation={[0, 0, -Math.PI / 6]}>
              <boxGeometry args={[0.06, 0.22, 0.15]} />
              <meshStandardMaterial color={colors.statorDark} roughness={0.5} metalness={0.5} />
            </mesh>
          ))}
          {[-0.75, 0.75].map((z, i) => (
            <group key={i} position={[-0.04, 0.09, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.015, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.04, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
              </mesh>
            </group>
          ))}
        </group>

        {/* Right Foot */}
        <group position={[0.92, -0.14, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.44, 0.18, 2.05]} />
            {renderShellMaterial(colors.statorDark, 'mounting-feet')}
          </mesh>
          {[-0.6, 0.6].map((z, i) => (
            <mesh key={i} position={[-0.12, 0.16, z]} rotation={[0, 0, Math.PI / 6]}>
              <boxGeometry args={[0.06, 0.22, 0.15]} />
              <meshStandardMaterial color={colors.statorDark} roughness={0.5} metalness={0.5} />
            </mesh>
          ))}
          {[-0.75, 0.75].map((z, i) => (
            <group key={i} position={[0.04, 0.09, z]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.09, 0.09, 0.015, 16]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
              </mesh>
              <mesh position={[0, 0.02, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.04, 6]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
              </mesh>
            </group>
          ))}
        </group>

        <ComponentLeaderLabel
          component={getComponentById('mounting-feet')}
          anchorPos={[0.92, 0, 0]}
          labelOffset={[0.55, -0.4, 0]}
          isSelected={selectedComponentId === 'mounting-feet'}
          isHovered={hoveredId === 'mounting-feet'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 4. STATOR CORE & COPPER COIL WINDINGS                     */}
      {/* ========================================================= */}
      <group
        ref={statorCoreGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('stator-core')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('stator-core')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.02, 1.02, 1.85, 36, 1, true]} />
          <meshStandardMaterial
            color="#334155"
            metalness={0.8}
            roughness={0.28}
            side={THREE.DoubleSide}
            {...getHighlightProps('stator-core')}
          />
        </mesh>

        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.72, 1.01, 1.82, 32, 1, true]} />
          <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {[-0.94, 0.94].map((z, idx) => (
          <group key={idx} position={[0, 0, z]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.82, 0.12, 16, 36]} />
              <meshStandardMaterial
                color={colors.copper}
                metalness={0.88}
                roughness={0.22}
                {...getHighlightProps('stator-core')}
              />
            </mesh>
            {Array.from({ length: 12 }).map((_, i) => {
              const a = (i / 12) * Math.PI * 2
              return (
                <mesh key={i} position={[Math.cos(a) * 0.82, Math.sin(a) * 0.82, 0]} rotation={[0, 0, a]}>
                  <boxGeometry args={[0.04, 0.16, 0.08]} />
                  <meshStandardMaterial color="#fef08a" roughness={0.7} />
                </mesh>
              )
            })}
          </group>
        ))}

        <ComponentLeaderLabel
          component={getComponentById('stator-core')}
          anchorPos={[0, 0.95, 0]}
          labelOffset={[-0.3, 0.7, 0]}
          isSelected={selectedComponentId === 'stator-core'}
          isHovered={hoveredId === 'stator-core'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 5. ROTOR (Laminated Core & Squirrel Cage)                 */}
      {/* ========================================================= */}
      <group
        ref={rotorGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('rotor')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('rotor')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.66, 0.66, 1.72, 36]} />
          <meshStandardMaterial
            color="#475569"
            metalness={0.78}
            roughness={0.32}
            {...getHighlightProps('rotor')}
          />
        </mesh>
        {[-0.87, 0.87].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.67, 0.67, 0.06, 36]} />
            <meshStandardMaterial color={colors.copper} metalness={0.9} roughness={0.2} />
          </mesh>
        ))}
        {Array.from({ length: 18 }).map((_, i) => {
          const a = (i / 18) * Math.PI * 2
          return (
            <mesh
              key={i}
              position={[Math.cos(a) * 0.665, Math.sin(a) * 0.665, 0]}
              rotation={[0, 0, a + 0.12]}
            >
              <boxGeometry args={[0.022, 0.038, 1.72]} />
              <meshStandardMaterial color={colors.copper} metalness={0.88} roughness={0.25} />
            </mesh>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('rotor')}
          anchorPos={[0, 0.72, 0]}
          labelOffset={[-0.4, 0.75, 0]}
          isSelected={selectedComponentId === 'rotor'}
          isHovered={hoveredId === 'rotor'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 6. DRIVE-END SHAFT (Spindle)                              */}
      {/* ========================================================= */}
      <group
        ref={driveShaftGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('drive-shaft')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('drive-shaft')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <group ref={shaftRotationRef}>
          <mesh position={[0, 0, 1.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 1.45, 40]} />
            <meshStandardMaterial
              color={colors.shaft}
              roughness={0.14}
              metalness={0.96}
              {...getHighlightProps('drive-shaft')}
            />
          </mesh>
          <mesh position={[0, 0, 2.68]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.24, 0.26, 0.04, 40]} />
            <meshStandardMaterial color={colors.shaft} roughness={0.16} metalness={0.95} />
          </mesh>
          <mesh position={[0, 0, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.16, 36]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
          </mesh>
          <group position={[0, 0.255, 2.08]}>
            <mesh>
              <boxGeometry args={[0.076, 0.035, 0.68]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.35} />
            </mesh>
            <mesh position={[0, 0.015, 0]}>
              <boxGeometry args={[0.07, 0.03, 0.64]} />
              <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        </group>

        <ComponentLeaderLabel
          component={getComponentById('drive-shaft')}
          anchorPos={[0, 0.28, 2.2]}
          labelOffset={[-0.65, -0.7, 0]}
          isSelected={selectedComponentId === 'drive-shaft'}
          isHovered={hoveredId === 'drive-shaft'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 7. FRONT END SHIELD (DE Bearing Flange)                   */}
      {/* ========================================================= */}
      <group
        ref={frontEndShieldGroupRef}
        position={[0, 0, 1.18]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('front-end-shield')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('front-end-shield')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.13, 1.13, 0.14, 48]} />
          {renderShellMaterial(colors.bearingHub, 'front-end-shield')}
        </mesh>
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.78, 1.06, 0.18, 48]} />
          {renderShellMaterial(colors.bearingHub, 'front-end-shield')}
        </mesh>
        <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.54, 0.62, 0.16, 40]} />
          {renderShellMaterial(colors.statorDark, 'front-end-shield')}
        </mesh>
        <group position={[0, 0.66, 0.22]} rotation={[-Math.PI / 4, 0, 0]}>
          <mesh>
            <cylinderGeometry args={[0.022, 0.026, 0.07, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.25} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <sphereGeometry args={[0.025, 12, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.2} />
          </mesh>
        </group>

        <ComponentLeaderLabel
          component={getComponentById('front-end-shield')}
          anchorPos={[0, 1.15, 0]}
          labelOffset={[-0.75, 0.65, 0]}
          isSelected={selectedComponentId === 'front-end-shield'}
          isHovered={hoveredId === 'front-end-shield'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 8. DRIVE-END (DE) BALL BEARING                            */}
      {/* ========================================================= */}
      <group
        ref={deBearingGroupRef}
        position={[0, 0, 1.05]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('de-bearing')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('de-bearing')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.52, 0.52, 0.16, 36, 1, true]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.94}
            roughness={0.14}
            side={THREE.DoubleSide}
            {...getHighlightProps('de-bearing')}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.31, 0.31, 0.16, 36, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.14} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.415, Math.sin(a) * 0.415, 0]}>
              <sphereGeometry args={[0.08, 16, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
            </mesh>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('de-bearing')}
          anchorPos={[0, 0.55, 0]}
          labelOffset={[-0.6, 0.75, 0]}
          isSelected={selectedComponentId === 'de-bearing'}
          isHovered={hoveredId === 'de-bearing'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 9. NON-DRIVE-END (NDE) BALL BEARING                       */}
      {/* ========================================================= */}
      <group
        ref={ndeBearingGroupRef}
        position={[0, 0, -1.18]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('nde-bearing')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('nde-bearing')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.48, 0.48, 0.15, 36, 1, true]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.94}
            roughness={0.14}
            side={THREE.DoubleSide}
            {...getHighlightProps('nde-bearing')}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.27, 0.27, 0.15, 36, 1, true]} />
          <meshStandardMaterial color="#e2e8f0" metalness={0.94} roughness={0.14} side={THREE.DoubleSide} />
        </mesh>
        {Array.from({ length: 7 }).map((_, i) => {
          const a = (i / 7) * Math.PI * 2
          return (
            <mesh key={i} position={[Math.cos(a) * 0.375, Math.sin(a) * 0.375, 0]}>
              <sphereGeometry args={[0.075, 16, 16]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.98} roughness={0.1} />
            </mesh>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('nde-bearing')}
          anchorPos={[0, 0.52, 0]}
          labelOffset={[0.65, 0.75, 0]}
          isSelected={selectedComponentId === 'nde-bearing'}
          isHovered={hoveredId === 'nde-bearing'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 10. COOLING FAN (Centrifugal Impeller)                    */}
      {/* ========================================================= */}
      <group
        ref={coolingFanGroupRef}
        position={[0, 0, -1.55]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('cooling-fan')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('cooling-fan')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <group ref={fanRotationRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.18, 24]} />
            <meshStandardMaterial
              color="#f1f5f9"
              metalness={0.3}
              roughness={0.4}
              {...getHighlightProps('cooling-fan')}
            />
          </mesh>
          {fanBladeAngles.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.62, Math.sin(angle) * 0.62, 0]}
              rotation={[0, 0, angle + 0.38]}
            >
              <boxGeometry args={[0.55, 0.028, 0.19]} />
              <meshStandardMaterial color="#f8fafc" metalness={0.35} roughness={0.4} />
            </mesh>
          ))}
        </group>

        <ComponentLeaderLabel
          component={getComponentById('cooling-fan')}
          anchorPos={[0, 0.85, 0]}
          labelOffset={[0.95, 0.65, 0]}
          isSelected={selectedComponentId === 'cooling-fan'}
          isHovered={hoveredId === 'cooling-fan'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 11. FAN COVER (Cowl Shroud)                               */}
      {/* ========================================================= */}
      <group
        ref={fanCoverGroupRef}
        position={[0, 0, -1.35]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('fan-cover')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('fan-cover')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.13, 1.13, 0.85, 48, 1, true]} />
          {renderShellMaterial(colors.fanCowl, 'fan-cover')}
        </mesh>
        <mesh position={[0, 0, -0.84]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.06, 0.07, 16, 48]} />
          {renderShellMaterial(colors.fanCowl, 'fan-cover')}
        </mesh>
        <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.02, 36]} />
          <meshStandardMaterial color="#080e18" roughness={0.92} metalness={0.5} wireframe={true} />
        </mesh>
        {ventAngles.map((angle, idx) => {
          const r = 1.135
          return (
            <mesh
              key={idx}
              position={[Math.cos(angle) * r, Math.sin(angle) * r, -0.44]}
              rotation={[0, 0, angle]}
            >
              <boxGeometry args={[0.015, 0.06, 0.48]} />
              <meshBasicMaterial color="#070c14" />
            </mesh>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('fan-cover')}
          anchorPos={[0, 1.15, -0.4]}
          labelOffset={[1.1, 0.55, 0]}
          isSelected={selectedComponentId === 'fan-cover'}
          isHovered={hoveredId === 'fan-cover'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 12. TERMINAL JUNCTION BOX                                 */}
      {/* ========================================================= */}
      <group
        ref={terminalBoxGroupRef}
        position={[0, 1.28, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('terminal-box')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('terminal-box')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.74, 0.22, 0.68]} />
          {renderShellMaterial(colors.statorDark, 'terminal-box')}
        </mesh>
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 0.42, 0.92]} />
          {renderShellMaterial(colors.stator, 'terminal-box')}
        </mesh>
        <group position={[0, 0.4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.07, 0.98]} />
            {renderShellMaterial(colors.statorDark, 'terminal-box')}
          </mesh>
          {[-0.32, -0.16, 0, 0.16, 0.32].map((z, idx) => (
            <mesh key={idx} position={[0, 0.05, z]} castShadow>
              <boxGeometry args={[0.96, 0.04, 0.03]} />
              <meshStandardMaterial color={colors.stator} roughness={0.3} metalness={0.5} />
            </mesh>
          ))}
          {[
            [-0.48, -0.42],
            [0.48, -0.42],
            [-0.48, 0.42],
            [0.48, 0.42],
          ].map(([x, z], idx) => (
            <mesh key={idx} position={[x, 0.055, z]}>
              <cylinderGeometry args={[0.032, 0.032, 0.04, 6]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} />
            </mesh>
          ))}
        </group>
        <group position={[0.54, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.24} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.088, 0.098, 0.09, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.26} />
          </mesh>
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.12, 16]} />
            <meshStandardMaterial color="#090e17" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>

        <ComponentLeaderLabel
          component={getComponentById('terminal-box')}
          anchorPos={[0, 0.46, 0]}
          labelOffset={[0, 0.65, 0]}
          isSelected={selectedComponentId === 'terminal-box'}
          isHovered={hoveredId === 'terminal-box'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 13. LIFTING EYE-BOLT                                      */}
      {/* ========================================================= */}
      <group
        ref={liftingEyeGroupRef}
        position={[0, 1.25, -0.72]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('lifting-eye')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('lifting-eye')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.085, 0.16, 16]} />
          {renderShellMaterial(colors.statorDark, 'lifting-eye')}
        </mesh>
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.16, 0.045, 18, 32]} />
          <meshStandardMaterial
            color="#cbd5e1"
            metalness={0.88}
            roughness={0.22}
            {...getHighlightProps('lifting-eye')}
          />
        </mesh>

        <ComponentLeaderLabel
          component={getComponentById('lifting-eye')}
          anchorPos={[0, 0.45, 0]}
          labelOffset={[0.65, 0.35, 0]}
          isSelected={selectedComponentId === 'lifting-eye'}
          isHovered={hoveredId === 'lifting-eye'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>

      {/* ========================================================= */}
      {/* 14. FASTENERS (Assembly Bolts & Hardware)                 */}
      {/* ========================================================= */}
      <group
        ref={fastenersGroupRef}
        position={[0.1, -0.3, 1.3]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('fasteners')
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHoveredId('fasteners')
        }}
        onPointerOut={() => setHoveredId(null)}
      >
        {boltAngles.map((angle, idx) => {
          const r = 0.45
          const bx = Math.cos(angle) * r
          const by = Math.sin(angle) * r
          return (
            <group key={idx} position={[bx, by, 0]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.08, 6]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  metalness={0.92}
                  roughness={0.16}
                  {...getHighlightProps('fasteners')}
                />
              </mesh>
              <mesh position={[0, 0, -0.04]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.065, 0.065, 0.012, 16]} />
                <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.25} />
              </mesh>
            </group>
          )
        })}

        <ComponentLeaderLabel
          component={getComponentById('fasteners')}
          anchorPos={[0, 0, 0]}
          labelOffset={[0.65, -0.5, 0]}
          isSelected={selectedComponentId === 'fasteners'}
          isHovered={hoveredId === 'fasteners'}
          onSelect={(id) => onSelectComponent?.(id)}
          onHover={(id) => setHoveredId(id)}
          visible={isLabelsVisible}
        />
      </group>
    </group>
  )
}
