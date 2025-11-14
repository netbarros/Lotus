// ═══════════════════════════════════════════════════════════════════════════
// MAGICSAAS SYSTEM-∞ - K6 LOAD TESTING SCENARIOS
// Version: 1.0.0
// Performance Budgets: Based on SLO targets (p95 <200ms, p99 <500ms)
// ═══════════════════════════════════════════════════════════════════════════

import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';
import { randomString, randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM METRICS
// ═══════════════════════════════════════════════════════════════════════════

const errorRate = new Rate('errors');
const sofiaIntentionDuration = new Trend('sofia_intention_duration');
const sofiaGenerationDuration = new Trend('sofia_generation_duration');
const apiLatency = new Trend('api_latency');
const authSuccessRate = new Rate('auth_success_rate');
const dbQueryDuration = new Trend('db_query_duration');
const activeUsers = new Gauge('active_users');

// ═══════════════════════════════════════════════════════════════════════════
// PERFORMANCE BUDGETS (from SLO targets)
// ═══════════════════════════════════════════════════════════════════════════

const PERFORMANCE_BUDGETS = {
  api_p95: 200, // 200ms p95 latency
  api_p99: 500, // 500ms p99 latency
  sofia_p95: 300000, // 5 minutes (300 seconds) for intention processing
  error_rate: 0.001, // 0.1% error rate
  success_rate: 0.999, // 99.9% success rate
};

// ═══════════════════════════════════════════════════════════════════════════
// LOAD TEST SCENARIOS
// ═══════════════════════════════════════════════════════════════════════════

export const options = {
  scenarios: {
    // Scenario 1: Smoke Test - Verify system works with minimal load
    smoke_test: {
      executor: 'constant-vus',
      vus: 1,
      duration: '1m',
      startTime: '0s',
      tags: { scenario: 'smoke' },
    },

    // Scenario 2: Load Test - Normal production traffic
    load_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 50 }, // Ramp up to 50 users
        { duration: '5m', target: 50 }, // Stay at 50 for 5 minutes
        { duration: '2m', target: 100 }, // Ramp to 100
        { duration: '5m', target: 100 }, // Stay at 100
        { duration: '2m', target: 0 }, // Ramp down
      ],
      startTime: '1m',
      tags: { scenario: 'load' },
    },

    // Scenario 3: Stress Test - Beyond normal capacity
    stress_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '5m', target: 200 },
        { duration: '2m', target: 300 },
        { duration: '5m', target: 300 },
        { duration: '2m', target: 0 },
      ],
      startTime: '20m',
      tags: { scenario: 'stress' },
    },

    // Scenario 4: Spike Test - Sudden traffic surge
    spike_test: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 500 }, // Sudden spike
        { duration: '1m', target: 500 }, // Sustain
        { duration: '10s', target: 0 }, // Drop
      ],
      startTime: '40m',
      tags: { scenario: 'spike' },
    },

    // Scenario 5: Soak Test - Extended duration at normal load
    soak_test: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2h',
      startTime: '50m',
      tags: { scenario: 'soak' },
    },

    // Scenario 6: Sofia AI Intensive - Intention processing load
    sofia_intensive: {
      executor: 'ramping-arrival-rate',
      startRate: 1,
      timeUnit: '1m',
      preAllocatedVUs: 10,
      maxVUs: 50,
      stages: [
        { duration: '5m', target: 10 }, // 10 intentions/min
        { duration: '10m', target: 20 }, // 20 intentions/min
        { duration: '5m', target: 10 },
      ],
      startTime: '3h',
      tags: { scenario: 'sofia' },
      exec: 'sofiaIntentionScenario',
    },
  },

  thresholds: {
    // API Response Time Thresholds (Performance Budgets)
    http_req_duration: [
      `p(95)<${PERFORMANCE_BUDGETS.api_p95}`, // p95 < 200ms
      `p(99)<${PERFORMANCE_BUDGETS.api_p99}`, // p99 < 500ms
    ],
    'http_req_duration{scenario:smoke}': ['p(95)<100'], // Smoke test should be fast

    // Error Rate Thresholds
    http_req_failed: [`rate<${PERFORMANCE_BUDGETS.error_rate}`], // <0.1% errors
    errors: [`rate<${PERFORMANCE_BUDGETS.error_rate}`],

    // Success Rate Thresholds
    checks: [`rate>${PERFORMANCE_BUDGETS.success_rate}`], // >99.9% success

    // Sofia AI Thresholds
    sofia_intention_duration: [
      `p(95)<${PERFORMANCE_BUDGETS.sofia_p95}`, // p95 < 5 minutes
      'p(99)<600000', // p99 < 10 minutes
    ],
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// BASE URL CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3003';
const DIRECTUS_URL = __ENV.DIRECTUS_URL || 'http://localhost:8055';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function authenticate() {
  const loginRes = http.post(
    `${BASE_URL}/api/auth/login`,
    JSON.stringify({
      email: 'test@magicsaas.com',
      password: 'test123456',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'received token': (r) => r.json('token') !== undefined,
  });

  authSuccessRate.add(loginRes.status === 200);

  return loginRes.json('token');
}

function makeAuthHeaders(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT SCENARIO - Mixed API Workload
// ═══════════════════════════════════════════════════════════════════════════

export default function () {
  const token = authenticate();
  const headers = makeAuthHeaders(token);

  group('API Health Checks', function () {
    const healthRes = http.get(`${BASE_URL}/health`);
    const startTime = new Date();

    check(healthRes, {
      'health check status 200': (r) => r.status === 200,
      'health check has uptime': (r) => r.json('uptime') !== undefined,
    });

    apiLatency.add(new Date() - startTime);
    errorRate.add(healthRes.status !== 200);
  });

  group('User Profile Operations', function () {
    // GET profile
    const profileRes = http.get(`${BASE_URL}/api/users/me`, { headers });
    check(profileRes, {
      'profile retrieved': (r) => r.status === 200,
    });

    // UPDATE profile
    const updateRes = http.patch(
      `${BASE_URL}/api/users/me`,
      JSON.stringify({
        first_name: `User${randomIntBetween(1, 10000)}`,
      }),
      { headers }
    );

    check(updateRes, {
      'profile updated': (r) => r.status === 200,
    });
  });

  group('Directus CMS Operations', function () {
    // List collections
    const collectionsRes = http.get(`${DIRECTUS_URL}/collections`, { headers });
    check(collectionsRes, {
      'collections loaded': (r) => r.status === 200,
    });

    // Query items
    const itemsRes = http.get(`${DIRECTUS_URL}/items/tenants?limit=10`, { headers });
    check(itemsRes, {
      'items queried': (r) => r.status === 200,
    });
  });

  group('Sofia AI - Simple Intention', function () {
    const intention = {
      description: `Create a simple landing page for ${randomString(10)}`,
      type: 'landing_page',
      user_id: 'test-user',
    };

    const intentionStart = new Date();
    const intentionRes = http.post(`${BASE_URL}/api/sofia/intention`, JSON.stringify(intention), {
      headers,
    });
    sofiaIntentionDuration.add(new Date() - intentionStart);

    check(intentionRes, {
      'intention accepted': (r) => r.status === 200 || r.status === 202,
      'intention has id': (r) => r.json('id') !== undefined,
    });

    errorRate.add(intentionRes.status >= 400);
  });

  sleep(randomIntBetween(1, 3)); // Think time
}

// ═══════════════════════════════════════════════════════════════════════════
// SOFIA AI INTENSIVE SCENARIO
// ═══════════════════════════════════════════════════════════════════════════

export function sofiaIntentionScenario() {
  const token = authenticate();
  const headers = makeAuthHeaders(token);

  const complexIntention = {
    description: `Create a full SaaS application with:
      - User authentication and authorization
      - Dashboard with analytics
      - CRUD operations for ${randomString(8)} entities
      - API endpoints
      - Admin panel
      - Email notifications
      - Payment integration
      - Multi-tenancy support`,
    type: 'full_saas',
    complexity: 'high',
    features: [
      'authentication',
      'dashboard',
      'crud',
      'api',
      'admin',
      'email',
      'payments',
      'multi_tenant',
    ],
    user_id: `load-test-${randomString(10)}`,
  };

  const genStart = new Date();
  const genRes = http.post(`${BASE_URL}/api/sofia/generate`, JSON.stringify(complexIntention), {
    headers,
    timeout: '600s', // 10 minute timeout for complex generations
  });

  const genDuration = new Date() - genStart;
  sofiaGenerationDuration.add(genDuration);

  check(genRes, {
    'generation started': (r) => r.status === 200 || r.status === 202,
    'generation within budget': () => genDuration < PERFORMANCE_BUDGETS.sofia_p95,
  });

  // Poll for completion
  if (genRes.status === 202) {
    const jobId = genRes.json('job_id');
    let completed = false;
    let attempts = 0;
    const maxAttempts = 60; // 10 minutes with 10s intervals

    while (!completed && attempts < maxAttempts) {
      sleep(10);
      const statusRes = http.get(`${BASE_URL}/api/sofia/job/${jobId}`, { headers });

      if (statusRes.json('status') === 'completed') {
        completed = true;
        check(statusRes, {
          'generation completed successfully': (r) => r.json('result.success') === true,
        });
      } else if (statusRes.json('status') === 'failed') {
        errorRate.add(1);
        break;
      }

      attempts++;
    }
  }

  sleep(randomIntBetween(30, 60)); // Long think time for complex operations
}

// ═══════════════════════════════════════════════════════════════════════════
// LIFECYCLE HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export function setup() {
  console.log('🚀 Starting MagicSaaS Load Tests');
  console.log(`📊 Performance Budgets:
    - API p95: ${PERFORMANCE_BUDGETS.api_p95}ms
    - API p99: ${PERFORMANCE_BUDGETS.api_p99}ms
    - Sofia AI p95: ${PERFORMANCE_BUDGETS.sofia_p95}ms
    - Error Rate: <${PERFORMANCE_BUDGETS.error_rate * 100}%
    - Success Rate: >${PERFORMANCE_BUDGETS.success_rate * 100}%
  `);

  // Verify system is ready
  const healthCheck = http.get(`${BASE_URL}/health`);
  if (healthCheck.status !== 200) {
    throw new Error('System health check failed - cannot start load test');
  }

  return {
    startTime: new Date().toISOString(),
  };
}

export function teardown(data) {
  console.log('✅ Load Tests Completed');
  console.log(`Started at: ${data.startTime}`);
  console.log(`Ended at: ${new Date().toISOString()}`);
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM SUMMARY
// ═══════════════════════════════════════════════════════════════════════════

export function handleSummary(data) {
  const budgetViolations = [];

  // Check performance budgets
  if (data.metrics.http_req_duration?.values?.['p(95)'] > PERFORMANCE_BUDGETS.api_p95) {
    budgetViolations.push(
      `API p95 latency: ${data.metrics.http_req_duration.values['p(95)']}ms (budget: ${PERFORMANCE_BUDGETS.api_p95}ms)`
    );
  }

  if (data.metrics.http_req_failed?.values?.rate > PERFORMANCE_BUDGETS.error_rate) {
    budgetViolations.push(
      `Error rate: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}% (budget: ${PERFORMANCE_BUDGETS.error_rate * 100}%)`
    );
  }

  const summary = {
    stdout: JSON.stringify(data, null, 2),
    'load-test-results.json': JSON.stringify(data),
    'load-test-summary.html': generateHTMLReport(data, budgetViolations),
  };

  if (budgetViolations.length > 0) {
    console.error('❌ PERFORMANCE BUDGET VIOLATIONS:');
    budgetViolations.forEach((v) => console.error(`   - ${v}`));
  } else {
    console.log('✅ ALL PERFORMANCE BUDGETS MET');
  }

  return summary;
}

function generateHTMLReport(data, violations) {
  return `
<!DOCTYPE html>
<html>
<head>
  <title>MagicSaaS Load Test Results</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    .violation { background: #ffebee; color: #c62828; padding: 10px; margin: 10px 0; border-left: 4px solid #c62828; }
    .success { background: #e8f5e9; color: #2e7d32; padding: 10px; margin: 10px 0; border-left: 4px solid #2e7d32; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #6644FF; color: white; }
  </style>
</head>
<body>
  <h1>MagicSaaS System-∞ Load Test Results</h1>
  <p><strong>Date:</strong> ${new Date().toISOString()}</p>

  ${
    violations.length > 0
      ? `
    <div class="violation">
      <h2>⚠️ Performance Budget Violations</h2>
      <ul>
        ${violations.map((v) => `<li>${v}</li>`).join('')}
      </ul>
    </div>
  `
      : `
    <div class="success">
      <h2>✅ All Performance Budgets Met</h2>
    </div>
  `
  }

  <h2>Summary Statistics</h2>
  <table>
    <tr><th>Metric</th><th>Value</th><th>Budget</th><th>Status</th></tr>
    <tr>
      <td>API Latency (p95)</td>
      <td>${data.metrics.http_req_duration?.values?.['p(95)'] || 'N/A'}ms</td>
      <td>${PERFORMANCE_BUDGETS.api_p95}ms</td>
      <td>${(data.metrics.http_req_duration?.values?.['p(95)'] || 0) <= PERFORMANCE_BUDGETS.api_p95 ? '✅' : '❌'}</td>
    </tr>
    <tr>
      <td>Error Rate</td>
      <td>${((data.metrics.http_req_failed?.values?.rate || 0) * 100).toFixed(2)}%</td>
      <td>${PERFORMANCE_BUDGETS.error_rate * 100}%</td>
      <td>${(data.metrics.http_req_failed?.values?.rate || 0) <= PERFORMANCE_BUDGETS.error_rate ? '✅' : '❌'}</td>
    </tr>
    <tr>
      <td>Total Requests</td>
      <td>${data.metrics.http_reqs?.values?.count || 'N/A'}</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </table>
</body>
</html>
  `;
}
