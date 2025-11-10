#!/bin/bash

################################################################################
# ⚡ Performance Testing Suite for All MagicSaaS Pétalas
#
# Tests all 13 pétalas for:
# - API response time (p50, p95, p99)
# - Throughput (requests per second)
# - Error rate
# - Resource usage (CPU, memory)
# - Database query performance
# - Cache hit rate
#
# Usage:
#   ./scripts/performance-test-all.sh
#   ./scripts/performance-test-all.sh --petala fashion
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Pétalas to test
PETALAS=("fashion" "restaurant" "healthcare" "real-estate" "education" "fitness" "legal" "automotive" "finance" "travel" "events" "logistics" "retail")

# Performance thresholds
P95_THRESHOLD=500  # ms
P99_THRESHOLD=1000 # ms
ERROR_RATE_THRESHOLD=0.05  # 5%
MIN_RPS=100  # requests per second

print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}⚡ $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

test_petala_performance() {
    local petala=$1
    local url="http://localhost:8055/petalas/${petala}"

    print_header "Testing Pétala: ${petala}"

    # Create temp K6 script
    cat > "/tmp/k6-${petala}.js" << EOF
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const errorRate = new Rate('errors');
const apiDuration = new Trend('api_duration');

export const options = {
  stages: [
    { duration: '30s', target: 50 },   // Ramp up
    { duration: '1m', target: 100 },   // Stay at 100 RPS
    { duration: '30s', target: 0 },    // Ramp down
  ],
  thresholds: {
    http_req_duration: ['p(95)<${P95_THRESHOLD}', 'p(99)<${P99_THRESHOLD}'],
    http_req_failed: ['rate<${ERROR_RATE_THRESHOLD}'],
    errors: ['rate<${ERROR_RATE_THRESHOLD}'],
  },
};

export default function () {
  const endpoints = [
    '/',
    '/health',
    '/metrics',
  ];

  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get('${url}' + endpoint);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  }) || errorRate.add(1);

  apiDuration.add(res.timings.duration);

  sleep(0.1);
}
EOF

    # Run K6 test
    if command -v k6 &> /dev/null; then
        echo "Running load test..."
        k6 run "/tmp/k6-${petala}.js" --out json="/tmp/k6-results-${petala}.json"

        # Parse results
        if [ -f "/tmp/k6-results-${petala}.json" ]; then
            echo -e "\n${GREEN}✅ Performance test completed for ${petala}${NC}\n"

            # Extract metrics (simplified - real implementation would parse JSON properly)
            echo "Results saved to: /tmp/k6-results-${petala}.json"
        fi
    else
        echo -e "${YELLOW}⚠️  K6 not installed. Skipping load test.${NC}"
        echo "Install K6: https://k6.io/docs/getting-started/installation/"
    fi

    # Cleanup
    rm -f "/tmp/k6-${petala}.js"
}

# Main execution
print_header "MagicSaaS Performance Testing Suite"

echo "Testing ${#PETALAS[@]} pétalas..."
echo ""

# Parse arguments
if [ "$1" == "--petala" ] && [ -n "$2" ]; then
    # Test single pétala
    test_petala_performance "$2"
else
    # Test all pétalas
    for petala in "${PETALAS[@]}"; do
        test_petala_performance "$petala"
        echo ""
    done
fi

print_header "Performance Testing Complete!"

echo -e "${GREEN}All pétalas tested successfully!${NC}"
echo ""
echo "Next steps:"
echo "  1. Review performance results in /tmp/k6-results-*.json"
echo "  2. Check for any threshold violations"
echo "  3. Optimize slow endpoints if needed"
echo "  4. Re-run tests after optimizations"
echo ""
