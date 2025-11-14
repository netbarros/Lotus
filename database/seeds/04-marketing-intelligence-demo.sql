-- =====================================================
-- 🎯 MARKETING INTELLIGENCE SYSTEM - DEMO DATA
-- Powered by Sofia AI v4.0
-- Complete enterprise marketing data across all 16 pétalas
-- =====================================================

-- =====================================================
-- MARKETING CAMPAIGNS (Sofia AI Generated)
-- =====================================================

INSERT INTO marketing_campaigns (id, name, type, status, objective, target_audience, budget, spent, start_date, end_date, channels, kpis, sofia_generated, sofia_optimized, impressions, clicks, conversions, revenue, ctr, conversion_rate, roi) VALUES

-- Healthcare Campaign
('550e8400-e29b-41d4-a716-446655440001', 'Healthcare Digital Transformation', 'content', 'running', 'Generate leads for healthcare SaaS vertical',
'{"segments": ["healthcare_providers", "clinic_managers"], "demographics": {"industries": ["healthcare"], "roles": ["CTO", "COO", "Practice Manager"]}, "behaviors": {"interests": ["digital_health", "EHR", "telemedicine"]}}',
50000.00, 32500.00, NOW() - INTERVAL '45 days', NOW() + INTERVAL '15 days',
'[{"type": "linkedin", "budget": 0.4, "frequency": "5x/week"}, {"type": "email", "budget": 0.3, "frequency": "2x/week"}, {"type": "google-ads", "budget": 0.3, "frequency": "continuous"}]',
'[{"metric": "Leads Generated", "target": 250, "current": 187, "unit": "leads"}, {"metric": "Conversion Rate", "target": 5, "current": 4.2, "unit": "%"}]',
true, true, 125000, 5250, 187, 562000.00, 0.0420, 0.0356, 42.77),

-- Restaurant Campaign
('550e8400-e29b-41d4-a716-446655440002', 'Restaurant POS Revolution', 'webinar', 'scheduled', 'Launch new restaurant management features',
'{"segments": ["restaurant_owners", "hospitality"], "demographics": {"industries": ["food_service"], "roles": ["Owner", "Manager"]}}',
25000.00, 8500.00, NOW() + INTERVAL '7 days', NOW() + INTERVAL '30 days',
'[{"type": "instagram", "budget": 0.3, "frequency": "daily"}, {"type": "facebook", "budget": 0.3, "frequency": "daily"}, {"type": "email", "budget": 0.4, "frequency": "3x/week"}]',
'[{"metric": "Webinar Registrations", "target": 500, "current": 234, "unit": "registrations"}]',
true, true, 45000, 1890, 234, 0, 0.0420, 0.1238, 0),

-- Fashion E-commerce Campaign
('550e8400-e29b-41d4-a716-446655440003', 'Fashion Omnichannel Excellence', 'social', 'running', 'Showcase fashion vertical capabilities',
'{"segments": ["fashion_brands", "retail"], "demographics": {"industries": ["fashion", "retail"]}}',
35000.00, 28000.00, NOW() - INTERVAL '30 days', NOW() + INTERVAL '30 days',
'[{"type": "instagram", "budget": 0.5, "frequency": "3x/day"}, {"type": "tiktok", "budget": 0.3, "frequency": "2x/day"}, {"type": "pinterest", "budget": 0.2, "frequency": "daily"}]',
'[{"metric": "Brand Awareness", "target": 100000, "current": 78500, "unit": "impressions"}]',
true, true, 285000, 14250, 125, 187500.00, 0.0500, 0.0088, -44.64),

-- Real Estate Campaign
('550e8400-e29b-41d4-a716-446655440004', 'PropTech Innovation Series', 'event', 'completed', 'Position as leader in real estate tech',
'{"segments": ["real_estate_agencies", "property_managers"], "demographics": {"industries": ["real_estate"]}}',
40000.00, 38500.00, NOW() - INTERVAL '60 days', NOW() - INTERVAL '30 days',
'[{"type": "linkedin", "budget": 0.6, "frequency": "daily"}, {"type": "email", "budget": 0.4, "frequency": "weekly"}]',
'[{"metric": "Event Attendees", "target": 300, "current": 342, "unit": "attendees"}, {"metric": "Pipeline Generated", "target": 500000, "current": 680000, "unit": "USD"}]',
true, true, 95000, 3800, 342, 680000.00, 0.0400, 0.0900, 1666.23),

-- Finance Campaign
('550e8400-e29b-41d4-a716-446655440005', 'FinTech Security & Compliance', 'content', 'running', 'Generate qualified leads for financial services vertical',
'{"segments": ["financial_institutions", "fintech"], "demographics": {"industries": ["finance", "banking"]}}',
60000.00, 42000.00, NOW() - INTERVAL '50 days', NOW() + INTERVAL '10 days',
'[{"type": "linkedin", "budget": 0.5, "frequency": "daily"}, {"type": "google-ads", "budget": 0.3, "frequency": "continuous"}, {"type": "email", "budget": 0.2, "frequency": "2x/week"}]',
'[{"metric": "MQLs", "target": 150, "current": 128, "unit": "leads"}]',
true, true, 180000, 7200, 128, 512000.00, 0.0400, 0.0178, 119.05),

-- Cross-Vertical Campaign
('550e8400-e29b-41d4-a716-446655440006', 'MagicSaaS System-∞ Launch', 'ads', 'running', 'Promote complete platform across all 16 verticals',
'{"segments": ["all_verticals"], "demographics": {"roles": ["CEO", "CTO", "Founder"]}}',
100000.00, 65000.00, NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days',
'[{"type": "google-ads", "budget": 0.4, "frequency": "continuous"}, {"type": "linkedin", "budget": 0.3, "frequency": "daily"}, {"type": "meta-ads", "budget": 0.2, "frequency": "continuous"}, {"type": "youtube", "budget": 0.1, "frequency": "weekly"}]',
'[{"metric": "Brand Awareness", "target": 500000, "current": 325000, "unit": "impressions"}, {"metric": "Trials", "target": 500, "current": 287, "unit": "signups"}]',
true, true, 625000, 31250, 287, 430500.00, 0.0500, 0.0092, -37.69);

-- =====================================================
-- LEADS (Sofia AI Scored & Predicted)
-- =====================================================

INSERT INTO marketing_leads (id, email, name, company, role, source, campaign_id, score, grade, stage, last_interaction, total_interactions, predicted_conversion, predicted_ltv, next_best_action, churn_risk, industry, is_qualified, is_active) VALUES

-- High-Value Healthcare Leads
('660e8400-e29b-41d4-a716-446655440001', 'dr.smith@cityhealthgroup.com', 'Dr. Sarah Smith', 'City Health Group', 'CMO', 'linkedin', '550e8400-e29b-41d4-a716-446655440001', 92, 'A', 'decision', NOW() - INTERVAL '2 days', 18, 0.8750, 125000.00, 'Schedule product demo with technical team', 15, 'healthcare', true, true),

('660e8400-e29b-41d4-a716-446655440002', 'john.martinez@medicalcenter.com', 'John Martinez', 'Central Medical Center', 'IT Director', 'google-ads', '550e8400-e29b-41d4-a716-446655440001', 88, 'A', 'consideration', NOW() - INTERVAL '1 day', 12, 0.7250, 95000.00, 'Send detailed pricing and ROI calculator', 20, 'healthcare', true, true),

('660e8400-e29b-41d4-a716-446655440003', 'lisa.chen@clinicnetwork.com', 'Lisa Chen', 'Metro Clinic Network', 'COO', 'email', '550e8400-e29b-41d4-a716-446655440001', 85, 'A', 'consideration', NOW() - INTERVAL '3 days', 9, 0.6800, 85000.00, 'Invite to upcoming healthcare webinar', 25, 'healthcare', true, true),

-- Restaurant Leads
('660e8400-e29b-41d4-a716-446655440004', 'marco@pizzaparadise.com', 'Marco Rossi', 'Pizza Paradise Chain', 'Owner', 'instagram', '550e8400-e29b-41d4-a716-446655440002', 78, 'B', 'awareness', NOW() - INTERVAL '5 days', 6, 0.4500, 45000.00, 'Send case study of similar restaurant chain', 35, 'food_service', true, true),

('660e8400-e29b-41d4-a716-446655440005', 'jennifer@gourmetgroup.com', 'Jennifer Lee', 'Gourmet Restaurant Group', 'Operations Manager', 'facebook', '550e8400-e29b-41d4-a716-446655440002', 72, 'B', 'awareness', NOW() - INTERVAL '7 days', 4, 0.3800, 38000.00, 'Nurture with POS efficiency content', 40, 'food_service', false, true),

-- Fashion Leads
('660e8400-e29b-41d4-a716-446655440006', 'sophia@luxefashion.com', 'Sophia Anderson', 'Luxe Fashion Boutique', 'CEO', 'instagram', '550e8400-e29b-41d4-a716-446655440003', 82, 'A', 'consideration', NOW() - INTERVAL '4 days', 11, 0.6200, 72000.00, 'Demo omnichannel inventory management', 28, 'fashion', true, true),

-- Real Estate Leads (High Intent)
('660e8400-e29b-41d4-a716-446655440007', 'david@primeproperties.com', 'David Thompson', 'Prime Properties LLC', 'CTO', 'linkedin', '550e8400-e29b-41d4-a716-446655440004', 95, 'A', 'decision', NOW() - INTERVAL '1 day', 22, 0.9100, 150000.00, 'Send contract and onboarding timeline', 10, 'real_estate', true, true),

('660e8400-e29b-41d4-a716-446655440008', 'emily@urbanrealty.com', 'Emily Wilson', 'Urban Realty Partners', 'VP Operations', 'event', '550e8400-e29b-41d4-a716-446655440004', 91, 'A', 'decision', NOW() - INTERVAL '2 days', 19, 0.8500, 135000.00, 'Schedule implementation planning call', 12, 'real_estate', true, true),

-- Finance Leads
('660e8400-e29b-41d4-a716-446655440009', 'michael@securebank.com', 'Michael Brown', 'SecureBank International', 'Chief Security Officer', 'linkedin', '550e8400-e29b-41d4-a716-446655440005', 89, 'A', 'consideration', NOW() - INTERVAL '3 days', 14, 0.7600, 200000.00, 'Provide security & compliance whitepaper', 18, 'finance', true, true),

('660e8400-e29b-41d4-a716-446655440010', 'rachel@fintechventures.com', 'Rachel Green', 'FinTech Ventures', 'Head of Technology', 'google-ads', '550e8400-e29b-41d4-a716-446655440005', 84, 'A', 'consideration', NOW() - INTERVAL '4 days', 10, 0.6600, 110000.00, 'Invite to fintech innovation roundtable', 22, 'finance', true, true),

-- Platform-Wide Leads
('660e8400-e29b-41d4-a716-446655440011', 'chris@techstartup.io', 'Chris Johnson', 'TechStartup Inc', 'Founder & CEO', 'google-ads', '550e8400-e29b-41d4-a716-446655440006', 75, 'B', 'awareness', NOW() - INTERVAL '6 days', 5, 0.4200, 55000.00, 'Send platform overview video', 45, 'technology', true, true),

('660e8400-e29b-41d4-a716-446655440012', 'anna@innovatecorp.com', 'Anna Davis', 'InnovateCorp', 'VP Product', 'linkedin', '550e8400-e29b-41d4-a716-446655440006', 79, 'B', 'consideration', NOW() - INTERVAL '5 days', 8, 0.5500, 68000.00, 'Demo Sofia AI cognitive capabilities', 32, 'technology', true, true),

-- Lower Funnel Leads
('660e8400-e29b-41d4-a716-446655440013', 'tom@smallbiz.com', 'Tom Harris', 'SmallBiz Solutions', 'Owner', 'organic', null, 45, 'D', 'awareness', NOW() - INTERVAL '15 days', 2, 0.1500, 12000.00, 'Send beginner guide to SaaS selection', 70, 'general', false, true),

('660e8400-e29b-41d4-a716-446655440014', 'maria@consultingfirm.com', 'Maria Garcia', 'Elite Consulting', 'Partner', 'referral', null, 87, 'A', 'consideration', NOW() - INTERVAL '3 days', 13, 0.7200, 95000.00, 'Connect with partner program team', 20, 'consulting', true, true),

-- Churned/Inactive (for journey analysis)
('660e8400-e29b-41d4-a716-446655440015', 'inactive@oldlead.com', 'Inactive Lead', 'Dormant Corp', 'Manager', 'email', null, 32, 'F', 'awareness', NOW() - INTERVAL '60 days', 1, 0.0500, 5000.00, 'Re-engagement campaign with new features', 95, 'general', false, false);

-- =====================================================
-- LEAD INTERACTIONS (Activity Log)
-- =====================================================

INSERT INTO marketing_interactions (lead_id, campaign_id, type, value, timestamp) VALUES

-- Dr. Sarah Smith (High Activity)
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'email_open', 5, NOW() - INTERVAL '30 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'email_click', 10, NOW() - INTERVAL '29 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'website_visit', 3, NOW() - INTERVAL '28 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'content_download', 15, NOW() - INTERVAL '25 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'webinar_register', 10, NOW() - INTERVAL '20 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'webinar_attend', 20, NOW() - INTERVAL '18 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'demo_request', 25, NOW() - INTERVAL '10 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'trial_start', 30, NOW() - INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'meeting_booked', 15, NOW() - INTERVAL '2 days'),

-- David Thompson (Ready to Buy)
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'event_register', 10, NOW() - INTERVAL '55 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'event_attend', 25, NOW() - INTERVAL '35 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'demo_request', 25, NOW() - INTERVAL '20 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'trial_start', 30, NOW() - INTERVAL '15 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'meeting_completed', 20, NOW() - INTERVAL '10 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'call_inbound', 15, NOW() - INTERVAL '5 days'),
('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'email_reply', 10, NOW() - INTERVAL '1 day'),

-- Michael Brown (Evaluating)
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'email_open', 5, NOW() - INTERVAL '25 days'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'website_visit', 3, NOW() - INTERVAL '20 days'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'content_download', 15, NOW() - INTERVAL '15 days'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'webinar_attend', 20, NOW() - INTERVAL '10 days'),
('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'demo_request', 25, NOW() - INTERVAL '3 days');

-- =====================================================
-- MARKETING CONTENT (Sofia AI Generated)
-- =====================================================

INSERT INTO marketing_content (id, type, title, content, keywords, target_audience, sofia_generated, seo_score, engagement_prediction, status, published_at, views, engagement_rate, shares, conversions) VALUES

-- Blog Posts
('770e8400-e29b-41d4-a716-446655440001', 'blog', 'Healthcare Digital Transformation: The Complete 2026 Guide',
'Complete guide to digital transformation in healthcare with Sofia AI...',
ARRAY['healthcare', 'digital transformation', 'EHR', 'telemedicine'],
ARRAY['healthcare_providers', 'clinic_managers'],
true, 92, 0.0850, 'published', NOW() - INTERVAL '45 days',
8500, 0.0780, 425, 87),

('770e8400-e29b-41d4-a716-446655440002', 'blog', 'Restaurant POS Systems: Modern vs Traditional',
'Comparing modern cloud-based POS with traditional systems...',
ARRAY['restaurant', 'POS', 'cloud', 'management'],
ARRAY['restaurant_owners'],
true, 88, 0.0720, 'published', NOW() - INTERVAL '30 days',
6200, 0.0690, 310, 45),

('770e8400-e29b-41d4-a716-446655440003', 'blog', 'Fashion Omnichannel: Inventory Management Revolution',
'How modern fashion brands manage inventory across all channels...',
ARRAY['fashion', 'omnichannel', 'inventory', 'retail'],
ARRAY['fashion_brands'],
true, 85, 0.0680, 'published', NOW() - INTERVAL '25 days',
5400, 0.0650, 270, 32),

-- Case Studies
('770e8400-e29b-41d4-a716-446655440004', 'case_study', 'How City Health Group Scaled to 10k Patients in 90 Days',
'Complete case study of healthcare implementation...',
ARRAY['healthcare', 'case study', 'success story'],
ARRAY['healthcare_providers'],
false, 90, 0.0920, 'published', NOW() - INTERVAL '40 days',
12500, 0.0880, 625, 142),

('770e8400-e29b-41d4-a716-446655440005', 'case_study', 'Real Estate Firm Increases Closings by 45% with PropTech',
'Real estate technology implementation success...',
ARRAY['real estate', 'proptech', 'success'],
ARRAY['real_estate_agencies'],
false, 87, 0.0850, 'published', NOW() - INTERVAL '35 days',
9800, 0.0820, 490, 98),

-- Whitepapers
('770e8400-e29b-41d4-a716-446655440006', 'whitepaper', 'Financial Services Security & Compliance Framework 2026',
'Complete security and compliance guide for financial institutions...',
ARRAY['fintech', 'security', 'compliance', 'GDPR'],
ARRAY['financial_institutions'],
true, 95, 0.0750, 'published', NOW() - INTERVAL '50 days',
3200, 0.0680, 160, 78),

-- Videos
('770e8400-e29b-41d4-a716-446655440007', 'video', 'Sofia AI v4.0: From Intention to Production in 5 Minutes',
'Demo video showing complete SaaS generation...',
ARRAY['Sofia AI', 'demo', 'AI', 'automation'],
ARRAY['all_verticals'],
true, 82, 0.1250, 'published', NOW() - INTERVAL '20 days',
15600, 0.1180, 780, 156),

-- Ebooks
('770e8400-e29b-41d4-a716-446655440008', 'ebook', 'The Cognitive Mesh OS Manifesto: Future of Enterprise SaaS',
'Complete guide to cognitive mesh architecture...',
ARRAY['AI', 'enterprise', 'architecture', 'SaaS'],
ARRAY['CTOs', 'architects'],
true, 93, 0.0820, 'published', NOW() - INTERVAL '60 days',
4500, 0.0790, 225, 95),

-- Social Posts
('770e8400-e29b-41d4-a716-446655440009', 'social_post', 'MagicSaaS System-∞ Launch Announcement',
'Introducing the world\'s first Cognitive Mesh OS...',
ARRAY['launch', 'AI', 'SaaS'],
ARRAY['all_verticals'],
true, 75, 0.0950, 'published', NOW() - INTERVAL '15 days',
42000, 0.0920, 2100, 287);

-- =====================================================
-- MARKETING INSIGHTS (Sofia AI Generated)
-- =====================================================

INSERT INTO marketing_insights (id, type, category, title, description, impact, confidence, data, actionable, suggested_actions, status) VALUES

('880e8400-e29b-41d4-a716-446655440001', 'opportunity', 'campaigns', 'Healthcare Campaign Outperforming Targets',
'Healthcare campaign has achieved 74.8% of lead target with 25% time remaining. Conversion rate is 4.2% vs 5% target.',
'high', 0.92,
'{"current_leads": 187, "target_leads": 250, "days_remaining": 15, "budget_remaining": 17500}',
true,
'["Increase budget by $10k for final push", "Double down on best-performing channels (LinkedIn)", "Fast-track high-scoring leads to sales"]',
'new'),

('880e8400-e29b-41d4-a716-446655440002', 'trend', 'leads', 'Lead Quality Increasing Across All Verticals',
'Average lead score has increased from 68 to 79 over the past 30 days, indicating higher quality prospects.',
'high', 0.88,
'{"avg_score_30d_ago": 68, "avg_score_now": 79, "increase_pct": 16.2}',
true,
'["Analyze what changed in targeting", "Share learnings across all campaigns", "Increase budget on high-quality sources"]',
'new'),

('880e8400-e29b-41d4-a716-446655440003', 'warning', 'content', 'Video Content Engagement Declining',
'Video engagement rate dropped from 12.5% to 8.2% in past 2 weeks. Audience may be experiencing fatigue.',
'medium', 0.75,
'{"previous_engagement": 0.125, "current_engagement": 0.082, "decline_pct": -34.4}',
true,
'["Test new video formats (shorts, reels)", "Refresh video thumbnails and titles", "Reduce video frequency temporarily"]',
'new'),

('880e8400-e29b-41d4-a716-446655440004', 'recommendation', 'channels', 'LinkedIn Outperforming Other Channels 3x',
'LinkedIn generates leads with 3.2x higher score than other channels. Consider reallocating budget.',
'high', 0.90,
'{"linkedin_avg_score": 84, "other_channels_avg_score": 26, "linkedin_cost_per_lead": 125, "other_cost_per_lead": 180}',
true,
'["Increase LinkedIn budget by 40%", "Reduce Meta ads spend by 20%", "Create LinkedIn-specific content series"]',
'actioned'),

('880e8400-e29b-41d4-a716-446655440005', 'forecast', 'revenue', 'Q1 2026 Revenue Forecast: $1.2M ARR',
'Based on current pipeline and conversion rates, Sofia AI predicts $1.2M ARR by end of Q1 2026.',
'high', 0.85,
'{"current_pipeline": 850000, "predicted_conversion_rate": 0.35, "predicted_arr": 1200000}',
true,
'["Validate forecast with sales team", "Prepare infrastructure for growth", "Start hiring for customer success"]',
'reviewing'),

('880e8400-e29b-41d4-a716-446655440006', 'anomaly', 'campaigns', 'Real Estate Event ROI Exceptional (1666%)',
'PropTech Innovation Series generated $680k pipeline from $38.5k spend - investigate success factors.',
'critical', 0.95,
'{"spend": 38500, "revenue": 680000, "roi": 1666, "attendees": 342}',
true,
'["Document event playbook", "Replicate for other verticals", "Plan Q2 event series"]',
'actioned');

-- =====================================================
-- CUSTOMER JOURNEYS (Sofia AI Mapped)
-- =====================================================

INSERT INTO marketing_journeys (lead_id, stages, current_stage, time_in_stage, sofia_insights, sofia_recommendations, predicted_path, risk_score) VALUES

('660e8400-e29b-41d4-a716-446655440001',
'[
  {"name": "awareness", "enteredAt": "2024-10-15T10:00:00Z", "exitedAt": "2024-10-20T14:30:00Z", "actions": ["email_open", "website_visit"], "conversions": 0},
  {"name": "consideration", "enteredAt": "2024-10-20T14:30:00Z", "exitedAt": "2024-11-05T09:00:00Z", "actions": ["content_download", "webinar_attend"], "conversions": 0},
  {"name": "decision", "enteredAt": "2024-11-05T09:00:00Z", "actions": ["demo_request", "trial_start", "meeting_booked"], "conversions": 0}
]',
'decision', 9,
'["Strong engagement across all touchpoints", "High-value decision maker with budget authority", "Fast progression through funnel (21 days awareness to decision)"]',
'["Schedule product demo with technical team this week", "Provide ROI calculator customized for 15-clinic network", "Connect with existing healthcare customers for references"]',
'["decision", "customer", "advocate"]',
15),

('660e8400-e29b-41d4-a716-446655440007',
'[
  {"name": "awareness", "enteredAt": "2024-09-20T08:00:00Z", "exitedAt": "2024-10-15T16:00:00Z", "actions": ["event_register"], "conversions": 0},
  {"name": "consideration", "enteredAt": "2024-10-15T16:00:00Z", "exitedAt": "2024-10-25T11:00:00Z", "actions": ["event_attend", "demo_request"], "conversions": 0},
  {"name": "decision", "enteredAt": "2024-10-25T11:00:00Z", "actions": ["trial_start", "meeting_completed", "call_inbound"], "conversions": 0}
]',
'decision', 20,
'["Very high intent signals", "Long evaluation period indicates enterprise buying process", "Multiple stakeholders involved (CTO + team)"]',
'["Send contract and onboarding timeline", "Prepare implementation team for January start", "Offer holiday promotion to close before year-end"]',
'["decision", "customer"]',
10),

('660e8400-e29b-41d4-a716-446655440013',
'[
  {"name": "awareness", "enteredAt": "2024-10-30T12:00:00Z", "actions": ["website_visit", "page_view"], "conversions": 0}
]',
'awareness', 15,
'["Low engagement - only 2 interactions in 15 days", "Small business with limited budget", "Needs education on SaaS benefits"]',
'["Send beginner guide to SaaS selection", "Enroll in nurture email series", "Offer consultation call with SaaS expert"]',
'["awareness", "consideration", "decision"]',
70);

-- =====================================================
-- A/B TESTS (Sofia AI Predicted)
-- =====================================================

INSERT INTO marketing_ab_tests (id, name, type, description, variants, status, sofia_recommendation, sofia_confidence, started_at) VALUES

('990e8400-e29b-41d4-a716-446655440001', 'Healthcare Email Subject Line Test', 'subject_line',
'Testing subject lines for healthcare campaign emails',
'[
  {"id": "var-a", "name": "Direct Value", "content": "Cut Healthcare Admin Time by 60% with Sofia AI", "traffic": 50, "metrics": {"impressions": 5000, "clicks": 250, "conversions": 22, "ctr": 0.05, "conversionRate": 0.088}},
  {"id": "var-b", "name": "Curiosity", "content": "The Secret Top Healthcare Providers Are Using", "traffic": 50, "metrics": {"impressions": 5000, "clicks": 180, "conversions": 12, "ctr": 0.036, "conversionRate": 0.067}}
]',
'completed', 'var-a', 0.92, NOW() - INTERVAL '30 days'),

('990e8400-e29b-41d4-a716-446655440002', 'CTA Button Color Test', 'cta',
'Testing CTA button colors on landing page',
'[
  {"id": "blue", "name": "Primary Blue", "content": "#3699ff", "traffic": 33, "metrics": {"impressions": 3300, "clicks": 165, "conversions": 18, "ctr": 0.05, "conversionRate": 0.109}},
  {"id": "green", "name": "Success Green", "content": "#1bc5bd", "traffic": 33, "metrics": {"impressions": 3300, "clicks": 198, "conversions": 24, "ctr": 0.06, "conversionRate": 0.121}},
  {"id": "purple", "name": "Premium Purple", "content": "#8950fc", "traffic": 34, "metrics": {"impressions": 3400, "clicks": 170, "conversions": 19, "ctr": 0.05, "conversionRate": 0.112}}
]',
'running', 'green', 0.78, NOW() - INTERVAL '10 days'),

('990e8400-e29b-41d4-a716-446655440003', 'Video Length Test', 'ad_creative',
'Testing optimal video length for ads',
'[
  {"id": "short", "name": "30 seconds", "content": "short_video.mp4", "traffic": 50, "metrics": {"impressions": 25000, "clicks": 0, "conversions": 0, "ctr": 0, "conversionRate": 0}},
  {"id": "long", "name": "2 minutes", "content": "long_video.mp4", "traffic": 50, "metrics": {"impressions": 25000, "clicks": 0, "conversions": 0, "ctr": 0, "conversionRate": 0}}
]',
'running', 'short', 0.68, NOW() - INTERVAL '5 days');

-- =====================================================
-- EMAIL CAMPAIGNS
-- =====================================================

INSERT INTO marketing_emails (id, campaign_id, name, subject, from_name, from_email, sofia_generated, total_sent, delivered, opened, clicked, open_rate, click_rate, sent_at) VALUES

('aa0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001',
'Healthcare Welcome Series - Day 1',
'Welcome to the Future of Healthcare Management',
'Sofia AI', 'sofia@magicsaas.com',
true, 1250, 1238, 618, 124, 0.4992, 0.2006, NOW() - INTERVAL '30 days'),

('aa0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001',
'Healthcare Case Study: 10k Patients in 90 Days',
'How City Health Group Scaled 10x',
'Sofia AI', 'sofia@magicsaas.com',
true, 1180, 1172, 551, 138, 0.4701, 0.2504, NOW() - INTERVAL '25 days'),

('aa0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006',
'Introducing MagicSaaS System-∞',
'The World\'s First Cognitive Mesh OS is Here',
'MagicSaaS Team', 'hello@magicsaas.com',
false, 8500, 8415, 3366, 505, 0.4000, 0.1500, NOW() - INTERVAL '15 days');

-- =====================================================
-- SOCIAL MEDIA POSTS
-- =====================================================

INSERT INTO marketing_social_posts (id, campaign_id, platform, content, hashtags, sofia_generated, engagement_prediction, status, published_at, impressions, engagement, likes, shares, clicks, engagement_rate) VALUES

('bb0e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440003', 'instagram',
'Fashion meets technology ✨ Manage your entire boutique from your phone with Sofia AI. Inventory, sales, customers - all in one place. #FashionTech',
ARRAY['FashionTech', 'Retail', 'AI', 'SaaS'],
true, 0.0850, 'published', NOW() - INTERVAL '20 days',
45000, 3825, 3200, 425, 200, 0.085),

('bb0e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440006', 'linkedin',
'🚀 Introducing MagicSaaS System-∞ - The world\'s first Cognitive Mesh OS. Transform "I want a healthcare SaaS" into a production-ready enterprise system in 10 minutes. Not low-code. Not no-code. Sofia AI understanding your INTENTION. [Demo link]',
ARRAY['SaaS', 'AI', 'Enterprise', 'Innovation'],
true, 0.0650, 'published', NOW() - INTERVAL '15 days',
125000, 6250, 4800, 950, 500, 0.05),

('bb0e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440006', 'twitter',
'🧵 How we built Sofia AI v4.0 - The Brain\n\n1/ Sofia isn\'t a chatbot. It\'s a Cognitive Mesh OS that orchestrates LangChain, Langfuse, Qdrant, pgVector.\n\nStack in production. Zero hype. 🚀',
ARRAY['AI', 'SaaS', 'BuildInPublic'],
true, 0.0420, 'published', NOW() - INTERVAL '18 days',
85000, 3570, 2800, 520, 250, 0.042);

-- =====================================================
-- MARKETING ATTRIBUTION
-- =====================================================

INSERT INTO marketing_attribution (lead_id, first_touch_campaign_id, first_touch_source, first_touch_timestamp, last_touch_campaign_id, last_touch_source, last_touch_timestamp, first_touch_value, last_touch_value, linear_value) VALUES

('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'linkedin', NOW() - INTERVAL '30 days', '550e8400-e29b-41d4-a716-446655440001', 'email', NOW() - INTERVAL '2 days', 125000.00, 125000.00, 125000.00),

('660e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440004', 'event', NOW() - INTERVAL '55 days', '550e8400-e29b-41d4-a716-446655440004', 'email', NOW() - INTERVAL '1 day', 150000.00, 150000.00, 150000.00),

('660e8400-e29b-41d4-a716-446655440009', '550e8400-e29b-41d4-a716-446655440005', 'linkedin', NOW() - INTERVAL '25 days', '550e8400-e29b-41d4-a716-446655440005', 'webinar', NOW() - INTERVAL '3 days', 200000.00, 200000.00, 200000.00);

-- =====================================================
-- UPDATE LEAD TOTAL INTERACTIONS COUNT
-- =====================================================

UPDATE marketing_leads SET total_interactions = (
  SELECT COUNT(*) FROM marketing_interactions WHERE lead_id = marketing_leads.id
);

-- =====================================================
-- SUMMARY STATS
-- =====================================================

-- Total campaigns: 6
-- Total leads: 15
-- Total content pieces: 9
-- Total insights: 6
-- Total A/B tests: 3
-- Total interactions: 30+
-- Total emails sent: 10,930
-- Total social impressions: 255,000

-- =====================================================
-- ✅ MARKETING INTELLIGENCE DEMO DATA COMPLETE
-- Sofia AI is present and active in ALL marketing operations
-- =====================================================
