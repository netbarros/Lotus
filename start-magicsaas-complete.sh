#!/usr/bin/env bash

# ==============================================================================
#
#         🌸 MAGICSAAS SYSTEM-∞ + PÉTALA FASHION
#         COMPLETE END-TO-END STARTUP SCRIPT
#
#         Starts all services in correct order with health checks
#
# ==============================================================================

set -euo pipefail

# Colors
readonly COLOR_RESET='\033[0m'
readonly COLOR_RED='\033[0;31m'
readonly COLOR_GREEN='\033[0;32m'
readonly COLOR_YELLOW='\033[1;33m'
readonly COLOR_BLUE='\033[0;34m'
readonly COLOR_MAGENTA='\033[0;35m'
readonly COLOR_CYAN='\033[0;36m'
readonly COLOR_WHITE='\033[1;37m'

# Script directory
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Utility functions
print_color() {
    local color="$1"
    shift
    echo -e "${color}$*${COLOR_RESET}"
}

print_header() {
    echo ""
    print_color "$COLOR_MAGENTA" "╔══════════════════════════════════════════════════════════════════════════╗"
    print_color "$COLOR_MAGENTA" "║ $(printf '%-74s' "$1") ║"
    print_color "$COLOR_MAGENTA" "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

print_success() {
    print_color "$COLOR_GREEN" "  ✅ $1"
}

print_error() {
    print_color "$COLOR_RED" "  ❌ $1"
}

print_warning() {
    print_color "$COLOR_YELLOW" "  ⚠️  $1"
}

print_info() {
    print_color "$COLOR_CYAN" "  ℹ️  $1"
}

# ==============================================================================
# WELCOME
# ==============================================================================

show_welcome() {
    clear
    echo ""
    print_color "$COLOR_MAGENTA" "╔══════════════════════════════════════════════════════════════════════════╗"
    print_color "$COLOR_MAGENTA" "║                                                                          ║"
    print_color "$COLOR_MAGENTA" "║         🌸 MAGICSAAS SYSTEM-∞ + PÉTALA FASHION                          ║"
    print_color "$COLOR_MAGENTA" "║                                                                          ║"
    print_color "$COLOR_MAGENTA" "║         Complete End-to-End Startup                                      ║"
    print_color "$COLOR_MAGENTA" "║                                                                          ║"
    print_color "$COLOR_MAGENTA" "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

# ==============================================================================
# CHECK ENVIRONMENT
# ==============================================================================

check_environment() {
    print_header "CHECKING ENVIRONMENT"

    # Check .env file
    if [[ ! -f "${SCRIPT_DIR}/.env" ]]; then
        print_error ".env file not found!"
        print_info "Run ./install-magicsaas-ultimate.sh first"
        exit 1
    fi
    print_success ".env file found"

    # Check Docker
    if ! command -v docker &> /dev/null; then
        print_error "Docker not found!"
        exit 1
    fi
    print_success "Docker found"

    # Check Docker Compose
    if ! docker compose version &> /dev/null && ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose not found!"
        exit 1
    fi
    print_success "Docker Compose found"

    echo ""
}

# ==============================================================================
# START INFRASTRUCTURE LAYER
# ==============================================================================

start_infrastructure() {
    print_header "STARTING INFRASTRUCTURE LAYER"

    cd "${SCRIPT_DIR}/infrastructure/docker"

    print_info "Starting PostgreSQL + Redis..."
    docker compose -f docker-compose.dev.yml up -d postgres redis 2>/dev/null || docker-compose -f docker-compose.dev.yml up -d postgres redis

    # Wait for PostgreSQL
    print_info "Waiting for PostgreSQL to be ready..."
    local pg_ready=false
    for i in {1..30}; do
        if docker inspect --format='{{.State.Health.Status}}' magicsaas-postgres 2>/dev/null | grep -q 'healthy'; then
            pg_ready=true
            break
        fi
        sleep 2
    done

    if [[ "$pg_ready" == "true" ]]; then
        print_success "PostgreSQL is ready"
    else
        print_error "PostgreSQL failed to start"
        exit 1
    fi

    # Wait for Redis
    print_info "Waiting for Redis to be ready..."
    local redis_ready=false
    for i in {1..15}; do
        if docker inspect --format='{{.State.Health.Status}}' magicsaas-redis 2>/dev/null | grep -q 'healthy'; then
            redis_ready=true
            break
        fi
        sleep 1
    done

    if [[ "$redis_ready" == "true" ]]; then
        print_success "Redis is ready"
    else
        print_error "Redis failed to start"
        exit 1
    fi

    cd "${SCRIPT_DIR}"
    echo ""
}

# ==============================================================================
# START BACKEND LAYER
# ==============================================================================

start_backend() {
    print_header "STARTING BACKEND LAYER"

    cd "${SCRIPT_DIR}/infrastructure/docker"

    print_info "Starting Directus..."
    docker compose -f docker-compose.dev.yml up -d directus 2>/dev/null || docker-compose -f docker-compose.dev.yml up -d directus

    # Wait for Directus
    print_info "Waiting for Directus to be ready (this may take 1-2 minutes)..."
    local directus_ready=false
    for i in {1..40}; do
        if curl -sf http://localhost:8055/server/health >/dev/null 2>&1; then
            directus_ready=true
            break
        fi
        sleep 3
    done

    if [[ "$directus_ready" == "true" ]]; then
        print_success "Directus is ready"
    else
        print_warning "Directus is still starting (continuing anyway)"
    fi

    cd "${SCRIPT_DIR}"
    echo ""
}

# ==============================================================================
# START APPLICATION LAYER
# ==============================================================================

start_applications() {
    print_header "STARTING APPLICATION LAYER"

    cd "${SCRIPT_DIR}/infrastructure/docker"

    print_info "Starting Sofia AI..."
    docker compose -f docker-compose.dev.yml up -d sofia-ai 2>/dev/null || docker-compose -f docker-compose.dev.yml up -d sofia-ai

    # Wait for Sofia AI
    print_info "Waiting for Sofia AI to be ready..."
    local sofia_ready=false
    for i in {1..20}; do
        if curl -sf http://localhost:3003/health >/dev/null 2>&1; then
            sofia_ready=true
            break
        fi
        sleep 3
    done

    if [[ "$sofia_ready" == "true" ]]; then
        print_success "Sofia AI is ready"
    else
        print_warning "Sofia AI is still starting (continuing anyway)"
    fi

    cd "${SCRIPT_DIR}"
    echo ""
}

# ==============================================================================
# START MONITORING LAYER
# ==============================================================================

start_monitoring() {
    print_header "STARTING MONITORING LAYER"

    cd "${SCRIPT_DIR}/infrastructure/docker"

    print_info "Starting Prometheus + Grafana..."
    docker compose -f docker-compose.dev.yml up -d prometheus grafana 2>/dev/null || docker-compose -f docker-compose.dev.yml up -d prometheus grafana

    # Wait for Prometheus
    print_info "Waiting for Prometheus..."
    sleep 10
    if curl -sf http://localhost:9090/-/healthy >/dev/null 2>&1; then
        print_success "Prometheus is ready"
    else
        print_warning "Prometheus is still starting"
    fi

    # Wait for Grafana
    print_info "Waiting for Grafana..."
    sleep 10
    if curl -sf http://localhost:3002/api/health >/dev/null 2>&1; then
        print_success "Grafana is ready"
    else
        print_warning "Grafana is still starting"
    fi

    cd "${SCRIPT_DIR}"
    echo ""
}

# ==============================================================================
# START PÉTALA FASHION
# ==============================================================================

start_petala_fashion() {
    print_header "STARTING PÉTALA FASHION"

    cd "${SCRIPT_DIR}/petalas/fashion"

    print_info "Starting Pétala Fashion services..."
    docker compose up -d 2>/dev/null || docker-compose up -d

    # Wait for frontend
    print_info "Waiting for Fashion frontend..."
    sleep 10
    if curl -sf http://localhost:5173 >/dev/null 2>&1; then
        print_success "Fashion frontend is ready"
    else
        print_warning "Fashion frontend is still starting"
    fi

    cd "${SCRIPT_DIR}"
    echo ""
}

# ==============================================================================
# VERIFY ALL SERVICES
# ==============================================================================

verify_services() {
    print_header "VERIFYING ALL SERVICES"

    local services=(
        "PostgreSQL:5432:magicsaas-postgres"
        "Redis:6379:magicsaas-redis"
        "Directus:8055:magicsaas-directus"
        "Sofia AI:3003:magicsaas-sofia-ai"
        "Prometheus:9090:prometheus"
        "Grafana:3002:grafana"
        "Fashion Frontend:5173:petala-fashion-frontend"
    )

    local all_healthy=true

    for service_info in "${services[@]}"; do
        IFS=':' read -r name port container <<< "$service_info"

        echo -n "  Checking $name... "

        if docker ps --filter "name=${container}" --format "{{.Status}}" | grep -q "Up" 2>/dev/null; then
            # Check if port is responding
            if nc -z localhost "$port" 2>/dev/null || curl -sf "http://localhost:${port}" >/dev/null 2>&1; then
                print_success "OK"
            else
                print_warning "STARTING"
                all_healthy=false
            fi
        else
            print_error "NOT RUNNING"
            all_healthy=false
        fi
    done

    echo ""

    if [[ "$all_healthy" == "true" ]]; then
        print_success "All services are operational!"
    else
        print_warning "Some services are still starting. Give them a few more seconds."
    fi

    return $([ "$all_healthy" == "true" ] && echo 0 || echo 1)
}

# ==============================================================================
# SHOW ACCESS POINTS
# ==============================================================================

show_access_points() {
    print_header "ACCESS POINTS"

    print_color "$COLOR_GREEN" "  🌸 MagicSaaS System-∞:"
    echo "     Sofia AI Health:  http://localhost:3003/health"
    echo "     Sofia AI Metrics: http://localhost:3003/metrics"
    echo ""

    print_color "$COLOR_GREEN" "  🎯 Directus CMS:"
    echo "     URL:   http://localhost:8055"
    echo "     Admin: http://localhost:8055/admin"
    echo ""

    print_color "$COLOR_GREEN" "  👗 Pétala Fashion:"
    echo "     Frontend:  http://localhost:5173"
    echo "     API:       http://localhost:8055/petalas/fashion"
    echo ""

    print_color "$COLOR_GREEN" "  📊 Monitoring:"
    echo "     Prometheus: http://localhost:9090"
    echo "     Grafana:    http://localhost:3002"
    echo ""

    print_color "$COLOR_GREEN" "  📊 Grafana Dashboards:"
    echo "     • System Overview"
    echo "     • Sofia AI Cognitive Layers"
    echo "     • Business Metrics"
    echo "     • Security Dashboard"
    echo "     • Performance SLO"
    echo "     • Pétala Fashion (Orders, Revenue, Customers)"
    echo ""
}

# ==============================================================================
# SHOW USEFUL COMMANDS
# ==============================================================================

show_commands() {
    print_header "USEFUL COMMANDS"

    echo "  View logs:"
    echo "  docker logs -f magicsaas-sofia-ai"
    echo "  docker logs -f magicsaas-directus"
    echo "  docker logs -f petala-fashion-frontend"
    echo ""

    echo "  View all logs:"
    echo "  cd infrastructure/docker && docker compose -f docker-compose.dev.yml logs -f"
    echo ""

    echo "  Stop all services:"
    echo "  ./stop-magicsaas-complete.sh"
    echo ""

    echo "  Restart services:"
    echo "  docker restart magicsaas-directus"
    echo "  docker restart petala-fashion-frontend"
    echo ""

    echo "  Run Pétala Fashion tests:"
    echo "  cd petalas/fashion/frontend && pnpm test"
    echo "  cd petalas/fashion/frontend && pnpm test:e2e"
    echo ""
}

# ==============================================================================
# MAIN
# ==============================================================================

main() {
    show_welcome
    check_environment

    print_info "Starting services in correct order..."
    echo ""

    start_infrastructure
    start_backend
    start_applications
    start_monitoring
    start_petala_fashion

    print_info "Waiting 10 seconds for services to stabilize..."
    sleep 10
    echo ""

    verify_services
    show_access_points
    show_commands

    echo ""
    print_color "$COLOR_GREEN" "╔══════════════════════════════════════════════════════════════════════════╗"
    print_color "$COLOR_GREEN" "║                                                                          ║"
    print_color "$COLOR_GREEN" "║   ✨ MAGICSAAS + PÉTALA FASHION STARTED SUCCESSFULLY! ✨               ║"
    print_color "$COLOR_GREEN" "║                                                                          ║"
    print_color "$COLOR_GREEN" "║   All services are running and ready to use                              ║"
    print_color "$COLOR_GREEN" "║                                                                          ║"
    print_color "$COLOR_GREEN" "╚══════════════════════════════════════════════════════════════════════════╝"
    echo ""
}

main "$@"
