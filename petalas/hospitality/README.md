# 🏨 Pétala Hospitality - Complete Hotel & Resort Management Solution

**Version:** 1.0.0 **Status:** ✅ Production-Ready **Category:** Hospitality &
Tourism **License:** Proprietary

---

## 📋 Overview

**Pétala Hospitality** is a complete, production-ready hotel and resort
management solution designed for hotels, resorts, vacation rentals, hostels, and
hospitality businesses. Built on the MagicSaaS System-∞ Cognitive Mesh OS with
Sofia AI v4.0 integration, it provides state-of-the-art features including
reservations, guest management, housekeeping, revenue management, channel
management, and AI-powered occupancy optimization.

### 🎯 Target Audience

- Hotels and resorts
- Vacation rentals (Airbnb-style)
- Hostels and budget accommodations
- Boutique hotels
- Bed & breakfasts
- Hotel chains and franchises

### ⭐ Key Features

1. ✅ **Sofia AI Assistant** - Conversational booking with natural language,
   personalized recommendations, and intelligent pricing
2. ✅ **Online Reservations** - Real-time booking engine with calendar view
3. ✅ **Room Management** - Room types, inventory, availability, pricing
4. ✅ **Guest Profiles** - Preferences, history, loyalty status, special
   requests
5. ✅ **Channel Manager** - Sync with Booking.com, Airbnb, Expedia, OTAs
6. ✅ **Dynamic Pricing** - AI-powered revenue management
7. ✅ **Housekeeping** - Room status, cleaning schedules, maintenance
8. ✅ **Front Desk** - Check-in/out, guest registry, key management
9. ✅ **Payment Processing** - Stripe, PIX, credit cards, deposits
10. ✅ **Point of Sale** - Restaurant, bar, room service, amenities
11. ✅ **Guest Communication** - SMS/WhatsApp automated messages
12. ✅ **Loyalty Program** - Points, tier levels, exclusive benefits
13. ✅ **Online Check-in** - Contactless arrival experience
14. ✅ **Guest Reviews** - TripAdvisor sync, reputation management
15. ✅ **Reporting & Analytics** - Occupancy, RevPAR, ADR, revenue
16. ✅ **Multi-Property** - Manage multiple locations
17. ✅ **Event Spaces** - Conference rooms, banquet halls booking
18. ✅ **Amenities Management** - Pool, gym, spa, parking
19. ✅ **Mobile App (PWA)** - Guest portal and staff app
20. ✅ **Smart Room Integration** - IoT devices, keyless entry

### 🧠 Sofia AI v4.0 Integration

Hospitality pétala includes complete **Sofia AI v4.0** integration powered by
LangChain, Langfuse, Qdrant, and pgVector:

#### AI-Powered Features:

- **Dynamic Pricing & Revenue Management** - Sofia optimizes pricing based on:
  - Historical occupancy patterns
  - Local events and seasonality
  - Competitor pricing analysis
  - Demand forecasting
  - Optimal rate recommendations (maximize RevPAR)

- **Personalized Guest Experience** - AI delivers:
  - Room upgrade recommendations
  - Personalized amenity suggestions
  - Activity and dining recommendations
  - Upsell opportunities (spa, tours, room service)
  - Special occasion recognition (anniversaries, birthdays)

- **Occupancy Optimization** - Sofia analyzes:
  - Booking pace and trends
  - Length-of-stay optimization
  - Overbooking risk management
  - Group vs transient mix

- **Guest Satisfaction Prediction** - AI monitors:
  - Guest satisfaction scores (real-time)
  - Churn risk (likelihood of not returning)
  - Review sentiment analysis
  - Service recovery opportunities

- **Operational Efficiency** - AI optimizes:
  - Housekeeping schedules
  - Staff allocation based on occupancy
  - Inventory management (linens, amenities)
  - Maintenance predictions

- **Marketing Intelligence** - Sofia provides:
  - Guest segmentation
  - Lifetime value predictions
  - Campaign effectiveness analysis
  - Booking source optimization

#### Database Integration:

- `petala_customers` - Guest profiles with AI customer scores, lifetime value,
  loyalty tier
- `petala_products` - Room types, amenities, packages with AI demand forecasting
- `petala_appointments` - Event space bookings, spa appointments
- `petala_orders` - POS transactions (F&B, room charges, extras)
- `petala_reviews` - Guest feedback with sentiment analysis
- `sofia_petala_insights` - AI-generated revenue and operational insights
- `sofia_embeddings_universal` - Vector search for semantic guest preference
  matching

All data synchronized with Sofia AI v4.0 for real-time intelligence.

---

## 🏗️ Architecture

### Tech Stack

**Backend:**

- Node.js 22+ with TypeScript
- PostgreSQL 17+ with pgVector extension
- Redis 8+ for caching and real-time features
- Directus 11+ as central hub
- LangChain for AI orchestration
- Qdrant for vector search

**Frontend:**

- React 18+ with TypeScript
- Metronic 9 components
- TailwindCSS for styling
- React Query for state management
- PWA support

**AI & Intelligence:**

- Sofia AI v4.0 Core
- Anthropic Claude API
- Langfuse for observability
- pgVector for embeddings (1536 dimensions)
- TimescaleDB for time-series analytics

**Integrations:**

- Stripe for payments
- Booking.com, Airbnb, Expedia APIs
- Twilio for SMS
- Evolution API for WhatsApp
- SendGrid for emails
- Google Calendar sync
- Smart lock integrations (Salto, ASSA ABLOY)

---

## 🚀 Getting Started

### Prerequisites

- Docker 27+ & Docker Compose
- Node.js 22+ & pnpm 9+
- PostgreSQL 17+ with pgVector
- Redis 8+
- Anthropic API key for Sofia AI

### Installation

```bash
# 1. Ensure MagicSaaS System is installed
cd /home/user/Lotus

# 2. Initialize database (includes Hospitality pétala tables)
docker exec magicsaas-db bash /database/init-database.sh

# 3. Verify Hospitality pétala is registered
docker exec magicsaas-db psql -U postgres -d magicsaas -c \
  "SELECT petala_code, petala_name, status FROM petalas_registry WHERE petala_code = 'hospitality';"

# 4. Start services
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# 5. Access Hospitality admin
# Navigate to: http://localhost:8055 (Directus)
# Login and navigate to Hospitality collections
```

### Quick Test

```bash
# Check Sofia AI is operational
curl http://localhost:3003/health

# Query available rooms via Sofia
curl -X POST http://localhost:3003/api/intentions \
  -H "Content-Type: application/json" \
  -d '{
    "type": "query",
    "description": "Show me available luxury suites for next weekend with ocean view",
    "tenantId": "demo-tenant"
  }'
```

---

## 📊 Database Schema

Hospitality pétala uses the universal tables:

- **petala_customers** - Guest profiles with preferences, loyalty status, visit
  history
- **petala_products** - Room types (Standard, Deluxe, Suite), packages,
  amenities
- **petala_orders** - Reservations and POS transactions (F&B, services)
- **petala_appointments** - Event space bookings, spa reservations
- **petala_reviews** - Guest feedback with ratings and photos

All tables include Sofia AI fields:

- `ai_customer_score` - Guest quality score (0-1)
- `ai_lifetime_value_prediction` - Predicted total revenue per guest
- `ai_churn_risk` - Risk of guest not returning (0-1)
- `ai_demand_forecast` - Room type demand prediction
- `ai_optimal_price` - AI-recommended room rate
- `ai_sentiment_score` - Review sentiment analysis (-1 to 1)

---

## 📈 Key Metrics & KPIs

Sofia AI tracks and optimizes:

1. **Occupancy Rate** - % of rooms occupied
2. **RevPAR** (Revenue Per Available Room) - Total room revenue / total rooms
3. **ADR** (Average Daily Rate) - Room revenue / rooms sold
4. **Guest Satisfaction Score** - Average review rating
5. **Booking Lead Time** - Days between booking and arrival
6. **Length of Stay** - Average nights per reservation
7. **Direct Booking Rate** - % bookings not through OTAs
8. **Guest Lifetime Value** - Predicted total revenue per guest
9. **Channel Performance** - Revenue by booking source
10. **Staff Efficiency** - Rooms cleaned per hour, check-in time

All metrics available in real-time dashboards with AI insights and
recommendations.

---

## 🔒 Security & Compliance

- ✅ **Multi-tenancy** with Row Level Security (RLS)
- ✅ **LGPD Compliant** - Brazilian data protection
- ✅ **GDPR Ready** - European compliance
- ✅ **PCI-DSS** - Payment security
- ✅ **PII Protection** - Guest data encryption at rest
- ✅ **Audit Logs** - Complete activity tracking
- ✅ **Role-Based Access** - Staff permissions by role

---

## 💰 Pricing

Hospitality pétala is available as part of MagicSaaS subscription:

| Plan             | Price   | Rooms           | Features                                              |
| ---------------- | ------- | --------------- | ----------------------------------------------------- |
| **Starter**      | $29/mo  | Up to 10 rooms  | Basic reservations, POS, Sofia AI                     |
| **Professional** | $99/mo  | Up to 50 rooms  | Channel manager, dynamic pricing, SMS                 |
| **Enterprise**   | $299/mo | Unlimited rooms | Multi-property, API, white-label, custom integrations |

---

## 🎓 Documentation

- **[Sofia AI v4.0 Complete Guide](../../SOFIA_AI_V4_COMPLETE.md)**
- **[Hospitality API Reference](./docs/API.md)**
- **[Database Schema](../../database/schemas/06-all-petalas-tables.sql)**
- **[Demo Data](../../database/seeds/02-all-petalas-demo-data.sql)**
- **[Installation Guide](../../INSTALLATION_GUIDE.md)**

---

## 🤝 Support

For technical support:

- **Email:** support@softwarelotus.com.br
- **Documentation:** https://docs.softwarelotus.com.br
- **Issues:** https://github.com/netbarros/Lotus/issues

---

## 📄 License

© 2025 Software Lotus. All rights reserved.

Hospitality pétala is proprietary enterprise software. Part of MagicSaaS
System-∞.

---

<div align="center">

**Built with ❤️ by Sofia AI v4.0 - The Brain**

**🧠 100% End-to-End Integration | Production Ready | Enterprise Grade**

</div>
