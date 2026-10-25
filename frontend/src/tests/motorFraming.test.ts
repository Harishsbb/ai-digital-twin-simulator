import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  DEFAULT_CAMERA_POS,
  DEFAULT_TARGET,
  DEFAULT_FOV,
  BASELINE_CAMERA_POS,
  BASELINE_TARGET,
  BASELINE_FOV,
  ORBIT_MIN_DISTANCE,
  ORBIT_MAX_DISTANCE,
  calculateCameraDistance,
  calculateVisualReductionPercentage,
} from '../utils/motorCameraConfig.ts'

describe('Digital Twin 3D Motor Framing & Sizing (Camera Geometry)', () => {
  const calculateDistance = calculateCameraDistance

  it('reduces motor visual size by approximately 20% to 25% from baseline', () => {
    const reductionPercentage = calculateVisualReductionPercentage()

    // Must be between 20% and 25%
    assert.ok(
      reductionPercentage >= 20.0 && reductionPercentage <= 25.0,
      `Expected visual size reduction between 20% and 25%, but got ${reductionPercentage.toFixed(2)}%`
    )
  })

  it('keeps the motor perfectly centered with balanced 3/4 perspective', () => {
    // Symmetrical X and Z camera offsets preserve balanced front-left perspective
    const dx = Math.abs(DEFAULT_CAMERA_POS[0] - DEFAULT_TARGET[0])
    const dz = Math.abs(DEFAULT_CAMERA_POS[2] - DEFAULT_TARGET[2])

    // Symmetrical offset check (less than 3% delta between horizontal axes)
    const symmetryRatio = Math.abs(dx - dz) / dx
    assert.ok(symmetryRatio < 0.03, 'Camera should maintain balanced isometric 3/4 symmetry')

    // Elevation angle check: should be between 18 and 23 degrees for natural inspection
    const horizontalDistance = Math.sqrt(dx * dx + dz * dz)
    const dy = DEFAULT_CAMERA_POS[1] - DEFAULT_TARGET[1]
    const elevationAngleDeg = (Math.atan2(dy, horizontalDistance) * 180) / Math.PI

    assert.ok(
      elevationAngleDeg >= 18 && elevationAngleDeg <= 23,
      `Expected elevation angle between 18° and 23°, but got ${elevationAngleDeg.toFixed(1)}°`
    )
  })

  it('centers camera target at the motor physical volumetric centroid', () => {
    // Mounting feet sit at y = -1.20, terminal box top sits at y = 1.40
    // Midpoint is y ~ 0.10. Target Y must be slightly elevated to counterbalance top UI header controls
    assert.strictEqual(DEFAULT_TARGET[0], 0.05)
    assert.strictEqual(DEFAULT_TARGET[1], 0.10)
    assert.strictEqual(DEFAULT_TARGET[2], 0.05)
  })

  it('ensures camera frustum fully encloses assembled motor dimensions with safety margins', () => {
    // Assembled motor dimensions: height ~ 2.85, length ~ 4.6, width ~ 2.3
    const distance = calculateDistance(DEFAULT_CAMERA_POS, DEFAULT_TARGET)
    const verticalSpan = 2 * distance * Math.tan(((DEFAULT_FOV / 2) * Math.PI) / 180)
    const horizontalSpan = verticalSpan * (16 / 10) // Standard card aspect ratio

    const assembledHeight = 2.85
    const assembledDiagonalWidth = Math.sqrt(2.3 * 2.3 + 4.6 * 4.6) * 0.707 // Projected width at 45 deg

    // Frustum span must exceed object dimensions by at least 25% margin
    assert.ok(
      verticalSpan >= assembledHeight * 1.25,
      `Vertical frustum (${verticalSpan.toFixed(2)}) must comfortably contain assembled height (${assembledHeight})`
    )
    assert.ok(
      horizontalSpan >= assembledDiagonalWidth * 1.25,
      `Horizontal frustum (${horizontalSpan.toFixed(2)}) must comfortably contain projected width (${assembledDiagonalWidth.toFixed(2)})`
    )
  })

  it('ensures camera frustum encloses exploded view separation without clipping', () => {
    // In exploded view: components separate along Z axis to span ~ 5.45 units, and Y to ~ 3.1 units
    const distance = calculateDistance(DEFAULT_CAMERA_POS, DEFAULT_TARGET)
    const verticalSpan = 2 * distance * Math.tan(((DEFAULT_FOV / 2) * Math.PI) / 180)
    const horizontalSpan = verticalSpan * (16 / 10)

    const explodedHeight = 3.10
    const explodedLength = 5.45

    assert.ok(
      verticalSpan > explodedHeight * 1.15,
      `Vertical frustum (${verticalSpan.toFixed(2)}) must contain exploded height (${explodedHeight})`
    )
    assert.ok(
      horizontalSpan > explodedLength * 1.10,
      `Horizontal frustum (${horizontalSpan.toFixed(2)}) must contain exploded length (${explodedLength})`
    )
  })

  it('validates orbit controls min and max zoom distance constraints', () => {
    const currentDistance = calculateDistance(DEFAULT_CAMERA_POS, DEFAULT_TARGET)

    // Current camera distance should reside comfortably between min and max bounds
    assert.ok(ORBIT_MIN_DISTANCE < currentDistance, 'Min distance must allow zoom in')
    assert.ok(ORBIT_MAX_DISTANCE > currentDistance, 'Max distance must allow zoom out')
    assert.ok(ORBIT_MIN_DISTANCE >= 2.0, 'Min distance must prevent camera passing through motor mesh')
    assert.ok(ORBIT_MAX_DISTANCE <= 15.0, 'Max distance must keep motor recognizable')
  })

  it('validates baseline reference parameters consistency', () => {
    const baseDist = calculateDistance(BASELINE_CAMERA_POS, BASELINE_TARGET)
    assert.ok(baseDist > 5.0 && baseDist < 5.5, `Baseline distance should be ~5.25, got ${baseDist.toFixed(2)}`)
    assert.strictEqual(BASELINE_FOV, 38)
  })
})
