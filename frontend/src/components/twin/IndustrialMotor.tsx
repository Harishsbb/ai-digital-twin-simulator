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

  // Photorealistic industrial enamel finishes matching reference image
  const colors = useMemo(() => {
    switch (status) {
      case 'Warning':
        return {
          stator: '#38362b',
          statorDark: '#28261e',
          accent: '#d97706',
          bearingHub: '#2e2c22',
          shaft: '#cbd5e1',
          fanCowl: '#26241c',
          heatGlow: '#f59e0b',
        }
      case 'Critical':
        return {
          stator: '#452227',
          statorDark: '#32171c',
          accent: '#dc2626',
          bearingHub: '#381c20',
          shaft: '#fca5a5',
          fanCowl: '#2f1519',
          heatGlow: '#ef4444',
        }
      case 'Normal':
      default:
        // Metallic sapphire/petrol industrial enamel
        return {
          stator: '#24476b',
          statorDark: '#172f47',
          accent: '#38bdf8',
          bearingHub: '#1c3752',
          shaft: '#f1f5f9',
          fanCowl: '#182d43',
          heatGlow: '#10b981',
        }
    }
  }, [status])

  // 32 High-Density Cast Cooling Fins radiating around the stator body
  const finAngles = useMemo(() => {
    const fins: number[] = []
    const count = 32
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2
      // Clearance for top terminal box and bottom mounting feet
      const distFromTop = Math.abs(angle - Math.PI / 2)
      const distFromBottom = Math.abs(angle - (3 * Math.PI) / 2)
      if (distFromTop > 0.32 && distFromBottom > 0.35) {
        fins.push(angle)
      }
    }
    return fins
  }, [])

  // 6 End-Shield Bolt Angles
  const boltAngles = useMemo(() => {
    return [0, 1, 2, 3, 4, 5].map((i) => (i / 6) * Math.PI * 2)
  }, [])

  // 8 Fan Blades
  const fanBladeAngles = useMemo(() => {
    return [0, 1, 2, 3, 4, 5, 6, 7].map((i) => (i / 8) * Math.PI * 2)
  }, [])

  // 12 Cowl Air-Intake Vent Slots
  const ventAngles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2)
  }, [])

  // Continuous animation loop (shaft spin, fan rotation, vibrations, exploded view lerp)
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime()

    // Shaft & Cooling Fan Rotation
    if (shaftGroupRef.current) {
      const speed = options.autoRotate ? 5.0 * options.rotationSpeed : 1.2
      shaftGroupRef.current.rotation.z += speed * delta
    }
    if (fanGroupRef.current && shaftGroupRef.current) {
      fanGroupRef.current.rotation.z = shaftGroupRef.current.rotation.z
    }

    // Exploded View Transitions
    const explodeT = options.explodedView ? 1 : 0

    if (deShieldRef.current) {
      deShieldRef.current.position.z = THREE.MathUtils.lerp(
        deShieldRef.current.position.z,
        1.18 + explodeT * 0.95,
        0.1
      )
    }
    if (ndeShieldRef.current) {
      ndeShieldRef.current.position.z = THREE.MathUtils.lerp(
        ndeShieldRef.current.position.z,
        -1.18 - explodeT * 0.75,
        0.1
      )
    }
    if (fanCowlRef.current) {
      fanCowlRef.current.position.z = THREE.MathUtils.lerp(
        fanCowlRef.current.position.z,
        -1.35 - explodeT * 1.55,
        0.1
      )
    }
    if (terminalBoxRef.current) {
      terminalBoxRef.current.position.y = THREE.MathUtils.lerp(
        terminalBoxRef.current.position.y,
        1.28 + explodeT * 0.75,
        0.1
      )
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
  })

  const wireframe = options.wireframe

  return (
    <group ref={motorGroupRef} position={[0, 0, 0]}>
      {/* ========================================================= */}
      {/* 1. STATOR HOUSING & DENSE COOLING FINS                    */}
      {/* ========================================================= */}
      <group
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('stator-casing')
        }}
      >
        {/* Main Cast Iron Barrel */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.08, 1.08, 2.26, 48]} />
          <meshPhysicalMaterial
            color={colors.stator}
            roughness={0.34}
            metalness={0.42}
            clearcoat={0.62}
            clearcoatRoughness={0.25}
            reflectivity={0.65}
            wireframe={wireframe}
          />
        </mesh>

        {/* Front & Rear Structural Casting Collar Rings */}
        {[-1.08, 1.08].map((z, idx) => (
          <mesh key={idx} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[1.14, 1.14, 0.1, 48]} />
            <meshPhysicalMaterial
              color={colors.statorDark}
              roughness={0.4}
              metalness={0.5}
              clearcoat={0.4}
              wireframe={wireframe}
            />
          </mesh>
        ))}

        {/* Central Circumferential Reinforcement Rib */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.1, 0.018, 16, 48]} />
          <meshStandardMaterial color={colors.statorDark} metalness={0.5} roughness={0.4} />
        </mesh>

        {/* 32 Thin Cast-Iron Cooling Fins */}
        {finAngles.map((angle, idx) => {
          const radius = 1.12
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          return (
            <group key={idx} position={[x, y, 0]} rotation={[0, 0, angle]}>
              {/* Fin Blade Body */}
              <mesh castShadow receiveShadow>
                <boxGeometry args={[0.22, 0.02, 2.12]} />
                <meshPhysicalMaterial
                  color={colors.stator}
                  roughness={0.32}
                  metalness={0.44}
                  clearcoat={0.65}
                  clearcoatRoughness={0.22}
                  wireframe={wireframe}
                />
              </mesh>
              {/* Subtle Tapered Fin Tip Highlight */}
              <mesh position={[0.11, 0, 0]}>
                <boxGeometry args={[0.015, 0.014, 2.12]} />
                <meshStandardMaterial
                  color="#3a5a7e"
                  roughness={0.25}
                  metalness={0.6}
                  wireframe={wireframe}
                />
              </mesh>
            </group>
          )
        })}

        {/* Heavy Duty Base Mounting Feet */}
        <group position={[0, -1.05, 0]}>
          {/* Left Foot Pad */}
          <group position={[-0.92, -0.14, 0]}>
            {/* Foot Sole Plate */}
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.44, 0.18, 2.05]} />
              <meshPhysicalMaterial
                color={colors.statorDark}
                roughness={0.5}
                metalness={0.52}
                clearcoat={0.3}
                wireframe={wireframe}
              />
            </mesh>
            {/* Webbing Gusset Ribs */}
            {[-0.6, 0.6].map((z, i) => (
              <mesh key={i} position={[0.12, 0.16, z]} rotation={[0, 0, -Math.PI / 6]}>
                <boxGeometry args={[0.06, 0.22, 0.15]} />
                <meshStandardMaterial color={colors.statorDark} roughness={0.5} metalness={0.5} />
              </mesh>
            ))}
            {/* Mounting Bolt Holes & Studs */}
            {[-0.75, 0.75].map((z, i) => (
              <group key={i} position={[-0.04, 0.09, z]}>
                {/* Washer */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <cylinderGeometry args={[0.09, 0.09, 0.015, 16]} />
                  <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.2} />
                </mesh>
                {/* Hex Bolt Head */}
                <mesh position={[0, 0.02, 0]}>
                  <cylinderGeometry args={[0.065, 0.065, 0.04, 6]} />
                  <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.18} />
                </mesh>
              </group>
            ))}
          </group>

          {/* Right Foot Pad */}
          <group position={[0.92, -0.14, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.44, 0.18, 2.05]} />
              <meshPhysicalMaterial
                color={colors.statorDark}
                roughness={0.5}
                metalness={0.52}
                clearcoat={0.3}
                wireframe={wireframe}
              />
            </mesh>
            {/* Webbing Gusset Ribs */}
            {[-0.6, 0.6].map((z, i) => (
              <mesh key={i} position={[-0.12, 0.16, z]} rotation={[0, 0, Math.PI / 6]}>
                <boxGeometry args={[0.06, 0.22, 0.15]} />
                <meshStandardMaterial color={colors.statorDark} roughness={0.5} metalness={0.5} />
              </mesh>
            ))}
            {/* Mounting Bolt Holes & Studs */}
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
        </group>

        {/* Brushed Stainless Steel Rating Nameplate */}
        <group position={[1.15, 0.12, 0.1]} rotation={[0, Math.PI / 2, 0]}>
          {/* Main Metal Plate */}
          <mesh castShadow>
            <planeGeometry args={[0.56, 0.32]} />
            <meshStandardMaterial
              color="#e2e8f0"
              metalness={0.94}
              roughness={0.18}
              side={THREE.DoubleSide}
            />
          </mesh>
          {/* Rating Lines (Laser Engraved Appearance) */}
          {[-0.08, -0.02, 0.04, 0.1].map((y, i) => (
            <mesh key={i} position={[0, y, 0.002]}>
              <planeGeometry args={[0.48, 0.012]} />
              <meshBasicMaterial color="#334155" />
            </mesh>
          ))}
          {/* Corner Rivets */}
          {[
            [-0.24, -0.12],
            [0.24, -0.12],
            [-0.24, 0.12],
            [0.24, 0.12],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0.003]}>
              <cylinderGeometry args={[0.012, 0.012, 0.01, 8]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 2. DRIVE-END (DE) FRONT END-SHIELD & FLANGE               */}
      {/* ========================================================= */}
      <group
        ref={deShieldRef}
        position={[0, 0, 1.18]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('de-bearing')
        }}
      >
        {/* Outer Flange Rim */}
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.13, 1.13, 0.14, 48]} />
          <meshPhysicalMaterial
            color={colors.bearingHub}
            roughness={0.38}
            metalness={0.48}
            clearcoat={0.5}
            wireframe={wireframe}
          />
        </mesh>

        {/* Stepped Conical Bearing Shield */}
        <mesh position={[0, 0, 0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.78, 1.06, 0.18, 48]} />
          <meshPhysicalMaterial
            color={colors.bearingHub}
            roughness={0.35}
            metalness={0.5}
            clearcoat={0.55}
            wireframe={wireframe}
          />
        </mesh>

        {/* Central Machined Hub Boss */}
        <mesh position={[0, 0, 0.24]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.54, 0.62, 0.16, 40]} />
          <meshPhysicalMaterial
            color={colors.statorDark}
            roughness={0.28}
            metalness={0.62}
            clearcoat={0.6}
            wireframe={wireframe}
          />
        </mesh>

        {/* Shaft Oil Seal Retaining Ring */}
        <mesh position={[0, 0, 0.33]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.36, 0.44, 0.06, 32]} />
          <meshStandardMaterial color="#1e293b" roughness={0.85} metalness={0.2} />
        </mesh>

        {/* 6 Peripheral Hex Mounting Bolts */}
        {boltAngles.map((angle, idx) => {
          const r = 0.94
          const bx = Math.cos(angle) * r
          const by = Math.sin(angle) * r
          return (
            <group key={idx} position={[bx, by, 0.1]}>
              <mesh rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[0.045, 0.045, 0.03, 6]} />
                <meshStandardMaterial color="#cbd5e1" metalness={0.92} roughness={0.16} />
              </mesh>
            </group>
          )
        })}

        {/* Grease Zerk Nipple Fitting on top */}
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
      </group>

      {/* ========================================================= */}
      {/* 3. NON-DRIVE-END (NDE) REAR END-SHIELD                    */}
      {/* ========================================================= */}
      <group
        ref={ndeShieldRef}
        position={[0, 0, -1.18]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('nde-bearing')
        }}
      >
        <mesh castShadow receiveShadow rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.13, 1.13, 0.14, 48]} />
          <meshPhysicalMaterial
            color={colors.bearingHub}
            roughness={0.4}
            metalness={0.48}
            wireframe={wireframe}
          />
        </mesh>

        <mesh position={[0, 0, -0.12]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.62, 0.82, 0.16, 40]} />
          <meshPhysicalMaterial
            color={colors.bearingHub}
            roughness={0.38}
            metalness={0.5}
            wireframe={wireframe}
          />
        </mesh>
      </group>

      {/* ========================================================= */}
      {/* 4. PRECISION MACHINED DRIVE SHAFT & ROTOR ASSEMBLY        */}
      {/* ========================================================= */}
      <group
        ref={shaftGroupRef}
        position={[0, 0, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('drive-shaft')
        }}
      >
        {/* Internal Laminated Rotor Core (Visible in Exploded View) */}
        {options.explodedView && (
          <group position={[0, 0, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.66, 0.66, 1.7, 36]} />
              <meshStandardMaterial
                color="#64748b"
                roughness={0.3}
                metalness={0.78}
                wireframe={wireframe}
              />
            </mesh>
            {/* Copper Rotor Squirrel-Cage Bars */}
            {Array.from({ length: 16 }).map((_, i) => {
              const a = (i / 16) * Math.PI * 2
              return (
                <mesh
                  key={i}
                  position={[Math.cos(a) * 0.67, Math.sin(a) * 0.67, 0]}
                  rotation={[0, 0, a]}
                >
                  <boxGeometry args={[0.02, 0.035, 1.7]} />
                  <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
                </mesh>
              )
            })}
          </group>
        )}

        {/* Polished Main Output Drive Shaft */}
        <mesh position={[0, 0, 1.95]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.26, 0.26, 1.45, 40]} />
          <meshStandardMaterial
            color={colors.shaft}
            roughness={0.14}
            metalness={0.96}
            wireframe={wireframe}
          />
        </mesh>

        {/* Precision Chamfered Shaft Tip (Matching Reference Image) */}
        <mesh position={[0, 0, 2.68]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.24, 0.26, 0.04, 40]} />
          <meshStandardMaterial color={colors.shaft} roughness={0.16} metalness={0.95} />
        </mesh>

        {/* Shaft Stepped Collar Shoulder */}
        <mesh position={[0, 0, 1.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.32, 0.32, 0.16, 36]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.92} roughness={0.2} />
        </mesh>

        {/* Milled Keyway Slot & Hardened Key Bar */}
        <group position={[0, 0.255, 2.08]}>
          {/* Keyway Slot Recess */}
          <mesh>
            <boxGeometry args={[0.076, 0.035, 0.68]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.35} />
          </mesh>
          {/* Seated Machine Key */}
          <mesh position={[0, 0.015, 0]}>
            <boxGeometry args={[0.07, 0.03, 0.64]} />
            <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>

        {/* Rear Shaft Stub extending into fan */}
        <mesh position={[0, 0, -1.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 0.6, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.88} roughness={0.2} />
        </mesh>

        {/* Internal Centrifugal Cooling Fan Impeller */}
        <group ref={fanGroupRef} position={[0, 0, -1.55]}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.36, 0.36, 0.18, 24]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.65} roughness={0.3} />
          </mesh>
          {fanBladeAngles.map((angle, idx) => (
            <mesh
              key={idx}
              position={[Math.cos(angle) * 0.62, Math.sin(angle) * 0.62, 0]}
              rotation={[0, 0, angle + 0.38]}
            >
              <boxGeometry args={[0.55, 0.028, 0.19]} />
              <meshStandardMaterial color="#cbd5e1" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ========================================================= */}
      {/* 5. REAR COOLING FAN COWL / SHROUD (Matching Reference)    */}
      {/* ========================================================= */}
      <group
        ref={fanCowlRef}
        position={[0, 0, -1.35]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('cooling-fan')
        }}
      >
        {/* Cowl Cylinder Barrel */}
        <mesh position={[0, 0, -0.42]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[1.13, 1.13, 0.85, 48, 1, true]} />
          <meshPhysicalMaterial
            color={colors.fanCowl}
            roughness={0.42}
            metalness={0.45}
            clearcoat={0.5}
            side={THREE.DoubleSide}
            wireframe={wireframe}
          />
        </mesh>

        {/* Smooth Rounded Rear Dome Bevel */}
        <mesh position={[0, 0, -0.84]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[1.06, 0.07, 16, 48]} />
          <meshPhysicalMaterial
            color={colors.fanCowl}
            roughness={0.38}
            metalness={0.48}
            clearcoat={0.55}
          />
        </mesh>

        {/* Perforated Rear Air Intake Grille */}
        <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[1.05, 1.05, 0.02, 36]} />
          <meshStandardMaterial
            color="#080e18"
            roughness={0.92}
            metalness={0.5}
            wireframe={true}
          />
        </mesh>

        {/* Circumferential Air-Intake Vent Louvers */}
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
      </group>

      {/* ========================================================= */}
      {/* 6. TOP TERMINAL JUNCTION BOX (Refined Industrial Style)   */}
      {/* ========================================================= */}
      <group
        ref={terminalBoxRef}
        position={[0, 1.28, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onSelectComponent?.('terminal-box')
        }}
      >
        {/* Cast Mounting Spacer Riser */}
        <mesh position={[0, -0.12, 0]} castShadow>
          <boxGeometry args={[0.74, 0.22, 0.68]} />
          <meshPhysicalMaterial
            color={colors.statorDark}
            roughness={0.4}
            metalness={0.48}
            clearcoat={0.4}
            wireframe={wireframe}
          />
        </mesh>

        {/* Terminal Box Main Body */}
        <mesh position={[0, 0.16, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.04, 0.42, 0.92]} />
          <meshPhysicalMaterial
            color={colors.stator}
            roughness={0.34}
            metalness={0.44}
            clearcoat={0.62}
            clearcoatRoughness={0.24}
            wireframe={wireframe}
          />
        </mesh>

        {/* Finned / Ribbed Terminal Box Lid */}
        <group position={[0, 0.4, 0]}>
          {/* Lid Base Plate */}
          <mesh castShadow>
            <boxGeometry args={[1.1, 0.07, 0.98]} />
            <meshPhysicalMaterial
              color={colors.statorDark}
              roughness={0.32}
              metalness={0.52}
              clearcoat={0.65}
              wireframe={wireframe}
            />
          </mesh>
          {/* 5 Horizontal Cooling / Strengthening Ribs on Lid */}
          {[-0.32, -0.16, 0, 0.16, 0.32].map((z, idx) => (
            <mesh key={idx} position={[0, 0.05, z]} castShadow>
              <boxGeometry args={[0.96, 0.04, 0.03]} />
              <meshPhysicalMaterial
                color={colors.stator}
                roughness={0.3}
                metalness={0.5}
                clearcoat={0.6}
              />
            </mesh>
          ))}
          {/* 4 Corner Stainless Steel Hex Cap Bolts */}
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

        {/* Machined Brass/Nickel Heavy Duty Cable Gland on Side */}
        <group position={[0.54, 0.16, 0]} rotation={[0, 0, Math.PI / 2]}>
          {/* Hex Locknut Flange */}
          <mesh>
            <cylinderGeometry args={[0.11, 0.11, 0.06, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.24} />
          </mesh>
          {/* Gland Dome Nut */}
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.088, 0.098, 0.09, 6]} />
            <meshStandardMaterial color="#d4af37" metalness={0.85} roughness={0.26} />
          </mesh>
          {/* Neoprene Cable Grommet & Cable Exit */}
          <mesh position={[0, 0.15, 0]}>
            <cylinderGeometry args={[0.052, 0.052, 0.12, 16]} />
            <meshStandardMaterial color="#090e17" roughness={0.9} metalness={0.1} />
          </mesh>
        </group>
      </group>

      {/* ========================================================= */}
      {/* 7. HEAVY-DUTY HOISTING CRANE EYE-BOLT (Matching Ref)      */}
      {/* ========================================================= */}
      <group position={[0, 1.25, -0.72]}>
        {/* Threaded Collar Boss anchored to Stator */}
        <mesh position={[0, 0.08, 0]} castShadow>
          <cylinderGeometry args={[0.07, 0.085, 0.16, 16]} />
          <meshPhysicalMaterial
            color={colors.statorDark}
            roughness={0.35}
            metalness={0.55}
            clearcoat={0.5}
          />
        </mesh>
        {/* Hex Flange Collar */}
        <mesh position={[0, 0.18, 0]}>
          <cylinderGeometry args={[0.075, 0.075, 0.04, 6]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Heavy Forged Steel Toroidal Ring */}
        <mesh position={[0, 0.38, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
          <torusGeometry args={[0.16, 0.045, 18, 32]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.88} roughness={0.22} />
        </mesh>
      </group>
    </group>
  )
}
