# ✅ Production Deployment Checklist

> **Comprehensive checklist antes de ir para produção**

---

## 🎯 Overview

Use este checklist para garantir que seu deployment está **production-ready**.

**Estimativa**: 2-3 dias para completar todos os itens.

---

## 🔐 Security

### **Secrets & Keys**
- [ ] Todas as secrets em secret manager (não em .env)
- [ ] API keys rotacionadas (dev → prod)
- [ ] Passwords fortes (32+ chars)
- [ ] JWT secrets únicos e seguros (64+ chars)
- [ ] Encryption keys geradas corretamente
- [ ] Database credentials seguros
- [ ] ANTHROPIC_API_KEY de produção

### **HTTPS & SSL**
- [ ] Certificado SSL válido
- [ ] HTTPS forçado (redirect HTTP → HTTPS)
- [ ] HSTS headers configurados
- [ ] SSL Labs score A+
- [ ] Certificate auto-renewal configurado

### **Authentication & Authorization**
- [ ] JWT expiration configurado (não infinito)
- [ ] Refresh token strategy implementada
- [ ] Rate limiting habilitado
- [ ] CORS configurado (apenas origins permitidos)
- [ ] CSRF protection habilitado
- [ ] XSS prevention headers

### **Security Headers**
- [ ] Helmet.js configurado
- [ ] Content-Security-Policy
- [ ] X-Frame-Options
- [ ] X-Content-Type-Options
- [ ] Referrer-Policy
- [ ] Permissions-Policy

### **Database Security**
- [ ] Row-level security (RLS) habilitado
- [ ] SQL injection prevention verificado
- [ ] Database connection encrypted
- [ ] Backup encryption habilitado
- [ ] Access logs habilitados

### **Vulnerability Scanning**
- [ ] npm audit rodado (0 vulnerabilities)
- [ ] Dependências atualizadas
- [ ] OWASP Top 10 checklist completo
- [ ] Penetration testing feito
- [ ] Security audit realizado

---

## 🗄️ Database

### **Performance**
- [ ] Indexes criados em colunas frequentemente consultadas
- [ ] Queries lentas otimizadas (< 50ms)
- [ ] Connection pooling configurado
- [ ] Query timeout configurado
- [ ] EXPLAIN ANALYZE rodado nas queries críticas

### **Backup & Recovery**
- [ ] Backup automático configurado (diário)
- [ ] Backup off-site configurado
- [ ] Recovery procedure testado
- [ ] Point-in-time recovery configurado
- [ ] Backup retention policy definida (30+ dias)
- [ ] Backup encryption habilitado

### **Migrations**
- [ ] Todas migrations testadas
- [ ] Rollback procedure documentado
- [ ] Zero-downtime migrations planejadas
- [ ] Migration logs revisados

### **Monitoring**
- [ ] Slow query log habilitado
- [ ] Connection pool monitoring
- [ ] Disk space alerts configurados
- [ ] Replication lag alerts (se aplicável)

---

## ⚡ Performance

### **Backend**
- [ ] Response time < 100ms p95
- [ ] Response time < 500ms p99
- [ ] No N+1 queries
- [ ] Caching strategy implementada
- [ ] Database connection pooling
- [ ] Gzip compression habilitado
- [ ] CDN configurado

### **Frontend**
- [ ] Lighthouse score 90+
- [ ] Core Web Vitals OK:
  - [ ] LCP < 2.5s
  - [ ] FID < 100ms
  - [ ] CLS < 0.1
- [ ] Code splitting implementado
- [ ] Lazy loading de imagens
- [ ] Font optimization
- [ ] Bundle size < 1MB

### **Load Testing**
- [ ] Load testing executado (k6, Artillery)
- [ ] Stress testing executado
- [ ] Spike testing executado
- [ ] Capacidade conhecida (req/sec)
- [ ] Bottlenecks identificados e resolvidos

---

## 📊 Monitoring & Observability

### **Metrics**
- [ ] Prometheus configurado
- [ ] Grafana dashboards criados
- [ ] Business metrics rastreados
- [ ] Custom metrics adicionados
- [ ] SLIs/SLOs definidos

### **Logging**
- [ ] Structured logging implementado (JSON)
- [ ] Log levels apropriados
- [ ] Correlation IDs em todos logs
- [ ] Log aggregation configurado
- [ ] Log retention policy definida
- [ ] Sensitive data mascarada em logs

### **Tracing**
- [ ] Jaeger configurado
- [ ] Distributed tracing implementado
- [ ] Trace sampling configurado
- [ ] Spans com contexto apropriado

### **Alerting**
- [ ] Alerts configurados:
  - [ ] High error rate (> 1%)
  - [ ] High latency (> 1s p95)
  - [ ] Low disk space (< 20%)
  - [ ] High CPU (> 80%)
  - [ ] High memory (> 80%)
  - [ ] SSL certificate expiring
  - [ ] Database connection pool exhaustion
- [ ] PagerDuty / on-call rotation configurado
- [ ] Escalation policy definida

### **Health Checks**
- [ ] /health endpoint implementado
- [ ] /ready endpoint implementado
- [ ] Liveness probe configurado (K8s)
- [ ] Readiness probe configurado (K8s)

---

## 🐳 Infrastructure

### **Docker**
- [ ] Multi-stage builds usados
- [ ] Images escaneadas (Trivy, Clair)
- [ ] .dockerignore configurado
- [ ] Non-root user em containers
- [ ] Image size otimizada (< 500MB)
- [ ] Health checks em containers

### **Kubernetes** (se aplicável)
- [ ] Resource limits definidos
- [ ] Resource requests definidos
- [ ] HPA (auto-scaling) configurado
- [ ] PodDisruptionBudget configurado
- [ ] Network policies configuradas
- [ ] Secrets não em ConfigMaps
- [ ] Ingress configurado
- [ ] TLS terminação configurada

### **CI/CD**
- [ ] Pipeline automated (GitHub Actions)
- [ ] Tests rodando em CI
- [ ] Linting rodando em CI
- [ ] Security scanning em CI
- [ ] Docker image build em CI
- [ ] Deploy automático (staging)
- [ ] Deploy manual/aprovado (prod)
- [ ] Rollback procedure definido

---

## 🌐 Networking

### **CDN**
- [ ] CDN configurado (Cloudflare, CloudFront)
- [ ] Static assets no CDN
- [ ] Cache headers apropriados
- [ ] Geo-replication configurada

### **DNS**
- [ ] TTL apropriado (300-3600s)
- [ ] DNSSEC configurado
- [ ] DNS provider com boa uptime
- [ ] Failover DNS configurado

### **Load Balancer**
- [ ] Load balancer configurado
- [ ] Health checks habilitados
- [ ] Session stickiness configurado (se necessário)
- [ ] DDoS protection habilitado

---

## 📱 Application

### **Configuration**
- [ ] NODE_ENV=production
- [ ] Debug mode desabilitado
- [ ] Verbose logging desabilitado
- [ ] Source maps não expostos
- [ ] Error stack traces não expostos

### **Error Handling**
- [ ] Error handling centralizado
- [ ] Errors logados corretamente
- [ ] User-friendly error messages
- [ ] 500 errors capturados (Sentry)
- [ ] Error recovery implementado

### **Rate Limiting**
- [ ] Rate limiting implementado
- [ ] Per-user rate limits
- [ ] Per-IP rate limits
- [ ] Burst limits configurados

### **Data Validation**
- [ ] Input validation em todos endpoints
- [ ] Output sanitization
- [ ] File upload validation (tamanho, tipo)
- [ ] SQL injection prevention
- [ ] XSS prevention

---

## 🧪 Testing

### **Tests**
- [ ] Unit tests > 90% coverage
- [ ] Integration tests escritos
- [ ] E2E tests para fluxos críticos
- [ ] Performance tests executados
- [ ] Security tests executados
- [ ] Accessibility tests executados

### **Manual Testing**
- [ ] Smoke tests executados
- [ ] User acceptance testing (UAT)
- [ ] Cross-browser testing
- [ ] Mobile testing
- [ ] Accessibility testing (WCAG AA)

---

## 📝 Documentation

### **User Documentation**
- [ ] User guide atualizado
- [ ] API documentation atualizada
- [ ] FAQ atualizado
- [ ] Video tutorials (optional)

### **Technical Documentation**
- [ ] Architecture documented
- [ ] Deployment process documented
- [ ] Rollback process documented
- [ ] Monitoring documented
- [ ] On-call runbook criado
- [ ] Disaster recovery plan documentado

### **Legal**
- [ ] Terms of Service
- [ ] Privacy Policy
- [ ] Cookie Policy
- [ ] GDPR/LGPD compliance
- [ ] Data processing agreements

---

## 💼 Business

### **Analytics**
- [ ] Google Analytics configurado
- [ ] Event tracking implementado
- [ ] Conversion tracking
- [ ] Error tracking (Sentry)
- [ ] User behavior analytics

### **Support**
- [ ] Support email configurado
- [ ] Help center criado
- [ ] Status page configurado
- [ ] Feedback mechanism implementado

### **Billing** (se aplicável)
- [ ] Stripe/payment gateway configurado
- [ ] Subscription management
- [ ] Invoice generation
- [ ] Payment webhooks configurados

---

## 🚀 Launch Preparation

### **Pre-Launch** (1 week before)
- [ ] Staging environment = production clone
- [ ] Full system test em staging
- [ ] Load test executado
- [ ] Disaster recovery drill executado
- [ ] Team briefed
- [ ] Support team trained
- [ ] Communication plan pronto

### **Launch Day**
- [ ] Health checks passing
- [ ] Monitoring dashboards abertos
- [ ] On-call engineer disponível
- [ ] Rollback plan pronto
- [ ] Status page atualizado
- [ ] Social media anúncio pronto
- [ ] Email announcement pronto

### **Post-Launch** (first 24h)
- [ ] Monitor errors closely
- [ ] Monitor performance
- [ ] Monitor user feedback
- [ ] Be ready to rollback
- [ ] Log all issues

---

## ✅ Final Checklist

### **Critical** (must have)
- [ ] All security items checked
- [ ] Backups working
- [ ] Monitoring working
- [ ] SSL/HTTPS working
- [ ] Performance acceptable

### **Important** (should have)
- [ ] Load testing done
- [ ] Documentation complete
- [ ] CI/CD working
- [ ] Rollback tested

### **Nice to have**
- [ ] Video tutorials
- [ ] Advanced analytics
- [ ] A/B testing ready

---

## 🎯 Sign-Off

**Deployment Ready**: ⬜ YES / ⬜ NO

**Signed by**:
- [ ] Tech Lead: ________________
- [ ] DevOps: ________________
- [ ] Security: ________________
- [ ] Product: ________________

**Date**: __________

---

**[← Voltar ao Índice](../00-INDEX.md)** | **[Próximo: Docker Production →](./docker-production.md)**
