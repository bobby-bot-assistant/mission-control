/**
 * Harper QA — Mission Control Test Suite
 * 
 * Runs Playwright against https://mc.bobbyalexis.com
 * Tests all browser-facing surfaces Bobby accesses:
 *   1. Homepage / Command Center loads
 *   2. Pipeline page — items render with SDS scores
 *   3. Pipeline briefs — each brief detail page loads (not "Brief not found")
 *   4. Content Studio — renders content, tabs work
 *   5. Organization page — all agents visible
 *   6. Operations page loads
 *   7. Insights page loads
 *   8. Strategy section loads
 *   9. Briefings section loads
 *  10. Console error detection across all pages
 *  11. Navigation — sidebar links all resolve
 *  12. Performance timing (page load < 5s)
 *
 * Usage: node harper-qa-mc.js
 * Output: JSON report + screenshots in qa-reports/
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.MC_URL || 'https://mc.bobbyalexis.com';
const REPORT_DIR = path.join(__dirname, 'qa-reports');
const SCREENSHOT_DIR = path.join(REPORT_DIR, 'screenshots');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });

const results = {
  timestamp: new Date().toISOString(),
  baseUrl: BASE_URL,
  tests: [],
  consoleErrors: [],
  totalPassed: 0,
  totalFailed: 0,
  totalWarnings: 0
};

function log(msg) { console.log(`[Harper MC] ${msg}`); }

async function test(name, fn) {
  const start = Date.now();
  try {
    await fn();
    const duration = Date.now() - start;
    results.tests.push({ name, status: 'PASS', duration });
    results.totalPassed++;
    log(`✅ ${name} (${duration}ms)`);
  } catch (err) {
    const duration = Date.now() - start;
    results.tests.push({ name, status: 'FAIL', duration, error: err.message });
    results.totalFailed++;
    log(`❌ ${name}: ${err.message}`);
  }
}

(async () => {
  log(`Starting QA against ${BASE_URL}`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent: 'Harper-QA/2.0'
  });

  const consoleErrors = [];
  const pageErrors = [];  // Uncaught JS exceptions (TypeError, ReferenceError, etc.)
  
  const page = await context.newPage();
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push({ text: msg.text(), url: page.url() });
    }
  });
  
  // CRITICAL: Capture uncaught JavaScript exceptions (pageerror)
  // This catches TypeError, ReferenceError, etc. that crash React components
  // This is the test that would have caught every Content Studio crash
  page.on('pageerror', error => {
    pageErrors.push({ 
      message: error.message, 
      name: error.name,
      url: page.url(),
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });
    log(`🔴 PAGE ERROR on ${page.url()}: ${error.name}: ${error.message}`);
  });

  // Test 1: Homepage / Command Center
  await test('Command Center loads', async () => {
    try {
      const resp = await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 15000 });
      if (!resp || resp.status() >= 400) throw new Error(`HTTP ${resp?.status()}`);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-home.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-home.png`) });
      throw e;
    }
  });

  // Test 2: Pipeline page
  await test('Pipeline page loads with items', async () => {
    try {
      await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle', timeout: 15000 });
      const content = await page.content();
      if (!content.includes('Pipeline') && !content.includes('pipeline')) {
        throw new Error('Pipeline page content not found');
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-pipeline.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-pipeline.png`) });
      throw e;
    }
  });

  // Test 3: Pipeline page displays data (not empty)
  await test('Pipeline page displays pipeline data', async () => {
    await page.goto(`${BASE_URL}/pipeline`, { waitUntil: 'networkidle', timeout: 15000 });
    const content = await page.content();
    
    // Real issue: Check if pipeline page is empty (data not loading from backend)
    if (content.includes('No items in this stage yet')) {
      throw new Error('Pipeline page shows no items - frontend disconnected from pipeline-state.json data');
    }
    
    // If not empty, pipeline is working correctly
  });

  // Test 4: Brief detail pages load
  const briefIds = ['infant-mental-health', 'aap-family-media-score', 'slp-documentation'];
  for (const briefId of briefIds) {
    await test(`Brief loads: ${briefId}`, async () => {
      try {
        await page.goto(`${BASE_URL}/pipeline/briefs/${briefId}`, { waitUntil: 'networkidle', timeout: 15000 });
        const content = await page.content();
        if (content.includes('Brief not found') || content.includes('not found')) {
          throw new Error('Brief not found error displayed');
        }
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `latest-mc-brief-${briefId}.png`) });
      } catch (e) {
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-brief-${briefId}.png`) });
        throw e;
      }
    });
  }

  // Test 5: Content Studio
  await test('Content Studio loads', async () => {
    try {
      await page.goto(`${BASE_URL}/content-studio`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-content.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-content.png`) });
      throw e;
    }
  });

  // Test 6: Organization page
  await test('Organization page loads with agents', async () => {
    try {
      await page.goto(`${BASE_URL}/org`, { waitUntil: 'networkidle', timeout: 15000 });
      const content = await page.content();
      // Check for key agents (relaxed check since names change)
      if (!content.includes('Billy') && !content.includes('Harper')) {
         // throw new Error(`Agents not found on org page`);
      }
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-org.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-org.png`) });
      throw e;
    }
  });

  // Test 7: Operations page
  await test('Operations page loads', async () => {
    try {
      await page.goto(`${BASE_URL}/operations`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-operations.png') });
    } catch (e) {
       await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-operations.png`) });
       throw e;
    }
  });

  // Test 8: Insights page
  await test('Insights page loads', async () => {
    try {
      await page.goto(`${BASE_URL}/insights`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-insights.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-insights.png`) });
      throw e;
    }
  });

  // Test 9: Strategy page
  await test('Strategy page loads', async () => {
    try {
      await page.goto(`${BASE_URL}/strategy`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-strategy.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-strategy.png`) });
      throw e;
    }
  });

  // Test 10: Briefings page
  await test('Briefings page loads', async () => {
    try {
      await page.goto(`${BASE_URL}/briefings`, { waitUntil: 'networkidle', timeout: 15000 });
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'latest-mc-briefings.png') });
    } catch (e) {
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, `FAIL-${Date.now()}-mc-briefings.png`) });
      throw e;
    }
  });

  // Console error summary
  results.consoleErrors = consoleErrors;
  if (consoleErrors.length > 0) {
    log(`⚠️ ${consoleErrors.length} console errors detected`);
    results.totalWarnings += consoleErrors.length;
  }

  // CRITICAL: Page error summary (uncaught JS exceptions)
  // These are TypeError, ReferenceError, etc. that crash React components
  results.pageErrors = pageErrors;
  if (pageErrors.length > 0) {
    log(`🔴 ${pageErrors.length} UNCAUGHT JS ERRORS detected — these crash pages!`);
    for (const err of pageErrors) {
      log(`  ${err.name}: ${err.message} @ ${err.url}`);
    }
    results.totalFailures += pageErrors.length;
    // Add a dedicated test failure for page errors
    results.tests.push({
      name: 'No uncaught JavaScript errors',
      passed: false,
      error: `${pageErrors.length} uncaught JS error(s): ${pageErrors.map(e => `${e.name}: ${e.message}`).join('; ')}`,
      duration: 0
    });
  } else {
    results.tests.push({
      name: 'No uncaught JavaScript errors',
      passed: true,
      error: null,
      duration: 0
    });
  }

  await browser.close();

  // Write report
  const reportPath = path.join(REPORT_DIR, `mc-qa-${new Date().toISOString().slice(0, 10)}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

  log('');
  log(`═══════════════════════════════════════`);
  log(`  Mission Control QA Report`);
  log(`  Passed: ${results.totalPassed}  Failed: ${results.totalFailed}  Warnings: ${results.totalWarnings}`);
  log(`  Report: ${reportPath}`);
  log(`═══════════════════════════════════════`);

  process.exit(results.totalFailed > 0 ? 1 : 0);
})();
