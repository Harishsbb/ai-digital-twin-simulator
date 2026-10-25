/**
 * API Client Services Unit Tests
 * 
 * Tests REST endpoints, parameter serialization, error propagation,
 * and WebSocket URL formation.
 */

import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert'
import {
  controlSimulator,
  fetchAIMetrics,
  fetchAILatest,
  fetchAIStatus,
  fetchBackendHealth,
  fetchBackendInfo,
  fetchDatabaseHealth,
  fetchLatestSensorReading,
  fetchSensorHistory,
  fetchSimulatorState,
  getApiBaseUrl,
  getSensorWebSocketUrl,
  predictAnomaly,
} from '../services/api.ts'

describe('Frontend API Client Services', () => {
  const originalFetch = globalThis.fetch

  afterEach(() => {
    globalThis.fetch = originalFetch
  })

  it('getApiBaseUrl returns valid string', () => {
    const url = getApiBaseUrl()
    assert.strictEqual(typeof url, 'string')
    assert.ok(url.length > 0)
  })

  it('getSensorWebSocketUrl generates correct ws/wss url', () => {
    const originalLocation = globalThis.window?.location
    const mockLocation = {
      protocol: 'http:',
      host: 'localhost:5173',
    } as unknown as Location

    const mockWindow = { location: mockLocation }
    ;(globalThis as unknown as { window?: typeof mockWindow }).window = mockWindow

    const wsUrl = getSensorWebSocketUrl()
    assert.ok(wsUrl.startsWith('ws://'))
    assert.ok(wsUrl.includes('/api/v1/sensors/ws'))

    // Test https scenario
    const mutableLoc = mockLocation as unknown as { protocol: string }
    mutableLoc.protocol = 'https:'
    const wssUrl = getSensorWebSocketUrl()
    assert.ok(wssUrl.startsWith('wss://'))

    // Restore
    if (originalLocation) {
      mockWindow.location = originalLocation
    }
  })


  it('fetchBackendHealth resolves on successful response', async () => {
    const mockHealth = { status: 'healthy', service: 'AI Digital Twin', timestamp: '2026-10-21T00:00:00Z' }
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      assert.ok(url.includes('/api/health'))
      return {
        ok: true,
        status: 200,
        json: async () => mockHealth,
      }
    }

    const data = await fetchBackendHealth()
    assert.strictEqual(data.status, 'healthy')
    assert.strictEqual(data.service, 'AI Digital Twin')
  })

  it('fetchBackendHealth throws when server returns non-200', async () => {
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    })

    await assert.rejects(
      async () => fetchBackendHealth(),
      /Health check failed with status: 503/
    )
  })

  it('fetchBackendInfo resolves app metadata', async () => {
    const mockInfo = { app_name: 'AI Twin', version: '1.0.0', stage: 'Step 7', environment: 'development' }
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      assert.ok(url.includes('/api/v1/info'))
      return {
        ok: true,
        status: 200,
        json: async () => mockInfo,
      }
    }

    const data = await fetchBackendInfo()
    assert.strictEqual(data.app_name, 'AI Twin')
    assert.strictEqual(data.version, '1.0.0')
  })

  it('fetchLatestSensorReading retrieves point-in-time telemetry', async () => {
    const mockReading = {
      device_id: 'SIMOTICS-150KW-01',
      timestamp: '2026-10-21T00:00:00Z',
      temperature: 68.4,
      vibration: 1.25,
      rpm: 1488.2,
      mode: 'normal',
      is_running: true,
      sequence: 42,
    }
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      assert.ok(url.includes('/api/v1/sensors/latest'))
      return {
        ok: true,
        status: 200,
        json: async () => mockReading,
      }
    }

    const reading = await fetchLatestSensorReading()
    assert.strictEqual(reading.temperature, 68.4)
    assert.strictEqual(reading.vibration, 1.25)
    assert.strictEqual(reading.rpm, 1488.2)
  })

  it('fetchSimulatorState inspects simulator runtime', async () => {
    const mockState = {
      device_id: 'SIMOTICS-150KW-01',
      is_running: true,
      mode: 'normal',
      sequence: 10,
      uptime_seconds: 120,
      connected_clients: 1,
      latest_reading: {
        device_id: 'SIMOTICS-150KW-01',
        timestamp: '2026-10-21T00:00:00Z',
        temperature: 68.0,
        vibration: 1.2,
        rpm: 1488.0,
        mode: 'normal',
        is_running: true,
        sequence: 10,
      },
      config: {
        device_id: 'SIMOTICS-150KW-01',
        update_interval_sec: 0.5,
        temp_baseline: 68.0,
        temp_normal_min: 58.0,
        temp_normal_max: 78.0,
        vib_baseline: 1.2,
        vib_normal_min: 0.8,
        vib_normal_max: 1.9,
        rpm_baseline: 1488.0,
        rpm_normal_min: 1478.0,
        rpm_normal_max: 1496.0,
        temp_fault_target: 118.0,
        vib_fault_target: 7.4,
        rpm_fault_target: 1240.0,
      },
    }

    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      assert.ok(url.includes('/api/v1/sensors/state'))
      return {
        ok: true,
        status: 200,
        json: async () => mockState,
      }
    }

    const state = await fetchSimulatorState()
    assert.strictEqual(state.is_running, true)
    assert.strictEqual(state.mode, 'normal')
  })

  it('fetchSensorHistory passes limit query parameter', async () => {
    let capturedUrl = ''
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      capturedUrl = url
      return {
        ok: true,
        status: 200,
        json: async () => [],
      }
    }

    await fetchSensorHistory(25)
    assert.ok(capturedUrl.includes('limit=25'))
  })

  it('controlSimulator sends post body with action and mode', async () => {
    let capturedMethod = ''
    let capturedBody = ''
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string, init?: RequestInit) => {
      assert.ok(url.includes('/api/v1/sensors/control'))
      capturedMethod = init?.method || ''
      capturedBody = init?.body as string
      return {
        ok: true,
        status: 200,
        json: async () => ({ device_id: 'SIMOTICS-150KW-01' }),
      }
    }

    await controlSimulator('set_mode', 'fault')
    assert.strictEqual(capturedMethod, 'POST')
    assert.strictEqual(capturedBody, JSON.stringify({ action: 'set_mode', mode: 'fault' }))
  })

  it('fetchAIStatus retrieves ML model metadata', async () => {
    const mockStatus = {
      model_loaded: true,
      status: 'ready',
      model_name: 'IsolationForest-Motor-AnomalyDetector',
      model_version: '1.0.0',
      algorithm: 'IsolationForest (scikit-learn)',
      features: ['temperature', 'vibration', 'rpm'],
      feature_units: { temperature: '°C', vibration: 'mm/s RMS', rpm: 'RPM' },
      training_sample_count: 6000,
      contamination: 0.03,
      trained_at: '2026-10-21T00:00:00Z',
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
  })

  it('predictAnomaly posts telemetry and returns anomaly score', async () => {
    const mockResp = {
      device_id: 'SIMOTICS-150KW-01',
      timestamp: '2026-10-21T00:00:00Z',
      is_anomaly: false,
      prediction: 1,
      anomaly_score: 0.1245,
      model_name: 'IsolationForest-Motor-AnomalyDetector',
      model_version: '1.0.0',
      source: 'user_telemetry_submission',
      features_evaluated: { temperature: 68.4, vibration: 1.2, rpm: 1488.0 },
      diagnostic_context: {
        summary: 'Telemetry conforms to learned normal distribution.',
        deviations: [],
        inlier_status: 'Nominal',
      },
    }

    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string, init?: RequestInit) => {
      assert.ok(url.includes('/api/v1/ai/predict'))
      assert.strictEqual(init?.method, 'POST')
      return {
        ok: true,
        status: 200,
        json: async () => mockResp,
      }
    }

    const result = await predictAnomaly({ temperature: 68.4, vibration: 1.2, rpm: 1488.0 })
    assert.strictEqual(result.is_anomaly, false)
    assert.strictEqual(result.prediction, 1)
    assert.ok(result.anomaly_score > 0)
  })

  it('fetchAILatest scores current running simulator reading', async () => {
    const mockLatest = {
      device_id: 'SIMOTICS-150KW-01',
      timestamp: '2026-10-21T00:00:00Z',
      is_anomaly: true,
      prediction: -1,
      anomaly_score: -0.155,
      model_name: 'IsolationForest-Motor-AnomalyDetector',
      model_version: '1.0.0',
      source: 'live_simulator_stream',
      features_evaluated: { temperature: 110.0, vibration: 7.2, rpm: 1250.0 },
      diagnostic_context: {
        summary: 'Sensor telemetry deviates from normal.',
        deviations: ['Temperature is elevated'],
        inlier_status: 'Anomalous',
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

    const latest = await fetchAILatest()
    assert.strictEqual(latest.is_anomaly, true)
    assert.strictEqual(latest.prediction, -1)
  })

  it('fetchAIMetrics retrieves held-out evaluation summary', async () => {
    const mockMetrics = {
      model_name: 'IsolationForest-Motor-AnomalyDetector',
      model_version: '1.0.0',
      evaluation_summary: {
        evaluation_sample_count: 2400,
        normal_sample_count: 1200,
        fault_sample_count: 1200,
        confusion_matrix: { true_negatives: 1173, false_positives: 27, false_negatives: 0, true_positives: 1200 },
        accuracy: 0.9888,
        precision: 0.978,
        recall: 1.0,
        f1_score: 0.9889,
        false_positive_rate: 0.0225,
        scenario_breakdown: {},
        disclaimer: 'Synthetic data',
      },
      disclaimer: 'Synthetic data',
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

    const metrics = await fetchAIMetrics()
    assert.strictEqual(metrics.evaluation_summary.accuracy, 0.9888)
    assert.strictEqual(metrics.evaluation_summary.recall, 1.0)
  })

  it('fetchDatabaseHealth retrieves Supabase connection and pooler status', async () => {
    const mockDbHealth = {
      status: 'connected',
      connected: true,
      database_type: 'Supabase PostgreSQL (Session Pooler)',
      host: 'aws-0-ap-northeast-2.pooler.supabase.com',
      port: 5432,
      database: 'postgres',
      masked_url: 'postgresql://postgres.test:****@aws-0.pooler.supabase.com:5432/postgres',
      latency_ms: 12.5,
      tables_registered: ['sensor_readings', 'ai_predictions', 'alert_records', 'whatif_experiments'],
      timestamp: '2026-10-25T11:00:00Z',
      error: null,
    }

    // @ts-expect-error Mocking fetch
    globalThis.fetch = async (url: string) => {
      assert.ok(url.includes('/api/v1/db/health'))
      return {
        ok: true,
        status: 200,
        json: async () => mockDbHealth,
      }
    }

    const health = await fetchDatabaseHealth()
    assert.strictEqual(health.status, 'connected')
    assert.strictEqual(health.connected, true)
    assert.strictEqual(health.tables_registered.length, 4)
  })

  it('fetchDatabaseHealth throws descriptive error when server returns non-200', async () => {
    // @ts-expect-error Mocking fetch
    globalThis.fetch = async () => ({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    })

    await assert.rejects(
      async () => {
        await fetchDatabaseHealth()
      },
      /Database health check failed with status: 503 Service Unavailable/
    )
  })
})

