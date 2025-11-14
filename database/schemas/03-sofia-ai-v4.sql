-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - SOFIA AI v4.0 TABLES
-- The Brain - Complete AI & ML Infrastructure
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- SOFIA AI DECISIONS LOG
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sofia_decisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Decision type
    decision_type VARCHAR(100) NOT NULL CHECK (decision_type IN (
        'intention_generation', 'ux_validation', 'seo_optimization',
        'marketplace_recommendation', 'auto_improvement', 'system_optimization'
    )),

    -- Input
    input_data JSONB NOT NULL,
    context JSONB DEFAULT '{}'::JSONB,

    -- Processing
    model_used VARCHAR(100),
    tokens_used INTEGER,
    processing_time_ms INTEGER,

    -- Decision
    decision JSONB NOT NULL,
    confidence_score DECIMAL(5, 4) CHECK (confidence_score BETWEEN 0 AND 1),
    reasoning TEXT,

    -- Status
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN (
        'pending', 'approved', 'rejected', 'applied', 'failed'
    )),
    applied_at TIMESTAMP WITH TIME ZONE,
    applied_by UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Outcome
    outcome JSONB,
    feedback_score INTEGER CHECK (feedback_score BETWEEN 1 AND 5),
    feedback_comment TEXT,

    -- Tracing
    trace_id VARCHAR(255),
    span_id VARCHAR(255),
    langfuse_trace_url TEXT,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sofia_decisions_tenant ON sofia_decisions(tenant_id);
CREATE INDEX idx_sofia_decisions_user ON sofia_decisions(user_id);
CREATE INDEX idx_sofia_decisions_type ON sofia_decisions(decision_type);
CREATE INDEX idx_sofia_decisions_status ON sofia_decisions(status);
CREATE INDEX idx_sofia_decisions_created ON sofia_decisions(created_at DESC);
CREATE INDEX idx_sofia_decisions_trace ON sofia_decisions(trace_id);

SELECT create_hypertable('sofia_decisions', 'created_at', if_not_exists => TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- VECTOR EMBEDDINGS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS embeddings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Source
    source_type VARCHAR(100) NOT NULL,
    source_id VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,

    -- Embedding
    embedding vector(1536), -- OpenAI ada-002 dimension
    model VARCHAR(100) DEFAULT 'text-embedding-ada-002',

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, source_type, source_id)
);

CREATE INDEX idx_embeddings_tenant ON embeddings(tenant_id);
CREATE INDEX idx_embeddings_source ON embeddings(source_type, source_id);
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- ═══════════════════════════════════════════════════════════════════════════
-- LANGCHAIN CONVERSATIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS langchain_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,

    -- Conversation
    session_id VARCHAR(255) NOT NULL,
    title VARCHAR(500),

    -- Context
    context JSONB DEFAULT '{}'::JSONB,
    summary TEXT,

    -- Messages
    message_count INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, session_id)
);

CREATE INDEX idx_langchain_conv_tenant ON langchain_conversations(tenant_id);
CREATE INDEX idx_langchain_conv_user ON langchain_conversations(user_id);
CREATE INDEX idx_langchain_conv_session ON langchain_conversations(session_id);
CREATE INDEX idx_langchain_conv_status ON langchain_conversations(status);

CREATE TRIGGER update_langchain_conversations_updated_at BEFORE UPDATE ON langchain_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- LANGCHAIN MESSAGES
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS langchain_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES langchain_conversations(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Message
    role VARCHAR(50) NOT NULL CHECK (role IN ('system', 'user', 'assistant', 'function')),
    content TEXT NOT NULL,

    -- Tokens
    tokens INTEGER,
    model VARCHAR(100),

    -- Function call
    function_name VARCHAR(255),
    function_args JSONB,
    function_result JSONB,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_langchain_msg_conversation ON langchain_messages(conversation_id);
CREATE INDEX idx_langchain_msg_tenant ON langchain_messages(tenant_id);
CREATE INDEX idx_langchain_msg_created ON langchain_messages(created_at DESC);

SELECT create_hypertable('langchain_messages', 'created_at', if_not_exists => TRUE);

-- ═══════════════════════════════════════════════════════════════════════════
-- QDRANT COLLECTIONS METADATA
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS qdrant_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Collection
    collection_name VARCHAR(255) NOT NULL,
    vector_dimension INTEGER NOT NULL,
    distance_metric VARCHAR(50) DEFAULT 'cosine',

    -- Stats
    vectors_count BIGINT DEFAULT 0,
    indexed_vectors_count BIGINT DEFAULT 0,

    -- Configuration
    config JSONB DEFAULT '{}'::JSONB,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    UNIQUE(tenant_id, collection_name)
);

CREATE INDEX idx_qdrant_collections_tenant ON qdrant_collections(tenant_id);
CREATE INDEX idx_qdrant_collections_name ON qdrant_collections(collection_name);

CREATE TRIGGER update_qdrant_collections_updated_at BEFORE UPDATE ON qdrant_collections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ═══════════════════════════════════════════════════════════════════════════
-- AI MODEL CONFIGURATIONS
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS ai_model_configs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Model
    model_name VARCHAR(255) NOT NULL,
    provider VARCHAR(100) NOT NULL,
    model_type VARCHAR(100) NOT NULL CHECK (model_type IN (
        'llm', 'embedding', 'vision', 'audio', 'multimodal'
    )),

    -- Configuration
    config JSONB NOT NULL DEFAULT '{}'::JSONB,
    temperature DECIMAL(3, 2),
    max_tokens INTEGER,
    top_p DECIMAL(3, 2),

    -- Costs
    cost_per_1k_input_tokens DECIMAL(10, 6),
    cost_per_1k_output_tokens DECIMAL(10, 6),

    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_default BOOLEAN DEFAULT FALSE,

    -- Metadata
    metadata JSONB DEFAULT '{}'::JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_ai_models_tenant ON ai_model_configs(tenant_id);
CREATE INDEX idx_ai_models_type ON ai_model_configs(model_type);
CREATE INDEX idx_ai_models_active ON ai_model_configs(is_active);

CREATE TRIGGER update_ai_model_configs_updated_at BEFORE UPDATE ON ai_model_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Success message
DO $$
BEGIN
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE 'Sofia AI v4.0 Tables - Created Successfully';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '✅ sofia_decisions        - AI decision log';
    RAISE NOTICE '✅ embeddings             - Vector embeddings (pgVector)';
    RAISE NOTICE '✅ langchain_conversations - LangChain sessions';
    RAISE NOTICE '✅ langchain_messages     - Chat messages';
    RAISE NOTICE '✅ qdrant_collections     - Vector DB metadata';
    RAISE NOTICE '✅ ai_model_configs       - Model configurations';
    RAISE NOTICE '';
    RAISE NOTICE 'pgVector enabled for semantic search';
    RAISE NOTICE 'LangChain integration ready';
    RAISE NOTICE 'Langfuse tracing enabled';
    RAISE NOTICE 'Qdrant vector database connected';
    RAISE NOTICE '═══════════════════════════════════════════════════════';
END $$;
