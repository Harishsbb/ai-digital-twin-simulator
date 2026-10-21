/**
 * Motor Telemetry Visualization Mathematics & Physics Formulas
 * 
 * Provides frame-rate independent conversions for:
 * 1. RPM -> Angular Velocity (rad/s) with calibrated 60fps visual anti-aliasing.
 * 2. Vibration (mm/s ISO 10816) -> Bounded harmonic displacement (x, y).
 * 3. Temperature (°C) -> Thermal intensity factor & emissive color mapping.
 * 4. Machine Status evaluation from live sensor thresholds.
 */

import * as THREE from 'three'
import type { TwinVisualStatus } from '../types'

/**
 * Visual scaling factor for RPM rotation in real-time WebGL.
 * At 1488 RPM (24.8 rev/s = 155.8 rad/s), direct unscaled rotation causes severe
 * temporal aliasing (wagon-wheel illusion) at 60Hz display refresh rates.
 * A 0.22 scale maps 1488 RPM to ~34.3 rad/s (approx 5.4 rev/s), preserving
 * true proportional speed relationships while remaining visually smooth.
 */
export const RPM_VISUAL_SCALE = 0.22

/**
 * Calculate angular velocity in radians per second from motor RPM.
 * @param rpm Mechanical revolutions per minute (e.g. 0 to 1800)
 * @param isRunning Motor operational state
 * @returns Angular velocity (rad/s)
 */
export function calculateAngularVelocity(rpm: number, isRunning = true): number {
  if (!isRunning || !Number.isFinite(rpm) || rpm <= 0) {
    return 0
  }
  const actualRadPerSec = (rpm / 60) * 2 * Math.PI
  return actualRadPerSec * RPM_VISUAL_SCALE
}

/**
 * Vibration amplitude mapping based on ISO 10816-3 guidelines:
 * - Zone A/B (Normal / Good): 0.5 - 2.8 mm/s -> subtle micro-displacement (0.001 - 0.003)
 * - Zone C (Alert / Degradation): 2.8 - 7.1 mm/s -> noticeable vibration (0.004 - 0.009)
 * - Zone D (Critical / Failure): > 7.1 mm/s -> high amplitude vibration (capped at 0.016 max)
 */
export const VIB_MIN_AMPLITUDE = 0.0008
export const VIB_MAX_AMPLITUDE = 0.016

export function calculateVibrationAmplitude(vibrationMmPerSec: number, isRunning = true): number {
  if (!isRunning || !Number.isFinite(vibrationMmPerSec) || vibrationMmPerSec <= 0) {
    return 0
  }
  // Linear interpolation with baseline offset
  const normalized = (vibrationMmPerSec - 1.0) / (9.0 - 1.0)
  const clampedNorm = Math.max(0, Math.min(normalized, 1.25))
  const amplitude = VIB_MIN_AMPLITUDE + clampedNorm * (VIB_MAX_AMPLITUDE - VIB_MIN_AMPLITUDE)
  return Math.min(amplitude, VIB_MAX_AMPLITUDE)
}

/**
 * Calculate harmonic 2D mechanical displacement for motor vibration.
 * Uses 1X fundamental and 2X harmonic components to simulate realistic
 * unbalance and bearing race jitter without unrealistic sudden jerking.
 */
export function calculateVibrationDisplacement(
  amplitude: number,
  timeSec: number
): { x: number; y: number } {
  if (amplitude <= 0) {
    return { x: 0, y: 0 }
  }
  // 1X rotational harmonic + 2X bearing race pass harmonic
  const x = amplitude * (Math.sin(timeSec * 46) + 0.35 * Math.sin(timeSec * 92))
  const y = amplitude * (Math.cos(timeSec * 38) + 0.3 * Math.cos(timeSec * 76))
  return { x, y }
}

/**
 * Temperature Heatmap Configuration
 * Maps operational motor temperature to thermal color gradient and emissive glow.
 */
export const THERMAL_CONFIG = {
  baselineTemp: 68.0,    // °C - Normal baseline operating point
  warmThreshold: 78.0,   // °C - Elevated temperature starts
  hotThreshold: 92.0,    // °C - High alert temperature
  criticalThreshold: 110.0, // °C - Severe overheating fault
  maxTargetTemp: 135.0,  // °C - Upper bound
  colors: {
    cool: '#1c5cb8',     // Deep industrial blue (normal)
    warm: '#f59e0b',     // Amber / gold
    elevated: '#ea580c', // Hot orange
    critical: '#dc2626', // Radiant crimson red
  },
}

/**
 * Calculate normalized thermal factor from 0.0 (nominal) to 1.0 (overheated).
 */
export function calculateThermalFactor(temperatureDegC: number): number {
  if (!Number.isFinite(temperatureDegC)) return 0
  if (temperatureDegC <= THERMAL_CONFIG.baselineTemp) return 0
  const factor =
    (temperatureDegC - THERMAL_CONFIG.baselineTemp) /
    (THERMAL_CONFIG.criticalThreshold - THERMAL_CONFIG.baselineTemp)
  return Math.max(0, Math.min(factor, 1.2))
}

export interface ThermalEmissiveResult {
  emissiveColor: string
  emissiveIntensity: number
  isOverheating: boolean
}

/**
 * Calculate emissive color and intensity for thermal heatmap visualization.
 * When temperature is within nominal limits (<= 75°C), returns zero emissive intensity,
 * completely preserving original component materials and textures.
 */
export function getThermalEmissiveProperties(temperatureDegC: number): ThermalEmissiveResult {
  if (!Number.isFinite(temperatureDegC) || temperatureDegC <= 74.0) {
    return {
      emissiveColor: '#000000',
      emissiveIntensity: 0,
      isOverheating: false,
    }
  }

  if (temperatureDegC <= THERMAL_CONFIG.hotThreshold) {
    // Warm range: 74°C - 92°C (Amber glow)
    const t = (temperatureDegC - 74.0) / (THERMAL_CONFIG.hotThreshold - 74.0)
    return {
      emissiveColor: THERMAL_CONFIG.colors.warm,
      emissiveIntensity: THREE.MathUtils.lerp(0.12, 0.42, t),
      isOverheating: true,
    }
  }

  if (temperatureDegC <= THERMAL_CONFIG.criticalThreshold) {
    // High alert range: 92°C - 110°C (Orange glow)
    const t = (temperatureDegC - THERMAL_CONFIG.hotThreshold) / (THERMAL_CONFIG.criticalThreshold - THERMAL_CONFIG.hotThreshold)
    return {
      emissiveColor: THERMAL_CONFIG.colors.elevated,
      emissiveIntensity: THREE.MathUtils.lerp(0.42, 0.70, t),
      isOverheating: true,
    }
  }

  // Critical overheating range: > 110°C (Radiant Red glow)
  const t = Math.min(1.0, (temperatureDegC - THERMAL_CONFIG.criticalThreshold) / 25.0)
  return {
    emissiveColor: THERMAL_CONFIG.colors.critical,
    emissiveIntensity: THREE.MathUtils.lerp(0.70, 0.92, t),
    isOverheating: true,
  }
}

/**
 * Evaluates machine status from live sensor telemetry.
 */
export function evaluateMachineStatusFromSensors(
  temperature?: number,
  vibration?: number,
  rpm?: number
): TwinVisualStatus {
  if (temperature === undefined && vibration === undefined) {
    return 'Normal'
  }

  const temp = temperature ?? 68
  const vib = vibration ?? 1.8
  const currentRpm = rpm ?? 1488

  // Critical conditions: Severe thermal escalation, extreme vibration (ISO Zone D), or severe stall
  if (temp >= 105 || vib >= 7.2 || (currentRpm < 1250 && currentRpm > 0)) {
    return 'Critical'
  }

  // Warning conditions: Elevated thermal levels or ISO Zone C vibration
  if (temp >= 82 || vib >= 3.8 || currentRpm < 1400) {
    return 'Warning'
  }

  return 'Normal'
}
