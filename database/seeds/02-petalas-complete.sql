/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌱 SEED DATA - Complete Pétalas (All 16 Verticals)                     ║
 * ║ Full demo data with stats, features, and metadata                       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

-- ═══════════════════════════════════════════════════════════════════════════
-- PÉTALAS - ALL 16 VERTICALS
-- ═══════════════════════════════════════════════════════════════════════════

INSERT INTO petalas (
  id, name, slug, description, icon, color, status, version, features, stats,
  created_at, updated_at, created_by
) VALUES
  -- Healthcare (COMPLETE)
  (
    uuid_generate_v4(),
    'Healthcare',
    'healthcare',
    'Complete healthcare management system with appointments, EHR, billing, and telemedicine',
    'ki-duotone ki-medical-cross',
    'success',
    'active',
    '1.0.0',
    '["Appointment Scheduling", "Electronic Health Records", "Billing & Insurance", "Telemedicine", "Lab Integration", "Prescription Management"]'::jsonb,
    '{"users": 1250, "revenue": 125000.50, "growth": 15.5}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Restaurant (COMPLETE)
  (
    uuid_generate_v4(),
    'Restaurant',
    'restaurant',
    'Full restaurant management with POS, reservations, inventory, and delivery integration',
    'ki-duotone ki-shop',
    'warning',
    'active',
    '1.0.0',
    '["Point of Sale", "Table Reservations", "Menu Management", "Inventory Control", "Delivery Integration", "Kitchen Display System"]'::jsonb,
    '{"users": 850, "revenue": 95000.75, "growth": 12.3}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Fashion (COMPLETE)
  (
    uuid_generate_v4(),
    'Fashion',
    'fashion',
    'E-commerce platform for fashion retailers with inventory, catalog, and omnichannel',
    'ki-duotone ki-abstract-26',
    'danger',
    'active',
    '1.0.0',
    '["Product Catalog", "Inventory Management", "Multi-Channel Sales", "Size Guide", "Style Recommendations", "Loyalty Program"]'::jsonb,
    '{"users": 620, "revenue": 78000.00, "growth": 18.7}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Real Estate (PARTIAL → COMPLETE)
  (
    uuid_generate_v4(),
    'Real Estate',
    'real-estate',
    'Property management platform with listings, CRM, contracts, and virtual tours',
    'ki-duotone ki-home',
    'info',
    'active',
    '1.0.0',
    '["Property Listings", "CRM for Agents", "Contract Management", "Virtual Tours", "Lead Generation", "Market Analytics"]'::jsonb,
    '{"users": 450, "revenue": 65000.00, "growth": 22.1}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Automotive (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Automotive',
    'automotive',
    'Auto dealership and service management with inventory, sales, and maintenance tracking',
    'ki-duotone ki-car',
    'primary',
    'active',
    '1.0.0',
    '["Vehicle Inventory", "Sales Pipeline", "Service Scheduling", "Parts Management", "Test Drive Booking", "Finance Integration"]'::jsonb,
    '{"users": 380, "revenue": 58000.00, "growth": 14.2}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Beauty (EMPTY → COMPLETE)
  (
    uuid_generate_v4(),
    'Beauty',
    'beauty',
    'Beauty salon and spa management with appointments, services, retail, and membership',
    'ki-duotone ki-star',
    'pink',
    'active',
    '1.0.0',
    '["Online Booking", "Service Menu", "Staff Management", "Retail POS", "Membership Plans", "Gift Cards"]'::jsonb,
    '{"users": 720, "revenue": 42000.00, "growth": 25.8}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Creator (EMPTY → COMPLETE)
  (
    uuid_generate_v4(),
    'Creator',
    'creator',
    'Content creator platform with monetization, analytics, community, and collaboration tools',
    'ki-duotone ki-video',
    'purple',
    'active',
    '1.0.0',
    '["Content Management", "Monetization Tools", "Analytics Dashboard", "Community Features", "Collaboration", "Brand Partnerships"]'::jsonb,
    '{"users": 2850, "revenue": 185000.00, "growth": 45.3}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Education (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Education',
    'education',
    'Learning management system with courses, assessments, live classes, and student tracking',
    'ki-duotone ki-book',
    'blue',
    'active',
    '1.0.0',
    '["Course Builder", "Assessment Tools", "Live Classes", "Student Portal", "Progress Tracking", "Certification"]'::jsonb,
    '{"users": 1580, "revenue": 142000.00, "growth": 31.5}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Events (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Events',
    'events',
    'Event management platform with ticketing, registration, check-in, and analytics',
    'ki-duotone ki-calendar',
    'orange',
    'active',
    '1.0.0',
    '["Event Creation", "Ticketing System", "Registration", "Check-In App", "Attendee Management", "Event Analytics"]'::jsonb,
    '{"users": 920, "revenue": 98000.00, "growth": 28.4}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Finance (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Finance',
    'finance',
    'Financial management platform with accounting, invoicing, expenses, and reporting',
    'ki-duotone ki-dollar',
    'green',
    'active',
    '1.0.0',
    '["Accounting", "Invoicing", "Expense Tracking", "Financial Reports", "Tax Management", "Multi-Currency"]'::jsonb,
    '{"users": 1120, "revenue": 156000.00, "growth": 19.8}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Fitness (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Fitness',
    'fitness',
    'Gym and fitness studio management with classes, memberships, personal training, and nutrition',
    'ki-duotone ki-pulse',
    'red',
    'active',
    '1.0.0',
    '["Class Scheduling", "Membership Management", "Personal Training", "Nutrition Plans", "Progress Tracking", "Mobile App"]'::jsonb,
    '{"users": 680, "revenue": 72000.00, "growth": 24.6}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Hospitality (EMPTY → COMPLETE)
  (
    uuid_generate_v4(),
    'Hospitality',
    'hospitality',
    'Hotel and hospitality management with reservations, housekeeping, PMS, and guest services',
    'ki-duotone ki-buildings',
    'teal',
    'active',
    '1.0.0',
    '["Reservation System", "Property Management", "Housekeeping", "Guest Services", "Revenue Management", "Channel Manager"]'::jsonb,
    '{"users": 340, "revenue": 125000.00, "growth": 16.7}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Legal (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Legal',
    'legal',
    'Law firm management with case tracking, documents, time tracking, and billing',
    'ki-duotone ki-shield-tick',
    'dark',
    'active',
    '1.0.0',
    '["Case Management", "Document Automation", "Time Tracking", "Billing", "Client Portal", "Calendar Integration"]'::jsonb,
    '{"users": 280, "revenue": 92000.00, "growth": 11.3}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Logistics (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Logistics',
    'logistics',
    'Supply chain and logistics management with tracking, routing, warehouse, and fleet',
    'ki-duotone ki-delivery',
    'cyan',
    'active',
    '1.0.0',
    '["Shipment Tracking", "Route Optimization", "Warehouse Management", "Fleet Management", "POD", "Real-time Tracking"]'::jsonb,
    '{"users": 520, "revenue": 138000.00, "growth": 21.9}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Retail (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Retail',
    'retail',
    'Retail management platform with POS, inventory, e-commerce, and customer loyalty',
    'ki-duotone ki-basket',
    'indigo',
    'active',
    '1.0.0',
    '["Point of Sale", "Inventory Management", "E-Commerce", "Customer Loyalty", "Multi-Store", "Analytics"]'::jsonb,
    '{"users": 1450, "revenue": 215000.00, "growth": 17.2}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  ),

  -- Travel (STUB → COMPLETE)
  (
    uuid_generate_v4(),
    'Travel',
    'travel',
    'Travel agency management with bookings, itineraries, CRM, and supplier integration',
    'ki-duotone ki-airplane',
    'sky',
    'active',
    '1.0.0',
    '["Booking System", "Itinerary Builder", "CRM", "Supplier Integration", "Payment Processing", "Travel Documents"]'::jsonb,
    '{"users": 390, "revenue": 105000.00, "growth": 29.1}'::jsonb,
    NOW(),
    NOW(),
    'admin-user-uuid'
  )
ON CONFLICT (slug) DO UPDATE SET
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  stats = EXCLUDED.stats,
  status = EXCLUDED.status,
  updated_at = NOW();

-- ═══════════════════════════════════════════════════════════════════════════
-- STATS SUMMARY
-- ═══════════════════════════════════════════════════════════════════════════

-- Total Users: 14,398
-- Total Revenue: $1,791,001.25
-- Average Growth: 22.4%
-- All 16 Pétalas: ACTIVE ✅
