import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  calculateAngularVelocity,
  calculateThermalFactor,
  calculateVibrationAmplitude,
  calculateVibrationDisplacement,
  evaluateMachineStatusFromSensors,
  getThermalEmissiveProperties,
  RPM_VISUAL_SCALE,
  VIB_MAX_AMPLITUDE,
  VIB_MIN_AMPLITUDE,
} from '../utils/motorTelemetryMath.ts'

describe('Motor Telemetry Math & Physics Conversions (Step 6)', () => {
  describe('RPM to Angular Velocity Conversion', () => {
    it('returns zero angular velocity when motor is stopped or paused', () => {
      assert.strictEqual(calculateAngularVelocity(1488, false), 0)
      assert.strictEqual(calculateAngularVelocity(0, true), 0)
      assert.strictEqual(calculateAngularVelocity(-100, true), 0)
      assert.strictEqual(calculateAngularVelocity(Number.NaN, true), 0)
    })

    it('calculates frame-rate independent angular velocity proportional to RPM', () => {
      const omegaLow = calculateAngularVelocity(750, true)
      const omegaNominal = calculateAngularVelocity(1488, true)
      const omegaHigh = calculateAngularVelocity(1800, true)

      // Expected omega = (rpm / 60) * 2 * PI * scale
      const expectedNominal = (1488 / 60) * 2 * Math.PI * RPM_VISUAL_SCALE
      assert.ok(Math.abs(omegaNominal - expectedNominal) < 0.001)

      // Monotonically increasing with RPM
      assert.ok(omegaLow < omegaNominal)
      assert.ok(omegaNominal < omegaHigh)
    })
  })

  describe('Vibration Amplitude & Harmonic Displacement', () => {
    it('returns zero amplitude when motor is not running or vibration is zero', () => {
      assert.strictEqual(calculateVibrationAmplitude(5.0, false), 0)
      assert.strictEqual(calculateVibrationAmplitude(0, true), 0)
      assert.strictEqual(calculateVibrationAmplitude(-2.5, true), 0)
    })

    it('calculates subtle amplitude in normal zone and higher amplitude in fault zone', () => {
      const normalAmp = calculateVibrationAmplitude(1.8, true) // Zone A/B
      const alertAmp = calculateVibrationAmplitude(4.5, true)  // Zone C
      const faultAmp = calculateVibrationAmplitude(8.2, true)  // Zone D

      assert.ok(normalAmp >= VIB_MIN_AMPLITUDE)
      assert.ok(alertAmp > normalAmp)
      assert.ok(faultAmp > alertAmp)
      assert.ok(faultAmp <= VIB_MAX_AMPLITUDE)
    })

    it('strictly clamps excessive vibration to prevent physical motor distortion', () => {
      const extremeAmp = calculateVibrationAmplitude(50.0, true)
      assert.strictEqual(extremeAmp, VIB_MAX_AMPLITUDE)
    })

    it('computes harmonic 2D displacement without erratic jumping', () => {
      const zeroDisp = calculateVibrationDisplacement(0, 1.0)
      assert.deepStrictEqual(zeroDisp, { x: 0, y: 0 })

      const d1 = calculateVibrationDisplacement(0.01, 0.5)
      const d2 = calculateVibrationDisplacement(0.01, 0.51)

      // Displacements are finite and bounded
      assert.ok(Number.isFinite(d1.x) && Number.isFinite(d1.y))
      assert.ok(Math.abs(d1.x) <= 0.015)
      assert.ok(Math.abs(d1.y) <= 0.015)

      // Smooth continuity across small time steps
      assert.ok(Math.abs(d1.x - d2.x) < 0.01)
      assert.ok(Math.abs(d1.y - d2.y) < 0.01)
    })
  })

  describe('Temperature Heatmap & Emissive Mapping', () => {
    it('preserves pristine materials at nominal baseline temperatures (<= 74°C)', () => {
      const nominalProps = getThermalEmissiveProperties(68.0)
      assert.strictEqual(nominalProps.isOverheating, false)
      assert.strictEqual(nominalProps.emissiveColor, '#000000')
      assert.strictEqual(nominalProps.emissiveIntensity, 0)

      const limitProps = getThermalEmissiveProperties(74.0)
      assert.strictEqual(limitProps.isOverheating, false)
      assert.strictEqual(limitProps.emissiveIntensity, 0)
    })

    it('generates amber emissive glow for warm operating temperatures (75°C - 90°C)', () => {
      const warmProps = getThermalEmissiveProperties(82.0)
      assert.strictEqual(warmProps.isOverheating, true)
      assert.strictEqual(warmProps.emissiveColor, '#f59e0b')
      assert.ok(warmProps.emissiveIntensity >= 0.12 && warmProps.emissiveIntensity <= 0.42)
    })

    it('generates hot orange emissive glow for elevated temperatures (92°C - 110°C)', () => {
      const elevatedProps = getThermalEmissiveProperties(98.0)
      assert.strictEqual(elevatedProps.isOverheating, true)
      assert.strictEqual(elevatedProps.emissiveColor, '#ea580c')
      assert.ok(elevatedProps.emissiveIntensity >= 0.42 && elevatedProps.emissiveIntensity <= 0.70)
    })

    it('generates radiant alert red emissive glow for critical temperatures (> 110°C)', () => {
      const critProps = getThermalEmissiveProperties(118.0)
      assert.strictEqual(critProps.isOverheating, true)
      assert.strictEqual(critProps.emissiveColor, '#dc2626')
      assert.ok(critProps.emissiveIntensity >= 0.70 && critProps.emissiveIntensity <= 0.95)
    })

    it('calculates normalized thermal factor from 0.0 to 1.0', () => {
      assert.strictEqual(calculateThermalFactor(60), 0)
      assert.strictEqual(calculateThermalFactor(68), 0)
      assert.strictEqual(calculateThermalFactor(110), 1.0)
      assert.ok(calculateThermalFactor(89) > 0.4 && calculateThermalFactor(89) < 0.6)
    })
  })

  describe('Machine Status Evaluation from Telemetry', () => {
    it('evaluates normal operating state', () => {
      const status = evaluateMachineStatusFromSensors(70.0, 1.8, 1488)
      assert.strictEqual(status, 'Normal')
    })

    it('evaluates warning operating state on elevated parameters', () => {
      assert.strictEqual(evaluateMachineStatusFromSensors(85.0, 2.0, 1488), 'Warning')
      assert.strictEqual(evaluateMachineStatusFromSensors(70.0, 4.2, 1488), 'Warning')
      assert.strictEqual(evaluateMachineStatusFromSensors(70.0, 1.8, 1350), 'Warning')
    })

    it('evaluates critical operating state on severe faults', () => {
      assert.strictEqual(evaluateMachineStatusFromSensors(112.0, 1.8, 1488), 'Critical')
      assert.strictEqual(evaluateMachineStatusFromSensors(70.0, 8.5, 1488), 'Critical')
      assert.strictEqual(evaluateMachineStatusFromSensors(70.0, 1.8, 1100), 'Critical')
    })
  })
})
