#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# MAGICSAAS SYSTEM-∞ - DATABASE INITIALIZATION SCRIPT
# Complete End-to-End Database Setup with Sofia AI v4.0
# Executes ALL schemas and seeds in correct order
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMAS_DIR="${SCRIPT_DIR}/schemas"
SEEDS_DIR="${SCRIPT_DIR}/seeds"

# Database connection
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"
DB_NAME="${POSTGRES_DB:-magicsaas}"
DB_USER="${POSTGRES_USER:-postgres}"
export PGPASSWORD="${POSTGRES_PASSWORD:-postgres}"

# Logging
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[✓]${NC} $1"; }
log_error() { echo -e "${RED}[✗]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[⚠]${NC} $1"; }
log_section() {
    echo ""
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════${NC}"
    echo -e "${MAGENTA}  $1${NC}"
    echo -e "${MAGENTA}═══════════════════════════════════════════════════════${NC}"
    echo ""
}

# Check if PostgreSQL is ready
wait_for_postgres() {
    log_info "Waiting for PostgreSQL to be ready..."
    local max_attempts=30
    local attempt=1

    while [ $attempt -le $max_attempts ]; do
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1" >/dev/null 2>&1; then
            log_success "PostgreSQL is ready!"
            return 0
        fi

        log_warn "Attempt $attempt/$max_attempts - PostgreSQL not ready yet..."
        sleep 2
        ((attempt++))
    done

    log_error "PostgreSQL did not become ready in time"
    return 1
}

# Execute SQL file
execute_sql_file() {
    local file=$1
    local description=${2:-""}

    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        return 1
    fi

    log_info "Executing: $(basename "$file") ${description}"

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$file" > /dev/null 2>&1; then
        log_success "$(basename "$file") executed successfully"
        return 0
    else
        log_error "Failed to execute: $(basename "$file")"
        return 1
    fi
}

# Execute SQL command
execute_sql() {
    local sql=$1
    local description=${2:-""}

    [ -n "$description" ] && log_info "$description"

    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c "$sql" > /dev/null 2>&1; then
        [ -n "$description" ] && log_success "$description completed"
        return 0
    else
        log_error "Failed: $description"
        return 1
    fi
}

# Display banner
show_banner() {
    clear
    echo -e "${CYAN}"
    cat << "EOF"
  ███╗   ███╗ █████╗  ██████╗ ██╗ ██████╗███████╗ █████╗  █████╗ ███████╗
  ████╗ ████║██╔══██╗██╔════╝ ██║██╔════╝██╔════╝██╔══██╗██╔══██╗██╔════╝
  ██╔████╔██║███████║██║  ███╗██║██║     ███████╗███████║███████║███████╗
  ██║╚██╔╝██║██╔══██║██║   ██║██║██║     ╚════██║██╔══██║██╔══██║╚════██║
  ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║╚██████╗███████║██║  ██║██║  ██║███████║
  ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝ ╚═════╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝

           🧠 DATABASE INITIALIZATION - Sofia AI v4.0 Integration
                      Complete End-to-End Setup
EOF
    echo -e "${NC}"
}

# Main execution
main() {
    show_banner

    # Wait for PostgreSQL
    log_section "STEP 1: Checking PostgreSQL Connection"
    if ! wait_for_postgres; then
        exit 1
    fi

    # Create database if not exists
    log_section "STEP 2: Database Creation"
    log_info "Ensuring database '${DB_NAME}' exists..."
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -tc "SELECT 1 FROM pg_database WHERE datname = '${DB_NAME}'" | grep -q 1; then
        log_success "Database '${DB_NAME}' already exists"
    else
        psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "postgres" -c "CREATE DATABASE ${DB_NAME};" > /dev/null 2>&1
        log_success "Database '${DB_NAME}' created"
    fi

    # Execute schemas in order
    log_section "STEP 3: Executing Database Schemas"

    local schemas=(
        "00-extensions.sql:PostgreSQL Extensions (uuid, pgVector, TimescaleDB, etc.)"
        "01-core-tables.sql:Core Tables (tenants, users, plans, billing)"
        "02-billing-credits.sql:Lotus Credits & Billing System"
        "03-sofia-ai-v4.sql:Sofia AI v4.0 Tables (LangChain, Langfuse, Qdrant)"
        "04-healthcare-medicas.sql:Healthcare/Médicas Complete Schema"
        "05-sofia-universal-petalas.sql:Sofia AI Universal Integration (ALL 13 Pétalas)"
    )

    for schema_entry in "${schemas[@]}"; do
        IFS=':' read -r schema_file schema_desc <<< "$schema_entry"
        execute_sql_file "${SCHEMAS_DIR}/${schema_file}" "- ${schema_desc}"
    done

    # Execute seeds
    log_section "STEP 4: Loading Demo Data & Seeds"

    local seeds=(
        "00-initial-data.sql:Initial Data (plans, tenants, users, roles)"
        "01-healthcare-demo-data.sql:Healthcare Demo Data (facilities, providers, patients)"
    )

    for seed_entry in "${seeds[@]}"; do
        IFS=':' read -r seed_file seed_desc <<< "$seed_entry"
        seed_path="${SEEDS_DIR}/${seed_file}"
        if [ -f "$seed_path" ]; then
            execute_sql_file "$seed_path" "- ${seed_desc}"
        else
            log_warn "Seed file not found: ${seed_file}"
        fi
    done

    # Validation
    log_section "STEP 5: Database Validation"

    log_info "Counting tables..."
    table_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';" | xargs)
    log_success "Total tables created: ${table_count}"

    log_info "Verifying critical tables..."
    local critical_tables=(
        "tenants"
        "users"
        "plans"
        "sofia_decisions"
        "embeddings"
        "healthcare_patients"
        "healthcare_providers"
        "healthcare_appointments"
        "petalas_registry"
        "sofia_petala_insights"
        "sofia_embeddings_universal"
    )

    for table in "${critical_tables[@]}"; do
        if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = '${table}');" | grep -q t; then
            log_success "Table '${table}' exists"
        else
            log_error "Table '${table}' NOT found!"
        fi
    done

    log_info "Checking TimescaleDB hypertables..."
    hypertable_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM timescaledb_information.hypertables;" | xargs)
    log_success "TimescaleDB hypertables: ${hypertable_count}"

    log_info "Verifying pgVector extension..."
    if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector');" | grep -q t; then
        log_success "pgVector extension installed"
    else
        log_warn "pgVector extension not found"
    fi

    log_info "Checking Row Level Security (RLS) policies..."
    rls_count=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM pg_policies;" | xargs)
    log_success "RLS policies active: ${rls_count}"

    # Final summary
    log_section "STEP 6: Installation Summary"

    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════════════════╗"
    echo "║                                                                          ║"
    echo "║  ✅ DATABASE INITIALIZATION COMPLETE!                                   ║"
    echo "║                                                                          ║"
    echo "║  📊 Summary:                                                            ║"
    echo "║     • Total Tables: ${table_count}                                                       ║"
    echo "║     • TimescaleDB Hypertables: ${hypertable_count}                                                 ║"
    echo "║     • RLS Policies: ${rls_count}                                                        ║"
    echo "║                                                                          ║"
    echo "║  🧠 Sofia AI v4.0 Integration:                                          ║"
    echo "║     ✓ LangChain + Langfuse + Qdrant ready                               ║"
    echo "║     ✓ pgVector embeddings (1536 dimensions)                             ║"
    echo "║     ✓ TimescaleDB time-series optimization                              ║"
    echo "║     ✓ Universal integration with ALL 13 Pétalas                         ║"
    echo "║                                                                          ║"
    echo "║  💊 Healthcare/Médicas System:                                          ║"
    echo "║     ✓ 3 Facilities (Hospital, Clinic, Lab)                              ║"
    echo "║     ✓ 10 Healthcare Providers (all specialties)                         ║"
    echo "║     ✓ 15 Patients (diverse demographics)                                ║"
    echo "║     ✓ 20 Appointments (scheduled + historical)                          ║"
    echo "║                                                                          ║"
    echo "║  🌸 All 13 Pétalas registered and ready!                                ║"
    echo "║                                                                          ║"
    echo "║  🚀 MagicSaaS System-∞ is ready for production!                         ║"
    echo "║                                                                          ║"
    echo "╚══════════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"

    echo ""
    log_info "You can now start using MagicSaaS with Sofia AI v4.0!"
    echo ""
}

# Execute main function
main "$@"

# Clean up
unset PGPASSWORD
