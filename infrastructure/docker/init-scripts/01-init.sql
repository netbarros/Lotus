-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - PostgreSQL Initialization Script
-- This script runs automatically when the database container is first created
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";      -- UUID generation
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- Fuzzy text search
CREATE EXTENSION IF NOT EXISTS "btree_gist";     -- Advanced indexing
CREATE EXTENSION IF NOT EXISTS "vector";         -- pgVector for AI embeddings
CREATE EXTENSION IF NOT EXISTS "timescaledb";    -- Time-series optimization for metrics/logs

-- Create schemas (if needed beyond public)
-- CREATE SCHEMA IF NOT EXISTS magicsaas;
-- CREATE SCHEMA IF NOT EXISTS analytics;

-- Set timezone
SET timezone = 'UTC';

-- Performance settings
ALTER DATABASE magicsaas SET statement_timeout = '30s';
ALTER DATABASE magicsaas SET idle_in_transaction_session_timeout = '60s';

-- Log
SELECT 'MagicSaaS System-∞ PostgreSQL initialized successfully!' AS status;
