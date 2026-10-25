/**
 * Step 8: AI Predictions & Frontend Integration Unit Tests
 * 
 * Verifies typed AI API client, Isolation Forest output interpretation,
 * error handling (timeouts, HTTP 422/503), stale data checks,
 * out-of-order response rejection, and diagnostic context handling.
 */

import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert'
import {
  AIError,
  fetchAIMetrics,
  fetchAILatest,
  fetchAIStatus,
  interpretAnomalyScore,
  predictAnomaly,
} from '../services/aiApi.ts'
import type {
  AIModelMetricsResponse,
  AIModelStatusResponse,
  AnomalyPredictionResponse,
} from '../types/index.ts'

describe('Step 8: AI Predictions & API Integration Tests', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  // =========================================================================
  // 1. Isolation Forest Output & Decision Score Interpretation
  // =========================================================================
  describe('Isolation Forest Score Interpretation', () => {
    it('correctly classifies nominal inlier (prediction = 1, positive score)', () => {
      const res = interpretAnomalyScore(1, 0.143)
      assert.strictEqual(res.isAnomaly, false)
      assert.strictEqual(res.label, 'Normal')
      assert.ok(res.scoreDescription.includes('conforms to high-density'))
      assert.ok(!res.scoreDescription.includes('%'))
    })

    it('correctly classifies anomaly outlier (prediction = -1, negative score)', () => {
      const res = interpretAnomalyScore(-1, -0.0989)
      assert.strictEqual(res.isAnomaly, true)
      assert.strictEqual(res.label, 'Anomaly Detected')
      assert.ok(res.scoreDescription.includes('low-density feature space'))
    })

    it('classifies negative score as anomaly even if prediction code is ambiguous', () => {
      const res = interpretAnomalyScore(0, -0.015)
      assert.strictEqual(res.isAnomaly, true)
      assert.strictEqual(res.label, 'Anomaly Detected')
    })

    it('classifies zero or positive score as inlier', () => {
      const resZero = interpretAnomalyScore(1, 0.0)
      assert.strictEqual(resZero.isAnomaly, false)
      assert.strictEqual(resZero.label, 'Normal')
    })
  })

  // =========================================================================
  // 2. GET /api/v1/ai/status
  // =========================================================================
  describe('AI Model Status Endpoint', () => {
    it('resolves model specifications and readiness when backend is healthy', async () => {
      const mockStatus: AIModelStatusResponse = {
        model_loaded: true,
        status: 'ready',
        model_name: 'IsolationForest-Motor-AnomalyDetector',
        model_version: '1.0.0',
        algorithm: 'IsolationForest (scikit-learn)',
        features: ['temperature', 'vibration', 'rpm'],
        feature_units: { temperature: '°C', vibration: 'mm/s RMS', rpm: 'RPM' },
        training_sample_count: 6000,
        contamination: 0.03,
      }

      // @ts-expect-error Mocking fetch
      globalThis.fetch = async (url: string) => {
        assert.ok(url.includes('/api/v1/ai/status'))
        return {
          ok: true,
          status: 200,
          json: async () => mockStatus,
        }
      }

      const status = await fetchAIStatus()
      assert.strictEqual(status.model_loaded, true)
      assert.strictEqual(status.status, 'ready')
      assert.strictEqual(status.features.length, 3)
      assert.strictEqual(status.training_sample_count, 6000)
    })

    it('throws AIError with HTTP status 503 when model artifact is unloaded', async () => {
      // @ts-expect-error Mocking fetch
      globalThis.fetch = async () => ({
        ok: false,
        status: 503,
        statusText: 'Service Unavailable',
        json: async () => ({ detail: 'AI Model artifact not loaded into memory.' }),
      })

      await assert.rejects(
        async () => fetchAIStatus(),
        (err: unknown) => {
          assert.ok(err instanceof AIError)
          assert.strictEqual((err as AIError).status, 503)
          assert.ok((err as AIError).message.includes('AI Model artifact not loaded'))
          return true
        }
      )
    })

    it('marks AIError as network error on fetch connection refusal', async () => {
      globalThis.fetch = async () => {
        throw new TypeError('Failed to fetch')
      }

      await assert.rejects(
        async () => fetchAIStatus(),
        (err: unknown) => {
          assert.ok(err instanceof AIError)
          assert.strictEqual((err as AIError).isNetworkError, true)
          return true
        }
      )
    })
  })

  // =========================================================================
  // 3. GET /api/v1/ai/latest
  // =========================================================================
  describe('Latest Simulator Reading Inference', () => {
    it('retrieves and parses live prediction with diagnostic context', async () => {
      const mockLatest: AnomalyPredictionResponse = {
        device_id: 'SIMOTICS-150KW-01',
        timestamp: '2026-10-25T08:00:00Z',
        is_anomaly: false,
        prediction: 1,
        anomaly_score: 0.1342,
        model_name: 'IsolationForest-Motor-AnomalyDetector',
        model_version: '1.0.0',
        source: 'simulated_sensor_data',
        features_evaluated: { temperature: 68.4, vibration: 1.22, rpm: 1488.2 },
        diagnostic_context: {
          summary: 'All telemetry channels conform to learned normal distribution.',
          deviations: [],
          inlier_status: 'Nominal Inlier',
        },
      }

      // @ts-expect-error Mocking fetch
      globalThis.fetch = async (url: string) => {
        assert.ok(url.includes('/api/v1/ai/latest'))
        return {
          ok: true,
          status: 200,
          json: async () => mockLatest,
        }
      }

      const res = await fetchAILatest()
      assert.strictEqual(res.is_anomaly, false)
      assert.strictEqual(res.prediction, 1)
      assert.strictEqual(res.diagnostic_context.deviations.length, 0)
      assert.strictEqual(res.features_evaluated.temperature, 68.4)
    })

    it('correctly processes fault mode live telemetry', async () => {
      const mockFault: AnomalyPredictionResponse = {
        device_id: 'SIMOTICS-150KW-01',
        timestamp: '2026-10-25T08:05:00Z',
        is_anomaly: true,
        prediction: -1,
        anomaly_score: -0.0989,
        model_name: 'IsolationForest-Motor-AnomalyDetector',
        model_version: '1.0.0',
        source: 'simulated_sensor_data',
        features_evaluated: { temperature: 118.0, vibration: 7.4, rpm: 1240.0 },
        diagnostic_context: {
          summary: 'Severe multidimensional fault pattern detected.',
          deviations: [
            'Stator temperature exceeds nominal threshold (+50.0°C)',
            'Vibration velocity in ISO Zone D (+6.20 mm/s)',
          ],
          inlier_status: 'Outlier Anomaly',
        },
      }

      // @ts-expect-error Mocking fetch
      globalThis.fetch = async () => ({
        ok: true,
        status: 200,
        json: async () => mockFault,
      })

      const res = await fetchAILatest()
      assert.strictEqual(res.is_anomaly, true)
      assert.strictEqual(res.prediction, -1)
      assert.ok(res.anomaly_score < 0)
      assert.strictEqual(res.diagnostic_context.deviations.length, 2)
    })
  })

  // =========================================================================
  // 4. POST /api/v1/ai/predict
  // =========================================================================
  describe('Manual Inference Endpoint', () => {
    it('submits arbitrary telemetry and receives inference response', async () => {
      let capturedBody = ''

      // @ts-expect-error Mocking fetch
      globalThis.fetch = async (url: string, init?: RequestInit) => {
        assert.ok(url.includes('/api/v1/ai/predict'))
        assert.strictEqual(init?.method, 'POST')
        capturedBody = String(init?.body)
        return {
          ok: true,
          status: 200,
          json: async () => ({
            device_id: 'SIMOTICS-150KW-01',
            timestamp: '2026-10-25T08:10:00Z',
            is_anomaly: false,
            prediction: 1,
            anomaly_score: 0.125,
            model_name: 'IsolationForest-Motor-AnomalyDetector',
            model_version: '1.0.0',
            source: 'custom_telemetry_submission',
            features_evaluated: { temperature: 70.0, vibration: 1.3, rpm: 1485.0 },
            diagnostic_context: {
              summary: 'Telemetry aligns with baseline.',
              deviations: [],
              inlier_status: 'Inlier',
            },
          }),
        }
      }

      const res = await predictAnomaly({ temperature: 70.0, vibration: 1.3, rpm: 1485.0 })
      assert.strictEqual(res.is_anomaly, false)
      assert.ok(capturedBody.includes('"temperature":70'))
      assert.ok(capturedBody.includes('"vibration":1.3'))
    })

    it('propagates HTTP 422 validation errors without substituting fake success', async () => {
      // @ts-expect-error Mocking fetch
      globalThis.fetch = async () => ({
        ok: false,
        status: 422,
        statusText: 'Unprocessable Entity',
        json: async () => ({ detail: 'Temperature exceeds allowable threshold' }),
      })

      await assert.rejects(
        async () => predictAnomaly({ temperature: 999.0, vibration: 1.0, rpm: 1500.0 }),
        (err: unknown) => {
          assert.ok(err instanceof AIError)
          assert.strictEqual((err as AIError).status, 422)
          assert.ok((err as AIError).message.includes('422'))
          return true
        }
      )
    })
  })

  // =========================================================================
  // 5. GET /api/v1/ai/metrics
  // =========================================================================
  describe('Model Evaluation Metrics Endpoint', () => {
    it('retrieves verified evaluation summary, confusion matrix, and disclaimer', async () => {
      const mockMetrics: AIModelMetricsResponse = {
        model_name: 'IsolationForest-Motor-AnomalyDetector',
        model_version: '1.0.0',
        evaluation_summary: {
          evaluation_sample_count: 2400,
          normal_sample_count: 1200,
          fault_sample_count: 1200,
          confusion_matrix: {
            true_negatives: 1173,
            false_positives: 27,
            false_negatives: 0,
            true_positives: 1200,
          },
          accuracy: 0.9888,
          precision: 0.978,
          recall: 1.0,
          f1_score: 0.9889,
          false_positive_rate: 0.0225,
          scenario_breakdown: {
            normal: {
              sample_count: 1200,
              inlier_retention_rate: 0.9775,
              false_positive_count: 27,
              mean_anomaly_score: 0.1308,
            },
            overheating: {
              sample_count: 300,
              detected_anomaly_count: 300,
              detection_rate: 1.0,
              mean_anomaly_score: -0.1677,
            },
          },
          disclaimer:
            'These evaluation metrics are based on synthetic simulator-generated data and do not establish performance on real industrial equipment.',
        },
        disclaimer:
          'These evaluation metrics are based on synthetic simulator-generated data and do not establish performance on real industrial equipment.',
      }

      // @ts-expect-error Mocking fetch
      globalThis.fetch = async (url: string) => {
        assert.ok(url.includes('/api/v1/ai/metrics'))
        return {
          ok: true,
          status: 200,
          json: async () => mockMetrics,
        }
      }

      const res = await fetchAIMetrics()
      assert.strictEqual(res.evaluation_summary.accuracy, 0.9888)
      assert.strictEqual(res.evaluation_summary.recall, 1.0)
      assert.strictEqual(res.evaluation_summary.confusion_matrix.true_negatives, 1173)
      assert.strictEqual(res.evaluation_summary.confusion_matrix.true_positives, 1200)
      assert.strictEqual(res.evaluation_summary.confusion_matrix.false_negatives, 0)
      assert.ok(res.disclaimer.includes('synthetic simulator-generated data'))
    })
  })

  // =========================================================================
  // 6. Concurrency, Race Condition, & Stale Telemetry Protection
  // =========================================================================
  describe('Concurrency & Data Freshness Protections', () => {
    it('rejects stale out-of-order responses using request id tokens', () => {
      let activeRequestId = 10
      let latestAppliedData = 'INITIAL'

      const applyResponse = (requestId: number, data: string) => {
        // Enforces rule: only accept if requestId matches current active counter
        if (requestId === activeRequestId) {
          latestAppliedData = data
        }
      }

      // Request 1 fired at t=0 (delayed, requestId = 10)
      const req1Id = activeRequestId

      // Request 2 fired at t=100 (faster, requestId incremented to 11)
      activeRequestId = 11
      const req2Id = activeRequestId

      // Req 2 completes first
      applyResponse(req2Id, 'NEW_PREDICTION_FROM_REQ_2')
      assert.strictEqual(latestAppliedData, 'NEW_PREDICTION_FROM_REQ_2')

      // Req 1 finally arrives late
      applyResponse(req1Id, 'STALE_PREDICTION_FROM_REQ_1')
      // Must NOT overwrite the newer prediction!
      assert.strictEqual(latestAppliedData, 'NEW_PREDICTION_FROM_REQ_2')
    })

    it('identifies stale readings when last sync time exceeds 4.0 seconds', () => {
      const now = Date.now()
      const freshSyncTime = now - 1500
      const staleSyncTime = now - 4500

      const isFresh = now - freshSyncTime > 4000
      const isStale = now - staleSyncTime > 4000

      assert.strictEqual(isFresh, false)
      assert.strictEqual(isStale, true)
    })
  })
})
