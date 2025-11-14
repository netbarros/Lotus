-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - DATABASE EXTENSIONS
-- Sofia AI v4.0 - The Brain - Complete Database Setup
-- ═══════════════════════════════════════════════════════════════════════════
--
-- This script installs all required PostgreSQL extensions for MagicSaaS
-- Must be run as superuser (postgres)
--
-- Extensions:
-- - uuid-ossp: UUID generation
-- - pgcrypto: Encryption functions
-- - pg_trgm: Text search with trigrams
-- - btree_gin: Indexing optimization
-- - pgvector: Vector embeddings for AI (Sofia v4.0)
-- - timescaledb: Time-series data optimization
-- - pg_stat_statements: Query performance monitoring
--
-- ═══════════════════════════════════════════════════════════════════════════

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "timescaledb";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Verify extensions
DO $$
DECLARE
    ext_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO ext_count
    FROM pg_extension
    WHERE extname IN (
        'uuid-ossp',
        'pgcrypto',
        'pg_trgm',
        'btree_gin',
        'vector',
        'timescaledb',
        'pg_stat_statements'
    );

    IF ext_count = 7 THEN
        RAISE NOTICE '✅ All 7 extensions installed successfully!';
    ELSE
        RAISE EXCEPTION '❌ Expected 7 extensions, found %', ext_count;
    END IF;
END $$;

-- Set up search path
ALTER DATABASE magicsaas SET search_path TO public, timescaledb_information;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;

-- Success message
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'MagicSaaS Database Extensions - Installation Complete';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ uuid-ossp       - UUID generation';
    RAISE NOTICE '✅ pgcrypto        - Encryption';
    RAISE NOTICE '✅ pg_trgm         - Text search';
    RAISE NOTICE '✅ btree_gin       - Index optimization';
    RAISE NOTICE '✅ vector          - AI embeddings';
    RAISE NOTICE '✅ timescaledb     - Time-series';
    RAISE NOTICE '✅ pg_stat_stmts   - Query monitoring';
    RAISE NOTICE '';
    RAISE NOTICE 'Database ready for MagicSaaS System-∞!';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
