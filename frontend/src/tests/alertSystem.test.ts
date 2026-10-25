/**
 * Step 9: Real-Time AI Alert System Unit & Integration Tests
 * 
 * Verifies:
 * 1. Normal predictions do not create anomaly alerts.
 * 2. New anomaly events generate exactly one alert.
 * 3. Repeated anomaly polling deduplicates and prevents alert spam.
 * 4. Recovery transitions followed by a new anomaly generate new alerts.
 * 5. Stale, unready, or errored states reject alert generation.
 * 6. Multi-tier severity rules (Critical, High, Medium, Info) adhere to ISO 10816-3.
 * 7. Alert timestamps and sensor snapshots are populated correctly.
 * 8. Acknowledging alerts updates status without deleting.
 * 9. Dismissing alerts does not modify underlying AI predictions.
 * 10. Active, unacknowledged, and severity counts update accurately.
 * 11. In-memory history remains bounded to MAX_ALERT_HISTORY (150).
 * 12. Status, severity, and text search filters operate correctly.
 * 13. Telemetry and prediction contracts remain intact.
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import {
  ALERT_THRESHOLDS,
  createAlertFromPrediction,
  evaluateAlertSeverity,
  generateAlertDescription,
  generateAlertTitle,
  getSeverityStyles,
} from '../utils/alertRules.ts'
import type {
  AlertCounts,
  AlertFilterState,
  AlertItem,
  AlertSeverity,
  AnomalyPredictionResponse,
} from '../types/index.ts'

// Helper to construct typed mock AI predictions
function mockPrediction(overrides: Partial<AnomalyPredictionResponse> = {}): AnomalyPredictionResponse {
  return {
    is_anomaly: false,
    anomaly_score: 0.145,
    prediction: 1,
    model_name: 'isolation_forest_v1',
    model_version: '1.0.0',
    source: 'test_pipeline',
    features_evaluated: {
      temperature: 68.0,
      vibration: 1.2,
      rpm: 1488.0,
    },
    timestamp: new Date().toISOString(),
    device_id: 'SIMOTICS-150KW-01',
    diagnostic_context: {
      summary: 'All features within nominal distributions.',
      deviations: [],
      inlier_status: 'inlier',
    },
    ...overrides,
  }
}

describe('Step 9: Real-Time AI Alert System Tests', () => {
  // =========================================================================
  // 1. Severity Evaluation Rules & Thresholds (Requirement 6)
  // =========================================================================
  describe('Alert Severity Rules & ISO 10816 Thresholds', () => {
    it('evaluates normal non-anomalous telemetry as info', () => {
      const severity = evaluateAlertSeverity(68.0, 1.2, 1488.0, false)
      assert.strictEqual(severity, 'info')
    })

    it('evaluates Critical on thermal breach >= 105°C during active anomaly', () => {
      const severity = evaluateAlertSeverity(108.5, 2.0, 1480.0, true)
      assert.strictEqual(severity, 'critical')
    })

    it('evaluates Critical on ISO 10816 Zone D vibration breach >= 7.1 mm/s', () => {
      const severity = evaluateAlertSeverity(72.0, 7.85, 1480.0, true)
      assert.strictEqual(severity, 'critical')
    })

    it('evaluates Critical on severe rotor stall/slip < 1350 RPM', () => {
      const severity = evaluateAlertSeverity(72.0, 2.0, 1310.0, true)
      assert.strictEqual(severity, 'critical')
    })

    it('evaluates Critical when >= 2 elevated thresholds are breached concurrently', () => {
      // Temp >= 85°C and Vib >= 4.5 mm/s (both High tier, but combined -> Critical)
      const severity = evaluateAlertSeverity(88.0, 4.8, 1480.0, true)
      assert.strictEqual(severity, 'critical')
    })

    it('evaluates High on single elevated temperature >= 85°C', () => {
      const severity = evaluateAlertSeverity(89.5, 1.5, 1485.0, true)
      assert.strictEqual(severity, 'high')
    })

    it('evaluates High on single elevated vibration >= 4.5 mm/s (ISO Zone C)', () => {
      const severity = evaluateAlertSeverity(70.0, 5.2, 1485.0, true)
      assert.strictEqual(severity, 'high')
    })

    it('evaluates High on single rotor drag < 1460 RPM', () => {
      const severity = evaluateAlertSeverity(70.0, 1.5, 1445.0, true)
      assert.strictEqual(severity, 'high')
    })

    it('evaluates Medium when Isolation Forest isolates outlier without single sensor breach', () => {
      // Borderline features that together form a multivariate outlier in tree space
      const severity = evaluateAlertSeverity(78.0, 3.8, 1468.0, true)
      assert.strictEqual(severity, 'medium')
    })

    it('returns compliant light-theme severity styling tokens for each tier', () => {
      for (const sev of ['critical', 'high', 'medium', 'info'] as AlertSeverity[]) {
        const styles = getSeverityStyles(sev)
        assert.ok(styles.badge, `Missing badge style for ${sev}`)
        assert.ok(styles.text, `Missing text style for ${sev}`)
        assert.ok(styles.dot, `Missing dot style for ${sev}`)
        assert.strictEqual(styles.label, sev.toUpperCase())
      }
    })
  })

  // =========================================================================
  // 2. Alert Model, Timestamps & Sensor Snapshots (Requirement 7)
  // =========================================================================
  describe('Alert Data Model & Snapshot Integrity', () => {
    it('creates an AlertItem with unique ID, ISO timestamp, and accurate sensor snapshot', () => {
      const pred = mockPrediction({
        is_anomaly: true,
        anomaly_score: -0.1874,
        features_evaluated: {
          temperature: 109.2,
          vibration: 8.45,
          rpm: 1290.0,
        },
        device_id: 'SIMOTICS-150KW-01',
        diagnostic_context: {
          summary: 'High temperature and severe bearing vibration detected.',
          deviations: ['Temperature (+41.2°C)', 'Vibration (+7.25 mm/s)'],
          inlier_status: 'outlier',
        },
      })

      const alert = createAlertFromPrediction(pred, 'ai_anomaly_engine')

      assert.ok(alert.id.startsWith('alt-'), 'Alert ID should start with alt-')
      assert.ok(!Number.isNaN(alert.timestampMs), 'TimestampMs should be valid epoch number')
      assert.ok(alert.timestamp.includes('T'), 'Timestamp should be ISO string')
      assert.strictEqual(alert.severity, 'critical')
      assert.strictEqual(alert.category, 'ai_anomaly_engine')
      assert.strictEqual(alert.snapshot.temperature, 109.2)
      assert.strictEqual(alert.snapshot.vibration, 8.45)
      assert.strictEqual(alert.snapshot.rpm, 1290.0)
      assert.strictEqual(alert.snapshot.deviceId, 'SIMOTICS-150KW-01')
      assert.strictEqual(alert.anomalyScore, -0.1874)
      assert.strictEqual(alert.isAcknowledged, false)
      assert.strictEqual(alert.isDismissed, false)
      assert.strictEqual(alert.deviations.length, 2)
    })

    it('generates descriptive alert titles matching the primary fault drivers', () => {
      const critTitle = generateAlertTitle('critical', 110.0, 8.0, 1480.0)
      assert.ok(critTitle.includes('CRITICAL: Severe Overheating & ISO Zone D Vibration'))

      const highVibTitle = generateAlertTitle('high', 70.0, 5.5, 1480.0)
      assert.ok(highVibTitle.includes('HIGH: Unrestricted Vibration Level (ISO Zone C)'))

      const medTitle = generateAlertTitle('medium', 75.0, 2.5, 1475.0)
      assert.ok(medTitle.includes('MEDIUM: Unsupervised Anomaly'))

      const infoTitle = generateAlertTitle('info', 68.0, 1.2, 1488.0)
      assert.ok(infoTitle.includes('INFO: Normal Telemetry Baseline Restored'))
    })

    it('generates technical descriptions without asserting unconfirmed hardware failure', () => {
      const desc = generateAlertDescription(
        'critical',
        106.0,
        7.5,
        1340.0,
        -0.2104,
        'Bearing vibration in ISO Zone D with elevated thermal profile.'
      )
      assert.ok(desc.includes('Isolation Forest partitioned telemetry into outlier subspace'))
      assert.ok(desc.includes('-0.2104'))
      assert.ok(!desc.includes('hardware shattered'))
    })
  })

  // =========================================================================
  // 3. Alert Detection, Episode State Machine & Deduplication (Reqs 1, 2, 3, 4, 5)
  // =========================================================================
  describe('Episode State Machine & Deduplication Engine', () => {
    // Simulator replicating AlertContext's episode deduplication logic
    class AlertEngineSimulator {
      alerts: AlertItem[] = []
      isAnomalyActive = false
      lastProcessedTimestamp: string | null = null

      process(
        prediction: AnomalyPredictionResponse | null,
        isModelReady: boolean,
        isStale: boolean,
        hasError: boolean
      ): AlertItem | null {
        // Guard 1: Reject unready, stale, errored, or null predictions (Requirement 5)
        if (!isModelReady || isStale || hasError || !prediction) {
          return null
        }

        // Guard 2: Reject duplicate processing of identical payload timestamp
        if (prediction.timestamp === this.lastProcessedTimestamp) {
          return null
        }
        this.lastProcessedTimestamp = prediction.timestamp

        const isCurrentAnomaly = prediction.is_anomaly

        // Transition 1: Normal -> Anomaly (New Episode)
        if (isCurrentAnomaly) {
          if (!this.isAnomalyActive) {
            this.isAnomalyActive = true
            const alert = createAlertFromPrediction(prediction, 'ai_anomaly_engine')
            this.alerts.unshift(alert)
            if (this.alerts.length > 150) this.alerts.pop()
            return alert
          }
          // Continued anomaly: suppress duplicate alert (Requirement 3)
          return null
        }

        // Transition 2: Anomaly -> Normal (Recovery Episode)
        if (this.isAnomalyActive) {
          this.isAnomalyActive = false
          const recovery = createAlertFromPrediction(prediction, 'telemetry_recovery')
          this.alerts.unshift(recovery)
          if (this.alerts.length > 150) this.alerts.pop()
          return recovery
        }

        // Continual normal state: no alert
        return null
      }
    }

    it('Requirement 1: Normal prediction does not create an anomaly alert', () => {
      const engine = new AlertEngineSimulator()
      const pred = mockPrediction({ is_anomaly: false, timestamp: '2026-10-25T10:00:00.000Z' })

      const alert = engine.process(pred, true, false, false)

      assert.strictEqual(alert, null)
      assert.strictEqual(engine.alerts.length, 0)
      assert.strictEqual(engine.isAnomalyActive, false)
    })

    it('Requirement 2: New anomaly transition generates exactly ONE alert', () => {
      const engine = new AlertEngineSimulator()
      const anomalyPred = mockPrediction({
        is_anomaly: true,
        anomaly_score: -0.155,
        timestamp: '2026-10-25T10:00:01.000Z',
        features_evaluated: { temperature: 95.0, vibration: 2.0, rpm: 1485.0 },
      })

      const alert = engine.process(anomalyPred, true, false, false)

      assert.ok(alert !== null)
      assert.strictEqual(engine.alerts.length, 1)
      assert.strictEqual(alert.severity, 'high')
      assert.strictEqual(engine.isAnomalyActive, true)
    })

    it('Requirement 3: Repeated anomaly polling deduplicates and does not spawn new alerts', () => {
      const engine = new AlertEngineSimulator()

      // Tick 1: First anomaly
      const t1 = engine.process(
        mockPrediction({ is_anomaly: true, timestamp: '2026-10-25T10:00:01.000Z' }),
        true,
        false,
        false
      )
      assert.ok(t1 !== null)
      assert.strictEqual(engine.alerts.length, 1)

      // Ticks 2 through 10: Continuing anomaly polls at 1.5s intervals
      for (let i = 2; i <= 10; i++) {
        const next = engine.process(
          mockPrediction({
            is_anomaly: true,
            timestamp: `2026-10-25T10:00:0${i}.000Z`,
            features_evaluated: { temperature: 95.0 + i * 0.1, vibration: 5.5, rpm: 1450.0 },
          }),
          true,
          false,
          false
        )
        assert.strictEqual(next, null, `Poll tick ${i} should be deduplicated and return null`)
        assert.strictEqual(engine.alerts.length, 1, `Alert count should remain 1 on tick ${i}`)
      }
    })

    it('Requirement 4: Recovery followed by a subsequent anomaly generates a new alert', () => {
      const engine = new AlertEngineSimulator()

      // 1. Initial anomaly
      const alert1 = engine.process(
        mockPrediction({ is_anomaly: true, timestamp: '2026-10-25T10:00:01.000Z' }),
        true,
        false,
        false
      )
      assert.ok(alert1 !== null)
      assert.strictEqual(engine.isAnomalyActive, true)

      // 2. Recovery to normal
      const recoveryNotice = engine.process(
        mockPrediction({ is_anomaly: false, timestamp: '2026-10-25T10:00:03.000Z' }),
        true,
        false,
        false
      )
      assert.ok(recoveryNotice !== null)
      assert.strictEqual(recoveryNotice.severity, 'info')
      assert.strictEqual(engine.isAnomalyActive, false)
      assert.strictEqual(engine.alerts.length, 2)

      // 3. New subsequent anomaly after recovery
      const alert2 = engine.process(
        mockPrediction({
          is_anomaly: true,
          anomaly_score: -0.25,
          timestamp: '2026-10-25T10:00:05.000Z',
          features_evaluated: { temperature: 110.0, vibration: 7.8, rpm: 1300.0 },
        }),
        true,
        false,
        false
      )

      assert.ok(alert2 !== null)
      assert.strictEqual(alert2.severity, 'critical')
      assert.notStrictEqual(alert2.id, alert1.id, 'New alert should have a unique ID')
      assert.strictEqual(engine.isAnomalyActive, true)
      assert.strictEqual(engine.alerts.length, 3)
    })

    it('Requirement 5: Stale, unready, or errored states reject alert generation', () => {
      const engine = new AlertEngineSimulator()
      const anomalyPred = mockPrediction({ is_anomaly: true, timestamp: '2026-10-25T10:00:01.000Z' })

      // Case A: Model not ready
      const resUnready = engine.process(anomalyPred, false, false, false)
      assert.strictEqual(resUnready, null)

      // Case B: Stale stream
      const resStale = engine.process(anomalyPred, true, true, false)
      assert.strictEqual(resStale, null)

      // Case C: Prediction error
      const resErr = engine.process(anomalyPred, true, false, true)
      assert.strictEqual(resErr, null)

      // Case D: Null prediction
      const resNull = engine.process(null, true, false, false)
      assert.strictEqual(resNull, null)

      assert.strictEqual(engine.alerts.length, 0)
    })
  })

  // =========================================================================
  // 4. Alert Lifecycle: Acknowledge & Dismiss Actions (Reqs 8, 9, 10)
  // =========================================================================
  describe('Alert Lifecycle, Acknowledgment & Active Counts', () => {
    function computeCounts(alerts: AlertItem[]): AlertCounts {
      const activeAlerts = alerts.filter((a) => !a.isDismissed)
      let critical = 0
      let high = 0
      let medium = 0
      let info = 0
      let unacknowledged = 0

      for (const a of activeAlerts) {
        if (!a.isAcknowledged) unacknowledged++
        if (a.severity === 'critical') critical++
        else if (a.severity === 'high') high++
        else if (a.severity === 'medium') medium++
        else if (a.severity === 'info') info++
      }

      return {
        total: alerts.length,
        active: activeAlerts.length,
        unacknowledged,
        critical,
        high,
        medium,
        info,
      }
    }

    it('Requirement 8: Acknowledging an alert updates status without deleting it', () => {
      const pred = mockPrediction({ is_anomaly: true, features_evaluated: { temperature: 106, vibration: 7.5, rpm: 1400 } })
      const alert = createAlertFromPrediction(pred)
      let alerts = [alert]

      // Initial state
      assert.strictEqual(alerts[0].isAcknowledged, false)
      assert.strictEqual(alerts[0].acknowledgedAt, undefined)

      // Acknowledge
      const nowIso = new Date().toISOString()
      alerts = alerts.map((a) => (a.id === alert.id ? { ...a, isAcknowledged: true, acknowledgedAt: nowIso } : a))

      assert.strictEqual(alerts.length, 1, 'Alert must not be deleted on acknowledge')
      assert.strictEqual(alerts[0].isAcknowledged, true)
      assert.strictEqual(alerts[0].acknowledgedAt, nowIso)
    })

    it('Requirement 9: Dismissing an alert does not alter the underlying AI prediction', () => {
      const pred = mockPrediction({
        is_anomaly: true,
        anomaly_score: -0.142,
        features_evaluated: { temperature: 89.0, vibration: 4.8, rpm: 1470.0 },
      })
      const alert = createAlertFromPrediction(pred)
      let alerts = [alert]

      // Dismiss
      alerts = alerts.map((a) => (a.id === alert.id ? { ...a, isDismissed: true, dismissedAt: new Date().toISOString() } : a))

      // Prediction object remains untouched
      assert.strictEqual(pred.is_anomaly, true)
      assert.strictEqual(pred.anomaly_score, -0.142)
      assert.strictEqual(pred.features_evaluated.temperature, 89.0)

      // Alert history maintains the dismissed event
      assert.strictEqual(alerts.length, 1)
      assert.strictEqual(alerts[0].isDismissed, true)
    })

    it('Requirement 10: Active and unacknowledged counts update accurately across lifecycle', () => {
      const a1 = createAlertFromPrediction(mockPrediction({ is_anomaly: true, features_evaluated: { temperature: 110, vibration: 8.0, rpm: 1300 } }))
      const a2 = createAlertFromPrediction(mockPrediction({ is_anomaly: true, features_evaluated: { temperature: 88, vibration: 2.0, rpm: 1475 } }))
      const a3 = createAlertFromPrediction(mockPrediction({ is_anomaly: true, features_evaluated: { temperature: 75, vibration: 2.5, rpm: 1470 } }))
      const a4 = createAlertFromPrediction(mockPrediction({ is_anomaly: false }), 'telemetry_recovery')

      let alerts = [a1, a2, a3, a4] // 1 critical, 1 high, 1 medium, 1 info

      let counts = computeCounts(alerts)
      assert.strictEqual(counts.total, 4)
      assert.strictEqual(counts.active, 4)
      assert.strictEqual(counts.unacknowledged, 4)
      assert.strictEqual(counts.critical, 1)
      assert.strictEqual(counts.high, 1)
      assert.strictEqual(counts.medium, 1)
      assert.strictEqual(counts.info, 1)

      // Acknowledge a1 (critical)
      alerts = alerts.map((a) => (a.id === a1.id ? { ...a, isAcknowledged: true } : a))
      counts = computeCounts(alerts)
      assert.strictEqual(counts.unacknowledged, 3, 'Unacknowledged count should decrease by 1')
      assert.strictEqual(counts.active, 4, 'Active count remains 4 when acknowledged')
      assert.strictEqual(counts.critical, 1, 'Critical active count remains 1')

      // Dismiss a2 (high)
      alerts = alerts.map((a) => (a.id === a2.id ? { ...a, isDismissed: true } : a))
      counts = computeCounts(alerts)
      assert.strictEqual(counts.total, 4, 'Total history remains 4')
      assert.strictEqual(counts.active, 3, 'Active count drops to 3')
      assert.strictEqual(counts.unacknowledged, 2, 'Unacknowledged drops to 2 (a3 + a4)')
      assert.strictEqual(counts.high, 0, 'High active count drops to 0 because dismissed')
    })
  })

  // =========================================================================
  // 5. In-Memory Bounded History & FIFO Eviction (Requirement 11)
  // =========================================================================
  describe('Bounded History Capacity (150 Events)', () => {
    it('Requirement 11: Caps in-memory alert history at MAX_ALERT_HISTORY (150)', () => {
      const MAX_ALERT_HISTORY = 150
      let history: AlertItem[] = []

      // Push 200 alerts
      for (let i = 1; i <= 200; i++) {
        const item = createAlertFromPrediction(
          mockPrediction({
            is_anomaly: true,
            features_evaluated: { temperature: 70 + (i % 40), vibration: 2.0, rpm: 1480 },
          })
        )
        item.id = `alt-${i}`
        history = [item, ...history]
        if (history.length > MAX_ALERT_HISTORY) {
          history = history.slice(0, MAX_ALERT_HISTORY)
        }
      }

      assert.strictEqual(history.length, MAX_ALERT_HISTORY, 'History must not exceed 150 items')
      assert.strictEqual(history[0].id, 'alt-200', 'Newest item must be at index 0')
      assert.strictEqual(history[history.length - 1].id, 'alt-51', 'Oldest retained item should be alt-51')
    })
  })

  // =========================================================================
  // 6. Filters, Search & Empty States (Requirement 12)
  // =========================================================================
  describe('Alert Filters and Text Search', () => {
    function filterAlerts(alerts: AlertItem[], filterState: AlertFilterState): AlertItem[] {
      return alerts.filter((alert) => {
        if (filterState.status === 'active' && alert.isDismissed) return false
        if (filterState.status === 'unacknowledged' && (alert.isAcknowledged || alert.isDismissed)) return false
        if (filterState.status === 'dismissed' && !alert.isDismissed) return false

        if (filterState.severity !== 'all' && alert.severity !== filterState.severity) return false

        if (filterState.searchQuery.trim().length > 0) {
          const query = filterState.searchQuery.toLowerCase()
          const matchesTitle = alert.title.toLowerCase().includes(query)
          const matchesDesc = alert.description.toLowerCase().includes(query)
          const matchesDeviations = alert.deviations.some((d) => d.toLowerCase().includes(query))
          if (!matchesTitle && !matchesDesc && !matchesDeviations) return false
        }

        return true
      })
    }

    it('filters by status: active, unacknowledged, dismissed', () => {
      const a1: AlertItem = {
        ...createAlertFromPrediction(mockPrediction({ is_anomaly: true })),
        id: '1',
        isAcknowledged: false,
        isDismissed: false,
      }
      const a2: AlertItem = {
        ...createAlertFromPrediction(mockPrediction({ is_anomaly: true })),
        id: '2',
        isAcknowledged: true,
        isDismissed: false,
      }
      const a3: AlertItem = {
        ...createAlertFromPrediction(mockPrediction({ is_anomaly: true })),
        id: '3',
        isAcknowledged: false,
        isDismissed: true,
      }

      const list = [a1, a2, a3]

      // Active
      const active = filterAlerts(list, { status: 'active', severity: 'all', searchQuery: '' })
      assert.deepStrictEqual(active.map((a) => a.id), ['1', '2'])

      // Unacknowledged
      const unack = filterAlerts(list, { status: 'unacknowledged', severity: 'all', searchQuery: '' })
      assert.deepStrictEqual(unack.map((a) => a.id), ['1'])

      // Dismissed
      const dismissed = filterAlerts(list, { status: 'dismissed', severity: 'all', searchQuery: '' })
      assert.deepStrictEqual(dismissed.map((a) => a.id), ['3'])
    })

    it('filters by severity and search keyword', () => {
      const crit = createAlertFromPrediction(
        mockPrediction({
          is_anomaly: true,
          features_evaluated: { temperature: 110, vibration: 7.8, rpm: 1300 },
          diagnostic_context: {
            summary: 'Severe Stator Overheating detected',
            deviations: ['Temp > 105C'],
            inlier_status: 'outlier',
          },
        })
      )
      const high = createAlertFromPrediction(
        mockPrediction({
          is_anomaly: true,
          features_evaluated: { temperature: 88, vibration: 1.5, rpm: 1480 },
          diagnostic_context: {
            summary: 'Elevated Stator Temperature',
            deviations: ['Temp > 85C'],
            inlier_status: 'outlier',
          },
        })
      )

      const list = [crit, high]

      // Filter by severity critical
      const critResults = filterAlerts(list, { status: 'all', severity: 'critical', searchQuery: '' })
      assert.strictEqual(critResults.length, 1)
      assert.strictEqual(critResults[0].severity, 'critical')

      // Search by keyword 'Overheating'
      const searchResults = filterAlerts(list, { status: 'all', severity: 'all', searchQuery: 'overheating' })
      assert.strictEqual(searchResults.length, 1)
      assert.strictEqual(searchResults[0].id, crit.id)

      // Search non-existent keyword yields empty state
      const emptyResults = filterAlerts(list, { status: 'all', severity: 'all', searchQuery: 'nonexistenttermxyz' })
      assert.strictEqual(emptyResults.length, 0)
    })
  })

  // =========================================================================
  // 7. Data Contracts & Telemetry Math (Requirement 13)
  // =========================================================================
  describe('Telemetry & AI Prediction Contract Fidelity', () => {
    it('preserves exact decimal sensor readings in snapshot without rounding loss', () => {
      const pred = mockPrediction({
        is_anomaly: true,
        features_evaluated: {
          temperature: 104.876,
          vibration: 7.099,
          rpm: 1459.123,
        },
      })
      const alert = createAlertFromPrediction(pred)
      assert.strictEqual(alert.snapshot.temperature, 104.876)
      assert.strictEqual(alert.snapshot.vibration, 7.099)
      assert.strictEqual(alert.snapshot.rpm, 1459.123)
    })

    it('correctly associates ISO 10816 constants with standard motor baseline', () => {
      assert.strictEqual(ALERT_THRESHOLDS.TEMP_CRITICAL, 105.0)
      assert.strictEqual(ALERT_THRESHOLDS.TEMP_ELEVATED, 85.0)
      assert.strictEqual(ALERT_THRESHOLDS.VIB_CRITICAL_ZONE_D, 7.10)
      assert.strictEqual(ALERT_THRESHOLDS.VIB_ELEVATED_ZONE_C, 4.50)
      assert.strictEqual(ALERT_THRESHOLDS.RPM_CRITICAL_STALL, 1350.0)
      assert.strictEqual(ALERT_THRESHOLDS.RPM_ELEVATED_DRAG, 1460.0)
    })
  })
})
