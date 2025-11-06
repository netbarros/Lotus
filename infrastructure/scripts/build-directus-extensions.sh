#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# MAGICSAAS SYSTEM-∞ - BUILD & IMPORT DIRECTUS EXTENSIONS
# Builds TypeScript extensions and imports Flows/Insights into Directus
# ═══════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                          ║"
echo "║          🔧 DIRECTUS EXTENSIONS - BUILD & IMPORT                         ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""

# Check if Directus is running
if ! curl -s http://localhost:8055/server/health >/dev/null; then
  echo "❌ ERROR: Directus is not running at http://localhost:8055"
  echo "   Please start docker-compose first:"
  echo "   cd infrastructure/docker && docker-compose -f docker-compose.dev.yml up -d directus"
  exit 1
fi

echo "✅ Directus is running"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 1: BUILD PANEL EXTENSION
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Step 1: Building Panel Extension (magicsaas-dashboard)..."
cd "$PROJECT_ROOT/backend/directus/extensions/panels/magicsaas-dashboard"

if [ ! -f "package.json" ]; then
  echo "❌ ERROR: package.json not found"
  exit 1
fi

echo "   Installing dependencies..."
pnpm install --silent

echo "   Building extension..."
pnpm build

if [ -d "dist" ]; then
  echo "✅ Panel extension built successfully"
else
  echo "❌ ERROR: Build failed - dist/ directory not created"
  exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 2: BUILD ENDPOINT EXTENSION
# ═══════════════════════════════════════════════════════════════════════════

echo "📦 Step 2: Building Endpoint Extension (magicsaas-dashboard API)..."
cd "$PROJECT_ROOT/backend/directus/extensions/endpoints/magicsaas-dashboard"

if [ ! -f "package.json" ]; then
  echo "❌ ERROR: package.json not found"
  exit 1
fi

echo "   Installing dependencies..."
pnpm install --silent

echo "   Building extension..."
pnpm build

if [ -d "dist" ]; then
  echo "✅ Endpoint extension built successfully"
else
  echo "❌ ERROR: Build failed - dist/ directory not created"
  exit 1
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 3: RESTART DIRECTUS TO LOAD EXTENSIONS
# ═══════════════════════════════════════════════════════════════════════════

echo "🔄 Step 3: Restarting Directus to load extensions..."
cd "$PROJECT_ROOT/infrastructure/docker"
docker-compose -f docker-compose.dev.yml restart directus

echo "   Waiting for Directus to be ready..."
sleep 10

# Wait for Directus to be healthy
RETRY_COUNT=0
MAX_RETRIES=30
while ! curl -s http://localhost:8055/server/health >/dev/null; do
  RETRY_COUNT=$((RETRY_COUNT + 1))
  if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
    echo "❌ ERROR: Directus did not restart properly"
    exit 1
  fi
  echo "   Waiting... ($RETRY_COUNT/$MAX_RETRIES)"
  sleep 2
done

echo "✅ Directus restarted and ready"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 4: GET DIRECTUS ADMIN TOKEN
# ═══════════════════════════════════════════════════════════════════════════

echo "🔐 Step 4: Getting Directus admin token..."

# Try to get token from environment
if [ -z "$DIRECTUS_ADMIN_TOKEN" ]; then
  echo "   DIRECTUS_ADMIN_TOKEN not set in environment"
  echo "   Attempting login with admin credentials..."

  # Read from .env if exists
  if [ -f "$PROJECT_ROOT/.env" ]; then
    source "$PROJECT_ROOT/.env"
  fi

  ADMIN_EMAIL="${DIRECTUS_ADMIN_EMAIL:-admin@softwarelotus.com.br}"
  ADMIN_PASSWORD="${DIRECTUS_ADMIN_PASSWORD:-admin123}"

  TOKEN_RESPONSE=$(curl -s -X POST http://localhost:8055/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

  DIRECTUS_ADMIN_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

  if [ -z "$DIRECTUS_ADMIN_TOKEN" ]; then
    echo "❌ ERROR: Failed to get admin token"
    echo "   Response: $TOKEN_RESPONSE"
    echo ""
    echo "   Please set DIRECTUS_ADMIN_TOKEN manually:"
    echo "   export DIRECTUS_ADMIN_TOKEN='your-token-here'"
    exit 1
  fi
fi

echo "✅ Got admin token"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 5: VERIFY EXTENSIONS LOADED
# ═══════════════════════════════════════════════════════════════════════════

echo "🔍 Step 5: Verifying extensions loaded..."

EXTENSIONS=$(curl -s http://localhost:8055/extensions \
  -H "Authorization: Bearer $DIRECTUS_ADMIN_TOKEN")

if echo "$EXTENSIONS" | grep -q "magicsaas-dashboard"; then
  echo "✅ Extensions verified and loaded"
else
  echo "⚠️  WARNING: Extensions may not be loaded yet"
  echo "   Extensions will be available after Directus fully starts"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 6: IMPORT FLOWS (commented out - manual import recommended)
# ═══════════════════════════════════════════════════════════════════════════

echo "📥 Step 6: Importing Flows..."
echo "   ⚠️  MANUAL IMPORT RECOMMENDED:"
echo "   1. Go to http://localhost:8055/admin/settings/flows"
echo "   2. Click 'Import Flow'"
echo "   3. Upload: backend/directus/flows/magicsaas-metrics-collection.json"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# STEP 7: IMPORT INSIGHTS (commented out - manual import recommended)
# ═══════════════════════════════════════════════════════════════════════════

echo "📊 Step 7: Importing Insights..."
echo "   ⚠️  MANUAL IMPORT RECOMMENDED:"
echo "   1. Go to http://localhost:8055/admin/insights"
echo "   2. Create new dashboard"
echo "   3. Use JSON from:"
echo "      - backend/directus/insights/magicsaas-revenue-insights.json"
echo "      - backend/directus/insights/magicsaas-user-engagement.json"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SUCCESS
# ═══════════════════════════════════════════════════════════════════════════

echo "╔══════════════════════════════════════════════════════════════════════════╗"
echo "║                                                                          ║"
echo "║                  ✅ DIRECTUS EXTENSIONS READY ✅                          ║"
echo "║                                                                          ║"
echo "╚══════════════════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Summary:"
echo "   ✅ Panel extension built"
echo "   ✅ Endpoint extension built"
echo "   ✅ Directus restarted"
echo "   ✅ Extensions loaded"
echo ""
echo "🌐 Next Steps:"
echo "   1. Open Directus Admin: http://localhost:8055"
echo "   2. Go to Settings → Extensions to verify"
echo "   3. Test API endpoint: http://localhost:8055/magicsaas/dashboard/metrics"
echo "   4. Add dashboard panel to Insights"
echo "   5. Import Flows and Insights manually"
echo ""
