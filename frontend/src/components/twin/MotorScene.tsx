import { Suspense, forwardRef, useImperativeHandle, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { IndustrialMotor } from './IndustrialMotor'
import type { TwinViewOptions, TwinVisualStatus } from '../../types'

export interface MotorSceneHandle {
  resetCamera: () => void
}

interface MotorSceneProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  onSelectComponent?: (componentId: string) => void
}

// Camera positioned at 3/4 isometric angle matching the reference image
// (front-left perspective showing shaft, cooling fins, terminal box, and glowing pedestal)
const DEFAULT_CAMERA_POS: [number, number, number] = [-3.8, 2.0, 3.8]
const DEFAULT_TARGET: [number, number, number] = [0, 0.05, 0]

export const MotorScene = forwardRef<MotorSceneHandle, MotorSceneProps>(
  ({ status, options, onSelectComponent }, ref) => {
    const controlsRef = useRef<OrbitControlsImpl>(null)

    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        if (controlsRef.current) {
          controlsRef.current.reset()
          controlsRef.current.object.position.set(...DEFAULT_CAMERA_POS)
          controlsRef.current.target.set(...DEFAULT_TARGET)
          controlsRef.current.update()
        }
      },
    }))

    return (
      <div className="w-full h-full relative overflow-hidden select-none bg-radial from-[#121b2b] via-[#0b111a] to-[#06090e]">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.22,
          }}
          className="w-full h-full"
        >
          <PerspectiveCamera
            makeDefault
            position={DEFAULT_CAMERA_POS}
            fov={40}
            near={0.1}
            far={100}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={2.0}
            maxDistance={10}
            maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera from dipping beneath floor
            autoRotate={options.autoRotate}
            autoRotateSpeed={options.rotationSpeed * 1.5}
            target={DEFAULT_TARGET}
          />

          {/* ========================================================= */}
          {/* Studio HDR Environment for Metallic Reflections          */}
          {/* ========================================================= */}
          <Suspense fallback={null}>
            <Environment preset="studio" />
          </Suspense>

          {/* ========================================================= */}
          {/* Multi-Point High-Fidelity Studio Lighting System          */}
          {/* ========================================================= */}
          {/* Ambient Fill */}
          <ambientLight intensity={1.1} color="#f0f9ff" />

          {/* Key Light from top-left: casts crisp highlights across cooling fins */}
          <directionalLight
            position={[-4.5, 7.5, 5]}
            intensity={2.4}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#ffffff"
          />

          {/* Front Highlight: ensures metallic shaft & front end-shield glisten */}
          <directionalLight
            position={[-2.5, 2.5, 6]}
            intensity={1.6}
            color="#e2f1fd"
          />

          {/* Right-Side Fill Light: illuminates the stator side fins */}
          <directionalLight
            position={[6, 3.5, 1]}
            intensity={1.8}
            color="#93c5fd"
          />

          {/* Rear Rim Light: catches back edges and fan cowl */}
          <directionalLight
            position={[2, 6, -6]}
            intensity={2.2}
            color="#38bdf8"
          />

          {/* Overhead Softbox Light */}
          <directionalLight
            position={[0, 9, 0]}
            intensity={1.2}
            color="#ffffff"
          />

          {/* Glowing Pedestal Floor Glow (Upward Bounce) */}
          <pointLight
            position={[0, -0.9, 0]}
            intensity={1.2}
            distance={5.5}
            color="#38bdf8"
          />

          {/* ========================================================= */}
          {/* Industrial Turntable Pedestal (Matching Visual Reference) */}
          {/* ========================================================= */}
          <group position={[0, -1.22, 0]}>
            {/* Outer Cyan Laser Glow Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
              <ringGeometry args={[2.22, 2.27, 80]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
            </mesh>

            {/* Cyan Floor Aura Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
              <ringGeometry args={[2.08, 2.42, 80]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.22} />
            </mesh>

            {/* Inner Turntable Disc (Heavy Dark Steel Plate) */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
              <cylinderGeometry args={[2.22, 2.24, 0.04, 64]} />
              <meshStandardMaterial
                color="#0c121d"
                roughness={0.45}
                metalness={0.65}
              />
            </mesh>

            {/* Turntable Beveled Edge Trim */}
            <mesh position={[0, -0.02, 0]}>
              <cylinderGeometry args={[2.26, 2.28, 0.04, 64]} />
              <meshStandardMaterial
                color="#172236"
                roughness={0.3}
                metalness={0.8}
              />
            </mesh>
          </group>

          {/* Soft Ground Contact Shadow */}
          <ContactShadows
            position={[0, -1.215, 0]}
            opacity={0.82}
            scale={7.5}
            blur={1.4}
            far={2.5}
            color="#000000"
          />

          {/* 3D Realistic Industrial Electric Motor Mesh */}
          <Suspense fallback={null}>
            <IndustrialMotor
              status={status}
              options={options}
              onSelectComponent={onSelectComponent}
            />
          </Suspense>
        </Canvas>
      </div>
    )
  }
)

MotorScene.displayName = 'MotorScene'
