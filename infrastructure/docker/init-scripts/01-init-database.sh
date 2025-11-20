#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# MAGICSAAS SYSTEM-∞ - PostgreSQL Init Script
# Auto-runs on PostgreSQL container startup
# ═══════════════════════════════════════════════════════════════════════════

set -e

echo "═══════════════════════════════════════════════════════"
echo "MagicSaaS Database - Initialization Starting..."
echo "═══════════════════════════════════════════════════════"

# Wait for PostgreSQL to be fully ready
sleep 5

# Run schemas
if [ -d "/schemas" ]; then
    echo "Installing extensions..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /schemas/00-extensions.sql

    echo "Creating core tables..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /schemas/01-core-tables.sql

    echo "Creating billing tables..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /schemas/02-billing-credits.sql

    echo "Creating Sofia AI v4.0 tables..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /schemas/03-sofia-ai-v4.sql
fi

# Run seeds
if [ -d "/seeds" ]; then
    echo "Inserting seed data..."
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" -f /seeds/00-initial-data.sql
fi

echo "═══════════════════════════════════════════════════════"
echo "✅ MagicSaaS Database - Initialization Complete!"
echo "═══════════════════════════════════════════════════════"
