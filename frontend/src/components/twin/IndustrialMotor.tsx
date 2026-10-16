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

  // Industrial color schemes matching the reference image
  const colors = useMemo(() => {
    switch (status) {
      case 'Warning':
        return {
          stator: '#3b3b4f',
          statorAccent: '#d97706',
          bearingHub: '#b45309',
          shaft: '#cbd5e1',
          fanCowl: '#2d3345',
          beacon: '#f59e0b',
        }
      case 'Critical':
        return {
          stator: '#4a252b',
          statorAccent: '#dc2626',
          bearingHub: '#ef4444',
          shaft: '#fca5a5',
          fanCowl: '#3d1c22',
          beacon: '#ef4444',
        }
      case 'Normal':
      default:
        // Classic industrial motor sapphire/navy enamel finish matching reference
        return {
          stator: '#26425f',
          statorAccent: '#3b82f6',
          bearingHub: '#203952',
          shaft: '#e2e8f0', // Polished stainless steel
          fanCowl: '#1e334a',
          beacon: '#10b981',
        }
    }
  }, [status])

  // Longitudinal cooling fins
  const finAngles = useMemo(() => {
    const fins: number[] = []
    const count = 16
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      // Leave clearance for terminal box and base feet
      if (Math.abs(angle - Math.PI / 2) > 0.38 && Math.abs(angle - (3 * Math.PI) / 2) > 0.38) {
        fins.push(angle)
      }
    }
    return fins
  }, [])

  // Fan blades
  const fanBladeAngles = useMemo(() => {
    const blades: number[] = []
    for (let i = 0; i < 8; i++) {
      blades.push((i / 8) * Math.PI * 2)
    }
    return blades
  }, [])

  // Continuous animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // Smooth shaft & cooling fan rotation
    if (shaftGroupRef.current) {
      const speed = options.autoRotate ? 4.0 * options.rotationSpeed : 0.8
      shaftGroupRef.current.rotation.z += speed * delta
    }
    if (fanGroupRef.current && shaftGroupRef.current) {
      fanGroupRef.current.rotation.z = shaftGroupRef.current.rotation.z
    }

    // Exploded view component translations
    const explodeT = options.explodedView ? 1 : 0

    if (deShieldRef.current) {
      deShieldRef.current.position.z = THREE.MathUtils.lerp(
        deShieldRef.current.position.z,
        1.15 + explodeT * 0.85,
        0.1
      )
    }
    if (ndeShieldRef.current) {
      ndeShieldRef.current.position.z = THREE.MathUtils.lerp(
        ndeShieldRef.current.position.z,
        -1.15 - explodeT * 0.65,
        0.1
      )
    }
    if (fanCowlRef.current) {
      fanCowlRef.current.position.z = THREE.MathUtils.lerp(
        fanCowlRef.current.position.z,
        -1.3 - explodeT * 1.45,
        0.1
      )
    }
    if (terminalBoxRef.current) {
      terminalBoxRef.current.position.y = THREE.MathUtils.lerp(
        terminalBoxRef.current.position.y,
        1.25 + explodeT * 0.65,
        0.1
      )
    }

    // Status vibrations
    if (motorGroupRef.current) {
      if (status === 'Critical') {
        motorGroupRef.current.position.x = Math.sin(time * 60) * 0.012
        motorGroupRef.current.position.y = Math.cos(time * 50) * 0.01
      } else if (status === 'Warning') {
        motorGroupRef.current.position.x = Math.sin(time * 35) * 0.004
        motorGroupRef.current.position.y = Math.cos(time * 30) * 0.003
      } else {
        motorGroupRef.current.position.x = 0
        motorGroupRef.current.position.y = 0
      }
    }
  })

  const wireframe = options.wireframe

  return (
    <group ref={motorGroupRef} position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. STATOR HOUSING & COOLING FINS                          */}
      {/* ========================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('stator-casing')
        }}
      >
        {/* Main Body Cylinder */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.08, 1.08, 2.25, 40]} />
          <meshStandardMaterial
            color={colors.stator}
            roughness={0.4}
            metalness={0.45}
            wireframe={wireframe}
          />
        </mesh>

        {/* Outer Reinforcement Rib Bands */}
        {[-0.75, 0, 0.75].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.09, 0.02, 16, 40]} />
            <meshStandardMaterial
              color="#1a2e45"
              metalness={0.6}
              roughness={0.3}
              wireframe={wireframe}
            />
          </mesh>
        ))}

        {/* Longitudinal Deep Cooling Fins */}
        {finAngles.map((angle, idx) => {
          const x = Math.cos(angle) * 1.11
          const y = Math.sin(angle) * 1.11
          return (
            <mesh
              key={idx}
              position={[x, y, 0]}
              rotation={[0, 0, angle]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[0.22, 0.024, 2.15]} />
              <meshStandardMaterial
                color={colors.stator}
                roughness={0.45}
                metalness={0.4}
                wireframe={wireframe}
              />
            </mesh>
          )
        })}

        {/* Sturdy Heavy-Duty Base Mounting Feet */}
        <group position={[0, -1.02, 0]}>
          {/* Left Foot */}
          <mesh position={[-0.88, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.22, 1.95]} />
            <meshStandardMaterial
              color="#16273a"
              roughness={0.6}
              metalness={0.5}
              wireframe={wireframe}
            />
          </mesh>
          {[-0.7, 0.7].map((z, i) => (
            <mesh key={i} position={[-0.88, -0.02, z]}>
              <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}

          {/* Right Foot */}
          <mesh position={[0.88, -0.15, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.42, 0.22, 1.95]} />
            <meshStandardMaterial
              color="#16273a"
              roughness={0.6}
              metalness={0.5}
              wireframe={wireframe}
            />
          </mesh>
          {[-0.7, 0.7].map((z, i) => (
            <mesh key={i} position={[0.88, -0.02, z]}>
              <cylinderGeometry args={[0.07, 0.07, 0.06, 16]} />
              <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.2} />
            </mesh>
          ))}
        </group>

        {/* Metal Specification Nameplate Plaque */}
        <mesh position={[1.11, 0.1, 0.2]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.48, 0.26]} />
          <meshStandardMaterial
            color="#e2e8f0"
            metalness={0.9}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 2. DRIVE-END (DE) FRONT END-SHIELD                        */}
      {/* ========================================================= */}
      <group
        ref={deShieldRef}
        position={[0, 0, 1.15]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('de-bearing')
        }}
      >
        {/* End-Shield Flange */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.08, 1.07, 0.16, 40]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.45}
            metalness={0.45}
            wireframe={wireframe}
          />
        </mesh>

        {/* Central Bearing Hub Extension */}
        <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.55, 0.68, 0.18, 32]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.35}
            metalness={0.55}
            wireframe={wireframe}
          />
        </mesh>

        {/* Oil Seal Collar */}
        <mesh position={[0, 0, 0.25]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.38, 0.44, 0.06, 24]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 3. NON-DRIVE-END (NDE) REAR END-SHIELD                    */}
      {/* ========================================================= */}
      <group
        ref={ndeShieldRef}
        position={[0, 0, -1.15]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('nde-bearing')
        }}
      >
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.07, 1.08, 0.16, 40]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.45}
            metalness={0.45}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.5, 0.6, 0.16, 32]} />
          <meshStandardMaterial
            color={colors.bearingHub}
            roughness={0.35}
            metalness={0.55}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. DRIVE SHAFT & ROTOR (Polished Stainless Steel)         */}
      {/* ========================================================= */}
      <group
        ref={shaftGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('drive-shaft')
        }}
      >
        {/* Internal Rotor (in exploded view) */}
        {options.explodedView && (
          <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.65, 0.65, 1.65, 28]} />
            <meshStandardMaterial
              color="#94a3b8"
              roughness={0.25}
              metalness={0.8}
              wireframe={wireframe}
            />
          </mesh>
        )}

        {/* Polished Front Output Shaft */}
        <mesh position={[0, 0, 1.82]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.25, 32]} />
          <meshStandardMaterial
            color={colors.shaft}
            roughness={0.15}
            metalness={0.9}
            wireframe={wireframe}
          />
        </mesh>

        {/* Keyway Bar */}
        <mesh position={[0, 0.24, 1.95]}>
          <boxGeometry args={[0.08, 0.06, 0.6]} />
          <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
        </mesh>

        {/* Rear Shaft Stub */}
        <mesh position={[0, 0, -1.4]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.55, 20]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Impeller Cooling Fan Blades */}
        <group ref={fanGroupRef} position={[0, 0, -1.5]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.34, 0.34, 0.18, 20]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.5} roughness={0.3} />
          </mesh>
          {fanBladeAngles.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.58, Math.sin(angle) * 0.58, 0]}
              rotation={[0, 0, angle + 0.35]}
            >
              <boxGeometry args={[0.5, 0.03, 0.18]} />
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
        position={[0, 0, -1.3]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('cooling-fan')
        }}
      >
        {/* Cowl Cylinder Enclosure */}
        <mesh position={[0, 0, -0.35]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.08, 1.08, 0.7, 40, 1, true]} />
          <meshStandardMaterial
            color={colors.fanCowl}
            roughness={0.5}
            metalness={0.4}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>

        {/* Perforated Rear Cowl Grille */}
        <mesh position={[0, 0, -0.7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.06, 1.06, 0.03, 32]} />
          <meshStandardMaterial
            color="#0b131e"
            roughness={0.9}
            metalness={0.5}
            wireframe={true}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 6. TOP TERMINAL JUNCTION BOX                              */}
      {/* ========================================================= */}
      <group
        ref={terminalBoxRef}
        position={[0, 1.25, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('terminal-box')
        }}
      >
        {/* Junction Box Main Base */}
        <mesh position={[0, 0.18, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.44, 0.8]} />
          <meshStandardMaterial
            color={colors.stator}
            roughness={0.4}
            metalness={0.45}
            wireframe={wireframe}
          />
        </mesh>

        {/* Junction Box Top Lid */}
        <mesh position={[0, 0.44, 0]} castShadow>
          <boxGeometry args={[1.02, 0.08, 0.88]} />
          <meshStandardMaterial
            color="#1b324a"
            roughness={0.35}
            metalness={0.5}
            wireframe={wireframe}
          />
        </mesh>

        {/* 4 Corner Hex Screws */}
        {[
          [-0.44, -0.38],
          [0.44, -0.38],
          [-0.44, 0.38],
          [0.44, 0.38],
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 0.5, z]}>
            <cylinderGeometry args={[0.03, 0.03, 0.05, 6]} />
            <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
          </mesh>
        ))}

        {/* Dual Brass Cable Glands on side */}
        {[-0.2, 0.2].map((z, idx) => (
          <group key={idx} position={[0.5, 0.18, z]} rotation={[0, 0, Math.PI / 2]}>
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
      </group>

      {/* ========================================================= */}
      {/* 7. HOISTING CRANE EYE-BOLT                                */}
      {/* ========================================================= */}
      <group position={[0, 1.84, -0.1]}>
        <mesh position={[0, -0.06, 0]}>
          <cylinderGeometry args={[0.05, 0.06, 0.12, 16]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]}>
          <torusGeometry args={[0.13, 0.035, 16, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.85} roughness={0.2} />
        </mesh>
      </group>
    </group>
  )
}
