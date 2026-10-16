import { Suspense, forwardRef, useImperativeHandle, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows } from '@react-three/drei'
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

const DEFAULT_CAMERA_POS: [number, number, number] = [3.8, 2.4, 4.2]
const DEFAULT_TARGET: [number, number, number] = [0, 0.1, 0]

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
      <div className="w-full h-full relative overflow-hidden select-none bg-gradient-to-b from-[#111927] via-[#0d1422] to-[#080d16]">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          <PerspectiveCamera
            makeDefault
            position={DEFAULT_CAMERA_POS}
            fov={44}
            near={0.1}
            far={100}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={0.06}
            minDistance={2.2}
            maxDistance={12}
            maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera from dipping beneath floor
            autoRotate={options.autoRotate}
            autoRotateSpeed={options.rotationSpeed * 1.5}
            target={DEFAULT_TARGET}
          />

          {/* =================================================== */}
          {/* Studio Lighting System matching visual reference    */}
          {/* =================================================== */}
          <ambientLight intensity={0.9} color="#e0f2fe" />

          {/* Key directional light for specularity on fins */}
          <directionalLight
            position={[5, 8, 6]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
            color="#ffffff"
          />

          {/* Fill Light (Soft Cool Cyan/Blue) */}
          <directionalLight position={[-6, 4, -4]} intensity={0.9} color="#38bdf8" />

          {/* Rim Light from behind for edge definition */}
          <directionalLight position={[0, 6, -6]} intensity={1.2} color="#93c5fd" />

          {/* Glowing Pedestal Turntable Ring (from visual reference) */}
          <group position={[0, -1.22, 0]}>
            {/* Outer Circular Glow Ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[2.2, 2.25, 64]} />
              <meshBasicMaterial color="#38bdf8" transparent opacity={0.8} />
            </mesh>
            {/* Soft Cyan Turntable Aura */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.005, 0]}>
              <ringGeometry args={[2.1, 2.35, 64]} />
              <meshBasicMaterial color="#0284c7" transparent opacity={0.25} />
            </mesh>
            {/* Inner Turntable Disc */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
              <circleGeometry args={[2.2, 64]} />
              <meshStandardMaterial
                color="#0c121e"
                roughness={0.7}
                metalness={0.4}
              />
            </mesh>
          </group>

          {/* Floor Soft Contact Shadow */}
          <ContactShadows
            position={[0, -1.21, 0]}
            opacity={0.75}
            scale={8.5}
            blur={1.6}
            far={3.0}
            color="#000000"
          />

          {/* 3D Electric Motor Mesh */}
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
