#!/bin/bash

# =====================================================
# 🏆 MAGICSAAS SYSTEM-11 INSTALLER
# Cognitive Mesh Operating System (Phase 3: Infrastructure)
# =====================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_step() { echo -e "\n${BLUE}▶${NC} ${GREEN}${1}${NC}"; }
print_info() { echo -e "  ${BLUE}ℹ${NC} ${1}"; }
print_warn() { echo -e "  ${YELLOW}⚠${NC} ${1}"; }
print_err() { echo -e "  ${RED}✖${NC} ${1}"; }

echo -e "${BLUE}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════╗
║     🧠 MAGICSAAS SYSTEM-11 (COGNITIVE MESH)                  ║
║     Phase 3: Infrastructure & Validation                     ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# =====================================================
# 1. ENVIRONMENT CHECK
# =====================================================
print_step "Checking Environment..."

if ! command -v pnpm &> /dev/null; then
    print_err "pnpm is not installed. Please install it (npm i -g pnpm)."
    exit 1
fi

if ! command -v docker &> /dev/null; then
    print_err "Docker is not installed."
    exit 1
fi

# Check .env
if [ ! -f .env ]; then
    print_warn ".env not found. Creating from template..."
    # Simplified .env for System-11
    cat > .env << 'ENVEOF'
# MagicSaaS Core
NODE_ENV=development
LOG_LEVEL=info
CORS_ORIGIN=*

# Databases
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=magicsaas
REDIS_URL=redis://localhost:6379

# IoT Mesh
MQTT_URL=mqtt://localhost:1883
MQTT_WS_URL=ws://localhost:9001

# AI Bridges
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
ENVEOF
    print_info ".env created. PLEASE EDIT IT with your API keys!"
else
    print_info ".env exists."
fi

# =====================================================
# 2. START INFRASTRUCTURE (DOCKER)
# =====================================================
print_step "Starting Infrastructure (Docker)..."

DOCKER_COMPOSE_FILE="infrastructure/docker/docker-compose.dev.yml"

print_info "Starting Postgres, Redis, Mosquitto..."
docker-compose -f $DOCKER_COMPOSE_FILE up -d postgres redis mosquitto

print_info "Waiting for services..."
sleep 5

# Health Checks
if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up"; then
    print_info "Docker services are UP."
else
    print_err "Docker services failed to start."
    exit 1
fi

# Check MQTT Port
if nc -z localhost 1883; then
    print_info "MQTT Broker (1883) is listening."
else
    print_warn "MQTT Broker port 1883 not detected (might be starting)."
fi

# =====================================================
# 3. BUILD CORE PACKAGES
# =====================================================
print_step "Building System-11 Core Packages..."

# Install dependencies root
print_info "Installing dependencies..."
pnpm install

# Build order mapping (implicitly handled by pnpm -r but specific order helps debugging)
PACKAGES=(
    "@magicsaas/core"
    "@magicsaas/iot-mesh"
    "@magicsaas/erp-bridge"
    "@magicsaas/voice-bridge"
    "@magicsaas/ui-kit"
    "@magicsaas/sofia-sdk"
)

for pkg in "${PACKAGES[@]}"; do
    print_info "Building $pkg..."
    pnpm --filter "$pkg" build
done

print_info "All Core Packages Built."

# =====================================================
# 4. BUILD PILOT (MedicSaaS)
# =====================================================
print_step "Building Pilot: MedicSaaS..."

print_info "Building @petalas/medic-saas..."
if pnpm --filter @petalas/medic-saas build; then
    print_info "MedicSaaS Build Success."
else
    print_err "MedicSaaS Build Failed."
    exit 1
fi

# =====================================================
# 5. SUMMARY
# =====================================================
print_step "Installation Complete!"

echo -e "
${GREEN}SYSTEM-11 IS READY.${NC}

🚀 **Launch the Pilot:**
   cd petalas/medic-saas
   pnpm dev

📊 **Access:**
   - Reception: http://localhost:3000/reception
   - Finance:   http://localhost:3000/finance
   - Dashboard: http://localhost:3000/dashboard

🛠️ **Simulation:**
   pnpm --filter @petalas/medic-saas exec ts-node backend/scripts/simulate-sensor.ts
"
