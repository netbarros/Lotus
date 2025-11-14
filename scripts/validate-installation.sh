#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# MAGICSAAS SYSTEM-∞ - INSTALLATION VALIDATOR
# Complete End-to-End Validation Script
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; MAGENTA='\033[0;35m'; CYAN='\033[0;36m'; NC='\033[0m'

PASS_COUNT=0
FAIL_COUNT=0

log_test() {
    local test_name=$1
    local result=$2
    local details=${3:-""}

    if [ "$result" = "pass" ]; then
        echo -e "${GREEN}✓${NC} ${test_name}"
        [ -n "$details" ] && echo -e "  ${CYAN}${details}${NC}"
        ((PASS_COUNT++))
    else
        echo -e "${RED}✗${NC} ${test_name}"
        [ -n "$details" ] && echo -e "  ${RED}${details}${NC}"
        ((FAIL_COUNT++))
    fi
}

check_service() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}

    if response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null); then
        if [ "$response" -eq "$expected_status" ] || [ "$response" -eq 200 ] || [ "$response" -eq 302 ]; then
            log_test "$name" "pass" "HTTP $response"
            return 0
        else
            log_test "$name" "fail" "HTTP $response (expected $expected_status)"
            return 1
        fi
    else
        log_test "$name" "fail" "Service unreachable"
        return 1
    fi
}

check_docker_service() {
    local service_name=$1
    if docker ps --format '{{.Names}}' | grep -q "^${service_name}$"; then
        if [ "$(docker inspect -f '{{.State.Health.Status}}' "$service_name" 2>/dev/null || echo 'unknown')" = "healthy" ] || \
           [ "$(docker inspect -f '{{.State.Status}}' "$service_name")" = "running" ]; then
            log_test "Docker: $service_name" "pass" "Running"
            return 0
        else
            log_test "Docker: $service_name" "fail" "Unhealthy"
            return 1
        fi
    else
        log_test "Docker: $service_name" "fail" "Not running"
        return 1
    fi
}

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  MagicSaaS System-∞ - Installation Validator${NC}"
echo -e "${CYAN}  Sofia AI v4.0 - Complete Stack Validation${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# DOCKER SERVICES
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Docker Services${NC}"
check_docker_service "magicsaas-postgres"
check_docker_service "magicsaas-redis"
check_docker_service "magicsaas-minio"
check_docker_service "magicsaas-directus"
check_docker_service "magicsaas-sofia-ai"
check_docker_service "magicsaas-evolution-api"
check_docker_service "magicsaas-chatwoot"
check_docker_service "magicsaas-langfuse"
check_docker_service "magicsaas-qdrant"
check_docker_service "magicsaas-prometheus"
check_docker_service "magicsaas-grafana"
check_docker_service "magicsaas-jaeger"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# HEALTH ENDPOINTS
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Health Endpoints${NC}"
check_service "Sofia AI v4.0" "http://localhost:3003/health"
check_service "Directus" "http://localhost:8055/server/health"
check_service "Evolution API" "http://localhost:8080/"
check_service "Chatwoot" "http://localhost:3000/api"
check_service "Langfuse" "http://localhost:3030/api/public/health"
check_service "Qdrant" "http://localhost:6333/healthz"
check_service "Prometheus" "http://localhost:9090/-/healthy"
check_service "Grafana" "http://localhost:3002/api/health"
check_service "Jaeger" "http://localhost:14269/"
check_service "MinIO" "http://localhost:9000/minio/health/live"
check_service "MailHog" "http://localhost:8025/"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# DATABASE
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Database${NC}"
if docker exec magicsaas-postgres pg_isready -U postgres >/dev/null 2>&1; then
    log_test "PostgreSQL Ready" "pass"

    # Check extensions
    EXTENSIONS=$(docker exec magicsaas-postgres psql -U postgres -d magicsaas -t -c "SELECT COUNT(*) FROM pg_extension WHERE extname IN ('uuid-ossp', 'pgcrypto', 'vector', 'timescaledb')" 2>/dev/null | tr -d ' ')
    if [ "$EXTENSIONS" -ge 4 ]; then
        log_test "PostgreSQL Extensions" "pass" "$EXTENSIONS extensions"
    else
        log_test "PostgreSQL Extensions" "fail" "Only $EXTENSIONS found"
    fi

    # Check tables
    TABLES=$(docker exec magicsaas-postgres psql -U postgres -d magicsaas -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null | tr -d ' ')
    if [ "$TABLES" -ge 15 ]; then
        log_test "Database Tables" "pass" "$TABLES tables"
    else
        log_test "Database Tables" "fail" "Only $TABLES tables"
    fi

    # Check seed data
    PLANS=$(docker exec magicsaas-postgres psql -U postgres -d magicsaas -t -c "SELECT COUNT(*) FROM plans" 2>/dev/null | tr -d ' ')
    if [ "$PLANS" -ge 5 ]; then
        log_test "Seed Data" "pass" "$PLANS plans"
    else
        log_test "Seed Data" "fail" "Only $PLANS plans"
    fi
else
    log_test "PostgreSQL Ready" "fail"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# REDIS
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Redis${NC}"
if docker exec magicsaas-redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
    log_test "Redis" "pass" "PONG"
else
    log_test "Redis" "fail"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# NETWORK
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Network${NC}"
if docker network inspect magicsaas-network >/dev/null 2>&1; then
    CONTAINERS=$(docker network inspect magicsaas-network --format '{{len .Containers}}')
    log_test "Docker Network" "pass" "$CONTAINERS containers"
else
    log_test "Docker Network" "fail"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# VOLUMES
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Volumes${NC}"
VOLUMES=$(docker volume ls --filter name=magicsaas --format '{{.Name}}' | wc -l)
if [ "$VOLUMES" -ge 10 ]; then
    log_test "Docker Volumes" "pass" "$VOLUMES volumes"
else
    log_test "Docker Volumes" "fail" "Only $VOLUMES volumes"
fi
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# FILES & DIRECTORIES
# ═══════════════════════════════════════════════════════════════════════════

echo -e "${MAGENTA}▶ Files & Directories${NC}"
[ -f ".env" ] && log_test ".env file" "pass" || log_test ".env file" "fail"
[ -d "database/schemas" ] && log_test "Database schemas" "pass" || log_test "Database schemas" "fail"
[ -d "database/seeds" ] && log_test "Database seeds" "pass" || log_test "Database seeds" "fail"
[ -f "infrastructure/docker/docker-compose.ultimate.yml" ] && log_test "Docker Compose" "pass" || log_test "Docker Compose" "fail"
[ -x "install-magicsaas-ultimate-v4.sh" ] && log_test "Installer script" "pass" || log_test "Installer script" "fail"
echo ""

# ═══════════════════════════════════════════════════════════════════════════
# SUMMARY
# ═══════════════════════════════════════════════════════════════════════════

TOTAL=$((PASS_COUNT + FAIL_COUNT))
PERCENTAGE=$((PASS_COUNT * 100 / TOTAL))

echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  Validation Summary${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Total Tests: ${CYAN}${TOTAL}${NC}"
echo -e "  Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "  Failed: ${RED}${FAIL_COUNT}${NC}"
echo -e "  Success Rate: ${CYAN}${PERCENTAGE}%${NC}"
echo ""

if [ "$FAIL_COUNT" -eq 0 ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED!${NC}"
    echo -e "${GREEN}MagicSaaS System-∞ is fully operational!${NC}"
    echo ""
    exit 0
else
    echo -e "${YELLOW}⚠️  SOME CHECKS FAILED${NC}"
    echo -e "${YELLOW}Review the errors above and run: docker compose logs [service]${NC}"
    echo ""
    exit 1
fi
