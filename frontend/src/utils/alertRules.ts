/**
 * Step 9: Alert Severity & Rule Evaluation Engine
 * 
 * Maps multi-dimensional sensor telemetry and Isolation Forest anomaly predictions
 * to explicit, auditable severity tiers according to ISO 10816-3 vibration zones
 * and NEMA Class F motor insulation thermal thresholds.
 */

import type { AlertItem, AlertSeverity, AlertSensorSnapshot } from '../types/alert'
import type { AnomalyPredictionResponse } from '../types'

/**
 * Sensor Threshold Constants
 * Aligned with backend dataset fault generation and ISO 10816-3 mechanical vibration standards.
 */
export const ALERT_THRESHOLDS = {
  // Stator Winding Temperature (°C)
  TEMP_CRITICAL: 105.0,
  TEMP_ELEVATED: 85.0,
  TEMP_BASELINE: 68.0,

  // Bearing Vibration Velocity (mm/s RMS ISO 10816)
  VIB_CRITICAL_ZONE_D: 7.10,
  VIB_ELEVATED_ZONE_C: 4.50,
  VIB_BASELINE: 1.20,

  // Shaft Speed Velocity (RPM)
  RPM_CRITICAL_STALL: 1350.0,
  RPM_ELEVATED_DRAG: 1460.0,
  RPM_BASELINE: 1488.0,
}

/**
 * Determine alert severity from sensor telemetry and Isolation Forest classification.
 * 
 * Rules:
 * - Critical: AI Anomaly + (Temp >= 105°C OR Vib >= 7.1 mm/s OR RPM < 1350 RPM OR >= 2 High deviations)
 * - High:     AI Anomaly + (Temp >= 85°C OR Vib >= 4.5 mm/s OR RPM < 1460 RPM)
 * - Medium:   AI Anomaly + Borderline sensor parameters (pure multi-dimensional tree isolation)
 * - Info:     Restoration notice / Non-anomalous event
 */
export function evaluateAlertSeverity(
  temperature: number,
  vibration: number,
  rpm: number,
  isAnomaly: boolean
): AlertSeverity {
  if (!isAnomaly) {
    return 'info'
  }

  const isTempCritical = temperature >= ALERT_THRESHOLDS.TEMP_CRITICAL
  const isVibCritical = vibration >= ALERT_THRESHOLDS.VIB_CRITICAL_ZONE_D
  const isRpmCritical = rpm < ALERT_THRESHOLDS.RPM_CRITICAL_STALL && rpm > 0

  const isTempElevated = temperature >= ALERT_THRESHOLDS.TEMP_ELEVATED
  const isVibElevated = vibration >= ALERT_THRESHOLDS.VIB_ELEVATED_ZONE_C
  const isRpmElevated = rpm < ALERT_THRESHOLDS.RPM_ELEVATED_DRAG

  // Count high-tier deviations
  let highDeviationsCount = 0
  if (isTempElevated) highDeviationsCount++
  if (isVibElevated) highDeviationsCount++
  if (isRpmElevated) highDeviationsCount++

  // 1. Critical Tier
  if (isTempCritical || isVibCritical || isRpmCritical || highDeviationsCount >= 2) {
    return 'critical'
  }

  // 2. High Tier
  if (isTempElevated || isVibElevated || isRpmElevated) {
    return 'high'
  }

  // 3. Medium Tier (Outlier flagged in low-density space without single sensor breach)
  return 'medium'
}

/**
 * Generate human-readable alert title based on severity and primary sensor drivers.
 */
export function generateAlertTitle(
  severity: AlertSeverity,
  temperature: number,
  vibration: number,
  rpm: number
): string {
  if (severity === 'critical') {
    if (temperature >= ALERT_THRESHOLDS.TEMP_CRITICAL && vibration >= ALERT_THRESHOLDS.VIB_CRITICAL_ZONE_D) {
      return 'CRITICAL: Severe Overheating & ISO Zone D Vibration'
    }
    if (temperature >= ALERT_THRESHOLDS.TEMP_CRITICAL) {
      return 'CRITICAL: Thermal Escalation Exceeds 105°C'
    }
    if (vibration >= ALERT_THRESHOLDS.VIB_CRITICAL_ZONE_D) {
      return 'CRITICAL: Bearing Vibration Exceeds ISO Zone D (7.1 mm/s)'
    }
    if (rpm < ALERT_THRESHOLDS.RPM_CRITICAL_STALL) {
      return 'CRITICAL: Severe Rotor Drag / Slipping Velocity'
    }
    return 'CRITICAL: Multi-variable Mechanical Fault Pattern'
  }

  if (severity === 'high') {
    if (temperature >= ALERT_THRESHOLDS.TEMP_ELEVATED) {
      return 'HIGH: Elevated Stator Winding Thermal Signature'
    }
    if (vibration >= ALERT_THRESHOLDS.VIB_ELEVATED_ZONE_C) {
      return 'HIGH: Unrestricted Vibration Level (ISO Zone C)'
    }
    if (rpm < ALERT_THRESHOLDS.RPM_ELEVATED_DRAG) {
      return 'HIGH: Rotor Velocity Drag Detected'
    }
    return 'HIGH: Significant Telemetry Variance Flagged'
  }

  if (severity === 'medium') {
    return 'MEDIUM: Unsupervised Anomaly in Multi-Dimensional Telemetry'
  }

  return 'INFO: Normal Telemetry Baseline Restored'
}

/**
 * Generate comprehensive technical description for the alert event.
 */
export function generateAlertDescription(
  severity: AlertSeverity,
  temperature: number,
  vibration: number,
  rpm: number,
  score: number | null,
  contextSummary?: string
): string {
  const scoreText = score !== null ? `(decision score: ${score >= 0 ? '+' : ''}${score.toFixed(4)})` : ''

  if (severity === 'info') {
    return 'Simulator telemetry has stabilized within learned nominal distributions. All sensor channels returned to standard baseline.'
  }

  if (contextSummary && contextSummary.length > 0) {
    return `${contextSummary} Isolation Forest partitioned telemetry into outlier subspace ${scoreText}.`
  }

  return `Continuous inference detected an anomalous operating state ${scoreText} across temperature (${temperature.toFixed(1)}°C), vibration (${vibration.toFixed(2)} mm/s), and shaft speed (${rpm.toFixed(1)} RPM).`
}

/**
 * Build a complete AlertItem object from a live prediction response.
 */
export function createAlertFromPrediction(
  prediction: AnomalyPredictionResponse,
  category: 'ai_anomaly_engine' | 'telemetry_recovery' = 'ai_anomaly_engine'
): AlertItem {
  const now = new Date()
  const temp = prediction.features_evaluated.temperature
  const vib = prediction.features_evaluated.vibration
  const rpm = prediction.features_evaluated.rpm
  const isAnomaly = prediction.is_anomaly

  const severity = evaluateAlertSeverity(temp, vib, rpm, isAnomaly)
  const title = generateAlertTitle(severity, temp, vib, rpm)
  const description = generateAlertDescription(
    severity,
    temp,
    vib,
    rpm,
    prediction.anomaly_score,
    prediction.diagnostic_context?.summary
  )

  const snapshot: AlertSensorSnapshot = {
    temperature: temp,
    vibration: vib,
    rpm: rpm,
    deviceId: prediction.device_id || 'SIMOTICS-150KW-01',
  }

  return {
    id: `alt-${now.getTime()}-${Math.random().toString(36).substring(2, 7)}`,
    timestamp: now.toISOString(),
    timestampMs: now.getTime(),
    severity,
    category,
    title,
    description,
    aiPredictionLabel: isAnomaly ? 'Anomaly (Outlier)' : 'Normal (Inlier)',
    anomalyScore: prediction.anomaly_score,
    snapshot,
    deviations: prediction.diagnostic_context?.deviations || [],
    isAcknowledged: false,
    isDismissed: false,
  }
}

/**
 * Styling tokens for accessible, light-theme severity indicators.
 */
export function getSeverityStyles(severity: AlertSeverity) {
  switch (severity) {
    case 'critical':
      return {
        badge: 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]',
        text: 'text-[#DC2626]',
        bg: 'bg-[#FEF2F2]',
        border: 'border-[#FECACA]',
        dot: 'bg-[#EF4444]',
        iconColor: '#EF4444',
        lightBg: '#FFF5F5',
        label: 'CRITICAL',
      }
    case 'high':
      return {
        badge: 'bg-[#FFFBEB] text-[#92400E] border-[#FDE68A]',
        text: 'text-[#D97706]',
        bg: 'bg-[#FFFBEB]',
        border: 'border-[#FDE68A]',
        dot: 'bg-[#F59E0B]',
        iconColor: '#F59E0B',
        lightBg: '#FFFCF0',
        label: 'HIGH',
      }
    case 'medium':
      return {
        badge: 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]',
        text: 'text-[#15803D]',
        bg: 'bg-[#F0FDF4]',
        border: 'border-[#BBF7D0]',
        dot: 'bg-[#22C55E]',
        iconColor: '#22C55E',
        lightBg: '#F7FEE7',
        label: 'MEDIUM',
      }
    case 'info':
    default:
      return {
        badge: 'bg-[#EAF2FF] text-[#1E40AF] border-[#BFDBFE]',
        text: 'text-[#1769FF]',
        bg: 'bg-[#EAF2FF]',
        border: 'border-[#BFDBFE]',
        dot: 'bg-[#1769FF]',
        iconColor: '#1769FF',
        lightBg: '#F8FAFF',
        label: 'INFO',
      }
  }
}
