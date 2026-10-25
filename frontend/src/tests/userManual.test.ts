/**
 * User Manual Navigation & Documentation Tests
 * 
 * Verifies:
 * 1. User Manual navigation routes and link definitions.
 * 2. Presence of all 7 required documentation sections.
 * 3. Quick Start Guide for first-time users.
 * 4. Keyword search filtering behavior.
 * 5. Critical disclaimer presence (synthetic data only).
 * 6. What-If hypothetical isolation guarantee statement.
 * 7. Database connectivity documentation (/api/v1/db/health).
 */

import { describe, it } from 'node:test'
import assert from 'node:assert'
import fs from 'node:fs'
import path from 'node:path'

describe('User Manual & Operator Guide Tests', () => {
  const manualPath = path.resolve('src/pages/UserManualPage.tsx')
  const routesPath = path.resolve('src/routes/index.tsx')
  const headerPath = path.resolve('src/components/Header.tsx')
  const sidebarPath = path.resolve('src/components/Sidebar.tsx')

  const manualContent = fs.readFileSync(manualPath, 'utf-8')
  const routesContent = fs.readFileSync(routesPath, 'utf-8')
  const headerContent = fs.readFileSync(headerPath, 'utf-8')
  const sidebarContent = fs.readFileSync(sidebarPath, 'utf-8')

  // 1. Navigation & Routing
  describe('Navigation & Route Integration', () => {
    it('defines /user-manual route in AppRoutes', () => {
      assert.ok(routesContent.includes('/user-manual'), 'AppRoutes must include /user-manual')
      assert.ok(routesContent.includes('UserManualPage'), 'AppRoutes must mount UserManualPage')
    })

    it('provides alias routes for /manual and /guide redirecting to /user-manual', () => {
      assert.ok(routesContent.includes('/manual'), 'Should support /manual alias')
      assert.ok(routesContent.includes('/guide'), 'Should support /guide alias')
    })

    it('includes a clearly visible User Manual button in Header', () => {
      assert.ok(headerContent.includes('id="user-manual-header-btn"'), 'Header must contain user manual button id')
      assert.ok(headerContent.includes('to="/user-manual"'), 'Header button must link to /user-manual')
      assert.ok(headerContent.includes('BookOpen'), 'Header button must use book icon')
    })

    it('includes User Manual in Sidebar navigation items', () => {
      assert.ok(sidebarContent.includes("'User Manual'"), 'Sidebar must include User Manual')
      assert.ok(sidebarContent.includes("'/user-manual'"), 'Sidebar must link to /user-manual')
    })

    it('provides Back to Dashboard button linking to root /', () => {
      assert.ok(manualContent.includes('id="back-to-dashboard-btn"'), 'Must have Back to Dashboard button')
      assert.ok(manualContent.includes('to="/"'), 'Back to Dashboard button must navigate to root')
    })
  })

  // 2. Documentation Sections Completeness
  describe('Required Content Sections', () => {
    it('includes Quick Start Guide with numbered beginner steps', () => {
      assert.ok(manualContent.includes('Quick Start Guide for First-Time Users'), 'Must have Quick Start Guide')
      assert.ok(manualContent.includes('Check Live Telemetry'), 'Must have Step 1')
      assert.ok(manualContent.includes('Inspect the 3D Motor'), 'Must have Step 2')
      assert.ok(manualContent.includes('Observe Fault Mode'), 'Must have Step 3')
      assert.ok(manualContent.includes('Try What-If Testing'), 'Must have Step 4')
    })

    it('Section 1: Explains Dashboard, Temperature, Vibration, and RPM', () => {
      assert.ok(manualContent.includes('1. Dashboard & Live Sensor Telemetry'), 'Section 1 heading must exist')
      assert.ok(manualContent.includes('Stator Temperature (°C)'), 'Must explain Temperature')
      assert.ok(manualContent.includes('Bearing Vibration (mm/s RMS)'), 'Must explain Vibration')
      assert.ok(manualContent.includes('Motor Speed (RPM)'), 'Must explain RPM')
      assert.ok(manualContent.includes('ISO 10816'), 'Must reference ISO 10816 standard')
      assert.ok(manualContent.includes('Normal'), 'Must describe Normal state')
      assert.ok(manualContent.includes('Warning'), 'Must describe Warning state')
      assert.ok(manualContent.includes('Critical'), 'Must describe Critical state')
    })

    it('Section 2: Explains 3D Digital Twin (rotate, zoom, inspect, normal vs fault)', () => {
      assert.ok(manualContent.includes('2. 3D Digital Twin Motor Viewer'), 'Section 2 heading must exist')
      assert.ok(manualContent.includes('Rotate (Orbit)'), 'Must explain camera rotation')
      assert.ok(manualContent.includes('Zoom (In & Out)'), 'Must explain zooming')
      assert.ok(manualContent.includes('Inspect Components'), 'Must explain component inspection')
      assert.ok(manualContent.includes('Normal vs. Fault Conditions in 3D'), 'Must explain 3D visual changes')
      assert.ok(manualContent.includes('radiant alert red'), 'Must describe fault thermal emissive glow')
    })

    it('Section 3: Explains AI Anomaly Detection in simple English with synthetic disclaimer', () => {
      assert.ok(manualContent.includes('3. AI Anomaly Detection Engine'), 'Section 3 heading must exist')
      assert.ok(manualContent.includes('Isolation Forest'), 'Must explain Isolation Forest')
      assert.ok(manualContent.includes('Anomaly Score Interpretation'), 'Must explain score interpretation')
      assert.ok(manualContent.includes('Where to View AI Predictions'), 'Must explain where to check AI status')
      assert.ok(manualContent.includes('Synthetic Data Only'), 'Must clearly state synthetic data disclaimer')
      assert.ok(manualContent.includes('does not connect to physical factory machinery'), 'Disclaimer text must clarify simulation scope')
    })

    it('Section 4: Explains Alerts (Critical, High, Medium, Info, Acknowledge, Dismiss)', () => {
      assert.ok(manualContent.includes('4. Alert Management & Operator Lifecycle'), 'Section 4 heading must exist')
      assert.ok(manualContent.includes('Critical Severity'), 'Must explain Critical alerts')
      assert.ok(manualContent.includes('High / Warning Severity'), 'Must explain High/Warning alerts')
      assert.ok(manualContent.includes('Medium / Info Severity'), 'Must explain Medium/Info alerts')
      assert.ok(manualContent.includes('Acknowledge an Alert'), 'Must explain how to acknowledge')
      assert.ok(manualContent.includes('Dismiss an Alert'), 'Must explain how to dismiss')
    })

    it('Section 5: Explains Analytics (history, charts, time filters, CSV export)', () => {
      assert.ok(manualContent.includes('5. Analytics Dashboard & CSV Export'), 'Section 5 heading must exist')
      assert.ok(manualContent.includes('Time Range Filters'), 'Must explain time filters (30s, 1m, 2m, 5m, All)')
      assert.ok(manualContent.includes('Exporting to CSV'), 'Must explain CSV export')
    })

    it('Section 6: Explains What-If Simulation with strict isolation guarantee', () => {
      assert.ok(manualContent.includes('6. Interactive What-If Simulation'), 'Section 6 heading must exist')
      assert.ok(manualContent.includes('Choose a Preset or Custom Values'), 'Must explain presets and sliders')
      assert.ok(manualContent.includes('Run AI Prediction'), 'Must explain running simulation')
      assert.ok(manualContent.includes('Compare with Live Baseline'), 'Must explain baseline comparison')
      assert.ok(manualContent.includes('Strict Isolation Guarantee'), 'Must state isolation guarantee')
      assert.ok(manualContent.includes('never alter live sensor readings'), 'Must confirm hypothetical isolation')
    })

    it('Section 7: Explains Database Status & Supabase persistence', () => {
      assert.ok(manualContent.includes('7. Database Status & Cloud Persistence'), 'Section 7 heading must exist')
      assert.ok(manualContent.includes('Supabase PostgreSQL'), 'Must reference Supabase PostgreSQL')
      assert.ok(manualContent.includes('/api/v1/db/health'), 'Must document health endpoint')
      assert.ok(manualContent.includes('sensor_readings'), 'Must document sensor_readings table')
      assert.ok(manualContent.includes('ai_predictions'), 'Must document ai_predictions table')
      assert.ok(manualContent.includes('alert_records'), 'Must document alert_records table')
      assert.ok(manualContent.includes('whatif_experiments'), 'Must document whatif_experiments table')
      assert.ok(manualContent.includes('Seamless Offline Fallback'), 'Must document in-memory offline fallback')
    })
  })

  // 3. UI Features & Usability
  describe('UI Usability & Search Capabilities', () => {
    it('implements interactive topic search filter', () => {
      assert.ok(manualContent.includes('searchQuery'), 'Must have search state')
      assert.ok(manualContent.includes('filteredSections'), 'Must compute filtered sections')
      assert.ok(manualContent.includes('Search manual'), 'Must have search placeholder')
    })

    it('provides quick jump navigation pills for all sections', () => {
      assert.ok(manualContent.includes('scrollToSection'), 'Must have smooth scroll helper')
      assert.ok(manualContent.includes('activeSection'), 'Must track active section')
    })
  })
})
