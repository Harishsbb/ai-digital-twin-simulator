import { Suspense, forwardRef, useImperativeHandle, useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { IndustrialMotor } from './IndustrialMotor'
import type { LiveMotorTelemetry, TwinViewOptions, TwinVisualStatus } from '../../types'
import {
  DEFAULT_CAMERA_POS,
  DEFAULT_TARGET,
  DEFAULT_FOV,
  ORBIT_MIN_DISTANCE,
  ORBIT_MAX_DISTANCE,
  ORBIT_DAMPING_FACTOR,
  SHADOW_SCALE,
  SHADOW_OPACITY,
  SHADOW_BLUR,
  SHADOW_ELEVATION,
} from '../../utils/motorCameraConfig'

export { DEFAULT_CAMERA_POS, DEFAULT_TARGET, DEFAULT_FOV }

export interface MotorSceneHandle {
  resetCamera: () => void
}

interface MotorSceneProps {
  status: TwinVisualStatus
  options: TwinViewOptions
  selectedComponentId: string | null
  onSelectComponent?: (componentId: string) => void
  liveTelemetry?: LiveMotorTelemetry | null
}

export const MotorScene = forwardRef<MotorSceneHandle, MotorSceneProps>(
  ({ status, options, selectedComponentId, onSelectComponent, liveTelemetry }, ref) => {
    const controlsRef = useRef<OrbitControlsImpl>(null)

    useImperativeHandle(ref, () => ({
      resetCamera: () => {
        if (controlsRef.current) {
          controlsRef.current.target.set(...DEFAULT_TARGET)
          controlsRef.current.object.position.set(...DEFAULT_CAMERA_POS)
          controlsRef.current.update()
        }
      },
    }))

    return (
      <div className="w-full h-full relative overflow-hidden select-none bg-gradient-to-b from-[#EAEFF7] via-[#F4F7FB] to-[#FFFFFF]">
        <Canvas
          shadows
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            toneMappingExposure: 1.05,
            localClippingEnabled: true,
          }}
          className="w-full h-full"
        >
          <PerspectiveCamera
            makeDefault
            position={DEFAULT_CAMERA_POS}
            fov={DEFAULT_FOV}
            near={0.1}
            far={100}
          />

          <OrbitControls
            ref={controlsRef}
            makeDefault
            enableDamping
            dampingFactor={ORBIT_DAMPING_FACTOR}
            minDistance={ORBIT_MIN_DISTANCE}
            maxDistance={ORBIT_MAX_DISTANCE}
            maxPolarAngle={Math.PI / 2 + 0.02} // Prevent camera from dipping beneath floor
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
          {/* Crisp Daylight Studio Lighting System                     */}
          {/* ========================================================= */}
          {/* Soft Daylight Ambient Fill */}
          <ambientLight intensity={1.35} color="#f8fafc" />

          {/* Key Light from top-left */}
          <directionalLight
            position={[-4.5, 8.5, 5.5]}
            intensity={2.2}
            castShadow
            shadow-mapSize={[2048, 2048]}
            shadow-bias={-0.0001}
            color="#ffffff"
          />

          {/* Front Highlight: highlights metallic shaft, bearings & end-shield */}
          <directionalLight
            position={[-2.5, 2.5, 6]}
            intensity={1.2}
            color="#f1f5f9"
          />

          {/* Right-Side Soft Fill Light */}
          <directionalLight
            position={[6, 4, 1]}
            intensity={1.1}
            color="#e2e8f0"
          />

          {/* Rear Rim Light for fin edge definition */}
          <directionalLight
            position={[2, 6, -6]}
            intensity={1.4}
            color="#cbd5e1"
          />

          {/* Overhead Softbox Light */}
          <directionalLight
            position={[0, 9, 0]}
            intensity={1.0}
            color="#ffffff"
          />

          {/* Clean Studio Floor Shadow */}
          <ContactShadows
            position={[0, SHADOW_ELEVATION, 0]}
            opacity={SHADOW_OPACITY}
            scale={SHADOW_SCALE}
            blur={SHADOW_BLUR}
            far={2.5}
            color="#334155"
          />

          {/* 3D Realistic Industrial Electric Motor Mesh */}
          <Suspense fallback={null}>
            <IndustrialMotor
              status={status}
              options={options}
              selectedComponentId={selectedComponentId}
              onSelectComponent={onSelectComponent}
              liveTelemetry={liveTelemetry}
            />
          </Suspense>
        </Canvas>
      </div>
    )
  }
)

MotorScene.displayName = 'MotorScene'
