# 🚀 Quick Start - Instalação em 5 Minutos

> **Do zero ao primeiro SaaS gerado em menos de 10 minutos**

---

## 📋 Pré-requisitos

### **Hardware Mínimo**

- **CPU**: 4 cores
- **RAM**: 8 GB
- **Disco**: 20 GB livres

### **Software Necessário**

- ✅ **Docker** + **Docker Compose** (v2.0+)
- ✅ **Node.js 22+** (opcional, para desenvolvimento)
- ✅ **Git**

### **API Keys**

- ✅ **Anthropic API Key** (obrigatório) → https://console.anthropic.com

---

## ⚡ Instalação Rápida

### **Windows (PowerShell)**

```powershell
# 1. Clone o repositório
git clone https://github.com/netbarros/Lotus.git
cd Lotus

# 2. Execute o installer
.\Install-MagicSaaS-ULTIMATE.ps1

# 3. Forneça sua Anthropic API Key quando solicitado
# 4. Aguarde 5-10 minutos
# 5. Pronto! 🎉
```

### **Linux / macOS (Bash)**

```bash
# 1. Clone o repositório
git clone https://github.com/netbarros/Lotus.git
cd Lotus

# 2. Execute o installer
bash install-magicsaas-ultimate.sh

# 3. Forneça sua Anthropic API Key quando solicitado
# 4. Aguarde 5-10 minutos
# 5. Pronto! 🎉
```

---

## 🔍 O Que o Installer Faz?

1. ✅ **Verifica dependências** (Docker, Docker Compose, Node.js)
2. ✅ **Coleta configurações** (API keys, senhas)
3. ✅ **Gera arquivo .env** com 60+ variáveis
4. ✅ **Cria estrutura de diretórios**
5. ✅ **Sobe containers Docker**:
   - PostgreSQL 17 + pgVector
   - Redis 8
   - Directus CMS
   - Sofia AI v3.0
   - Prometheus + Grafana
   - Jaeger (tracing)
   - Inngest (workflows)
   - Mailhog (emails)
6. ✅ **Aguarda health checks** de todos os serviços
7. ✅ **Exibe URLs de acesso**

---

## 🎯 URLs Após Instalação

Após a instalação bem-sucedida, acesse:

| Serviço           | URL                    | Credenciais                           |
| ----------------- | ---------------------- | ------------------------------------- |
| **Sofia AI v3.0** | http://localhost:3003  | -                                     |
| **Directus CMS**  | http://localhost:8055  | admin@softwarelotus.com.br / [gerada] |
| **Grafana**       | http://localhost:3002  | admin / admin                         |
| **Prometheus**    | http://localhost:9090  | -                                     |
| **Jaeger**        | http://localhost:16686 | -                                     |
| **Mailhog**       | http://localhost:8025  | -                                     |

> **⚠️ IMPORTANTE**: As credenciais do Directus são exibidas no final da
> instalação. **Guarde-as em local seguro!**

---

## ✅ Verificação da Instalação

### **1. Verificar Status dos Containers**

```bash
docker ps
```

Você deve ver **8 containers** rodando:

- magicsaas-postgres
- magicsaas-redis
- magicsaas-directus
- magicsaas-sofia-ai
- magicsaas-prometheus
- magicsaas-grafana
- magicsaas-jaeger
- magicsaas-inngest
- magicsaas-mailhog

### **2. Testar Sofia AI**

```bash
curl http://localhost:3003/health
```

Resposta esperada:

```json
{
  "status": "healthy",
  "version": "3.0.0",
  "uptime": 123,
  "components": {
    "intentionEngine": "active",
    "uxValidator": "active",
    "seoOptimizer": "active",
    "marketplace": "active",
    "directus": "connected",
    "redis": "connected"
  }
}
```

### **3. Verificar Métricas**

```bash
curl http://localhost:3003/metrics
```

Deve retornar métricas do Prometheus.

---

## 🎨 Seu Primeiro SaaS em 2 Minutos

### **Via API (cURL)**

```bash
curl -X POST http://localhost:3003/api/intention/generate \
  -H "Content-Type: application/json" \
  -d '{
    "intention": "Criar um SaaS de agendamento para clínicas médicas",
    "vertical": "healthcare",
    "features": [
      "Calendário de consultas",
      "Cadastro de pacientes",
      "Prontuário eletrônico",
      "Lembretes automáticos por email"
    ],
    "target": {
      "users": 500,
      "tenants": 20
    }
  }'
```

### **Resposta** (resumida)

```json
{
  "success": true,
  "projectId": "prj_abc123",
  "architecture": {
    "type": "multi-tenant-saas",
    "databases": ["postgresql", "redis"],
    "services": ["api", "worker", "websocket"]
  },
  "schema": {
    "tables": [
      "tenants",
      "users",
      "patients",
      "appointments",
      "medical_records"
    ]
  },
  "apis": [
    { "method": "POST", "path": "/api/appointments", "auth": true },
    { "method": "GET", "path": "/api/patients/:id", "auth": true },
    { "method": "POST", "path": "/api/medical-records", "auth": true }
  ],
  "components": [
    "CalendarView.tsx",
    "PatientForm.tsx",
    "MedicalRecordEditor.tsx",
    "AppointmentNotifications.tsx"
  ],
  "documentation": "# Medical Clinic SaaS\n\n..."
}
```

---

## 🔧 Comandos Úteis

### **Parar todos os serviços**

```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml down
```

### **Reiniciar serviços**

```bash
docker-compose -f docker-compose.dev.yml restart
```

### **Ver logs de um serviço**

```bash
# Sofia AI
docker logs -f magicsaas-sofia-ai

# Directus
docker logs -f magicsaas-directus

# PostgreSQL
docker logs -f magicsaas-postgres
```

### **Acessar console do PostgreSQL**

```bash
docker exec -it magicsaas-postgres psql -U postgres -d magicsaas
```

### **Acessar Redis CLI**

```bash
docker exec -it magicsaas-redis redis-cli
```

---

## 🐛 Troubleshooting Rápido

### **Problema: "Port 3003 already in use"**

```bash
# Verificar o que está usando a porta
netstat -ano | findstr :3003  # Windows
lsof -i :3003                 # Linux/macOS

# Matar o processo ou mudar a porta no .env
PORT=3004
```

### **Problema: "Directus não inicia"**

```bash
# Verificar logs
docker logs magicsaas-directus

# Geralmente é problema de permissões ou PostgreSQL não iniciou
# Aguarde 30 segundos e tente novamente
docker-compose restart directus
```

### **Problema: "Sofia AI retorna 503"**

```bash
# Verificar se Directus e Redis estão rodando
docker ps | grep -E "directus|redis"

# Verificar logs do Sofia AI
docker logs -f magicsaas-sofia-ai

# Reiniciar Sofia AI
docker-compose restart sofia-ai
```

### **Problema: "ANTHROPIC_API_KEY inválida"**

```bash
# Editar .env e atualizar a key
nano .env
# ANTHROPIC_API_KEY=sk-ant-sua-key-aqui

# Reiniciar Sofia AI
docker-compose restart sofia-ai
```

---

## 📚 Próximos Passos

Agora que você tem o MagicSaaS instalado:

1. ✅ [Explore o Directus CMS](http://localhost:8055)
2. ✅ [Veja as métricas no Grafana](http://localhost:3002)
3. ✅ [Leia a Documentação Completa](../00-INDEX.md)
4. ✅ [Entenda a Arquitetura](../02-architecture/system-architecture.md)
5. ✅ [Comece a Desenvolver](../04-development/getting-started.md)
6. ✅ [Explore a API do Sofia AI](../05-api-reference/sofia-ai-api.md)

---

## 🆘 Precisa de Ajuda?

- **Issues**: https://github.com/netbarros/Lotus/issues
- **Discussions**: https://github.com/netbarros/Lotus/discussions
- **Email**: support@softwarelotus.com.br
- **Guia Completo**: [Installation Guide](./windows.md)

---

**[← Voltar ao Índice](../00-INDEX.md)** |
**[Próximo: Windows Installation →](./windows.md)**
