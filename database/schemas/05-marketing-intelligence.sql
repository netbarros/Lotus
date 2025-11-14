-- =====================================================
-- 🎯 MARKETING INTELLIGENCE SYSTEM v4.0 - DATABASE SCHEMA
-- Powered by Sofia AI v4.0 - The Marketing Brain
-- Integrated with Cognitive Mesh OS
-- =====================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search
CREATE EXTENSION IF NOT EXISTS "btree_gin"; -- For multi-column indexes

-- =====================================================
-- MARKETING CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('email', 'social', 'ads', 'content', 'webinar', 'event')),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'running', 'paused', 'completed')),
  objective TEXT,
  target_audience JSONB,
  budget DECIMAL(12,2),
  spent DECIMAL(12,2) DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  channels JSONB,
  kpis JSONB,

  -- Sofia AI Flags
  sofia_generated BOOLEAN DEFAULT false,
  sofia_optimized BOOLEAN DEFAULT false,
  sofia_insights JSONB,

  -- Performance Metrics
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  revenue DECIMAL(12,2) DEFAULT 0,
  ctr DECIMAL(5,4), -- Click-through rate
  conversion_rate DECIMAL(5,4),
  roi DECIMAL(8,2), -- Return on Investment

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date),
  CONSTRAINT valid_budget CHECK (budget IS NULL OR budget >= 0),
  CONSTRAINT valid_spent CHECK (spent >= 0 AND (budget IS NULL OR spent <= budget * 1.1))
);

-- =====================================================
-- LEADS & PROSPECTS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  company VARCHAR(255),
  role VARCHAR(100),
  phone VARCHAR(50),

  -- Source & Attribution
  source VARCHAR(100) NOT NULL,
  campaign_id UUID REFERENCES marketing_campaigns(id),
  referring_url TEXT,
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),

  -- Scoring (Sofia AI Powered)
  score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
  grade VARCHAR(1) CHECK (grade IN ('A', 'B', 'C', 'D', 'F')),

  -- Stage Management
  stage VARCHAR(50) DEFAULT 'awareness' CHECK (stage IN ('awareness', 'consideration', 'decision', 'customer', 'advocate', 'churned')),
  previous_stage VARCHAR(50),
  stage_changed_at TIMESTAMP,

  -- Engagement
  last_interaction TIMESTAMP,
  interactions JSONB DEFAULT '[]',
  total_interactions INTEGER DEFAULT 0,

  -- Sofia AI Predictions
  predicted_conversion DECIMAL(5,4), -- 0-1 probability
  predicted_ltv DECIMAL(12,2), -- Lifetime value
  next_best_action TEXT,
  churn_risk INTEGER CHECK (churn_risk IS NULL OR (churn_risk >= 0 AND churn_risk <= 100)),

  -- Demographics (enriched by Sofia AI)
  location JSONB,
  industry VARCHAR(100),
  company_size VARCHAR(50),
  annual_revenue VARCHAR(50),

  -- Behavior
  interests TEXT[],
  pain_points TEXT[],
  goals TEXT[],

  -- Status
  is_qualified BOOLEAN DEFAULT false,
  is_contacted BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LEAD INTERACTIONS & ACTIVITIES
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES marketing_leads(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES marketing_campaigns(id),

  type VARCHAR(50) NOT NULL CHECK (type IN (
    'email_sent', 'email_open', 'email_click', 'email_reply',
    'website_visit', 'page_view', 'form_submit',
    'content_download', 'video_watch',
    'webinar_register', 'webinar_attend',
    'demo_request', 'trial_start', 'trial_conversion',
    'meeting_booked', 'meeting_completed',
    'call_inbound', 'call_outbound',
    'social_follow', 'social_like', 'social_share', 'social_comment'
  )),

  metadata JSONB,
  value INTEGER DEFAULT 0, -- Score value for this interaction

  timestamp TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_lead FOREIGN KEY (lead_id) REFERENCES marketing_leads(id)
);

-- =====================================================
-- CONTENT LIBRARY
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'blog', 'video', 'infographic', 'ebook', 'whitepaper',
    'case_study', 'webinar', 'podcast', 'newsletter',
    'social_post', 'email_template', 'landing_page'
  )),

  title VARCHAR(500) NOT NULL,
  slug VARCHAR(500) UNIQUE,
  content TEXT,
  excerpt TEXT,

  -- SEO (Sofia AI Optimized)
  keywords TEXT[],
  meta_title VARCHAR(255),
  meta_description VARCHAR(500),
  seo_score INTEGER CHECK (seo_score IS NULL OR (seo_score >= 0 AND seo_score <= 100)),

  -- Targeting
  target_audience TEXT[],
  target_stage VARCHAR(50),
  target_persona VARCHAR(100),

  -- Sofia AI Flags
  sofia_generated BOOLEAN DEFAULT false,
  sofia_optimized BOOLEAN DEFAULT false,

  -- Performance Predictions (Sofia AI)
  engagement_prediction DECIMAL(5,4),
  virality_score INTEGER,
  conversion_prediction DECIMAL(5,4),

  -- Publishing
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'review', 'scheduled', 'published', 'archived')),
  published_at TIMESTAMP,
  scheduled_for TIMESTAMP,

  -- Media
  featured_image TEXT,
  media_urls TEXT[],

  -- Performance Metrics (actual)
  views INTEGER DEFAULT 0,
  unique_views INTEGER DEFAULT 0,
  engagement_rate DECIMAL(5,4),
  shares INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  time_on_page INTEGER, -- seconds

  -- Author
  author VARCHAR(255),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- A/B TESTS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'email', 'subject_line', 'landing_page', 'cta',
    'ad_creative', 'ad_copy', 'headline', 'pricing'
  )),

  description TEXT,
  hypothesis TEXT,

  variants JSONB NOT NULL,

  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'inconclusive')),
  winner VARCHAR(100),

  -- Sofia AI Predictions
  sofia_recommendation VARCHAR(100),
  sofia_confidence DECIMAL(3,2),

  -- Test Configuration
  traffic_allocation JSONB, -- % for each variant
  sample_size INTEGER,
  significance_level DECIMAL(3,2) DEFAULT 0.95,

  started_at TIMESTAMP,
  completed_at TIMESTAMP,

  -- Results
  results JSONB,
  statistical_significance BOOLEAN,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MARKETING AUTOMATION WORKFLOWS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_workflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'welcome_series', 'nurture', 'onboarding', 'reengagement',
    'upsell', 'cross_sell', 'retention', 'win_back'
  )),

  description TEXT,

  -- Trigger
  trigger_type VARCHAR(50) NOT NULL CHECK (trigger_type IN (
    'lead_created', 'stage_changed', 'score_threshold',
    'inactivity', 'content_download', 'trial_start',
    'custom_event', 'date_based', 'manual'
  )),
  trigger_config JSONB,

  -- Steps (Sofia AI Optimized)
  steps JSONB NOT NULL,

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'archived')),

  -- Sofia AI Optimization
  sofia_optimized BOOLEAN DEFAULT false,
  optimization_score INTEGER,

  -- Performance
  total_entered INTEGER DEFAULT 0,
  total_completed INTEGER DEFAULT 0,
  total_converted INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,4),
  conversion_rate DECIMAL(5,4),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MARKETING INSIGHTS (Sofia AI Generated)
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'trend', 'anomaly', 'opportunity', 'warning',
    'recommendation', 'forecast', 'correlation'
  )),

  category VARCHAR(50) CHECK (category IN (
    'campaigns', 'leads', 'content', 'channels',
    'conversion', 'revenue', 'engagement', 'general'
  )),

  title VARCHAR(255) NOT NULL,
  description TEXT,

  impact VARCHAR(20) CHECK (impact IN ('critical', 'high', 'medium', 'low')),
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),

  data JSONB,

  actionable BOOLEAN DEFAULT true,
  suggested_actions JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'actioned', 'dismissed')),
  actioned_at TIMESTAMP,

  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- =====================================================
-- CUSTOMER JOURNEYS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_journeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID UNIQUE REFERENCES marketing_leads(id) ON DELETE CASCADE,

  stages JSONB NOT NULL,
  current_stage VARCHAR(100),
  time_in_stage INTEGER, -- days

  -- Sofia AI Analysis
  sofia_insights JSONB,
  sofia_recommendations JSONB,
  predicted_path JSONB,
  risk_score INTEGER CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)),

  -- Touchpoints
  total_touchpoints INTEGER DEFAULT 0,
  touchpoints_by_channel JSONB,

  -- Timeline
  started_at TIMESTAMP,
  converted_at TIMESTAMP,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- EMAIL CAMPAIGNS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id),

  name VARCHAR(255) NOT NULL,
  subject VARCHAR(500) NOT NULL,
  preview_text VARCHAR(255),
  from_name VARCHAR(255),
  from_email VARCHAR(255),
  reply_to VARCHAR(255),

  -- Content
  html_body TEXT,
  text_body TEXT,
  template_id VARCHAR(100),

  -- Sofia AI Generated
  sofia_generated BOOLEAN DEFAULT false,
  subject_variants TEXT[], -- Sofia AI A/B test variants

  -- Targeting
  segment JSONB,

  -- Scheduling
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
  scheduled_for TIMESTAMP,
  sent_at TIMESTAMP,

  -- Performance
  total_sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  bounced INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  clicked INTEGER DEFAULT 0,
  unsubscribed INTEGER DEFAULT 0,
  spam_reports INTEGER DEFAULT 0,

  open_rate DECIMAL(5,4),
  click_rate DECIMAL(5,4),
  conversion_rate DECIMAL(5,4),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- SOCIAL MEDIA POSTS
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_social_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id),

  platform VARCHAR(50) NOT NULL CHECK (platform IN (
    'linkedin', 'twitter', 'instagram', 'facebook',
    'youtube', 'tiktok', 'threads'
  )),

  content TEXT NOT NULL,
  media_urls TEXT[],
  hashtags TEXT[],

  -- Sofia AI Generated
  sofia_generated BOOLEAN DEFAULT false,
  engagement_prediction DECIMAL(5,4),

  -- Scheduling
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
  scheduled_for TIMESTAMP,
  published_at TIMESTAMP,

  -- Performance
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,

  engagement_rate DECIMAL(5,4),

  -- External IDs
  external_post_id VARCHAR(255),
  external_url TEXT,

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- LANDING PAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES marketing_campaigns(id),

  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  url TEXT,

  -- Content
  headline VARCHAR(500),
  subheadline TEXT,
  body_html TEXT,
  cta_text VARCHAR(100),
  cta_url TEXT,

  -- Sofia AI Generated
  sofia_generated BOOLEAN DEFAULT false,
  seo_score INTEGER,
  conversion_prediction DECIMAL(5,4),

  -- Variants (A/B Testing)
  variants JSONB,

  -- Status
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMP,

  -- Performance
  visitors INTEGER DEFAULT 0,
  unique_visitors INTEGER DEFAULT 0,
  conversions INTEGER DEFAULT 0,
  conversion_rate DECIMAL(5,4),
  bounce_rate DECIMAL(5,4),
  avg_time_on_page INTEGER, -- seconds

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- MARKETING ATTRIBUTION
-- =====================================================

CREATE TABLE IF NOT EXISTS marketing_attribution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES marketing_leads(id),

  -- First Touch
  first_touch_campaign_id UUID REFERENCES marketing_campaigns(id),
  first_touch_source VARCHAR(100),
  first_touch_medium VARCHAR(100),
  first_touch_timestamp TIMESTAMP,

  -- Last Touch
  last_touch_campaign_id UUID REFERENCES marketing_campaigns(id),
  last_touch_source VARCHAR(100),
  last_touch_medium VARCHAR(100),
  last_touch_timestamp TIMESTAMP,

  -- Multi-Touch (All touchpoints)
  touchpoints JSONB,

  -- Attribution Models (Sofia AI Calculated)
  first_touch_value DECIMAL(12,2),
  last_touch_value DECIMAL(12,2),
  linear_value DECIMAL(12,2),
  time_decay_value DECIMAL(12,2),
  position_based_value DECIMAL(12,2),

  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Campaigns
CREATE INDEX idx_campaigns_status ON marketing_campaigns(status);
CREATE INDEX idx_campaigns_type ON marketing_campaigns(type);
CREATE INDEX idx_campaigns_sofia ON marketing_campaigns(sofia_generated);
CREATE INDEX idx_campaigns_dates ON marketing_campaigns(start_date, end_date);

-- Leads
CREATE INDEX idx_leads_email ON marketing_leads(email);
CREATE INDEX idx_leads_score ON marketing_leads(score DESC);
CREATE INDEX idx_leads_stage ON marketing_leads(stage);
CREATE INDEX idx_leads_source ON marketing_leads(source);
CREATE INDEX idx_leads_campaign ON marketing_leads(campaign_id);
CREATE INDEX idx_leads_active ON marketing_leads(is_active);
CREATE INDEX idx_leads_last_interaction ON marketing_leads(last_interaction DESC);
CREATE INDEX idx_leads_company ON marketing_leads USING gin(company gin_trgm_ops);

-- Interactions
CREATE INDEX idx_interactions_lead ON marketing_interactions(lead_id);
CREATE INDEX idx_interactions_type ON marketing_interactions(type);
CREATE INDEX idx_interactions_timestamp ON marketing_interactions(timestamp DESC);
CREATE INDEX idx_interactions_campaign ON marketing_interactions(campaign_id);

-- Content
CREATE INDEX idx_content_type ON marketing_content(type);
CREATE INDEX idx_content_status ON marketing_content(status);
CREATE INDEX idx_content_sofia ON marketing_content(sofia_generated);
CREATE INDEX idx_content_published ON marketing_content(published_at DESC);
CREATE INDEX idx_content_keywords ON marketing_content USING gin(keywords);
CREATE INDEX idx_content_title ON marketing_content USING gin(title gin_trgm_ops);

-- Insights
CREATE INDEX idx_insights_type ON marketing_insights(type);
CREATE INDEX idx_insights_category ON marketing_insights(category);
CREATE INDEX idx_insights_impact ON marketing_insights(impact);
CREATE INDEX idx_insights_status ON marketing_insights(status);
CREATE INDEX idx_insights_generated ON marketing_insights(generated_at DESC);

-- Journeys
CREATE INDEX idx_journeys_lead ON marketing_journeys(lead_id);
CREATE INDEX idx_journeys_stage ON marketing_journeys(current_stage);
CREATE INDEX idx_journeys_risk ON marketing_journeys(risk_score DESC);

-- Emails
CREATE INDEX idx_emails_campaign ON marketing_emails(campaign_id);
CREATE INDEX idx_emails_status ON marketing_emails(status);
CREATE INDEX idx_emails_sent ON marketing_emails(sent_at DESC);

-- Social Posts
CREATE INDEX idx_social_platform ON marketing_social_posts(platform);
CREATE INDEX idx_social_status ON marketing_social_posts(status);
CREATE INDEX idx_social_published ON marketing_social_posts(published_at DESC);
CREATE INDEX idx_social_campaign ON marketing_social_posts(campaign_id);

-- Landing Pages
CREATE INDEX idx_landing_slug ON marketing_landing_pages(slug);
CREATE INDEX idx_landing_status ON marketing_landing_pages(status);
CREATE INDEX idx_landing_campaign ON marketing_landing_pages(campaign_id);

-- Attribution
CREATE INDEX idx_attribution_lead ON marketing_attribution(lead_id);
CREATE INDEX idx_attribution_first_campaign ON marketing_attribution(first_touch_campaign_id);
CREATE INDEX idx_attribution_last_campaign ON marketing_attribution(last_touch_campaign_id);

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON marketing_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON marketing_content
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_journeys_updated_at BEFORE UPDATE ON marketing_journeys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-calculate lead grade from score
CREATE OR REPLACE FUNCTION calculate_lead_grade()
RETURNS TRIGGER AS $$
BEGIN
  NEW.grade = CASE
    WHEN NEW.score >= 80 THEN 'A'
    WHEN NEW.score >= 60 THEN 'B'
    WHEN NEW.score >= 40 THEN 'C'
    WHEN NEW.score >= 20 THEN 'D'
    ELSE 'F'
  END;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_lead_grade BEFORE INSERT OR UPDATE OF score ON marketing_leads
  FOR EACH ROW EXECUTE FUNCTION calculate_lead_grade();

-- Auto-calculate campaign ROI
CREATE OR REPLACE FUNCTION calculate_campaign_roi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.spent > 0 THEN
    NEW.roi = ((NEW.revenue - NEW.spent) / NEW.spent) * 100;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_roi BEFORE UPDATE OF revenue, spent ON marketing_campaigns
  FOR EACH ROW EXECUTE FUNCTION calculate_campaign_roi();

-- =====================================================
-- VIEWS FOR ANALYTICS
-- =====================================================

-- Campaign Performance Overview
CREATE OR REPLACE VIEW v_campaign_performance AS
SELECT
  c.id,
  c.name,
  c.type,
  c.status,
  c.budget,
  c.spent,
  c.impressions,
  c.clicks,
  c.conversions,
  c.revenue,
  c.ctr,
  c.conversion_rate,
  c.roi,
  c.sofia_generated,
  COUNT(DISTINCT l.id) as total_leads,
  AVG(l.score) as avg_lead_score,
  c.created_at
FROM marketing_campaigns c
LEFT JOIN marketing_leads l ON l.campaign_id = c.id
GROUP BY c.id;

-- Lead Funnel Overview
CREATE OR REPLACE VIEW v_lead_funnel AS
SELECT
  stage,
  COUNT(*) as total_leads,
  AVG(score) as avg_score,
  AVG(total_interactions) as avg_interactions,
  COUNT(*) FILTER (WHERE is_qualified = true) as qualified_leads
FROM marketing_leads
WHERE is_active = true
GROUP BY stage
ORDER BY
  CASE stage
    WHEN 'awareness' THEN 1
    WHEN 'consideration' THEN 2
    WHEN 'decision' THEN 3
    WHEN 'customer' THEN 4
    WHEN 'advocate' THEN 5
  END;

-- Content Performance
CREATE OR REPLACE VIEW v_content_performance AS
SELECT
  type,
  COUNT(*) as total_pieces,
  AVG(seo_score) as avg_seo_score,
  SUM(views) as total_views,
  AVG(engagement_rate) as avg_engagement_rate,
  SUM(conversions) as total_conversions,
  COUNT(*) FILTER (WHERE sofia_generated = true) as sofia_generated_count
FROM marketing_content
WHERE status = 'published'
GROUP BY type;

-- Top Performing Channels
CREATE OR REPLACE VIEW v_channel_performance AS
SELECT
  source,
  COUNT(*) as total_leads,
  AVG(score) as avg_score,
  COUNT(*) FILTER (WHERE stage = 'customer') as customers,
  (COUNT(*) FILTER (WHERE stage = 'customer')::DECIMAL / NULLIF(COUNT(*), 0)) * 100 as conversion_rate
FROM marketing_leads
WHERE is_active = true
GROUP BY source
ORDER BY total_leads DESC;

-- =====================================================
-- ROW LEVEL SECURITY (Multi-tenant)
-- =====================================================

ALTER TABLE marketing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_insights ENABLE ROW LEVEL SECURITY;

-- Policies will be created per tenant

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE marketing_campaigns IS 'Marketing campaigns orchestrated by Sofia AI';
COMMENT ON TABLE marketing_leads IS 'Leads with AI-powered scoring and predictions';
COMMENT ON TABLE marketing_content IS 'Content library with Sofia AI generation and optimization';
COMMENT ON TABLE marketing_insights IS 'AI-generated marketing insights and recommendations';
COMMENT ON TABLE marketing_journeys IS 'Customer journey mapping powered by Sofia AI';
COMMENT ON TABLE marketing_workflows IS 'Automated marketing workflows optimized by Sofia AI';

COMMENT ON COLUMN marketing_leads.score IS 'AI-calculated lead score (0-100)';
COMMENT ON COLUMN marketing_leads.predicted_conversion IS 'Sofia AI predicted conversion probability';
COMMENT ON COLUMN marketing_leads.next_best_action IS 'Sofia AI recommended next action';
COMMENT ON COLUMN marketing_content.sofia_generated IS 'Content generated by Sofia AI';
COMMENT ON COLUMN marketing_campaigns.sofia_optimized IS 'Campaign optimized by Sofia AI';

-- =====================================================
-- COMPLETE ✅
-- Sofia AI is present in ALL marketing layers
-- =====================================================
