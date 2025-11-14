# Pétala Fashion - Kubernetes Deployment

Complete Kubernetes manifests for production deployment of Pétala Fashion on AWS
EKS or any Kubernetes cluster.

## Architecture

### Components

- **PostgreSQL** (TimescaleDB): Primary database with event sourcing
- **Redis**: Caching and session management
- **Directus**: Backend API with 3 replicas
- **Frontend**: Vue 3 SPA with 3 replicas
- **Prometheus**: Metrics collection and alerting
- **Grafana**: Observability dashboards

### Scaling Configuration

- **Directus**: Auto-scales 3-20 replicas based on CPU/Memory
- **Frontend**: Auto-scales 3-10 replicas based on CPU/Memory
- **Database**: Single replica with persistent storage (20GB)
- **Redis**: Single replica with persistent storage (5GB)

## Prerequisites

### 1. Kubernetes Cluster

```bash
# AWS EKS (recommended)
eksctl create cluster \
  --name petala-fashion \
  --region us-east-1 \
  --nodegroup-name standard-workers \
  --node-type t3.xlarge \
  --nodes 3 \
  --nodes-min 3 \
  --nodes-max 10 \
  --managed
```

### 2. Install Required Components

#### NGINX Ingress Controller

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.2/deploy/static/provider/aws/deploy.yaml
```

#### Cert-Manager (SSL/TLS)

```bash
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.2/cert-manager.yaml
```

#### Metrics Server (for HPA)

```bash
kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
```

### 3. Storage Classes

#### AWS EBS (gp3)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: gp3
provisioner: ebs.csi.aws.com
parameters:
  type: gp3
  fsType: ext4
volumeBindingMode: WaitForFirstConsumer
```

#### AWS EFS (for shared storage)

```yaml
apiVersion: storage.k8s.io/v1
kind: StorageClass
metadata:
  name: efs
provisioner: efs.csi.aws.com
volumeBindingMode: Immediate
```

## Deployment Steps

### 1. Update Secrets

**CRITICAL**: Update all secrets in `secrets.yaml` before deployment:

```bash
# Generate random keys
openssl rand -base64 32  # For KEY
openssl rand -base64 32  # For SECRET

# Update secrets.yaml with:
# - Database passwords
# - Admin credentials
# - API keys (Stripe, Instagram, 8th Wall)
# - Email SMTP credentials
# - S3 access keys
```

### 2. Deploy Infrastructure

```bash
# Create namespace
kubectl apply -f namespace.yaml

# Deploy configuration
kubectl apply -f configmap.yaml
kubectl apply -f secrets.yaml

# Deploy storage layer
kubectl apply -f postgres-deployment.yaml
kubectl apply -f redis-deployment.yaml

# Wait for databases to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n petala-fashion --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n petala-fashion --timeout=300s
```

### 3. Deploy Application

```bash
# Deploy backend
kubectl apply -f directus-deployment.yaml

# Wait for Directus to be ready
kubectl wait --for=condition=ready pod -l app=directus -n petala-fashion --timeout=300s

# Deploy frontend
kubectl apply -f frontend-deployment.yaml
```

### 4. Deploy Monitoring

```bash
# Deploy Prometheus
kubectl apply -f prometheus-deployment.yaml

# Deploy Grafana
kubectl apply -f grafana-deployment.yaml

# Wait for monitoring to be ready
kubectl wait --for=condition=ready pod -l app=prometheus -n petala-fashion --timeout=300s
kubectl wait --for=condition=ready pod -l app=grafana -n petala-fashion --timeout=300s
```

### 5. Configure Networking

```bash
# Apply network policies (zero-trust security)
kubectl apply -f network-policy.yaml

# Deploy ingress
kubectl apply -f ingress.yaml

# Configure auto-scaling
kubectl apply -f hpa.yaml
```

### 6. Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n petala-fashion

# Check services
kubectl get svc -n petala-fashion

# Check ingress
kubectl get ingress -n petala-fashion

# Check HPA status
kubectl get hpa -n petala-fashion

# View logs
kubectl logs -f deployment/directus -n petala-fashion
kubectl logs -f deployment/frontend -n petala-fashion
```

## DNS Configuration

Point your domains to the Load Balancer created by the Ingress:

```bash
# Get Load Balancer hostname
kubectl get ingress fashion-ingress -n petala-fashion -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'

# Create DNS records (Route 53 example)
fashion.magicsaas.ai          -> CNAME to LB hostname
api.fashion.magicsaas.ai      -> CNAME to LB hostname
grafana.fashion.magicsaas.ai  -> CNAME to LB hostname
```

## Monitoring & Observability

### Access Grafana

```bash
# Get Grafana URL
echo "https://grafana.fashion.magicsaas.ai"

# Default credentials (change immediately)
Username: admin
Password: (from secrets.yaml ADMIN_PASSWORD)
```

### Access Prometheus

```bash
# Port forward to access locally
kubectl port-forward -n petala-fashion svc/prometheus-service 9090:9090

# Access at http://localhost:9090
```

## Scaling

### Manual Scaling

```bash
# Scale Directus
kubectl scale deployment directus -n petala-fashion --replicas=5

# Scale Frontend
kubectl scale deployment frontend -n petala-fashion --replicas=5
```

### Auto-Scaling (Already Configured)

- **Directus**: 3-20 replicas (70% CPU / 80% Memory threshold)
- **Frontend**: 3-10 replicas (70% CPU / 80% Memory threshold)

## Backup & Restore

### Database Backup

```bash
# Backup PostgreSQL
kubectl exec -n petala-fashion postgres-0 -- pg_dump -U directus petala_fashion > backup.sql

# Restore
kubectl exec -i -n petala-fashion postgres-0 -- psql -U directus petala_fashion < backup.sql
```

### Volume Snapshots (AWS EBS)

```bash
# Create snapshot
aws ec2 create-snapshot --volume-id vol-xxxxx --description "Pétala Fashion DB Backup"

# Restore from snapshot
aws ec2 create-volume --snapshot-id snap-xxxxx --availability-zone us-east-1a
```

## Troubleshooting

### Check Pod Status

```bash
kubectl get pods -n petala-fashion
kubectl describe pod <pod-name> -n petala-fashion
kubectl logs <pod-name> -n petala-fashion
```

### Check Events

```bash
kubectl get events -n petala-fashion --sort-by='.lastTimestamp'
```

### Database Connection Issues

```bash
# Test PostgreSQL connection
kubectl exec -it -n petala-fashion deployment/directus -- nc -zv postgres-service 5432

# Test Redis connection
kubectl exec -it -n petala-fashion deployment/directus -- nc -zv redis-service 6379
```

### Restart Deployments

```bash
kubectl rollout restart deployment/directus -n petala-fashion
kubectl rollout restart deployment/frontend -n petala-fashion
```

## Security

### Network Policies

- Zero-trust network policy by default (deny all)
- Explicit allow rules for required communication
- Frontend can only access Directus
- Directus can only access PostgreSQL and Redis
- No pod-to-pod communication except explicitly allowed

### TLS/SSL

- Automatic SSL certificate provisioning via cert-manager
- Let's Encrypt production certificates
- Forced HTTPS redirect
- HSTS enabled

### Security Headers

- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: no-referrer-when-downgrade
- Strict-Transport-Security: max-age=31536000

### Rate Limiting

- 100 requests/minute per IP at ingress level
- 50 requests/second at Directus level
- Configurable via ConfigMap

## Cost Optimization

### AWS EKS Estimated Costs

- **EKS Control Plane**: $73/month
- **EC2 Nodes** (3x t3.xlarge): ~$450/month
- **EBS Storage** (100GB): ~$10/month
- **EFS Storage** (55GB): ~$16.50/month
- **Load Balancer**: ~$25/month
- **Data Transfer**: Variable

**Total**: ~$575/month base infrastructure

### Optimization Tips

1. Use Spot Instances for non-production workloads
2. Enable Cluster Autoscaler
3. Use smaller instance types for development
4. Implement proper resource requests/limits
5. Use Reserved Instances for production

## Production Checklist

- [ ] Update all secrets in `secrets.yaml`
- [ ] Configure DNS records
- [ ] Set up SSL certificates
- [ ] Configure backup strategy
- [ ] Set up monitoring alerts
- [ ] Configure log aggregation
- [ ] Enable cluster autoscaling
- [ ] Set up disaster recovery plan
- [ ] Configure WAF rules
- [ ] Set up cost alerts
- [ ] Document runbook procedures
- [ ] Test scaling behavior
- [ ] Perform load testing
- [ ] Security audit and penetration testing

## Support

For issues or questions:

- GitHub: https://github.com/netbarros/Lotus
- Documentation: https://docs.magicsaas.ai
- Email: support@magicsaas.ai
