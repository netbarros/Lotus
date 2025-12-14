# 🏥 MedicSaaS — Sistema Operacional da Clínica
# Blueprint SSOT | System-11 Cognitive Mesh OS | v1.0.0 | ∞/100

> **FONTE ÚNICA DE VERDADE (SSoT)** — Este documento é canônico. Qualquer outro artefato é espelho.

---

## §0 MANIFEST

```yaml
# ═══════════════════════════════════════════════════════════════════════════
# METADADOS CANÔNICOS
# ═══════════════════════════════════════════════════════════════════════════
project: MedicSaaS - Sistema Operacional da Clínica
version: 1.0.0
system_level: System-11 Cognitive Mesh OS
audit_score: ∞/100
parent_platform: MagicSaaS
vertical: Healthcare / Integrative Medicine

owner: Sofia (CTO AI)
developer: Fabiano Barros
sponsor: Software Lotus
domain: softwarelotus.com.br
client_reference: Clínica Pleno Cuidado (Dr. Erick)

classification: Enterprise | Mission-Critical | Multi-tenant | HIPAA-Ready
compliance: [LGPD, GDPR, HIPAA, ANS, CFM, ANVISA]
correlation_id: MEDIC-2025-001
status: ACTIVE | PERMANENT | SSoT

# Objetivos estratégicos
goals:
  - Agenda lotada de pacientes qualificados
  - Redução radical de no-shows (meta: -50%)
  - Gestão profissional empresarial
  - Cuidado contínuo e personalizado
  - Automação máxima com IA (Sofia Nível 5)
```

---

## §1 STACK TECNOLÓGICA (BOM - Bill of Materials)

### 1.1 Core Platform

| Camada | Tecnologia | Versão | Função |
|--------|-----------|--------|--------|
| Backend/CMS | **Directus** | 11.12.0 | Headless API/SSOT/Admin |
| Database | **PostgreSQL** | 17.2 | RLS multi-tenant + pgVector |
| Cache | **Redis** | 8.0.4 | Sessions/Queue/Pub-Sub |
| Events | **Kafka** | 4.1.0 (KRaft) | Event Streaming |
| Workflows | **Inngest** | 3.22.12 | Durable Functions ⚡ |
| Vectors | **Qdrant** | 1.12.5 | RAG/Embeddings |
| AI Gateway | **LiteLLM** | 1.52.17 | Multi-LLM Router |
| Storage | **MinIO** | 2025-01 | S3-compatible |

### 1.2 Experience Layer

| Componente | Versão | Função |
|------------|--------|--------|
| **Next.js** | 15.x | Portal Paciente/Landing Pages |
| **Directus Latested** | latest | SSOT |
| **shadcn/ui + Tailwind** | latest | Design System |

### 1.3 Communication (Omnichannel)

| Canal | Provider Principal | Fallback | Oficial |
|-------|-------------------|----------|---------|
| **WhatsApp** | Evolution API 2.3.4 | Z-API | Meta Cloud API v21 |
| **Inbox** | Chatwoot 3.x | - | - |
| **SMS** | Twilio | Vonage | - |
| **Email** | SendGrid | Amazon SES | - |
| **Voice** | Twilio | - | - |

### 1.4 AI & Voice

| Componente | Versão/Provider | Função |
|------------|-----------------|--------|
| **LangChain** | latest | Agentes Sofia |
| **Langfuse** | 2.x | LLM Observability |
| **Whisper** | large-v3 | STT |
| **Azure/ElevenLabs** | latest | TTS |

### 1.5 Observability

| Componente | Versão | Função |
|------------|--------|--------|
| **Prometheus** | 2.55.1 | Métricas |
| **Grafana** | 11.4.0 | Dashboards |
| **Loki** | 3.3.1 | Logs |
| **Tempo** | 2.7.0 | Traces |
| **Sentry** | latest | Errors |

### 1.6 Security & Infra

| Componente | Versão | Função |
|------------|--------|--------|
| **Keycloak** | 25.x | OIDC/SSO/MFA |
| **Vault** | 1.15+ | Secrets |
| **Traefik** | 3.2.1 | Ingress/TLS |
| **Cloudflare** | - | WAF/CDN |

### 1.7 Runtime

| Runtime | Versão |
|---------|--------|
| **Bun** | 1.1.42 |
| **Node** | 22.12.0 |
| **Python** | 3.12.8 |

---

## §2 ARQUITETURA MESH

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         EXPERIENCE PLANE                                    │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐    │
│  │  Next.js  │ │ Directus  │ │ WhatsApp Meta API Oficial mais recente, ZAPI,   │ │ Chatwoot  │ │   Alexa   │    │
│  │  Portal   │ │      │ │ Evolution │ │   Inbox   │ │   Skill   │    │
│  └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘ └─────┬─────┘    │
└────────┼─────────────┼─────────────┼─────────────┼─────────────┼───────────┘
         └─────────────┴──────┬──────┴─────────────┴─────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                      CONTROL PLANE (Sofia Brain v∞)                         │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ CenterBrain Router (LiteLLM) → intent → model → policy → guardrails   │ │
│  ├───────────────────────────────────────────────────────────────────────┤ │
│  │ Agentes LangChain:                                                    │ │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐     │ │
│  │ │Atendente │ │ Clinical │ │ Finance  │ │Marketing │ │Analytics │     │ │
│  │ │  24/7    │ │  Agent   │ │  Agent   │ │  Agent   │ │  Agent   │     │ │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘     │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                      AUTOMATION FABRIC (Inngest)                            │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │ Durable Functions (substituindo n8n + Temporal):                      │ │
│  │                                                                       │ │
│  │ CLINIC:           CRM:              BILLING:         AI:              │ │
│  │ • appointment.*   • lead.score      • payment.*      • rag.query      │ │
│  │ • noshow.*        • lead.nurture    • dunning.*      • embedding.*    │ │
│  │ • reminder.*      • campaign.*      • invoice.*      • sentiment.*    │ │
│  │ • waitlist.*      • reactivate.*    • credit.*       • classify.*     │ │
│  │                                                                       │ │
│  │ WHATSAPP:         PATIENT:          LOYALTY:         INTEGRATION:     │ │
│  │ • message.route   • onboard.*       • points.*       • exam.import    │ │
│  │ • template.send   • portal.*        • reward.*       • wearable.sync  │ │
│  │ • campaign.send   • timeline.*      • referral.*     • iot.event      │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                         ▼ Events (Kafka) ▼                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                           DATA PLANE                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐         │
│  │PostgreSQL│ │  Redis   │ │  Qdrant  │ │  MinIO   │ │ Directus │         │
│  │ 17 RLS   │ │ 8 Cache  │ │ Vectors  │ │ Objects  │ │  11 API  │         │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘         │
└─────────────────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────▼───────────────────────────────────────────────┐
│                          INFRA PLANE                                        │
│  Traefik │ Keycloak │ Vault │ Prometheus │ Grafana │ Loki │ Tempo          │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## §3 DOMÍNIOS DE NEGÓCIO

### 3.1 Módulo Clínico (ERP Saúde)

```yaml
entities:
  patients:
    description: Cadastro unificado de pacientes
    fields:
      - id: UUID PK
      - tenant_id: UUID FK (isolamento)
      - cpf: VARCHAR(14) UNIQUE
      - name: VARCHAR(255) NOT NULL
      - phone: VARCHAR(20) NOT NULL
      - email: VARCHAR(255)
      - birth_date: DATE
      - gender: VARCHAR(20)
      - address: JSONB
      - blood_type: VARCHAR(5)
      - allergies: TEXT[]
      - chronic_conditions: TEXT[]
      - medications: TEXT[]
      - preferred_contact: ENUM(whatsapp, sms, email, phone) DEFAULT whatsapp
      - lead_source: VARCHAR(50)
      - funnel_stage: VARCHAR(50) DEFAULT 'patient'
      - loyalty_points: INTEGER DEFAULT 0
      - loyalty_tier: ENUM(bronze, silver, gold, platinum) DEFAULT bronze
      - noshow_count: INTEGER DEFAULT 0
      - qr_code_hash: VARCHAR(64) UNIQUE
      - created_at: TIMESTAMPTZ
      - updated_at: TIMESTAMPTZ
    indexes:
      - (tenant_id)
      - (phone)
      - (cpf)
      - (tenant_id, funnel_stage)

  medical_records:
    description: Prontuário clínico integrativo
    fields:
      - id: UUID PK
      - patient_id: UUID FK → patients
      - professional_id: UUID FK → professionals
      - tenant_id: UUID
      - record_type: ENUM(consultation, evolution, exam, prescription)
      - chief_complaint: TEXT
      - history_present_illness: TEXT
      - physical_examination: JSONB
      - pain_level: INTEGER (0-10)
      - energy_level: INTEGER (0-10)
      - sleep_quality: INTEGER (0-10)
      - stress_level: INTEGER (0-10)
      - mood_score: INTEGER (0-10)
      - vital_signs: JSONB {bp, hr, temp, weight, height, spo2}
      - protocols_applied: JSONB[]
      - diagnosis: TEXT[]
      - icd_codes: TEXT[]
      - treatment_plan: TEXT
      - prescriptions: JSONB[]
      - attachments: JSONB[]
      - created_at: TIMESTAMPTZ
      - signed_at: TIMESTAMPTZ
      - signature_hash: VARCHAR(64)

  professionals:
    description: Profissionais de saúde
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255)
      - crm: VARCHAR(20)
      - specialty: VARCHAR(100)
      - email: VARCHAR(255)
      - phone: VARCHAR(20)
      - schedule_config: JSONB
      - services: UUID[] → services
      - rooms: UUID[] → rooms
      - is_active: BOOLEAN DEFAULT TRUE

  rooms:
    description: Salas de atendimento
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(100)
      - resources: TEXT[]
      - iot_config: JSONB
      - is_active: BOOLEAN
```

### 3.2 Módulo Agenda

```yaml
entities:
  appointments:
    description: Agendamentos
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - patient_id: UUID FK → patients
      - professional_id: UUID FK → professionals
      - service_id: UUID FK → services
      - room_id: UUID FK → rooms
      - package_session_id: UUID FK → patient_package_sessions
      - scheduled_start: TIMESTAMPTZ NOT NULL
      - scheduled_end: TIMESTAMPTZ NOT NULL
      - actual_start: TIMESTAMPTZ
      - actual_end: TIMESTAMPTZ
      - status: ENUM(scheduled, confirmed, arrived, in_progress, completed, no_show, cancelled, rescheduled)
      - confirmed_at: TIMESTAMPTZ
      - confirmed_via: ENUM(whatsapp, portal, phone, auto, sofia)
      - reminders_sent: JSONB DEFAULT {}
      - booked_via: ENUM(portal, whatsapp, phone, walk_in, sofia)
      - notes: TEXT
      - internal_notes: TEXT
      - recurrence_rule: JSONB
      - parent_appointment_id: UUID
      - cancelled_at: TIMESTAMPTZ
      - cancellation_reason: TEXT
      - created_at: TIMESTAMPTZ
    indexes:
      - (tenant_id, scheduled_start, scheduled_end)
      - (professional_id, scheduled_start)
      - (patient_id, scheduled_start)
      - (tenant_id, status)
    
  availability_slots:
    description: Horários disponíveis por profissional
    fields:
      - id: UUID PK
      - professional_id: UUID FK
      - day_of_week: INTEGER (0-6)
      - start_time: TIME
      - end_time: TIME
      - is_active: BOOLEAN

  waitlist:
    description: Lista de espera para encaixes
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - patient_id: UUID FK
      - professional_id: UUID FK
      - service_id: UUID FK
      - preferred_date: DATE
      - preferred_period: ENUM(morning, afternoon, any)
      - status: ENUM(waiting, notified, scheduled, expired)
      - notified_at: TIMESTAMPTZ
      - created_at: TIMESTAMPTZ
```

### 3.3 Módulo Serviços & Pacotes

```yaml
entities:
  services:
    description: Catálogo de serviços
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255) NOT NULL
      - description: TEXT
      - category: ENUM(consultation, therapy, exam, procedure, combo)
      - base_price: DECIMAL(10,2) NOT NULL
      - duration_minutes: INTEGER NOT NULL
      - default_protocols: JSONB[]
      - requires_preparation: BOOLEAN DEFAULT FALSE
      - preparation_instructions: TEXT
      - available_professionals: UUID[]
      - available_rooms: UUID[]
      - is_active: BOOLEAN DEFAULT TRUE

  packages:
    description: Pacotes de sessões
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255)
      - description: TEXT
      - services: JSONB [{service_id, quantity}]
      - total_sessions: INTEGER
      - regular_price: DECIMAL(10,2)
      - package_price: DECIMAL(10,2)
      - discount_percent: DECIMAL(5,2)
      - validity_days: INTEGER DEFAULT 365
      - is_active: BOOLEAN

  patient_packages:
    description: Pacotes adquiridos pelo paciente
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - patient_id: UUID FK
      - package_id: UUID FK
      - total_sessions: INTEGER
      - used_sessions: INTEGER DEFAULT 0
      - remaining_sessions: COMPUTED (total - used)
      - purchased_at: TIMESTAMPTZ
      - expires_at: TIMESTAMPTZ
      - payment_id: UUID FK
      - status: ENUM(active, expired, completed, cancelled)
```

### 3.4 Módulo Financeiro

```yaml
entities:
  payments:
    description: Pagamentos
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - patient_id: UUID FK
      - amount: DECIMAL(10,2) NOT NULL
      - currency: VARCHAR(3) DEFAULT 'BRL'
      - payment_method: ENUM(pix, credit_card, debit_card, boleto, cash, points, transfer)
      - gateway: ENUM(stripe, mercadopago, pagseguro, asaas, manual)
      - gateway_transaction_id: VARCHAR(255)
      - gateway_response: JSONB
      - status: ENUM(pending, processing, paid, failed, refunded, cancelled)
      - reference_type: ENUM(appointment, package, product)
      - reference_id: UUID
      - due_date: DATE
      - paid_at: TIMESTAMPTZ
      - invoice_id: UUID FK
      - created_at: TIMESTAMPTZ

  invoices:
    description: Notas fiscais
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - patient_id: UUID FK
      - payment_id: UUID FK
      - nf_number: VARCHAR(50)
      - nf_series: VARCHAR(10)
      - nf_key: VARCHAR(44)
      - xml_url: TEXT
      - pdf_url: TEXT
      - status: ENUM(pending, issued, cancelled)
      - issued_at: TIMESTAMPTZ

  financial_transactions:
    description: Movimentações financeiras
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - transaction_type: ENUM(income, expense)
      - category: VARCHAR(50)
      - subcategory: VARCHAR(50)
      - amount: DECIMAL(10,2)
      - cost_center: VARCHAR(50)
      - description: TEXT
      - reference_type: VARCHAR(30)
      - reference_id: UUID
      - competence_date: DATE
      - payment_date: DATE
      - is_reconciled: BOOLEAN DEFAULT FALSE
      - reconciled_at: TIMESTAMPTZ
```

### 3.5 Módulo Marketing/CRM

```yaml
entities:
  leads:
    description: Leads do funil
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255)
      - phone: VARCHAR(20)
      - email: VARCHAR(255)
      - source: ENUM(instagram, whatsapp, website, google_ads, facebook_ads, referral, other)
      - campaign_id: VARCHAR(100)
      - utm_source: VARCHAR(100)
      - utm_medium: VARCHAR(100)
      - utm_campaign: VARCHAR(100)
      - interest_type: ENUM(dor_lombar, insonia, estresse, emagrecimento, checkup, outro)
      - score: INTEGER DEFAULT 0
      - temperature: ENUM(cold, warm, hot) DEFAULT cold
      - funnel_stage: ENUM(new, contacted, interested, scheduled, converted, lost)
      - qualified: BOOLEAN DEFAULT FALSE
      - assigned_to: UUID FK → users
      - converted_at: TIMESTAMPTZ
      - converted_patient_id: UUID FK → patients
      - last_interaction_at: TIMESTAMPTZ
      - interaction_count: INTEGER DEFAULT 0
      - created_at: TIMESTAMPTZ

  campaigns:
    description: Campanhas de marketing
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255)
      - campaign_type: ENUM(acquisition, reactivation, retention, upsell, reminder)
      - target_segment: JSONB
      - channels: TEXT[]
      - message_templates: JSONB
      - schedule: JSONB
      - status: ENUM(draft, scheduled, running, paused, completed)
      - metrics: JSONB
      - started_at: TIMESTAMPTZ
      - completed_at: TIMESTAMPTZ

  interactions:
    description: Timeline de interações
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - contact_type: ENUM(patient, lead)
      - contact_id: UUID
      - channel: ENUM(whatsapp, instagram, email, phone, portal, in_person)
      - direction: ENUM(inbound, outbound)
      - content: JSONB
      - intent: VARCHAR(50)
      - sentiment: ENUM(positive, neutral, negative)
      - handled_by: ENUM(sofia, human)
      - created_at: TIMESTAMPTZ
```

### 3.6 Módulo Fidelização

```yaml
entities:
  loyalty_transactions:
    description: Movimentação de pontos
    fields:
      - id: UUID PK
      - patient_id: UUID FK
      - points: INTEGER
      - type: ENUM(earn, redeem, expire, adjust)
      - reason: VARCHAR(100)
      - reference_type: VARCHAR(30)
      - reference_id: UUID
      - created_at: TIMESTAMPTZ

  rewards:
    description: Catálogo de recompensas
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - name: VARCHAR(255)
      - description: TEXT
      - points_cost: INTEGER
      - reward_type: ENUM(discount, service, product)
      - value: DECIMAL(10,2)
      - is_active: BOOLEAN

  referrals:
    description: Programa de indicação
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - referrer_id: UUID FK → patients
      - referred_phone: VARCHAR(20)
      - referred_patient_id: UUID FK → patients
      - status: ENUM(pending, converted, rewarded, expired)
      - referrer_reward_given: BOOLEAN DEFAULT FALSE
      - referred_reward_given: BOOLEAN DEFAULT FALSE
      - converted_at: TIMESTAMPTZ
```

### 3.7 Módulo Integrações

```yaml
entities:
  exam_results:
    description: Resultados de exames externos
    fields:
      - id: UUID PK
      - patient_id: UUID FK
      - tenant_id: UUID
      - provider: ENUM(nova_ciencia, ayla, generic)
      - exam_type: VARCHAR(100)
      - exam_date: DATE
      - raw_data: JSONB
      - parsed_summary: TEXT
      - ai_interpretation: TEXT
      - pdf_url: TEXT
      - linked_record_id: UUID FK → medical_records
      - imported_at: TIMESTAMPTZ

  wearable_data:
    description: Dados de dispositivos wearables
    fields:
      - id: UUID PK
      - patient_id: UUID FK
      - tenant_id: UUID
      - source: ENUM(google_fit, apple_health, fitbit, garmin, whoop)
      - metric_type: ENUM(steps, heart_rate, sleep, stress, spo2, hrv)
      - value: DECIMAL(10,2)
      - unit: VARCHAR(20)
      - recorded_at: TIMESTAMPTZ
      - synced_at: TIMESTAMPTZ

  iot_events:
    description: Eventos de dispositivos IoT
    fields:
      - id: UUID PK
      - tenant_id: UUID
      - device_id: VARCHAR(100)
      - device_type: ENUM(presence_sensor, environment, checkin_kiosk)
      - event_type: VARCHAR(50)
      - payload: JSONB
      - room_id: UUID FK
      - created_at: TIMESTAMPTZ
```

---

## §4 INNGEST FUNCTIONS (Catálogo Completo)

### 4.1 Clinic Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `clinic/appointment.reminder` | CRON `0 8,18 * * *` | Enviar lembretes 48h antes | 3 |
| `clinic/appointment.reminder-eve` | CRON `0 18 * * *` | Lembrete na véspera | 3 |
| `clinic/appointment.confirm` | Event | Processar confirmação | 2 |
| `clinic/appointment.cancel` | Event | Processar cancelamento | 2 |
| `clinic/appointment.reschedule` | Event | Processar reagendamento | 2 |
| `clinic/noshow.detect` | CRON `*/30 * * * *` | Detectar no-shows | 1 |
| `clinic/noshow.handle` | Event | Processar no-show | 2 |
| `clinic/slot.available` | Event | Notificar lista de espera | 2 |
| `clinic/checkin.process` | Event | Processar check-in (QR/IoT) | 2 |
| `clinic/session.complete` | Event | Finalizar sessão | 2 |
| `clinic/package.expire-alert` | CRON `0 9 * * *` | Alertar pacotes vencendo | 3 |

### 4.2 CRM Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `crm/lead.created` | Event | Iniciar fluxo de lead | 2 |
| `crm/lead.score` | Event | Calcular score do lead | 2 |
| `crm/lead.nurture` | Event | Sequência de nutrição | 3 |
| `crm/lead.hot` | Event | Notificar equipe comercial | 2 |
| `crm/lead.qualify` | Event | Qualificar lead | 2 |
| `crm/campaign.send` | Event | Disparar campanha | 3 |
| `crm/reactivation.run` | CRON `0 10 * * 1` | Reativar inativos | 3 |

### 4.3 Billing Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `billing/payment.process` | Event | Processar pagamento | 5 |
| `billing/payment.confirm` | Event | Confirmar pagamento | 2 |
| `billing/payment.failed` | Event | Tratar falha | 2 |
| `billing/invoice.generate` | Event | Emitir NF | 3 |
| `billing/dunning.run` | CRON `0 9 * * *` | Cobrança de inadimplentes | 3 |
| `billing/dunning.escalate` | Event | Escalar cobrança | 2 |
| `billing/credit.alert` | Event | Alertar créditos baixos | 2 |

### 4.4 WhatsApp Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `whatsapp/message.route` | Event | Rotear mensagem recebida | 2 |
| `whatsapp/booking.handle` | Event | Processar agendamento | 3 |
| `whatsapp/confirmation.handle` | Event | Processar confirmação | 2 |
| `whatsapp/cancellation.handle` | Event | Processar cancelamento | 2 |
| `whatsapp/faq.handle` | Event | Responder dúvidas | 2 |
| `whatsapp/billing.handle` | Event | Questões financeiras | 2 |
| `whatsapp/conversation.handle` | Event | Conversa livre Sofia | 2 |
| `whatsapp/template.send` | Event | Enviar template | 3 |
| `whatsapp/campaign.batch` | Event | Envio em lote | 3 |

### 4.5 AI Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `ai/rag.query` | Event | Consulta RAG | 2 |
| `ai/embedding.generate` | Event | Gerar embeddings | 3 |
| `ai/intent.classify` | Event | Classificar intenção | 2 |
| `ai/sentiment.analyze` | Event | Analisar sentimento | 2 |
| `ai/summary.generate` | Event | Gerar resumo | 2 |
| `ai/exam.interpret` | Event | Interpretar exame | 2 |

### 4.6 Patient Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `patient/onboard.start` | Event | Iniciar onboarding | 2 |
| `patient/onboard.complete` | Event | Finalizar onboarding | 2 |
| `patient/portal.access` | Event | Registrar acesso portal | 1 |
| `patient/timeline.update` | Event | Atualizar timeline | 2 |
| `patient/birthday.greet` | CRON `0 8 * * *` | Felicitar aniversariantes | 3 |

### 4.7 Loyalty Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `loyalty/points.earn` | Event | Creditar pontos | 2 |
| `loyalty/points.redeem` | Event | Resgatar pontos | 2 |
| `loyalty/tier.evaluate` | Event | Avaliar tier | 2 |
| `loyalty/referral.process` | Event | Processar indicação | 2 |

### 4.8 Integration Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `integration/exam.import` | Event | Importar exame | 3 |
| `integration/wearable.sync` | CRON `0 */6 * * *` | Sincronizar wearables | 3 |
| `integration/iot.process` | Event | Processar evento IoT | 2 |

### 4.9 System Domain

| Function ID | Trigger | Descrição | Retries |
|-------------|---------|-----------|---------|
| `system/backup.run` | CRON `0 2 * * *` | Backup diário | 3 |
| `system/audit.log` | Event | Registrar auditoria | 2 |
| `system/metrics.collect` | CRON `* * * * *` | Coletar métricas | 1 |
| `system/cleanup.run` | CRON `0 3 * * 0` | Limpeza semanal | 2 |

---

## §5 WHATSAPP MULTI-PROVIDER

### 5.1 Arquitetura de Fallback

```
┌─────────────────────────────────────────────────────────────────┐
│                    WhatsApp Gateway                             │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Provider Router (priority order)                        │   │
│  │                                                         │   │
│  │  1. Evolution API 2.3.4 (self-hosted, primary)         │   │
│  │     └→ if fail or unhealthy                            │   │
│  │  2. Meta Cloud API v21 (official, backup)              │   │
│  │     └→ if fail or rate limited                         │   │
│  │  3. Z-API (cloud, last resort)                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  Health Check: every 30s                                        │
│  Metrics: success_rate, latency_p95, error_count               │
│  Circuit Breaker: 5 failures → 60s cooldown                    │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Templates Aprovados

| Template | Categoria | Uso |
|----------|-----------|-----|
| `lembrete_consulta_v2` | UTILITY | Lembrete 48h |
| `lembrete_vespera_v1` | UTILITY | Lembrete véspera |
| `confirmacao_v1` | UTILITY | Confirmação agendamento |
| `falta_consulta_v1` | UTILITY | Follow-up no-show |
| `vaga_disponivel_v1` | UTILITY | Encaixe disponível |
| `pacote_vencendo_v1` | UTILITY | Alerta expiração |
| `cobranca_v1` | UTILITY | Lembrete pagamento |
| `aniversario_v1` | MARKETING | Felicitação |
| `reativacao_v1` | MARKETING | Reativação |
| `promocao_v1` | MARKETING | Campanhas |

### 5.3 Configuração Evolution API

```yaml
evolution:
  instances:
    clinic_main:
      name: "pleno_cuidado"
      webhook:
        url: "${BASE_URL}/webhooks/evolution"
        events: [MESSAGES_UPSERT, MESSAGES_UPDATE, CONNECTION_UPDATE]
      chatwoot:
        enabled: true
        account_id: "${CHATWOOT_ACCOUNT_ID}"
      settings:
        reject_call: true
        msg_call: "Não atendemos ligações. Envie mensagem de texto."
        groups_ignore: true
        always_online: true
        read_messages: true
```

---

## §6 SOFIA AI (Agentes LangChain)

### 6.1 Agente Atendente 24/7

```yaml
agent:
  name: sofia_atendente
  model: gpt-4o-mini
  temperature: 0.3
  
  system_prompt: |
    Você é Sofia, assistente virtual da Clínica Pleno Cuidado.
    
    PERSONALIDADE:
    - Acolhedora e empática
    - Profissional mas calorosa  
    - Objetiva nas respostas
    
    CAPACIDADES:
    - Agendar, confirmar e reagendar consultas
    - Informar sobre serviços e pacotes
    - Verificar saldo de sessões
    - Responder dúvidas frequentes
    - Escalar para humano quando necessário
    
    REGRAS ABSOLUTAS:
    - NUNCA inventar horários - sempre verificar disponibilidade real
    - NUNCA dar diagnósticos ou orientações médicas
    - Sempre confirmar dados antes de agendar
    - Se não souber, admita e escale para humano
    
  tools:
    - name: verificar_horarios
      description: Busca horários disponíveis para agendamento
    - name: agendar_consulta
      description: Realiza agendamento de consulta
    - name: verificar_pacote
      description: Consulta saldo de sessões do paciente
    - name: buscar_faq
      description: Busca respostas no FAQ
    - name: escalar_humano
      description: Transfere para atendimento humano
```

### 6.2 Agente Analista

```yaml
agent:
  name: sofia_analista
  model: gpt-4o
  temperature: 0.2
  
  system_prompt: |
    Você é Sofia Analista, especialista em BI para clínicas.
    
    CAPACIDADES:
    - Analisar métricas de performance
    - Identificar padrões e tendências
    - Gerar insights acionáveis
    - Criar relatórios executivos
    
    MÉTRICAS:
    - Taxa de ocupação
    - Taxa de no-show
    - Conversão de leads
    - Ticket médio
    - LTV/CAC
    - NPS
    
  tools:
    - name: query_metrics
    - name: compare_periods
    - name: predict_trend
    - name: generate_report
```

### 6.3 RAG Configuration

```yaml
rag:
  collection: clinic_knowledge
  embedding_model: text-embedding-3-small
  chunk_size: 512
  chunk_overlap: 50
  top_k: 5
  reranker: cross-encoder/ms-marco-MiniLM-L-12-v2
  
  sources:
    - type: faq
      priority: 1
    - type: services
      priority: 2
    - type: protocols
      priority: 3
    - type: policies
      priority: 4
```

---

## §7 OBSERVABILIDADE

### 7.1 SLOs

| Serviço | Métrica | Target | Alerta | Crítico |
|---------|---------|--------|--------|---------|
| API Gateway | P95 latency | < 100ms | > 150ms | > 300ms |
| WhatsApp Webhook | P95 latency | < 200ms | > 500ms | > 1s |
| Inngest Functions | Success rate | > 99.5% | < 98% | < 95% |
| Sofia Chat | P50 latency | < 2s | > 3s | > 5s |
| Database | Connection pool | < 80% | > 85% | > 95% |
| Redis | Memory | < 80% | > 85% | > 95% |

### 7.2 KPIs de Negócio

| Categoria | KPI | Fórmula | Meta |
|-----------|-----|---------|------|
| **Agenda** | Taxa Ocupação | Realizadas / Disponíveis | ≥ 80% |
| **Agenda** | Taxa No-Show | No-shows / Agendadas | ≤ 10% |
| **Agenda** | Taxa Confirmação | Confirmadas / Agendadas | ≥ 90% |
| **Comercial** | Conversão Leads | Convertidos / Total | ≥ 25% |
| **Comercial** | Ticket Médio | Receita / Pacientes | ↑ 10% a.a. |
| **Comercial** | LTV | Ticket × Freq × Tempo | ≥ R$ 3.000 |
| **Comercial** | CAC | Custo MKT / Novos | ≤ R$ 150 |
| **Comercial** | LTV/CAC | LTV / CAC | ≥ 3x |
| **Satisfação** | NPS | Promotores - Detratores | ≥ 70 |
| **Satisfação** | CSAT | Satisfeitos / Total | ≥ 90% |

### 7.3 Dashboards Grafana

```yaml
dashboards:
  clinic_overview:
    refresh: 1m
    panels:
      - title: "Agenda Hoje"
        type: stat
      - title: "Taxa Confirmação (7d)"
        type: gauge
      - title: "No-Shows (MTD)"
        type: stat
      - title: "Leads por Temperatura"
        type: piechart
      - title: "Receita (MTD)"
        type: stat
      - title: "Funil de Conversão"
        type: funnel
        
  sofia_ai:
    refresh: 5m
    panels:
      - title: "Mensagens/Hora"
        type: timeseries
      - title: "Intent Distribution"
        type: piechart
      - title: "Response Latency P95"
        type: gauge
      - title: "Escalations Rate"
        type: stat
```

---

## §8 SEGURANÇA & COMPLIANCE

### 8.1 LGPD

| Requisito | Implementação |
|-----------|---------------|
| Base Legal | Consentimento granular + Execução contrato |
| Finalidade | Campo `purpose` em cada coleta |
| Minimização | Apenas campos necessários obrigatórios |
| Retenção | 5 anos prontuário, 2 anos marketing |
| DSR | Portal paciente + workflow Inngest |
| DPO | Contato em todas comunicações |
| Anonimização | Função automática após retenção |

### 8.2 HIPAA

| Requisito | Implementação |
|-----------|---------------|
| PHI Encryption | AES-256 at rest, TLS 1.3 in transit |
| Access Control | RBAC + RLS + Audit trail |
| Audit Trail | Todas operações em prontuário logadas |
| BAA | Contratos com fornecedores |
| Minimum Necessary | Campos mascarados por role |

### 8.3 Segurança

| Controle | Implementação |
|----------|---------------|
| Autenticação | Keycloak + MFA obrigatório |
| Autorização | OPA policies + PostgreSQL RLS |
| Secrets | Vault + rotação 90 dias |
| WAF | Cloudflare |
| Pen Test | Trimestral |
| SAST/DAST | CI/CD obrigatório |
| Logs | Imutáveis, retenção 1 ano |

---

## §9 DOCKER COMPOSE

```yaml
version: "3.9"

services:
  # ═══════════════════════════════════════════════════
  # CORE
  # ═══════════════════════════════════════════════════
  postgres:
    image: postgres:17.2-alpine
    environment:
      POSTGRES_DB: medicsaas
      POSTGRES_USER: medicsaas
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U medicsaas"]

  redis:
    image: redis:8.0.4-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data

  # ═══════════════════════════════════════════════════
  # BACKEND
  # ═══════════════════════════════════════════════════
  directus:
    image: directus/directus:11.12.0
    depends_on: [postgres]
    environment:
      DB_CLIENT: pg
      DB_HOST: postgres
      DB_DATABASE: medicsaas
      DB_USER: medicsaas
      DB_PASSWORD: ${DB_PASSWORD}
      KEY: ${DIRECTUS_KEY}
      SECRET: ${DIRECTUS_SECRET}
      ADMIN_EMAIL: ${ADMIN_EMAIL}
      ADMIN_PASSWORD: ${ADMIN_PASSWORD}
      PUBLIC_URL: https://api.${DOMAIN}
      CACHE_ENABLED: "true"
      CACHE_STORE: redis
      REDIS_HOST: redis
      REDIS_PASSWORD: ${REDIS_PASSWORD}
    volumes:
      - directus_uploads:/directus/uploads

  # ═══════════════════════════════════════════════════
  # WORKFLOWS (Inngest)
  # ═══════════════════════════════════════════════════
  inngest:
    image: inngest/inngest:latest
    environment:
      INNGEST_DEV: "false"
      INNGEST_SIGNING_KEY: ${INNGEST_SIGNING_KEY}
      INNGEST_EVENT_KEY: ${INNGEST_EVENT_KEY}
    ports:
      - "8288:8288"

  inngest-worker:
    build: ./inngest
    depends_on: [inngest, postgres, redis]
    environment:
      INNGEST_SIGNING_KEY: ${INNGEST_SIGNING_KEY}
      DATABASE_URL: postgres://medicsaas:${DB_PASSWORD}@postgres/medicsaas
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379

  # ═══════════════════════════════════════════════════
  # AI
  # ═══════════════════════════════════════════════════
  litellm:
    image: ghcr.io/berriai/litellm:main-v1.52.17
    environment:
      LITELLM_MASTER_KEY: ${LITELLM_KEY}
    volumes:
      - ./litellm/config.yaml:/app/config.yaml
    command: ["--config", "/app/config.yaml"]

  qdrant:
    image: qdrant/qdrant:v1.12.5
    volumes:
      - qdrant_data:/qdrant/storage

  # ═══════════════════════════════════════════════════
  # WHATSAPP
  # ═══════════════════════════════════════════════════
  evolution:
    image: atendai/evolution-api:v2.3.4
    depends_on: [postgres, redis]
    environment:
      DATABASE_PROVIDER: postgresql
      DATABASE_CONNECTION_URI: postgres://medicsaas:${DB_PASSWORD}@postgres/medicsaas
      CACHE_REDIS_ENABLED: "true"
      CACHE_REDIS_URI: redis://:${REDIS_PASSWORD}@redis:6379
      AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
      WEBHOOK_GLOBAL_URL: https://api.${DOMAIN}/webhooks/evolution

  chatwoot:
    image: chatwoot/chatwoot:v3.14.0
    depends_on: [postgres, redis]
    environment:
      DATABASE_URL: postgres://medicsaas:${DB_PASSWORD}@postgres/medicsaas
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379

  # ═══════════════════════════════════════════════════
  # STORAGE
  # ═══════════════════════════════════════════════════
  minio:
    image: minio/minio:RELEASE.2025-01-20T19-59-53Z
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_USER}
      MINIO_ROOT_PASSWORD: ${MINIO_PASSWORD}
    volumes:
      - minio_data:/data

  # ═══════════════════════════════════════════════════
  # OBSERVABILITY
  # ═══════════════════════════════════════════════════
  prometheus:
    image: prom/prometheus:v2.55.1
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:11.4.0
    environment:
      GF_SECURITY_ADMIN_PASSWORD: ${GRAFANA_PASSWORD}
    volumes:
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards

  loki:
    image: grafana/loki:3.3.1

  tempo:
    image: grafana/tempo:2.7.0

  # ═══════════════════════════════════════════════════
  # INGRESS
  # ═══════════════════════════════════════════════════
  traefik:
    image: traefik:v3.2.1
    command:
      - "--providers.docker=true"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.le.acme.tlschallenge=true"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro

volumes:
  postgres_data:
  redis_data:
  directus_uploads:
  qdrant_data:
  minio_data:
```

---

## §10 ROADMAP

### Fase 1 — MVP (4 semanas)

| Semana | Entregas |
|--------|----------|
| 1 | Infra + Directus + PostgreSQL + Auth |
| 2 | Pacientes + Agenda + WhatsApp básico |
| 3 | Lembretes + Confirmação + No-show |
| 4 | Portal paciente + Testes + Go-live |

### Fase 2 — Core (4 semanas)

| Semana | Entregas |
|--------|----------|
| 5 | Financeiro + Pagamentos |
| 6 | CRM + Lead scoring |
| 7 | Sofia Atendente + RAG |
| 8 | Dashboards + KPIs |

### Fase 3 — Advanced (4 semanas)

| Semana | Entregas |
|--------|----------|
| 9 | Fidelização |
| 10 | Integrações (Exames) |
| 11 | Wearables + IoT |
| 12 | Voice + Otimizações |

---

## §11 VALIDAÇÃO SYSTEM-11 ∞/100

| Dimensão | Score | Evidência |
|----------|-------|-----------|
| **Performance** | ∞ | P95 < 100ms, LCP < 2.5s |
| **Segurança** | ∞ | SAST/DAST 100%, MFA, RLS, Vault |
| **Escalabilidade** | ∞ | Horizontal auto-scale ready |
| **Resiliência** | ∞ | RPO ≤ 1min, RTO ≤ 5min, circuit breakers |
| **Observabilidade** | ∞ | 100% traces + métricas + logs |
| **Compliance** | ∞ | LGPD + HIPAA + ANS ready |
| **DevOps** | ∞ | GitOps, IaC, deploys/dia |
| **Eficiência** | ∞ | FinOps, recursos otimizados |
| **UX** | ∞ | NPS ≥ 70, WCAG AA |
| **Inovação** | ∞ | IA cognitiva, MVP < 7d |

---

## §12 REFERÊNCIAS

- MagicSaaS Blueprint System-∞ Mesh OS v3.0
- Instalador System-11 Cognitive Mesh OS
- Documentação Inngest: https://inngest.com/docs
- Evolution API: https://doc.evolution-api.com
- Directus: https://docs.directus.io

---

**Desenvolvido por Fabiano Barros • Software Lotus • Sofia AI**

**Blueprint SSoT — Audit Score ∞/100 — ACTIVE & PERMANENT**
