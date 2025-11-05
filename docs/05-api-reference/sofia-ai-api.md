# 📡 Sofia AI v3.0 - API Reference

> **Complete API documentation for all Sofia AI endpoints**

---

## 🌐 Base URL

```
http://localhost:3003 (development)
https://api.magicsaas.ai (production)
```

---

## 🔒 Authentication

Currently, Sofia AI API is **open for development**. Production deployment will require:

```http
Authorization: Bearer <token>
```

---

## 📊 Health & Metrics

### **GET /health**

Health check endpoint.

**Response** `200 OK`:
```json
{
  "status": "healthy",
  "version": "3.0.0",
  "uptime": 3600,
  "timestamp": "2025-11-05T10:30:00Z",
  "components": {
    "intentionEngine": "active",
    "uxValidator": "active",
    "seoOptimizer": "active",
    "marketplace": "active",
    "directus": "connected",
    "redis": "connected",
    "anthropic": "connected"
  }
}
```

### **GET /metrics**

Prometheus metrics endpoint.

**Response** `200 OK` (text/plain):
```
# HELP sofia_intentions_total Total intentions processed
# TYPE sofia_intentions_total counter
sofia_intentions_total{status="success"} 150
sofia_intentions_total{status="failure"} 5

# HELP sofia_generation_duration_seconds Time to generate SaaS
# TYPE sofia_generation_duration_seconds histogram
sofia_generation_duration_seconds_bucket{le="1"} 45
sofia_generation_duration_seconds_bucket{le="5"} 120
...
```

---

## 🎯 IntentionEngine API

### **POST /api/intention/generate**

Generate complete SaaS architecture from natural language intention.

**Request Body**:
```json
{
  "intention": "Create a SaaS for gym management",
  "vertical": "fitness",
  "features": [
    "Member check-in via QR code",
    "Workout plans",
    "Monthly subscriptions",
    "Metrics dashboard"
  ],
  "target": {
    "users": 1000,
    "tenants": 50
  },
  "preferences": {
    "database": "postgresql",
    "frontend": "nextjs",
    "includeTests": true
  }
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "projectId": "prj_abc123",
  "intention": "Create a SaaS for gym management",
  "vertical": "fitness",
  "architecture": {
    "type": "multi-tenant-saas",
    "pattern": "microservices",
    "databases": ["postgresql", "redis"],
    "services": [
      {
        "name": "api",
        "type": "rest",
        "framework": "express",
        "port": 3000
      },
      {
        "name": "worker",
        "type": "background",
        "framework": "bullmq"
      },
      {
        "name": "websocket",
        "type": "realtime",
        "framework": "socket.io",
        "port": 3001
      }
    ]
  },
  "schema": {
    "tables": [
      {
        "name": "tenants",
        "columns": [
          { "name": "id", "type": "uuid", "primary": true },
          { "name": "name", "type": "varchar(255)" },
          { "name": "slug", "type": "varchar(100)", "unique": true },
          { "name": "plan", "type": "enum", "values": ["starter", "pro", "enterprise"] },
          { "name": "created_at", "type": "timestamp" }
        ],
        "indexes": ["slug"],
        "relations": []
      },
      {
        "name": "users",
        "columns": [
          { "name": "id", "type": "uuid", "primary": true },
          { "name": "tenant_id", "type": "uuid", "foreign": "tenants.id" },
          { "name": "email", "type": "varchar(255)", "unique": true },
          { "name": "role", "type": "enum", "values": ["admin", "trainer", "member"] }
        ]
      },
      {
        "name": "members",
        "columns": [
          { "name": "id", "type": "uuid", "primary": true },
          { "name": "user_id", "type": "uuid", "foreign": "users.id" },
          { "name": "qr_code", "type": "varchar(255)", "unique": true },
          { "name": "subscription_status", "type": "enum" }
        ]
      }
      // ... mais 8 tabelas
    ]
  },
  "apis": [
    {
      "method": "POST",
      "path": "/api/checkin",
      "auth": true,
      "body": { "qr_code": "string" },
      "response": { "success": "boolean", "member": "object" }
    },
    {
      "method": "GET",
      "path": "/api/workouts/:memberId",
      "auth": true,
      "response": { "workouts": "array" }
    },
    {
      "method": "POST",
      "path": "/api/subscriptions",
      "auth": true,
      "body": { "plan": "string", "payment_method": "string" }
    }
    // ... mais 25 endpoints
  ],
  "components": [
    {
      "name": "CheckInScanner",
      "type": "component",
      "framework": "react",
      "props": ["onScan"],
      "file": "CheckInScanner.tsx"
    },
    {
      "name": "WorkoutBuilder",
      "type": "page",
      "framework": "nextjs",
      "file": "pages/workouts/builder.tsx"
    }
    // ... mais 15 componentes
  ],
  "documentation": "# Gym Management SaaS\n\n## Overview\n...",
  "tests": [
    {
      "file": "tests/checkin.test.ts",
      "coverage": "95%"
    }
  ],
  "estimatedTime": "5 minutes",
  "confidence": 0.95
}
```

**Error Response** `400 Bad Request`:
```json
{
  "success": false,
  "error": "Invalid intention format",
  "details": "Intention must be a clear description of the SaaS"
}
```

---

## ✨ UXValidator API

### **POST /api/ux/validate**

Validate UX/UI of components.

**Request Body**:
```json
{
  "component": "LoginForm",
  "html": "<form>...</form>",
  "type": "form",
  "context": {
    "page": "authentication",
    "userFlow": "signup"
  }
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "score": 85,
  "grade": "B+",
  "issues": [
    {
      "id": "ux_001",
      "severity": "high",
      "heuristic": "error_prevention",
      "title": "Missing real-time email validation",
      "description": "Email field lacks real-time validation",
      "location": "input[name='email']",
      "suggestion": "Add regex validation onChange",
      "impact": "Users may submit invalid emails",
      "fixable": true
    },
    {
      "id": "ux_002",
      "severity": "medium",
      "heuristic": "visibility_of_status",
      "title": "No loading state visible",
      "description": "Submit button doesn't show loading",
      "location": "button[type='submit']",
      "suggestion": "Add spinner/loading indicator",
      "impact": "Users unsure if form is submitting"
    }
  ],
  "improvements": [
    "Add 'Forgot password?' link",
    "Implement social login (Google, GitHub)",
    "Improve button contrast ratio to 4.5:1",
    "Add keyboard shortcuts (Enter to submit)",
    "Show password strength meter"
  ],
  "accessibility": {
    "score": 90,
    "wcagLevel": "AA",
    "issues": [
      {
        "rule": "label-required",
        "impact": "critical",
        "fix": "Add <label> for each input"
      }
    ]
  },
  "performance": {
    "score": 95,
    "metrics": {
      "renderTime": "45ms",
      "interactiveTime": "120ms"
    }
  }
}
```

---

## 🔍 SEOOptimizer API

### **POST /api/seo/optimize**

Optimize SEO for pages.

**Request Body**:
```json
{
  "page": {
    "title": "Login",
    "url": "/login",
    "type": "authentication",
    "content": "<html>...</html>"
  },
  "vertical": "saas",
  "target": {
    "keywords": ["gym management", "fitness saas"],
    "geo": "brazil"
  }
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "score": 92,
  "metaTags": {
    "title": "Login - GymPro | Gym Management SaaS",
    "description": "Access your GymPro account. Manage members, workouts, and subscriptions efficiently.",
    "keywords": ["gym management", "fitness saas", "academia", "gestão"],
    "canonical": "https://gympro.com/login",
    "robots": "noindex, nofollow"
  },
  "openGraph": {
    "type": "website",
    "title": "GymPro - Gym Management SaaS",
    "description": "Professional gym management platform",
    "image": "https://gympro.com/og-image.png",
    "url": "https://gympro.com/login"
  },
  "twitterCard": {
    "card": "summary_large_image",
    "title": "GymPro Login",
    "description": "Access your gym management dashboard",
    "image": "https://gympro.com/twitter-image.png"
  },
  "structuredData": {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "GymPro",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web"
  },
  "recommendations": [
    "Add FAQ schema for common login questions",
    "Implement breadcrumb navigation",
    "Optimize images (compress 40%)",
    "Add hreflang tags for multi-language"
  ]
}
```

---

## 🏪 Marketplace API

### **GET /api/marketplace/petalas**

List all available pétalas.

**Query Parameters**:
- `vertical` (optional): Filter by vertical
- `limit` (optional): Max results (default: 20)
- `offset` (optional): Pagination offset

**Response** `200 OK`:
```json
{
  "success": true,
  "total": 45,
  "petalas": [
    {
      "id": "petala_whatsapp",
      "name": "WhatsApp Integration",
      "description": "Send automated WhatsApp messages",
      "icon": "💬",
      "color": "#25D366",
      "vertical": "communication",
      "basePrice": 99.00,
      "currency": "BRL",
      "features": [
        "Automated messages",
        "Template management",
        "Delivery analytics",
        "WhatsApp Business API"
      ],
      "status": "active",
      "downloads": 1250,
      "rating": 4.8
    }
    // ... mais pétalas
  ]
}
```

### **POST /api/marketplace/checkout**

Create checkout session.

**Request Body**:
```json
{
  "tenantId": "tenant_123",
  "userId": "user_456",
  "items": [
    {
      "productId": "petala_whatsapp",
      "quantity": 1
    },
    {
      "productId": "plan_professional",
      "quantity": 1
    }
  ],
  "discountCode": "LAUNCH50"
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "sessionId": "checkout_abc123",
  "items": [
    {
      "productId": "petala_whatsapp",
      "name": "WhatsApp Integration",
      "price": 99.00,
      "quantity": 1
    }
  ],
  "subtotal": 99.00,
  "discount": {
    "code": "LAUNCH50",
    "amount": 49.50,
    "type": "percentage"
  },
  "tax": 9.90,
  "total": 59.40,
  "currency": "BRL",
  "expiresAt": "2025-11-05T11:30:00Z",
  "paymentMethods": ["credit_card", "pix", "boleto"]
}
```

### **POST /api/marketplace/payment**

Process payment.

**Request Body**:
```json
{
  "sessionId": "checkout_abc123",
  "paymentMethod": "pix",
  "paymentData": {
    "cpf": "123.456.789-00"
  }
}
```

**Response** `200 OK`:
```json
{
  "success": true,
  "transactionId": "txn_xyz789",
  "status": "completed",
  "paymentMethod": "pix",
  "qrCode": "00020126580014br.gov.bcb.pix...",
  "qrCodeImage": "data:image/png;base64,iVBORw0KGgo...",
  "expiresAt": "2025-11-05T11:00:00Z"
}
```

---

## 📝 DecisionLogger API

### **GET /api/decisions**

Get decision logs.

**Query Parameters**:
- `projectId` (optional): Filter by project
- `component` (optional): Filter by component
- `limit` (optional): Max results (default: 50)

**Response** `200 OK`:
```json
{
  "success": true,
  "total": 150,
  "decisions": [
    {
      "id": "dec_001",
      "timestamp": "2025-11-05T10:30:00Z",
      "projectId": "prj_abc123",
      "component": "IntentionEngine",
      "decision": "database_choice",
      "chosen": "PostgreSQL + pgVector",
      "alternatives": ["MongoDB", "MySQL", "Supabase"],
      "reasoning": "PostgreSQL chosen for native JSON support, full-text search, and pgVector for future ML/embeddings features. Strong ACID compliance required for financial data.",
      "confidence": 0.95,
      "factors": [
        { "factor": "scalability", "weight": 0.3, "score": 0.9 },
        { "factor": "feature_fit", "weight": 0.4, "score": 1.0 },
        { "factor": "cost", "weight": 0.2, "score": 0.8 },
        { "factor": "team_experience", "weight": 0.1, "score": 0.9 }
      ]
    }
  ]
}
```

---

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad Request - Invalid input |
| `401` | Unauthorized - Missing/invalid token |
| `403` | Forbidden - Insufficient permissions |
| `404` | Not Found - Resource doesn't exist |
| `429` | Too Many Requests - Rate limit exceeded |
| `500` | Internal Server Error |
| `503` | Service Unavailable - Dependency down |

**Error Response Format**:
```json
{
  "success": false,
  "error": "Invalid request format",
  "code": "INVALID_REQUEST",
  "details": {
    "field": "intention",
    "issue": "Field is required"
  },
  "timestamp": "2025-11-05T10:30:00Z",
  "requestId": "req_abc123"
}
```

---

## 📊 Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/api/intention/generate` | 10 req/min |
| `/api/ux/validate` | 30 req/min |
| `/api/seo/optimize` | 30 req/min |
| `/api/marketplace/*` | 60 req/min |
| Other endpoints | 100 req/min |

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 7
X-RateLimit-Reset: 1699182000
```

---

**[← Voltar ao Índice](../00-INDEX.md)** | **[Próximo: Directus API →](./directus-api.md)**
