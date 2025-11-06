# 🚀 MagicSaaS System-∞ - Operational Runbook

**Version:** 3.1.0
**Last Updated:** 2025-11-05
**Audience:** DevOps, SRE, Production Support

---

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Deployment](#deployment)
4. [Monitoring](#monitoring)
5. [Troubleshooting](#troubleshooting)
6. [Incident Response](#incident-response)
7. [Maintenance](#maintenance)
8. [Scaling](#scaling)
9. [Backup & Recovery](#backup--recovery)
10. [Security](#security)

---

## 1. System Overview

### Components

| Component | Technology | Port | Purpose |
|-----------|------------|------|---------|
| Sofia AI | Node.js 22 + TypeScript | 3003 | AI Brain - Intention processing |
| API Backend | Express + Prisma | 3001 | REST API |
| Database | PostgreSQL 17 + pgVector + TimescaleDB | 5432 | Primary datastore |
| Cache | Redis 7 | 6379 | Session + caching |
| CMS | Directus | 8055 | Content management |
| Metrics | Prometheus | 9090 | Metrics collection |
| Dashboards | Grafana | 3002 | Visualization |
| Tracing | Jaeger | 14268 | Distributed tracing |
| Workflows | Inngest | 8288 | Serverless workflows |

### Service Dependencies

```
Sofia AI → PostgreSQL (read/write)
       → Redis (caching)
       → Directus (API)
       → Anthropic Claude (API)

API → PostgreSQL (read/write)
   → Redis (sessions)
   → Sofia AI (internal)

Directus → PostgreSQL (read/write)
        → Redis (cache)
```

---

## 2. Architecture

### High-Level Architecture

```
Internet
    ↓
NGINX Ingress (TLS/SSL)
    ↓
Kubernetes Service (ClusterIP)
    ↓
[Pod 1] [Pod 2] [Pod 3] ← HPA (3-10 replicas)
    ↓
PostgreSQL (Primary-Replica)
Redis (Sentinel)
```

### Multi-Tenancy Model

- **Row-Level Security (RLS)** enforced at database level
- Tenant context set via `set_current_tenant(tenant_id)`
- All queries automatically filtered by tenant_id

---

## 3. Deployment

### Prerequisites

```bash
# Check cluster access
kubectl cluster-info

# Verify namespaces
kubectl get ns magicsaas-staging
kubectl get ns magicsaas-production

# Check secrets exist
kubectl get secrets -n magicsaas-staging
```

### Standard Deployment

```bash
# 1. Pull latest code
git pull origin main

# 2. Build Docker image
docker build -t magicsaas/sofia-ai:v3.1.0 -f backend/sofia-ai/Dockerfile .

# 3. Push to registry
docker push ghcr.io/netbarros/magicsaas-sofia-ai:v3.1.0

# 4. Update image in deployment
kubectl set image deployment/sofia-ai \
  sofia-ai=ghcr.io/netbarros/magicsaas-sofia-ai:v3.1.0 \
  -n magicsaas-staging

# 5. Monitor rollout
kubectl rollout status deployment/sofia-ai -n magicsaas-staging

# 6. Verify pods are running
kubectl get pods -n magicsaas-staging -l app=sofia-ai
```

### Database Migrations

```bash
# Connect to migration pod
kubectl run -it --rm migration \
  --image=ghcr.io/netbarros/magicsaas-sofia-ai:latest \
  --env="DATABASE_URL=$DATABASE_URL" \
  --restart=Never \
  -n magicsaas-staging \
  -- npx prisma migrate deploy

# Verify migrations
kubectl logs migration -n magicsaas-staging
```

### Rollback

```bash
# Rollback to previous version
kubectl rollout undo deployment/sofia-ai -n magicsaas-staging

# Rollback to specific revision
kubectl rollout undo deployment/sofia-ai \
  --to-revision=5 \
  -n magicsaas-staging

# Check rollout history
kubectl rollout history deployment/sofia-ai -n magicsaas-staging
```

---

## 4. Monitoring

### Health Checks

```bash
# API health
curl https://staging.softwarelotus.com.br/health

# Sofia AI health
kubectl exec -it sofia-ai-xxx -n magicsaas-staging -- \
  curl http://localhost:3003/health

# Database health
kubectl exec -it postgres-0 -n magicsaas-staging -- \
  pg_isready -h localhost
```

### Key Metrics

**Application:**
- `http_requests_total` - Total HTTP requests
- `http_request_duration_ms` - Request latency
- `intentions_processed_total` - Intentions processed by Sofia AI
- `intentions_failed_total` - Failed intentions

**Database:**
- `pg_stat_database_numbackends` - Active connections
- `pg_stat_database_xact_commit` - Transaction rate
- `pg_stat_database_blks_hit / blks_read` - Cache hit ratio

**Redis:**
- `redis_memory_used_bytes` - Memory usage
- `redis_keyspace_hits_total / misses_total` - Cache hit rate
- `redis_connected_clients` - Active clients

### Grafana Dashboards

Access: `https://grafana.softwarelotus.com.br`

1. **Sofia AI Performance** - Request rate, latency, success rate
2. **Database Health** - Connections, transactions, cache hits
3. **Redis Performance** - Commands/s, memory, hit rate
4. **API Overview** - p50/p95/p99 latencies, error rate
5. **Business Metrics** - SaaS generated, revenue, active users

### Alerts

Prometheus alerts configured in `infrastructure/monitoring/prometheus/alerts.yml`

**Critical Alerts** (PagerDuty):
- ServiceDown
- HighMemoryUsage (>90%)
- DatabaseReplicationLag (>30s)
- RedisDown

**Warning Alerts** (Slack):
- HighErrorRate (>5%)
- HighLatency (p95 >1s)
- DatabaseConnectionsHigh (>80%)
- RedisCacheHitRateLow (<80%)

---

## 5. Troubleshooting

### Scenario 1: High Error Rate

**Symptoms:** Error rate >5% for 5+ minutes

**Investigation:**
```bash
# Check error logs
kubectl logs -n magicsaas-staging -l app=sofia-ai --tail=100 | grep ERROR

# Check recent deployments
kubectl rollout history deployment/sofia-ai -n magicsaas-staging

# Check pod status
kubectl get pods -n magicsaas-staging -l app=sofia-ai

# Describe failing pods
kubectl describe pod sofia-ai-xxx -n magicsaas-staging
```

**Resolution:**
1. If recent deployment → Rollback
2. If database issue → Scale up database
3. If external API issue → Enable circuit breaker
4. If memory leak → Restart pods

### Scenario 2: High Latency

**Symptoms:** p95 latency >1000ms

**Investigation:**
```bash
# Check CPU/Memory usage
kubectl top pods -n magicsaas-staging -l app=sofia-ai

# Check database slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

# Check Redis latency
redis-cli --latency-history
```

**Resolution:**
1. Scale horizontally (increase replicas)
2. Optimize slow queries (add indexes)
3. Increase cache TTL
4. Enable CDN for static assets

### Scenario 3: Database Connection Pool Exhausted

**Symptoms:** "too many connections" errors

**Investigation:**
```bash
# Check active connections
SELECT count(*) FROM pg_stat_activity;

# Check connections by application
SELECT application_name, count(*)
FROM pg_stat_activity
GROUP BY application_name;

# Check long-running queries
SELECT pid, now() - pg_stat_activity.query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

**Resolution:**
1. Terminate idle connections
2. Increase max_connections
3. Optimize connection pooling
4. Kill long-running queries

### Scenario 4: Redis Memory Full

**Symptoms:** Redis evicting keys, OOM errors

**Investigation:**
```bash
# Check memory usage
redis-cli INFO memory

# Check keyspace
redis-cli INFO keyspace

# Find largest keys
redis-cli --bigkeys
```

**Resolution:**
1. Increase Redis memory limit
2. Implement LRU eviction policy
3. Reduce cache TTL
4. Clear unused keys

---

## 6. Incident Response

### Severity Levels

| Level | Response Time | Example |
|-------|--------------|---------|
| P0 - Critical | 15 min | Complete outage, data loss |
| P1 - High | 1 hour | Partial outage, degraded performance |
| P2 - Medium | 4 hours | Feature broken, workaround available |
| P3 - Low | 1 day | Minor bug, cosmetic issue |

### Incident Response Process

1. **Detect** - Alert received via PagerDuty/Slack
2. **Assess** - Determine severity and impact
3. **Notify** - Escalate to on-call engineer
4. **Mitigate** - Immediate action to restore service
5. **Resolve** - Fix root cause
6. **Document** - Post-mortem report

### Escalation Path

1. On-call Engineer
2. Senior SRE
3. Engineering Manager
4. CTO

---

## 7. Maintenance

### Routine Maintenance Windows

**Weekly:**
- Sunday 02:00-04:00 UTC - Database backups
- Saturday 03:00-05:00 UTC - OS patches

**Monthly:**
- First Sunday 01:00-05:00 UTC - Major updates

### Pre-Maintenance Checklist

```bash
✅ Announce maintenance window (72h notice)
✅ Verify backups are recent (<24h)
✅ Test rollback procedure in staging
✅ Prepare communication templates
✅ Brief on-call team
✅ Scale up monitoring retention
```

### Post-Maintenance Checklist

```bash
✅ Verify all services healthy
✅ Run smoke tests
✅ Check error rates (should be <baseline)
✅ Monitor latency (should be <baseline)
✅ Send completion notification
✅ Document any issues encountered
```

---

## 8. Scaling

### Horizontal Scaling (HPA)

Sofia AI auto-scales based on CPU/Memory:
- Min: 3 replicas
- Max: 10 replicas
- Target CPU: 70%
- Target Memory: 80%

**Manual scaling:**
```bash
# Scale to specific replica count
kubectl scale deployment/sofia-ai --replicas=5 -n magicsaas-staging

# Check HPA status
kubectl get hpa -n magicsaas-staging
```

### Vertical Scaling

**Increase resources:**
```bash
# Edit deployment
kubectl edit deployment/sofia-ai -n magicsaas-staging

# Update resources
spec:
  template:
    spec:
      containers:
      - name: sofia-ai
        resources:
          requests:
            cpu: 1000m     # was 500m
            memory: 1Gi    # was 512Mi
          limits:
            cpu: 4000m     # was 2000m
            memory: 4Gi    # was 2Gi
```

### Database Scaling

**Read replicas:**
```bash
# Add read replica
kubectl scale statefulset/postgres --replicas=3 -n magicsaas-staging

# Configure read-only endpoint
DATABASE_READ_URL=postgresql://replica1:5432/magicsaas
```

---

## 9. Backup & Recovery

### Automated Backups

Daily PostgreSQL backups at 02:00 UTC:

```bash
# Run manual backup
./infrastructure/scripts/backup-postgres.sh

# Verify backup
ls -lh /backups/postgres/

# Check latest backup
cat /backups/postgres/latest.txt
```

### Recovery Procedures

**RTO (Recovery Time Objective):** 4 hours
**RPO (Recovery Point Objective):** 1 hour

**Restore from backup:**
```bash
# 1. Download latest backup from S3
aws s3 cp s3://magicsaas-backups/magicsaas_backup_20251105.sql.gz .

# 2. Stop applications
kubectl scale deployment/sofia-ai --replicas=0 -n magicsaas-staging

# 3. Drop and recreate database
dropdb magicsaas
createdb magicsaas

# 4. Restore
gunzip < magicsaas_backup_20251105.sql.gz | psql magicsaas

# 5. Restart applications
kubectl scale deployment/sofia-ai --replicas=3 -n magicsaas-staging
```

### Disaster Recovery

**Cross-region failover:**
1. DNS failover to DR region
2. Promote replica to primary
3. Update application config
4. Verify data integrity

---

## 10. Security

### Access Control

**Production access requires:**
- MFA enabled
- VPN connection
- Bastion host SSH key
- kubectl RBAC role

### Secret Management

```bash
# Rotate secrets
kubectl create secret generic magicsaas-secrets \
  --from-literal=anthropic-api-key=$NEW_KEY \
  --from-literal=database-url=$NEW_DB_URL \
  --dry-run=client -o yaml | kubectl apply -f -

# Restart pods to pick up new secrets
kubectl rollout restart deployment/sofia-ai -n magicsaas-staging
```

### Security Scanning

```bash
# Scan container images
trivy image ghcr.io/netbarros/magicsaas-sofia-ai:latest

# Scan dependencies
pnpm audit

# Check for secrets in code
trufflehog git file://. --since-commit HEAD~10
```

---

## 📞 Contacts

**On-call:** PagerDuty rotation
**Slack:** #magicsaas-ops
**Email:** ops@softwarelotus.com.br
**Documentation:** https://docs.softwarelotus.com.br
