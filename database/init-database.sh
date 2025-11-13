#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# MAGICSAAS SYSTEM-∞ - DATABASE INITIALIZATION
# Complete Database Setup with All Schemas and Seeds
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMAS_DIR="${SCRIPT_DIR}/schemas"
SEEDS_DIR="${SCRIPT_DIR}/seeds"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[⚠]${NC} $1"; }

# Database connection
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-magicsaas}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASS="${POSTGRES_PASSWORD:-postgres}"

export PGPASSWORD="$DB_PASS"

echo ""
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo -e "${CYAN}  MagicSaaS System-∞ - Database Initialization${NC}"
echo -e "${CYAN}═══════════════════════════════════════════════════════${NC}"
echo ""

# Wait for PostgreSQL
log_info "Waiting for PostgreSQL to be ready..."
for i in {1..30}; do
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c '\q' 2>/dev/null; then
        log_success "PostgreSQL is ready!"
        break
    fi
    if [ $i -eq 30 ]; then
        log_error "PostgreSQL failed to start"
        exit 1
    fi
    sleep 2
done

# Create database if not exists
log_info "Ensuring database exists..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1 || \
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE ${DB_NAME}"
log_success "Database ready: ${DB_NAME}"

# Function to run SQL file
run_sql_file() {
    local file=$1
    local description=$2

    log_info "Running: ${description}..."
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        log_success "${description} completed"
    else
        log_error "${description} failed"
        exit 1
    fi
}

# Run schemas in order
log_info "Creating database schemas..."
run_sql_file "${SCHEMAS_DIR}/00-extensions.sql" "Extensions installation"
run_sql_file "${SCHEMAS_DIR}/01-core-tables.sql" "Core tables"
run_sql_file "${SCHEMAS_DIR}/02-billing-credits.sql" "Billing & Credits"
run_sql_file "${SCHEMAS_DIR}/03-sofia-ai-v4.sql" "Sofia AI v4.0 tables"

# Run seeds
log_info "Inserting seed data..."
run_sql_file "${SEEDS_DIR}/00-initial-data.sql" "Initial data"

# Verify installation
log_info "Verifying installation..."

TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*)
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_type = 'BASE TABLE'
")

EXTENSION_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "
    SELECT COUNT(*)
    FROM pg_extension
    WHERE extname IN ('uuid-ossp', 'pgcrypto', 'pg_trgm', 'vector', 'timescaledb')
")

log_success "Tables created: ${TABLE_COUNT}"
log_success "Extensions installed: ${EXTENSION_COUNT}"

# Summary
echo ""
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Database Initialization Complete!${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  Database: ${CYAN}${DB_NAME}${NC}"
echo -e "  Host: ${CYAN}${DB_HOST}:${DB_PORT}${NC}"
echo -e "  Tables: ${CYAN}${TABLE_COUNT}${NC}"
echo -e "  Extensions: ${CYAN}${EXTENSION_COUNT}${NC}"
echo ""
echo -e "${YELLOW}Default credentials:${NC}"
echo -e "  Email: ${CYAN}admin@softwarelotus.com.br${NC}"
echo -e "  Pass:  ${CYAN}Admin123!${NC}"
echo ""
echo -e "${RED}⚠️  CHANGE DEFAULT PASSWORD IN PRODUCTION!${NC}"
echo ""

unset PGPASSWORD
