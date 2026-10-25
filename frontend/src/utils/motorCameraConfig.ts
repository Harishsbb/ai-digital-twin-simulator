/**
 * 3D Industrial Motor Camera & Viewport Framing Configuration
 *
 * Configures the Three.js camera framing to achieve a balanced layout matching
 * the reference UI, reducing the visual size by ~21.4% (target: 20–25%)
 * while keeping the motor perfectly centered and fully visible.
 */

// Camera position for balanced 3/4 perspective (~21.4% visual size reduction)
export const DEFAULT_CAMERA_POS: [number, number, number] = [-4.42, 2.44, 4.42]

// Center target aligned with motor volumetric centroid (y=0.10) to balance top header controls
export const DEFAULT_TARGET: [number, number, number] = [0.05, 0.10, 0.05]

// Field of view in degrees (telephoto-like rendering with minimal perspective distortion)
export const DEFAULT_FOV: number = 38

// Baseline reference prior to reduction
export const BASELINE_CAMERA_POS: [number, number, number] = [-3.45, 1.95, 3.45]
export const BASELINE_TARGET: [number, number, number] = [0.08, 0.08, 0.05]
export const BASELINE_FOV: number = 38

// OrbitControls bounds
export const ORBIT_MIN_DISTANCE = 2.2
export const ORBIT_MAX_DISTANCE = 12.0
export const ORBIT_DAMPING_FACTOR = 0.06

// Floor Contact Shadow parameters
export const SHADOW_SCALE = 8.5
export const SHADOW_OPACITY = 0.32
export const SHADOW_BLUR = 2.0
export const SHADOW_ELEVATION = -1.215

/**
 * Calculates Euclidean distance between 3D camera position and target
 */
export function calculateCameraDistance(
  pos: [number, number, number] = DEFAULT_CAMERA_POS,
  target: [number, number, number] = DEFAULT_TARGET
): number {
  const dx = pos[0] - target[0]
  const dy = pos[1] - target[1]
  const dz = pos[2] - target[2]
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

/**
 * Calculates the visual reduction percentage from baseline camera framing
 */
export function calculateVisualReductionPercentage(): number {
  const baseDist = calculateCameraDistance(BASELINE_CAMERA_POS, BASELINE_TARGET)
  const newDist = calculateCameraDistance(DEFAULT_CAMERA_POS, DEFAULT_TARGET)

  const baseSpan = baseDist * Math.tan((BASELINE_FOV * Math.PI) / 360)
  const newSpan = newDist * Math.tan((DEFAULT_FOV * Math.PI) / 360)

  const scaleFactor = baseSpan / newSpan
  return (1 - scaleFactor) * 100
}
