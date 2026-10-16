import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { TwinViewOptions, TwinVisualStatus } from '../../types'

interface IndustrialMotorProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  onSelectComponent?: (componentId: string) => void
}

export const IndustrialMotor: React.FC<IndustrialMotorProps> = ({
  status,
  options,
  onSelectComponent,
}) => {
  const motorGroupRef = useRef<THREE.Group>(null)
  const shaftGroupRef = useRef<THREE.Group>(null)
  const fanGroupRef = useRef<THREE.Group>(null)
  const deShieldRef = useRef<THREE.Group>(null)
  const ndeShieldRef = useRef<THREE.Group>(null)
  const terminalBoxRef = useRef<THREE.Group>(null)
  const fanCowlRef = useRef<THREE.Group>(null)
  const beaconLightRef = useRef<THREE.PointLight>(null)

  // Color schemes based on machine status
  const colors = useMemo(() => {
    switch (status) {
      case 'Warning':
        return {
          stator: '#475569',
          statorAcc: '#d97706',
          endShield: '#52525b',
          bearingHub: '#b45309',
          beacon: '#f59e0b',
          shaft: '#cbd5e1',
          accent: '#d97706',
          stressGlow: 0.4,
        }
      case 'Critical':
        return {
          stator: '#57534e',
          statorAcc: '#dc2626',
          endShield: '#592020',
          bearingHub: '#ef4444',
          beacon: '#ef4444',
          shaft: '#fca5a5',
          accent: '#ef4444',
          stressGlow: 1.0,
        }
      case 'Normal':
      default:
        return {
          stator: '#334155', // Cast iron slate
          statorAcc: '#0284c7',
          endShield: '#475569',
          bearingHub: '#3b82f6',
          beacon: '#10b981',
          shaft: '#e2e8f0', // Polished steel
          accent: '#0ea5e9',
          stressGlow: 0.0,
        }
    }
  }, [status])

  // Cooling fins array around stator
  const finAngles = useMemo(() => {
    const fins: number[] = []
    const count = 14
    for (let i = 0; i < count; i++) {
      // Leave space at top for terminal box and bottom for mounting feet
      const angle = (i / count) * Math.PI * 2
      if (Math.abs(angle - Math.PI / 2) > 0.4 && Math.abs(angle - (3 * Math.PI) / 2) > 0.4) {
        fins.push(angle)
      }
    }
    return fins
  }, [])

  // Fan blades
  const fanBladeAngles = useMemo(() => {
    const blades: number[] = []
    const count = 8
    for (let i = 0; i < count; i++) {
      blades.push((i / count) * Math.PI * 2)
    }
    return blades
  }, [])

  // Animation frame loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // Shaft & cooling fan rotation
    if (shaftGroupRef.current) {
      const rotationSpeed = options.autoRotate ? 4.5 * options.rotationSpeed : 0.8
      shaftGroupRef.current.rotation.z += rotationSpeed * delta
    }
    if (fanGroupRef.current && shaftGroupRef.current) {
      fanGroupRef.current.rotation.z = shaftGroupRef.current.rotation.z
    }

    // Exploded view component translations (smooth damping)
    const explodeT = options.explodedView ? 1 : 0

    if (deShieldRef.current) {
      deShieldRef.current.position.z = THREE.MathUtils.lerp(
        deShieldRef.current.position.z,
        1.1 + explodeT * 0.8,
        0.1
      )
    }
    if (ndeShieldRef.current) {
      ndeShieldRef.current.position.z = THREE.MathUtils.lerp(
        ndeShieldRef.current.position.z,
        -1.1 - explodeT * 0.6,
        0.1
      )
    }
    if (fanCowlRef.current) {
      fanCowlRef.current.position.z = THREE.MathUtils.lerp(
        fanCowlRef.current.position.z,
        -1.25 - explodeT * 1.4,
        0.1
      )
    }
    if (terminalBoxRef.current) {
      terminalBoxRef.current.position.y = THREE.MathUtils.lerp(
        terminalBoxRef.current.position.y,
        1.25 + explodeT * 0.6,
        0.1
      )
    }

    // Status-driven subtle vibration animation
    if (motorGroupRef.current) {
      if (status === 'Critical') {
        // Severe mechanical wobble
        motorGroupRef.current.position.x = Math.sin(time * 65) * 0.015
        motorGroupRef.current.position.y = Math.cos(time * 55) * 0.012
      } else if (status === 'Warning') {
        // Mild imbalance vibration
        motorGroupRef.current.position.x = Math.sin(time * 40) * 0.005
        motorGroupRef.current.position.y = Math.cos(time * 35) * 0.004
      } else {
        // Nominal smooth baseline
        motorGroupRef.current.position.x = 0
        motorGroupRef.current.position.y = 0
      }
    }

    // Beacon light pulsation
    if (beaconLightRef.current) {
      if (status === 'Critical') {
        beaconLightRef.current.intensity = 2.5 + Math.sin(time * 12) * 1.5
      } else if (status === 'Warning') {
        beaconLightRef.current.intensity = 1.5 + Math.sin(time * 5) * 0.8
      } else {
        beaconLightRef.current.intensity = 1.0 + Math.sin(time * 2) * 0.3
      }
    }
  })

  const wireframe = options.wireframe

  return (
    <group ref={motorGroupRef} dispose={null}>
      {/* ========================================================= */}
      {/* 1. MAIN STATOR CASING (Cast Iron Body)                    */}
      {/* ========================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('stator-casing')
        }}
      >
        {/* Main Cylinder Frame */}
        <mesh castShadow receiveShadow position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 2.15, 36]} />
          <meshStandardMaterial
            color={colors.stator}
            roughness={0.65}
            metalness={0.4}
            wireframe={wireframe}
          />
        </mesh>

        {/* Center Ribbed Reinforcement Rings */}
        {[-0.7, 0, 0.7].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.06, 0.025, 16, 36]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.5}
              metalness={0.5}
              wireframe={wireframe}
            />
          </mesh>
        ))}

        {/* Longitudinal Cooling Fins */}
        {finAngles.map((angle, idx) => {
          const x = Math.cos(angle) * 1.08
          const y = Math.sin(angle) * 1.08
          return (
            <mesh
              key={idx}
              position={[x, y, 0]}
              rotation={[0, 0, angle]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.025, 2.05]} />
              <meshStandardMaterial
                color={colors.stator}
                roughness={0.7}
                metalness={0.35}
                wireframe={wireframe}
              />
            </mesh>
          )
        })}

        {/* Heavy-Duty Base Mounting Feet */}
        <group position={[0, -0.98, 0]}>
          {/* Left Foot */}
          <mesh position={[-0.85, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.22, 1.9]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.8}
              metalness={0.3}
              wireframe={wireframe}
            />
          </mesh>
          {/* Left Foot Bolt Holes / Spacers */}
          {[-0.65, 0.65].map((z, i) => (
            <mesh key={i} position={[-0.85, -0.02, z]}>
              <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}

          {/* Right Foot */}
          <mesh position={[0.85, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.45, 0.22, 1.9]} />
            <meshStandardMaterial
              color="#1e293b"
              roughness={0.8}
              metalness={0.3}
              wireframe={wireframe}
            />
          </mesh>
          {/* Right Foot Bolt Holes / Spacers */}
          {[-0.65, 0.65].map((z, i) => (
            <mesh key={i} position={[0.85, -0.02, z]}>
              <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Metallic Nameplate Plaque */}
        <mesh position={[1.065, 0.1, 0.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.45, 0.24]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.85}
            roughness={0.2}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. DRIVE-END (DE) FRONT END-SHIELD & BEARING HOUSING      */}
      {/* ========================================================= */}
      <group
        ref={deShieldRef}
        position={[0, 0, 1.1]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('de-bearing')
        }}
      >
        {/* End-Shield Chamfered Plate */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.06, 1.05, 0.15, 36]} />
          <meshStandardMaterial
            color={colors.endShield}
            roughness={0.6}
            metalness={0.4}
            wireframe={wireframe}
          />
        </mesh>

        {/* Bearing Hub Snout */}
        <mesh position={[0, 0, 0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.65, 0.16, 28]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.4}
            metalness={0.6}
            wireframe={wireframe}
          />
        </mesh>

        {/* Seal Retainer Flange */}
        <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.45, 0.06, 24]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.8}
            metalness={0.2}
            wireframe={wireframe}
          />
        </mesh>

        {/* DE Vibration Sensor Probe Marker */}
        <group position={[0.42, 0.42, 0.12]}>
          <mesh rotation={[0.5, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 3. NON-DRIVE-END (NDE) REAR END-SHIELD                    */}
      {/* ========================================================= */}
      <group
        ref={ndeShieldRef}
        position={[0, 0, -1.1]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('nde-bearing')
        }}
      >
        {/* Rear Shield Flange */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.06, 0.15, 36]} />
          <meshStandardMaterial
            color={colors.endShield}
            roughness={0.6}
            metalness={0.4}
            wireframe={wireframe}
          />
        </mesh>

        {/* Rear Bearing Hub */}
        <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.58, 0.14, 28]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.4}
            metalness={0.6}
            wireframe={wireframe}
          />
        </mesh>

        {/* NDE Vibration Sensor Probe Marker */}
        <group position={[-0.42, 0.42, -0.12]}>
          <mesh rotation={[-0.5, 0.5, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.12, 12]} />
            <meshStandardMaterial
              color="#0284c7"
              emissive="#0284c7"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 4. DRIVE SHAFT (Polished Steel Rotor Extension)           */}
      {/* ========================================================= */}
      <group
        ref={shaftGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('drive-shaft')
        }}
      >
        {/* Internal Rotor Core (visible in exploded view) */}
        {options.explodedView && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.62, 0.62, 1.6, 24]} />
            <meshStandardMaterial
              color="#94a3b8"
              roughness={0.3}
              metalness={0.8}
              wireframe={wireframe}
            />
          </mesh>
        )}

        {/* Output Shaft (Front Extension) */}
        <mesh position={[0, 0, 1.75]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 1.2, 28]} />
          <meshStandardMaterial
            color={colors.shaft}
            roughness={0.2}
            metalness={0.88}
            wireframe={wireframe}
          />
        </mesh>

        {/* Drive Keyway Slot */}
        <mesh position={[0, 0.22, 1.9]}>
          <boxGeometry args={[0.08, 0.06, 0.55]} />
          <meshStandardMaterial color="#334155" metalness={0.7} roughness={0.4} />
        </mesh>

        {/* Rear Shaft Stub for Fan Mount */}
        <mesh position={[0, 0, -1.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.18, 0.18, 0.55, 20]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Cooling Fan Impeller (Attached to Shaft) */}
        <group ref={fanGroupRef} position={[0, 0, -1.45]}>
          {/* Fan Hub */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.32, 0.32, 0.18, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.4} />
          </mesh>
          {/* Fan Blades */}
          {fanBladeAngles.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.55, Math.sin(angle) * 0.55, 0]}
              rotation={[0, 0, angle + 0.35]}
            >
              <boxGeometry args={[0.48, 0.03, 0.16]} />
              <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.3} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. REAR COOLING FAN COWL / SHROUD                         */}
      {/* ========================================================= */}
      <group
        ref={fanCowlRef}
        position={[0, 0, -1.25]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('cooling-fan')
        }}
      >
        {/* Cowl Protective Outer Shroud */}
        <mesh position={[0, 0, -0.32]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.06, 1.06, 0.65, 36, 1, true]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.7}
            metalness={0.3}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>

        {/* Rear Perforated Grille Mesh */}
        <mesh position={[0, 0, -0.65]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.04, 1.04, 0.03, 32]} />
          <meshStandardMaterial
            color="#0f172a"
            roughness={0.9}
            metalness={0.4}
            wireframe={true}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. TOP TERMINAL JUNCTION BOX & CABLE GLANDS               */}
      {/* ========================================================= */}
      <group
        ref={terminalBoxRef}
        position={[0, 1.25, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('terminal-box')
        }}
      >
        {/* Terminal Enclosure Base Box */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.9, 0.42, 0.75]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.6}
            metalness={0.4}
            wireframe={wireframe}
          />
        </mesh>

        {/* Terminal Top Lid */}
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.96, 0.08, 0.82]} />
          <meshStandardMaterial
            color="#334155"
            roughness={0.5}
            metalness={0.5}
            wireframe={wireframe}
          />
        </mesh>

        {/* Corner Hex Bolts on Lid */}
        {[
          [-0.42, -0.35],
          [0.42, -0.35],
          [-0.42, 0.35],
          [0.42, 0.35],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 0.48, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.05, 6]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.3} />
          </mesh>
        ))}

        {/* Industrial Cable Entry Glands (Side) */}
        {[-0.18, 0.18].map((z, idx) => (
          <group key={idx} position={[0.48, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
            <mesh>
              <cylinderGeometry args={[0.08, 0.09, 0.16, 16]} />
              <meshStandardMaterial color="#eab308" metalness={0.8} roughness={0.25} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <cylinderGeometry args={[0.05, 0.05, 0.12, 16]} />
              <meshStandardMaterial color="#0f172a" roughness={0.9} />
            </mesh>
          </group>
        ))}

        {/* Status Indicator Beacon / Light */}
        <group position={[0, 0.54, 0]}>
          <mesh>
            <cylinderGeometry args={[0.07, 0.07, 0.14, 16]} />
            <meshStandardMaterial
              color={colors.beacon}
              emissive={colors.beacon}
              emissiveIntensity={1.2}
              roughness={0.1}
            />
          </mesh>
          <pointLight
            ref={beaconLightRef}
            color={colors.beacon}
            intensity={1.5}
            distance={4.0}
            decay={2}
          />
        </group>
      </group>

      {/* ========================================================= */}
      {/* 7. HOISTING CRANE EYE-BOLT                                */}
      {/* ========================================================= */}
      <group position={[0, 1.82, -0.15]}>
        {/* Post */}
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* Ring */}
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.12, 0.035, 16, 24]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}
