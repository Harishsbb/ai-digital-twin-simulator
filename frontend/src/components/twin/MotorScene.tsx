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

const DEFAULT_CAMERA_POS: [number, number, number] = [3.8, 2.6, 4.2]
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
      <div className="w-full h-full relative overflow-hidden select-none bg-gradient-to-b from-[#fbfaf6] via-[#f7f6f1] to-[#edebe3]">
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
            fov={45}
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
            maxPolarAngle={Math.PI / 2 + 0.05} // Prevent camera from going beneath floor
            autoRotate={options.autoRotate}
            autoRotateSpeed={options.rotationSpeed * 1.5}
            target={DEFAULT_TARGET}
          />

          {/* =================================================== */}
          {/* Studio Lighting System                              */}
          {/* =================================================== */}
          <ambientLight intensity={0.8} />

          {/* Key Light */}
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />

          {/* Fill Light (Soft Cool Blue) */}
          <directionalLight position={[-6, 4, -4]} intensity={0.7} color="#e0f2fe" />

          {/* Top Rim Light */}
          <directionalLight position={[0, 7, -5]} intensity={0.5} color="#fef08a" />

          {/* Ground Soft Contact Shadow */}
          <ContactShadows
            position={[0, -1.21, 0]}
            opacity={0.65}
            scale={10}
            blur={1.8}
            far={3.5}
          />

          {/* Floor Reference Grid Ring */}
          <mesh position={[0, -1.22, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.8, 3.4, 48]} />
            <meshBasicMaterial color="#d6d3d1" transparent opacity={0.35} />
          </mesh>

          {/* 3D Electric Motor Asset */}
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
