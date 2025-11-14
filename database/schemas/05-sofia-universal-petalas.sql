-- ═══════════════════════════════════════════════════════════════════════════
-- MAGICSAAS SYSTEM-∞ - SOFIA AI v4.0 UNIVERSAL INTEGRATION
-- Sofia AI - The Brain - Universal Integration with ALL 13 Pétalas
-- Complete End-to-End Intelligence Across All Dimensions
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PÉTALAS REGISTRY - Registro Universal de Todas as Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS petalas_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- Pétala Identification
    petala_code VARCHAR(50) NOT NULL UNIQUE CHECK (petala_code IN (
        'healthcare',      -- 1. Médicas/Healthcare
        'fashion',         -- 2. Fashion/Moda
        'restaurant',      -- 3. Restaurant/Food
        'real_estate',     -- 4. Real Estate/Imobiliário
        'education',       -- 5. Education/Educação
        'fitness',         -- 6. Fitness/Academia
        'beauty',          -- 7. Beauty/Beleza
        'legal',           -- 8. Legal/Jurídico
        'automotive',      -- 9. Automotive/Automotivo
        'retail',          -- 10. Retail/Varejo
        'logistics',       -- 11. Logistics/Logística
        'hospitality',     -- 12. Hospitality/Hotelaria
        'events'           -- 13. Events/Eventos
    )),
    petala_name VARCHAR(200) NOT NULL,
    petala_description TEXT,

    -- Sofia AI Integration Status
    sofia_enabled BOOLEAN DEFAULT TRUE,
    sofia_version VARCHAR(20) DEFAULT '4.0',

    -- Feature Flags per Pétala
    features_enabled JSONB DEFAULT '{
        "langchain": true,
        "langfuse": true,
        "qdrant": true,
        "pgvector": true,
        "timescaledb": true,
        "intention_engine": true,
        "ux_validation": true,
        "seo_optimization": true,
        "predictive_analytics": true,
        "automated_workflows": true
    }'::JSONB,

    -- AI Models Configuration per Pétala
    ai_models_config JSONB DEFAULT '{
        "primary_model": "claude-3-5-sonnet-20241022",
        "fallback_model": "claude-3-haiku-20240307",
        "embedding_model": "text-embedding-ada-002",
        "vision_model": "claude-3-opus-20240229"
    }'::JSONB,

    -- Business Logic
    industry_vertical VARCHAR(100),
    target_audience TEXT[],
    key_kpis TEXT[],

    -- Status
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'development', 'beta', 'deprecated')),
    deployment_status VARCHAR(50) DEFAULT 'production' CHECK (deployment_status IN ('development', 'staging', 'production')),

    -- Metrics
    total_tenants_using INTEGER DEFAULT 0,
    total_active_users INTEGER DEFAULT 0,
    total_sofia_decisions INTEGER DEFAULT 0,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert All 13 Pétalas
INSERT INTO petalas_registry (petala_code, petala_name, petala_description, industry_vertical, target_audience, key_kpis, status) VALUES
('healthcare', 'Healthcare/Médicas', 'Complete healthcare management system with patient records, appointments, prescriptions, and medical analytics', 'Healthcare', ARRAY['Hospitals', 'Clinics', 'Doctors', 'Patients'], ARRAY['Patient Satisfaction', 'Appointment Completion Rate', 'Treatment Success Rate', 'Revenue per Patient'], 'active'),

('fashion', 'Fashion/Moda', 'Fashion e-commerce with inventory, collections, trends analysis, and personalized recommendations', 'Fashion & Retail', ARRAY['Fashion Brands', 'Boutiques', 'E-commerce'], ARRAY['Sales Conversion', 'Average Order Value', 'Customer Lifetime Value', 'Inventory Turnover'], 'active'),

('restaurant', 'Restaurant/Food', 'Restaurant management with menu, orders, reservations, delivery, and kitchen operations', 'Food & Beverage', ARRAY['Restaurants', 'Cafes', 'Food Delivery'], ARRAY['Table Turnover', 'Average Ticket', 'Customer Satisfaction', 'Food Cost %'], 'active'),

('real_estate', 'Real Estate/Imobiliário', 'Real estate platform with property listings, virtual tours, contracts, and CRM', 'Real Estate', ARRAY['Real Estate Agencies', 'Property Developers', 'Brokers'], ARRAY['Properties Sold', 'Sales Conversion', 'Average Deal Size', 'Days on Market'], 'active'),

('education', 'Education/Educação', 'Educational platform with courses, students, assessments, and learning analytics', 'Education', ARRAY['Schools', 'Universities', 'Online Education', 'Training Centers'], ARRAY['Student Engagement', 'Course Completion Rate', 'Learning Outcomes', 'Retention Rate'], 'active'),

('fitness', 'Fitness/Academia', 'Fitness center management with memberships, classes, personal training, and wellness tracking', 'Health & Fitness', ARRAY['Gyms', 'Fitness Studios', 'Personal Trainers'], ARRAY['Member Retention', 'Class Attendance', 'Revenue per Member', 'New Memberships'], 'active'),

('beauty', 'Beauty/Beleza', 'Beauty salon and spa management with appointments, services, products, and loyalty programs', 'Beauty & Wellness', ARRAY['Beauty Salons', 'Spas', 'Barber Shops'], ARRAY['Appointment Fill Rate', 'Service Revenue', 'Product Sales', 'Customer Retention'], 'active'),

('legal', 'Legal/Jurídico', 'Legal practice management with cases, clients, documents, billing, and compliance', 'Legal Services', ARRAY['Law Firms', 'Legal Departments', 'Solo Practitioners'], ARRAY['Case Win Rate', 'Billable Hours', 'Client Satisfaction', 'Revenue per Case'], 'active'),

('automotive', 'Automotive/Automotivo', 'Automotive service management with maintenance, parts, scheduling, and fleet tracking', 'Automotive', ARRAY['Auto Repair Shops', 'Dealerships', 'Fleet Management'], ARRAY['Service Revenue', 'Parts Sales', 'Customer Retention', 'Average Repair Time'], 'active'),

('retail', 'Retail/Varejo', 'Retail operations with POS, inventory, e-commerce, and omnichannel integration', 'Retail', ARRAY['Retail Stores', 'E-commerce', 'Franchises'], ARRAY['Sales per Square Foot', 'Inventory Turnover', 'Conversion Rate', 'Customer Lifetime Value'], 'active'),

('logistics', 'Logistics/Logística', 'Logistics and supply chain with shipments, tracking, warehousing, and route optimization', 'Logistics & Supply Chain', ARRAY['Logistics Companies', 'Warehouses', 'Distributors'], ARRAY['On-Time Delivery', 'Cost per Mile', 'Warehouse Utilization', 'Order Accuracy'], 'active'),

('hospitality', 'Hospitality/Hotelaria', 'Hotel and hospitality management with reservations, housekeeping, amenities, and guest experience', 'Hospitality', ARRAY['Hotels', 'Resorts', 'Vacation Rentals'], ARRAY['Occupancy Rate', 'RevPAR', 'Guest Satisfaction', 'Average Daily Rate'], 'active'),

('events', 'Events/Eventos', 'Event management with planning, ticketing, attendees, vendors, and post-event analytics', 'Events & Entertainment', ARRAY['Event Planners', 'Venues', 'Conference Organizers'], ARRAY['Ticket Sales', 'Attendee Satisfaction', 'Vendor Performance', 'Event ROI'], 'active');

-- Index
CREATE INDEX idx_petalas_registry_code ON petalas_registry(petala_code);
CREATE INDEX idx_petalas_registry_status ON petalas_registry(status);

-- ═══════════════════════════════════════════════════════════════════════════
-- SOFIA PETALA INSIGHTS - Universal AI Insights for Each Pétala
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sofia_petala_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Insight Details
    insight_type VARCHAR(100) NOT NULL CHECK (insight_type IN (
        'trend_analysis',           -- Análise de tendências
        'anomaly_detection',        -- Detecção de anomalias
        'predictive_forecast',      -- Previsão preditiva
        'optimization_suggestion',  -- Sugestão de otimização
        'risk_assessment',          -- Avaliação de risco
        'opportunity_detection',    -- Detecção de oportunidades
        'customer_sentiment',       -- Sentimento do cliente
        'operational_efficiency',   -- Eficiência operacional
        'revenue_optimization',     -- Otimização de receita
        'churn_prediction'          -- Previsão de churn
    )),

    -- AI Generated Content
    insight_title VARCHAR(500) NOT NULL,
    insight_description TEXT NOT NULL,
    insight_data JSONB NOT NULL, -- Dados estruturados do insight

    -- Impact & Priority
    impact_score DECIMAL(5, 4) CHECK (impact_score BETWEEN 0 AND 1),
    confidence_score DECIMAL(5, 4) CHECK (confidence_score BETWEEN 0 AND 1),
    priority VARCHAR(20) CHECK (priority IN ('critical', 'high', 'medium', 'low')),

    -- Recommendations
    recommended_actions JSONB DEFAULT '[]'::JSONB, -- [{action, description, estimated_impact}]
    estimated_roi DECIMAL(10, 2),
    implementation_complexity VARCHAR(20) CHECK (implementation_complexity IN ('easy', 'medium', 'hard')),

    -- Time Relevance
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_time_sensitive BOOLEAN DEFAULT FALSE,

    -- Sofia AI Metadata
    model_used VARCHAR(100),
    tokens_used INTEGER,
    processing_time_ms INTEGER,
    langfuse_trace_id VARCHAR(255),
    langfuse_trace_url TEXT,

    -- Status & Feedback
    status VARCHAR(50) DEFAULT 'new' CHECK (status IN (
        'new', 'reviewed', 'in_progress', 'implemented', 'dismissed', 'expired'
    )),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
    feedback_comment TEXT,

    -- Implementation Tracking
    implemented_at TIMESTAMP WITH TIME ZONE,
    implemented_by UUID REFERENCES users(id) ON DELETE SET NULL,
    actual_roi DECIMAL(10, 2),
    implementation_notes TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sofia_petala_insights_tenant ON sofia_petala_insights(tenant_id);
CREATE INDEX idx_sofia_petala_insights_petala ON sofia_petala_insights(petala_id);
CREATE INDEX idx_sofia_petala_insights_type ON sofia_petala_insights(insight_type);
CREATE INDEX idx_sofia_petala_insights_priority ON sofia_petala_insights(priority);
CREATE INDEX idx_sofia_petala_insights_status ON sofia_petala_insights(status);
CREATE INDEX idx_sofia_petala_insights_created ON sofia_petala_insights(created_at);
CREATE INDEX idx_sofia_petala_insights_impact ON sofia_petala_insights(impact_score) WHERE impact_score > 0.7;

-- RLS
ALTER TABLE sofia_petala_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY sofia_petala_insights_tenant_isolation ON sofia_petala_insights
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- SOFIA PETALA AUTOMATIONS - Universal Workflow Automation
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sofia_petala_automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Automation Details
    automation_name VARCHAR(200) NOT NULL,
    automation_description TEXT,
    automation_type VARCHAR(100) NOT NULL CHECK (automation_type IN (
        'scheduled',           -- Agendado (cron-like)
        'event_triggered',     -- Disparado por evento
        'condition_based',     -- Baseado em condições
        'ai_suggested',        -- Sugerido pela Sofia AI
        'continuous'           -- Contínuo/real-time
    )),

    -- Trigger Configuration
    trigger_config JSONB NOT NULL, -- {type, schedule, events, conditions}

    -- Actions to Execute
    actions JSONB NOT NULL, -- [{type, target, parameters, retry_policy}]

    -- AI Learning
    sofia_optimized BOOLEAN DEFAULT FALSE,
    optimization_history JSONB DEFAULT '[]'::JSONB,
    performance_metrics JSONB DEFAULT '{}'::JSONB,

    -- Execution Statistics
    total_executions INTEGER DEFAULT 0,
    successful_executions INTEGER DEFAULT 0,
    failed_executions INTEGER DEFAULT 0,
    average_execution_time_ms INTEGER,
    last_execution_at TIMESTAMP WITH TIME ZONE,
    last_execution_status VARCHAR(50),

    -- Status & Control
    is_active BOOLEAN DEFAULT TRUE,
    paused_at TIMESTAMP WITH TIME ZONE,
    paused_by UUID REFERENCES users(id) ON DELETE SET NULL,
    pause_reason TEXT,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_sofia_petala_automations_tenant ON sofia_petala_automations(tenant_id);
CREATE INDEX idx_sofia_petala_automations_petala ON sofia_petala_automations(petala_id);
CREATE INDEX idx_sofia_petala_automations_type ON sofia_petala_automations(automation_type);
CREATE INDEX idx_sofia_petala_automations_active ON sofia_petala_automations(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE sofia_petala_automations ENABLE ROW LEVEL SECURITY;

CREATE POLICY sofia_petala_automations_tenant_isolation ON sofia_petala_automations
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- SOFIA EMBEDDINGS UNIVERSAL - Vector Embeddings for All Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sofia_embeddings_universal (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    petala_id UUID NOT NULL REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Source Entity
    entity_type VARCHAR(100) NOT NULL, -- 'patient', 'product', 'property', 'course', etc.
    entity_id UUID NOT NULL,
    entity_data JSONB NOT NULL,

    -- Content to Embed
    content_text TEXT NOT NULL,
    content_metadata JSONB DEFAULT '{}'::JSONB,

    -- Vector Embedding (1536 dimensions - OpenAI ada-002)
    embedding vector(1536) NOT NULL,
    embedding_model VARCHAR(100) DEFAULT 'text-embedding-ada-002',

    -- Qdrant Integration
    qdrant_collection VARCHAR(100),
    qdrant_point_id VARCHAR(255),
    qdrant_metadata JSONB DEFAULT '{}'::JSONB,

    -- Search Optimization
    search_keywords TEXT[],
    search_boost_factor DECIMAL(5, 2) DEFAULT 1.0,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sofia_embeddings_universal_tenant ON sofia_embeddings_universal(tenant_id);
CREATE INDEX idx_sofia_embeddings_universal_petala ON sofia_embeddings_universal(petala_id);
CREATE INDEX idx_sofia_embeddings_universal_entity ON sofia_embeddings_universal(entity_type, entity_id);

-- Vector index for similarity search (IVFFlat)
CREATE INDEX idx_sofia_embeddings_universal_vector
    ON sofia_embeddings_universal
    USING ivfflat (embedding vector_cosine_ops)
    WITH (lists = 100);

-- RLS
ALTER TABLE sofia_embeddings_universal ENABLE ROW LEVEL SECURITY;

CREATE POLICY sofia_embeddings_universal_tenant_isolation ON sofia_embeddings_universal
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- SOFIA KNOWLEDGE GRAPH - Universal Knowledge Graph Across Pétalas
-- ═══════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS sofia_knowledge_graph (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,

    -- Node Information
    node_type VARCHAR(100) NOT NULL, -- 'entity', 'concept', 'relationship', 'insight'
    petala_id UUID REFERENCES petalas_registry(id) ON DELETE CASCADE,

    -- Node Content
    node_label VARCHAR(500) NOT NULL,
    node_data JSONB NOT NULL,
    node_properties JSONB DEFAULT '{}'::JSONB,

    -- Connections (Graph Edges)
    connected_nodes UUID[] DEFAULT ARRAY[]::UUID[],
    connection_types TEXT[] DEFAULT ARRAY[]::TEXT[],
    connection_weights DECIMAL[] DEFAULT ARRAY[]::DECIMAL[],

    -- AI Enrichment
    ai_confidence DECIMAL(5, 4) CHECK (ai_confidence BETWEEN 0 AND 1),
    ai_tags TEXT[],
    ai_summary TEXT,

    -- Vector for Semantic Search
    semantic_embedding vector(1536),

    -- Temporal
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,

    -- Audit
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_sofia_knowledge_graph_tenant ON sofia_knowledge_graph(tenant_id);
CREATE INDEX idx_sofia_knowledge_graph_petala ON sofia_knowledge_graph(petala_id);
CREATE INDEX idx_sofia_knowledge_graph_type ON sofia_knowledge_graph(node_type);
CREATE INDEX idx_sofia_knowledge_graph_tags ON sofia_knowledge_graph USING GIN (ai_tags);

-- RLS
ALTER TABLE sofia_knowledge_graph ENABLE ROW LEVEL SECURITY;

CREATE POLICY sofia_knowledge_graph_tenant_isolation ON sofia_knowledge_graph
    FOR ALL
    USING (tenant_id = current_setting('app.current_tenant_id', TRUE)::UUID);

-- ═══════════════════════════════════════════════════════════════════════════
-- TIMESCALEDB HYPERTABLES
-- ═══════════════════════════════════════════════════════════════════════════

-- Convert insights to hypertable for time-series analysis
SELECT create_hypertable(
    'sofia_petala_insights',
    'created_at',
    chunk_time_interval => INTERVAL '1 month',
    if_not_exists => TRUE
);

-- ═══════════════════════════════════════════════════════════════════════════
-- FUNCTIONS - Sofia AI Helper Functions
-- ═══════════════════════════════════════════════════════════════════════════

-- Function to get similar content using vector search
CREATE OR REPLACE FUNCTION sofia_find_similar_content(
    p_tenant_id UUID,
    p_petala_code VARCHAR(50),
    p_query_embedding vector(1536),
    p_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
    entity_id UUID,
    entity_type VARCHAR(100),
    content_text TEXT,
    similarity_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        e.entity_id,
        e.entity_type,
        e.content_text,
        (1 - (e.embedding <=> p_query_embedding))::DECIMAL AS similarity_score
    FROM sofia_embeddings_universal e
    INNER JOIN petalas_registry p ON e.petala_id = p.id
    WHERE e.tenant_id = p_tenant_id
    AND p.petala_code = p_petala_code
    ORDER BY e.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Function to track petala usage
CREATE OR REPLACE FUNCTION update_petala_metrics()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE petalas_registry
        SET total_sofia_decisions = total_sofia_decisions + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = NEW.petala_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update petala metrics
CREATE TRIGGER trigger_update_petala_metrics
    AFTER INSERT ON sofia_petala_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_petala_metrics();

-- ═══════════════════════════════════════════════════════════════════════════
-- COMMENTS for Documentation
-- ═══════════════════════════════════════════════════════════════════════════

COMMENT ON TABLE petalas_registry IS 'Registro universal de todas as 13 Pétalas do MagicSaaS. Sofia AI v4.0 se integra com cada pétala de forma inteligente e adaptativa.';
COMMENT ON TABLE sofia_petala_insights IS 'Insights gerados pela Sofia AI para cada pétala. Inclui análises, previsões, detecção de anomalias e recomendações específicas por vertical.';
COMMENT ON TABLE sofia_petala_automations IS 'Automações inteligentes criadas e otimizadas pela Sofia AI para cada pétala. Workflows adaptam-se com aprendizado contínuo.';
COMMENT ON TABLE sofia_embeddings_universal IS 'Embeddings vetoriais universais para busca semântica em todas as pétalas. Integração com Qdrant e pgVector para high-performance.';
COMMENT ON TABLE sofia_knowledge_graph IS 'Grafo de conhecimento universal conectando entidades, conceitos e insights através de todas as pétalas. Permite descoberta de padrões cross-vertical.';

-- ═══════════════════════════════════════════════════════════════════════════
-- SUCCESS MESSAGE
-- ═══════════════════════════════════════════════════════════════════════════

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '╔══════════════════════════════════════════════════════════════════════════╗';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  ✅ SOFIA AI v4.0 - UNIVERSAL INTEGRATION COMPLETE!                     ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  🧠 Sofia is now THE BRAIN of ALL 13 Pétalas:                           ║';
    RAISE NOTICE '║     1. Healthcare/Médicas    8. Legal/Jurídico                          ║';
    RAISE NOTICE '║     2. Fashion/Moda          9. Automotive/Automotivo                   ║';
    RAISE NOTICE '║     3. Restaurant/Food      10. Retail/Varejo                           ║';
    RAISE NOTICE '║     4. Real Estate          11. Logistics/Logística                     ║';
    RAISE NOTICE '║     5. Education            12. Hospitality/Hotelaria                   ║';
    RAISE NOTICE '║     6. Fitness/Academia     13. Events/Eventos                          ║';
    RAISE NOTICE '║     7. Beauty/Beleza                                                    ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  🎯 Universal Capabilities:                                             ║';
    RAISE NOTICE '║     ✓ Insights & Analytics per Pétala                                   ║';
    RAISE NOTICE '║     ✓ Intelligent Automations                                           ║';
    RAISE NOTICE '║     ✓ Vector Search & Embeddings (Qdrant + pgVector)                    ║';
    RAISE NOTICE '║     ✓ Knowledge Graph across all verticals                              ║';
    RAISE NOTICE '║     ✓ LangChain + Langfuse integration                                  ║';
    RAISE NOTICE '║     ✓ TimescaleDB for time-series analytics                             ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '║  🚀 Sofia AI lives and breathes in every dimension!                     ║';
    RAISE NOTICE '║                                                                          ║';
    RAISE NOTICE '╚══════════════════════════════════════════════════════════════════════════╝';
    RAISE NOTICE '';
END $$;
