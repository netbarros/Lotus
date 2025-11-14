# 🚀 MagicSaaS System-∞ - Complete Installation Guide

**Version:** ∞.2026.Q1 (Sofia AI v4.0) **Last Updated:** November 13, 2025
**Estimated Installation Time:** 10-15 minutes

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Method 1: Ultimate Installer (Recommended)](#method-1-ultimate-installer-recommended)
4. [Method 2: Manual Installation](#method-2-manual-installation)
5. [Database Initialization](#database-initialization)
6. [Verification](#verification)
7. [Access Points](#access-points)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## ✅ Prerequisites

Before installing MagicSaaS System-∞, ensure you have the following installed:

### Required

- **Docker** 27+ & Docker Compose
- **Git** 2.40+
- **Anthropic API Key** (for Sofia AI v4.0)
  - Sign up at: https://console.anthropic.com
  - Get your API key from dashboard

### Optional (for development)

- **Node.js** 22+
- **pnpm** 9+
- **PostgreSQL** 17+ (if running database locally)
- **Redis** 8+ (if running Redis locally)

### System Requirements

- **CPU:** 4+ cores recommended
- **RAM:** 8GB minimum, 16GB recommended
- **Disk:** 20GB free space minimum
- **OS:** Linux, macOS, or Windows (with WSL2)

---

## 🎯 Installation Methods

MagicSaaS offers two installation methods:

1. **Ultimate Installer** (Recommended) - Fully automated, one-command setup
2. **Manual Installation** - Step-by-step for customization

---

## 📦 Method 1: Ultimate Installer (Recommended)

The **fastest and easiest** way to install MagicSaaS with Sofia AI v4.0.

### Linux / macOS

```bash
# 1. Clone the repository
git clone https://github.com/netbarros/Lotus.git
cd Lotus

# 2. Make installer executable
chmod +x install-magicsaas-ultimate-v4.sh

# 3. Run installer
./install-magicsaas-ultimate-v4.sh
```

The installer will:

1. ✅ Check all dependencies (Docker, Node.js, etc.)
2. ✅ Prompt for configuration (API keys, admin email)
3. ✅ Generate secure passwords
4. ✅ Create `.env` file
5. ✅ Start Docker services (18+ containers)
6. ✅ Initialize database (7 schemas + 3 seeds)
7. ✅ Verify installation
8. ✅ Display access points and credentials

**Installation time:** 10-15 minutes

### Windows (PowerShell)

```powershell
# 1. Clone the repository
git clone https://github.com/netbarros/Lotus.git
cd Lotus

# 2. Run installer as Administrator
.\Install-MagicSaaS-ULTIMATE.ps1

# Or with parameters:
.\Install-MagicSaaS-ULTIMATE.ps1 `
  -Mode Full `
  -AnthropicApiKey "sk-ant-your-key" `
  -DirectusAdminEmail "admin@yourcompany.com" `
  -AutoApprove
```

**Installation time:** 10-15 minutes

---

## 🔧 Method 2: Manual Installation

For users who want more control over the installation process.

### Step 1: Clone Repository

```bash
git clone https://github.com/netbarros/Lotus.git
cd Lotus
```

### Step 2: Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit environment variables
nano .env  # or use your preferred editor
```

**Required environment variables:**

```bash
# Sofia AI v4.0 - THE BRAIN
ANTHROPIC_API_KEY=sk-ant-your-key-here

# Directus Admin
DIRECTUS_ADMIN_EMAIL=admin@yourcompany.com
DIRECTUS_ADMIN_PASSWORD=YourSecurePassword123!

# Database
POSTGRES_PASSWORD=SecurePostgresPassword123!

# JWT Secret
JWT_SECRET=YourSecureJWTSecret123!

# Directus Secret
DIRECTUS_SECRET=YourSecureDirectusSecret123!
```

**All other variables have sensible defaults.**

### Step 3: Start Services

```bash
# Start all services with Docker Compose
docker compose -f infrastructure/docker/docker-compose.dev.yml up -d

# View logs
docker compose -f infrastructure/docker/docker-compose.dev.yml logs -f
```

This starts **18+ services**:

- PostgreSQL 17 with pgVector
- Redis 8
- Directus 11+
- Sofia AI v4.0
- LangChain service
- Langfuse
- Qdrant
- MinIO (S3-compatible storage)
- Evolution API (WhatsApp)
- Chatwoot (CRM)
- Prometheus (metrics)
- Grafana (monitoring)
- Jaeger (tracing)
- Inngest (workflows)
- MailHog (email testing)
- Additional support services

### Step 4: Wait for Services

```bash
# Wait for PostgreSQL to be ready (2-3 minutes)
docker logs -f magicsaas-db

# You should see:
# PostgreSQL init process complete; ready for start up.
```

### Step 5: Initialize Database

See [Database Initialization](#database-initialization) section below.

---

## 💾 Database Initialization

The database initialization creates **all tables, loads demo data, and
configures Sofia AI v4.0**.

### Automated Initialization

```bash
# Copy database files to container
docker cp database magicsaas-db:/database

# Run initialization script
docker exec magicsaas-db bash /database/init-database.sh
```

This executes:

**📊 7 Database Schemas (4,500+ lines):**

1. `00-extensions.sql` - PostgreSQL Extensions (uuid, pgVector, TimescaleDB)
2. `01-core-tables.sql` - Core Tables (tenants, users, plans, billing)
3. `02-billing-credits.sql` - Lotus Credits & Billing System
4. `03-sofia-ai-v4.sql` - Sofia AI v4.0 Tables
5. `04-healthcare-medicas.sql` - Healthcare/Médicas Complete Schema
6. `05-sofia-universal-petalas.sql` - Sofia AI Universal Integration
7. `06-all-petalas-tables.sql` - Universal Tables (ALL 13 Pétalas)

**🌱 3 Demo Data Seeds (1,800+ lines):**

1. `00-initial-data.sql` - Initial Data (plans, tenants, users, roles)
2. `01-healthcare-demo-data.sql` - Healthcare Demo Data
3. `02-all-petalas-demo-data.sql` - Demo Data for ALL 13 Pétalas

**Results:**

- ✅ 50+ tables created
- ✅ 13 Pétalas registered
- ✅ 50+ customers with demo data
- ✅ 100+ products/services
- ✅ TimescaleDB hypertables configured
- ✅ Row Level Security (RLS) policies applied
- ✅ pgVector extension enabled

**Time:** 2-3 minutes

---

## ✔️ Verification

Verify your installation is working correctly:

### Check Services

```bash
# Check all services are running
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# Should show 18+ services in "running" state
```

### Check PostgreSQL

```bash
# Connect to database
docker exec -it magicsaas-db psql -U postgres -d magicsaas

# Count tables
SELECT COUNT(*) FROM information_schema.tables
WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
-- Should return 50+

# Check pétalas
SELECT petala_code, petala_name, status FROM petalas_registry;
-- Should show 13 pétalas

# Exit
\q
```

### Check Redis

```bash
# Test Redis
docker exec magicsaas-redis redis-cli ping
# Should return: PONG
```

### Check Directus

```bash
# Check Directus health
curl http://localhost:8055/server/health

# Should return: {"status":"ok"}
```

### Check Sofia AI v4.0

```bash
# Check Sofia AI health
curl http://localhost:3003/health

# Should return: {"status":"healthy","version":"4.0.0"}
```

---

## 🌐 Access Points

After successful installation, access these services:

| Service              | URL                           | Credentials     |
| -------------------- | ----------------------------- | --------------- |
| **Directus CMS**     | http://localhost:8055         | See `.env` file |
| **Sofia AI Health**  | http://localhost:3003/health  | N/A             |
| **Sofia AI Metrics** | http://localhost:3003/metrics | N/A             |
| **Grafana**          | http://localhost:3002         | admin / admin   |
| **Prometheus**       | http://localhost:9090         | N/A             |
| **Jaeger**           | http://localhost:16686        | N/A             |
| **MailHog**          | http://localhost:8025         | N/A             |
| **MinIO**            | http://localhost:9001         | See `.env` file |

### Default Credentials

**Directus Admin:**

- Email: Set in `.env` (DIRECTUS_ADMIN_EMAIL)
- Password: Set in `.env` (DIRECTUS_ADMIN_PASSWORD)

**⚠️ IMPORTANT:** Change default passwords immediately in production!

---

## 🔍 Troubleshooting

### Services Won't Start

```bash
# Check Docker is running
docker info

# Check for port conflicts
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# View service logs
docker logs magicsaas-db
docker logs magicsaas-redis
docker logs magicsaas-sofia-ai
```

### Database Connection Issues

```bash
# Check PostgreSQL is ready
docker exec magicsaas-db pg_isready -U postgres

# Check database exists
docker exec magicsaas-db psql -U postgres -l | grep magicsaas

# View PostgreSQL logs
docker logs magicsaas-db --tail 100
```

### Sofia AI Not Responding

```bash
# Check Sofia AI logs
docker logs magicsaas-sofia-ai --tail 100

# Verify Anthropic API key
docker exec magicsaas-sofia-ai env | grep ANTHROPIC

# Restart Sofia AI service
docker restart magicsaas-sofia-ai
```

### Disk Space Issues

```bash
# Check Docker disk usage
docker system df

# Clean up unused Docker resources
docker system prune -a

# Remove old volumes (⚠️ THIS DELETES DATA!)
docker volume prune
```

### Memory Issues

```bash
# Check Docker memory usage
docker stats

# Increase Docker memory limit in Docker Desktop settings
# Recommended: 8GB minimum, 16GB ideal
```

---

## 🎯 Next Steps

After successful installation:

### 1. Explore Directus

- Navigate to http://localhost:8055
- Login with your admin credentials
- Explore the 13 Pétalas collections
- Review demo data

### 2. Test Sofia AI

```bash
# Health check
curl http://localhost:3003/health

# Get metrics
curl http://localhost:3003/metrics

# View Sofia AI logs
docker logs -f magicsaas-sofia-ai
```

### 3. Review Documentation

- **[README.md](README.md)** - System overview
- **[SOFIA_AI_V4_COMPLETE.md](SOFIA_AI_V4_COMPLETE.md)** - Sofia AI
  documentation
- **[PETALAS.md](PETALAS.md)** - Pétalas documentation
- **[CERTIFICATION.md](CERTIFICATION.md)** - Official certification

### 4. Configure for Production

- Update all default passwords
- Configure SSL/TLS certificates
- Set up backup strategy
- Configure monitoring alerts
- Review security settings

### 5. Develop Your Application

- Choose a pétala to start with
- Customize for your needs
- Use Sofia AI to generate code
- Deploy to production

---

## 📚 Additional Resources

### Documentation

- **Main README:** [README.md](README.md)
- **Architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)
- **Sofia AI v4.0:** [SOFIA_AI_V4_COMPLETE.md](SOFIA_AI_V4_COMPLETE.md)
- **Pétalas:** [PETALAS.md](PETALAS.md)
- **Certification:** [CERTIFICATION.md](CERTIFICATION.md)

### Useful Commands

```bash
# View all services
docker compose -f infrastructure/docker/docker-compose.dev.yml ps

# Stop all services
docker compose -f infrastructure/docker/docker-compose.dev.yml down

# Restart all services
docker compose -f infrastructure/docker/docker-compose.dev.yml restart

# View logs for specific service
docker logs -f <service-name>

# Execute command in container
docker exec -it <container-name> <command>

# Backup database
docker exec magicsaas-db pg_dump -U postgres magicsaas > backup.sql

# Restore database
docker exec -i magicsaas-db psql -U postgres magicsaas < backup.sql
```

---

## 🤝 Support

Need help? We're here for you:

- **Email:** support@softwarelotus.com.br
- **Documentation:** https://docs.softwarelotus.com.br
- **Issues:** https://github.com/netbarros/Lotus/issues
- **Community:** https://community.softwarelotus.com.br

---

<div align="center">

**🚀 MagicSaaS System-∞ - Production Ready**

**🧠 Sofia AI v4.0 - The Brain - 100% Operational**

**Built with ❤️ by Software Lotus**

</div>
