# 🧠 SYSTEM-11 COGNITIVE MESH PLAN — Lotus Monorepo Upgrade
## Audit de Reutilização + Tecnologias Avançadas | 2025-12-12

---

## §1 INVENTÁRIO: LOCALIZAÇÃO DE CÓDIGO AR/VR/WHATSAPP

### 1.1 AR/VR Modules (Realidade Aumentada/Virtual)

| Tecnologia | Localização | Pétala | Status |
|------------|-------------|--------|--------|
| **8th Wall WebAR** | `docs/PETALAS-COMPLETE.md` (linha 57) | **Fashion** | 📄 Documentado |
| **Matterport VR** | `docs/PETALAS-COMPLETE.md` (linha 139) | **Real Estate** | 📄 Documentado |
| AR Try-on | Mencionado como feature | Fashion | ⚠️ Não implementado |
| VR Property Tours | Mencionado como integration | Real Estate | ⚠️ Não implementado |

**Evidência** (`docs/PETALAS-COMPLETE.md`):
```markdown
Fashion:
- AR try-on (8th Wall WebAR)
- ⭐ AR virtual try-on

Real Estate:
- VR tours (Matterport integration)
- ⭐ VR property tours
```

> ⚠️ **ATENÇÃO**: Não há código AR/VR na base! Apenas documentação de features planejadas.

---

### 1.2 WhatsApp Multi-Provider Configuration

| Provider | Localização | Status | Prioridade |
|----------|-------------|--------|------------|
| **Evolution API** | `infrastructure/docker/docker-compose.ultimate.yml` (linha 347-438) | ✅ **CONFIGURADO** | Primary |
| **Z-API** | `docs/specs/MedicSaaS-Blueprint-SSOT.md` (linha 70, 705) | 📄 Documentado | Fallback |
| **Meta Cloud API v21** | `docs/specs/MedicSaaS-Blueprint-SSOT.md` (linha 70, 703) | 📄 Documentado | Official Backup |

**Arquitetura de Failover** (Blueprint):
```
1. Evolution API 2.3.4 (self-hosted, primary)
    └→ if fail or unhealthy
2. Meta Cloud API v21 (official, backup)
    └→ if fail or rate limited
3. Z-API (cloud, last resort)
```

**Evolution API Config Atual** (`docker-compose.ultimate.yml`):
```yaml
evolution-api:
  image: atendai/evolution-api:latest
  container_name: magicsaas-evolution-api
  ports:
    - "8080:8080"
  environment:
    DATABASE_PROVIDER: postgresql
    CACHE_REDIS_ENABLED: "true"
    CHATWOOT_ENABLED: "true"
    WEBHOOK_GLOBAL_URL: http://directus:8055/flows/trigger/evolution-webhook
```

---

### 1.3 Cognitive System 11 (Sofia AI Mesh)

| Localização | Conteúdo | Linhas |
|-------------|----------|--------|
| **`shared/sofia/core/CognitiveMeshIntegration.ts`** | Implementação TypeScript completa das 11 camadas | 580 linhas |
| `docs/02-architecture/complete-architecture.md` | Documentação das 11 camadas | 526 linhas |
| `docs/07-roadmap/q1-2026.md` | Histórico de implementação | 855 linhas |

**11 Camadas Implementadas** (`CognitiveMeshIntegration.ts`):
```typescript
Layer 1: Infrastructure     → InfrastructureContext (environment, region, containers)
Layer 2: Data              → DataContext (database, cache, storage metrics)
Layer 3: Integration       → IntegrationContext (external_apis, webhooks, events)
Layer 4: Business Logic    → BusinessLogicContext (workflows, rules, automation)
Layer 5: AI/ML             → AIMLContext (model_version, inference, accuracy)
Layer 6: API               → APIContext (requests/sec, latency, rate limits)
Layer 7: Application       → ApplicationContext (pétala, users, feature_flags)
Layer 8: Presentation      → PresentationContext (theme, viewport, accessibility)
Layer 9: Experience        → ExperienceContext (journey, satisfaction, frustration)
Layer 10: Intelligence     → IntelligenceContext (segments, predictions, insights)
Layer 11: Meta-Orchestration → MetaOrchestrationContext (health, circuit_breakers)
```

---

## §2 ANÁLISE DE REUTILIZAÇÃO (Shared vs Isolated)

### 2.1 Código Existente em `shared/`

```
shared/
├── api/
│   ├── petala-apis.ts       # API abstraction for pétalas
│   └── universal-api.ts     # Universal API client
├── backend/
│   └── runtime-config.ts    # Runtime configuration
├── composables/
│   └── useUniversalApi.ts   # Vue composable for API
├── config/
│   └── runtime-config.ts    # Config management
├── plugins/
│   └── magicsaas-plugin.ts  # Plugin system
└── sofia/
    ├── components/          # SofiaAvatar, SofiaChat, SofiaFloatingButton, SofiaVoiceControls
    ├── core/                # AnthropicClient, CognitiveMeshIntegration, ContextManager,
    │                        # IntentClassifier, PersonalityAdapter, SofiaEngine
    └── integration/
        └── fashion-views-sofia.ts
```

### 2.2 Duplicação Detectada em Pétalas

| Componente | Healthcare | Restaurant | Fashion | Problema |
|------------|------------|------------|---------|----------|
| `endpoints/analytics.ts` | ✅ | ✅ | Diferente | **Duplicado** |
| `endpoints/customers.ts` | ✅ (patients) | ✅ | ✅ | **Similar** |
| `endpoints/scheduler.ts` | ✅ | ✅ | N/A | **Duplicado** |
| `endpoints/payment.ts` | ✅ | ✅ | ✅ | **Duplicado** |
| `endpoints/notifications.ts` | ✅ | ✅ | ✅ | **Duplicado** |
| `hooks/` structure | ✅ (6 hooks) | ✅ (8 hooks) | Diferente | **Padrão similar** |
| `flows/` structure | ✅ | ✅ | Diferente | **Padrão similar** |

**Healthcare Backend** (15 endpoints):
```
analytics, appointments, customers, delivery, facilities, inventory,
lab_results, medical_records, notifications, patients, payment,
prescriptions, providers, scheduler, telemedicine
```

**Restaurant Backend** (15 endpoints):
```
analytics, customers, delivery, inventory, kitchen, menu,
notifications, orders, payment, reservations, restaurants,
reviews, scheduler, tables, waitlist
```

### 2.3 Oportunidades de Centralização em `packages/core`

| Módulo Proposto | Usado em | Economia de Código |
|-----------------|----------|-------------------|
| `@magicsaas/analytics` | Healthcare, Restaurant, Finance | ~3K linhas |
| `@magicsaas/scheduler` | Healthcare, Restaurant, Fitness, Events | ~2K linhas |
| `@magicsaas/payments` | Todas as 16 pétalas | ~5K linhas |
| `@magicsaas/notifications` | Todas as 16 pétalas | ~2K linhas |
| `@magicsaas/customers` | Healthcare (patients), Restaurant, Retail | ~3K linhas |
| `@magicsaas/whatsapp-gateway` | Todas as 16 pétalas | ~4K linhas |
| `@magicsaas/ar-viewer` | Fashion, Real Estate, Retail | ~2K linhas |

---

## §3 ESTRATÉGIA DE REUTILIZAÇÃO

### 3.1 Módulos Compartilhados a Criar

```
packages/
├── core/                           # Núcleo compartilhado
│   ├── src/
│   │   ├── auth/                   # JWT, RBAC, RLS context
│   │   ├── database/               # Connection pool, migrations
│   │   ├── cache/                  # Redis abstraction
│   │   └── logging/                # Structured logging (Pino)
│   └── package.json
│
├── whatsapp-gateway/               # Multi-provider WhatsApp
│   ├── src/
│   │   ├── providers/
│   │   │   ├── evolution.ts        # Evolution API client
│   │   │   ├── meta-cloud.ts       # Meta Cloud API v21 client
│   │   │   └── zapi.ts             # Z-API client
│   │   ├── router.ts               # Failover router
│   │   ├── health-check.ts         # Provider health monitor
│   │   └── templates/              # WhatsApp templates
│   └── package.json
│
├── ar-viewer/                      # Unified AR experience
│   ├── src/
│   │   ├── providers/
│   │   │   ├── eighth-wall.ts      # 8th Wall WebAR
│   │   │   └── webxr.ts            # WebXR fallback
│   │   ├── components/
│   │   │   ├── ARViewer.tsx        # React AR component
│   │   │   └── AROverlay.tsx       # AR overlay system
│   │   └── hooks/
│   │       └── useAR.ts            # AR hook
│   └── package.json
│
├── vr-tours/                       # VR property/facility tours
│   ├── src/
│   │   ├── providers/
│   │   │   ├── matterport.ts       # Matterport SDK
│   │   │   └── native-vr.ts        # Native VR fallback
│   │   └── components/
│   │       └── VRTour.tsx          # VR tour component
│   └── package.json
│
├── analytics/                      # Universal analytics
│   ├── src/
│   │   ├── tracker.ts              # Event tracking
│   │   ├── reports.ts              # Report generation
│   │   └── dashboards/             # Dashboard configs
│   └── package.json
│
├── scheduler/                      # Universal scheduling
│   ├── src/
│   │   ├── calendar.ts             # Calendar logic
│   │   ├── availability.ts         # Availability slots
│   │   ├── reminders.ts            # Reminder system
│   │   └── waitlist.ts             # Waitlist management
│   └── package.json
│
├── payments/                       # Payment gateway abstraction
│   ├── src/
│   │   ├── providers/
│   │   │   ├── stripe.ts
│   │   │   ├── mercado-pago.ts
│   │   │   └── asaas.ts
│   │   ├── checkout.ts
│   │   ├── subscriptions.ts
│   │   └── invoices.ts
│   └── package.json
│
└── notifications/                  # Multi-channel notifications
    ├── src/
    │   ├── channels/
    │   │   ├── email.ts            # SendGrid/Postmark
    │   │   ├── sms.ts              # Twilio
    │   │   ├── push.ts             # Firebase/OneSignal
    │   │   └── whatsapp.ts         # Uses whatsapp-gateway
    │   └── templates/
    └── package.json
```

### 3.2 Inngest Orchestration para WhatsApp Failover

**Nova Função Inngest** (`packages/whatsapp-gateway/src/inngest/`):

```typescript
// whatsapp.send.ts
import { inngest } from '@magicsaas/core';

export const sendWhatsAppMessage = inngest.createFunction(
  { id: 'whatsapp/message.send', retries: 3 },
  { event: 'whatsapp/message.requested' },
  async ({ event, step }) => {
    // Step 1: Try Evolution API (primary)
    const evolutionResult = await step.run('try-evolution', async () => {
      return await evolutionClient.send(event.data);
    }).catch(() => null);
    
    if (evolutionResult?.success) return evolutionResult;
    
    // Step 2: Fallback to Meta Cloud API (official backup)
    const metaResult = await step.run('fallback-meta-cloud', async () => {
      return await metaCloudClient.send(event.data);
    }).catch(() => null);
    
    if (metaResult?.success) return metaResult;
    
    // Step 3: Last resort - Z-API (cloud)
    const zapiResult = await step.run('last-resort-zapi', async () => {
      return await zapiClient.send(event.data);
    });
    
    return zapiResult;
  }
);
```

---

## §4 PLANO DE IMPLEMENTAÇÃO MEDICSAAS

### 4.1 Estrutura Final de `petalas/medic-saas`

```
petalas/medic-saas/
├── package.json                    # Depends on @magicsaas/* packages
├── config.json                     # Pétala configuration
├── metadata.json                   # Pétala metadata
│
├── backend/
│   ├── directus/
│   │   └── collections/            # MedicSaaS-specific collections only
│   │       ├── patients.yaml       # Extends @magicsaas/customers
│   │       ├── medical_records.yaml
│   │       ├── prescriptions.yaml
│   │       └── protocols.yaml      # Clinical protocols
│   │
│   ├── endpoints/                  # MedicSaaS-specific endpoints only
│   │   ├── telemedicine.ts         # Twilio Video integration
│   │   ├── lab_results.ts          # Lab integration (Nova Ciência, Ayla)
│   │   └── wearables.ts            # Wearable data sync
│   │
│   ├── inngest/                    # Inngest functions (from Blueprint)
│   │   ├── clinic/
│   │   │   ├── appointment.reminder.ts
│   │   │   ├── noshow.detect.ts
│   │   │   └── slot.available.ts
│   │   ├── crm/
│   │   │   ├── lead.score.ts
│   │   │   └── lead.nurture.ts
│   │   ├── billing/
│   │   │   ├── payment.process.ts
│   │   │   └── dunning.run.ts
│   │   └── whatsapp/
│   │       ├── message.route.ts
│   │       └── booking.handle.ts
│   │
│   └── hooks/
│       ├── medical_records.ts      # HIPAA audit logging
│       └── prescriptions.ts        # Digital signature
│
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── app/                    # Next.js 15 App Router
│   │   │   ├── (portal)/           # Patient Portal
│   │   │   │   ├── agendamento/
│   │   │   │   ├── meu-perfil/
│   │   │   │   └── resultados/
│   │   │   └── (admin)/            # Admin Dashboard
│   │   │       ├── dashboard/
│   │   │       ├── pacientes/
│   │   │       └── agenda/
│   │   │
│   │   └── components/
│   │       ├── ui/                 # shadcn/ui components
│   │       └── medic/              # MedicSaaS-specific
│   │           ├── PatientCard.tsx
│   │           ├── AppointmentCalendar.tsx
│   │           └── PrescriptionForm.tsx
│   │
│   └── tailwind.config.js
│
└── k8s/
    ├── deployment.yaml
    └── service.yaml
```

### 4.2 Dependencies em `petalas/medic-saas/package.json`

```json
{
  "name": "@magicsaas/petala-medic-saas",
  "version": "1.0.0",
  "dependencies": {
    "@magicsaas/core": "workspace:*",
    "@magicsaas/whatsapp-gateway": "workspace:*",
    "@magicsaas/scheduler": "workspace:*",
    "@magicsaas/payments": "workspace:*",
    "@magicsaas/notifications": "workspace:*",
    "@magicsaas/analytics": "workspace:*",
    "next": "15.x",
    "@shadcn/ui": "latest",
    "tailwindcss": "^3.4"
  }
}
```

---

## §5 INTEGRAÇÃO FRONTEND COM AR/VR

### 5.1 Fashion AR Try-On (8th Wall)

```typescript
// packages/ar-viewer/src/providers/eighth-wall.ts
export class EighthWallProvider {
  private apiKey: string;
  
  async initializeARSession(canvas: HTMLCanvasElement): Promise<ARSession> {
    // Load 8th Wall script dynamically
    await this.loadScript('https://apps.8thwall.com/xrweb');
    
    // Initialize XR8 engine
    XR8.run({ canvas });
    
    return {
      placeModel: (gltfUrl: string) => XR8.Threejs.placeModel(gltfUrl),
      takePhoto: () => XR8.snapshot.takeSnapshot()
    };
  }
}

// Usage in Fashion pétala
import { EighthWallProvider } from '@magicsaas/ar-viewer';

const arProvider = new EighthWallProvider({ apiKey: process.env.EIGHTH_WALL_KEY });
await arProvider.initializeARSession(canvasRef.current);
arProvider.placeModel('/models/dress-model.glb');
```

### 5.2 Real Estate VR Tours (Matterport)

```typescript
// packages/vr-tours/src/providers/matterport.ts
export class MatterportProvider {
  private sdk: any;
  
  async loadTour(modelId: string, containerId: string): Promise<VRTour> {
    const iframe = document.createElement('iframe');
    iframe.src = `https://my.matterport.com/show/?m=${modelId}&play=1`;
    document.getElementById(containerId)?.appendChild(iframe);
    
    // Connect to Matterport SDK for navigation control
    this.sdk = await window.MP_SDK.connect(iframe);
    
    return {
      navigateTo: (position) => this.sdk.Sweep.moveTo(position),
      getFloorplan: () => this.sdk.Floorplan.getData()
    };
  }
}
```

---

## §6 ROADMAP DE MIGRAÇÃO

### Fase 1: Criar `packages/` (Semana 1-2)

| Task | Ação | Esforço |
|------|------|---------|
| 1.1 | Criar `packages/core` com auth, database, cache, logging | 3 dias |
| 1.2 | Extrair `packages/whatsapp-gateway` do Blueprint | 2 dias |
| 1.3 | Criar `packages/scheduler` reutilizável | 2 dias |
| 1.4 | Criar `packages/payments` reutilizável | 2 dias |
| 1.5 | Criar `packages/notifications` reutilizável | 1 dia |

### Fase 2: Configurar Inngest (Semana 2-3)

| Task | Ação | Esforço |
|------|------|---------|
| 2.1 | Validar Inngest no docker-compose.ultimate.yml | 1 dia |
| 2.2 | Criar worker Inngest com funções do Blueprint | 3 dias |
| 2.3 | Implementar WhatsApp failover via Inngest | 2 dias |
| 2.4 | Testar fluxos de reminder, no-show, nurturing | 2 dias |

### Fase 3: Migrar Frontend para Next.js 15 (Semana 3-4)

| Task | Ação | Esforço |
|------|------|---------|
| 3.1 | Criar `petalas/medic-saas/frontend` com Next.js 15 | 2 dias |
| 3.2 | Instalar e configurar shadcn/ui | 1 dia |
| 3.3 | Migrar componentes de Vue para React | 5 dias |
| 3.4 | Implementar Portal do Paciente | 3 dias |

### Fase 4: AR/VR Modules (Semana 5)

| Task | Ação | Esforço |
|------|------|---------|
| 4.1 | Criar `packages/ar-viewer` com 8th Wall | 3 dias |
| 4.2 | Criar `packages/vr-tours` com Matterport | 2 dias |
| 4.3 | Integrar AR na Fashion pétala | 2 dias |
| 4.4 | Integrar VR na Real Estate pétala | 2 dias |

---

## §7 RESUMO EXECUTIVO

### 7.1 Inventário de Tecnologias Avançadas

| Tecnologia | Status | Localização | Ação |
|------------|--------|-------------|------|
| **8th Wall WebAR** | 📄 Documentado | `docs/PETALAS-COMPLETE.md` | Criar `packages/ar-viewer` |
| **Matterport VR** | 📄 Documentado | `docs/PETALAS-COMPLETE.md` | Criar `packages/vr-tours` |
| **Evolution API** | ✅ Configurado | `docker-compose.ultimate.yml` | Usar como base |
| **Z-API** | 📄 Documentado | Blueprint | Adicionar como fallback |
| **Meta Cloud API** | 📄 Documentado | Blueprint | Adicionar como fallback |
| **Inngest** | ✅ Configurado | `docker-compose.ultimate.yml:8288` | Implementar workers |
| **Cognitive Mesh 11** | ✅ Implementado | `shared/sofia/core/` | Manter e estender |

### 7.2 Módulos Compartilhados Propostos

| Módulo | Reusado por | Economia |
|--------|-------------|----------|
| `@magicsaas/core` | Todas pétalas | Base obrigatória |
| `@magicsaas/whatsapp-gateway` | Todas | ~4K linhas |
| `@magicsaas/ar-viewer` | Fashion, Retail, Real Estate | ~2K linhas |
| `@magicsaas/vr-tours` | Real Estate, Hospitality | ~2K linhas |
| `@magicsaas/scheduler` | Healthcare, Fitness, Restaurant, Events | ~3K linhas |
| `@magicsaas/payments` | Todas | ~5K linhas |
| `@magicsaas/notifications` | Todas | ~2K linhas |
| `@magicsaas/analytics` | Todas | ~3K linhas |

### 7.3 MedicSaaS Final Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    petalas/medic-saas                                   │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Frontend: Next.js 15 + shadcn/ui + TailwindCSS                   │ │
│  │  • Portal do Paciente (agendamento, resultados, perfil)          │ │
│  │  • Admin Dashboard (agenda, pacientes, financeiro)               │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  Backend: Directus + Inngest Workers                             │ │
│  │  • 40+ Inngest functions (reminder, noshow, nurturing, billing)  │ │
│  │  • WhatsApp via @magicsaas/whatsapp-gateway                      │ │
│  └───────────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────────────┤
│                    packages/ (SHARED)                                   │
│  @magicsaas/core │ whatsapp-gateway │ scheduler │ payments │ notifs   │
├─────────────────────────────────────────────────────────────────────────┤
│                    shared/sofia/                                        │
│  CognitiveMeshIntegration │ SofiaEngine │ IntentClassifier             │
├─────────────────────────────────────────────────────────────────────────┤
│                    Infrastructure                                       │
│  PostgreSQL 17+pgVector │ Redis 8 │ Directus 11 │ Inngest │ Evolution │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Desenvolvido por Arquiteto de Software Sênior (System-11)**  
**Software Lotus • 2025-12-12**
