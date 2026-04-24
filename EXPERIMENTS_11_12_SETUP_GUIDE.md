# Complete Setup Guide: Experiments 11 & 12
## Model Monitoring (Prometheus & Grafana) + Kubernetes Deployment

---

## 📋 Summary

This guide covers two critical experiments for the Loan Risk ML Platform:

### Experiment 11: Model Monitoring using Prometheus & Grafana
- Custom ML metrics collection
- Real-time model performance tracking
- Alert system for anomalies
- Grafana dashboards for visualization

### Experiment 12: Kubernetes Setup for ML Application
- Containerization with Docker
- Kubernetes manifests for deployment
- Auto-scaling with HPA
- High availability setup
- Monitoring stack integration

---

## 🚀 Quick Start (5 minutes)

### Option 1: Local Development (Kind Cluster)

```bash
# 1. Create Kind cluster
kind create cluster --name loan-risk-cluster --config kind-config.yaml

# 2. Build Docker image
cd backend && docker build -t loan-risk-api:latest . && cd ..

# 3. Load image to Kind
kind load docker-image loan-risk-api:latest --name loan-risk-cluster

# 4. Deploy everything (Windows)
.\scripts\deploy.ps1 -Environment dev

# OR (Linux/Mac)
bash scripts/deploy.sh dev

# 5. Access applications
# Application:    http://localhost:8000
# Prometheus:     http://localhost:9090
# Grafana:        http://localhost:3000 (admin/admin123)
```

### Option 2: Cloud Deployment (AKS)

```bash
# 1. Create AKS cluster
az aks create \
  --resource-group loan-risk-rg \
  --name loan-risk-cluster \
  --node-count 3

# 2. Get credentials
az aks get-credentials --resource-group loan-risk-rg --name loan-risk-cluster

# 3. Deploy (same commands as above)
.\scripts\deploy.ps1 -Environment prod
```

---

## 📁 File Structure

```
loan-risk-platform/
├── backend/
│   ├── Dockerfile                 # Multi-stage build
│   ├── app/
│   │   ├── main.py               # FastAPI with Prometheus
│   │   └── metrics.py            # Custom metrics (NEW)
│   └── requirements.txt
├── monitoring/
│   ├── prometheus.yml            # Prometheus config
│   ├── alert_rules.yml           # Alert definitions
│   ├── grafana_dashboard.json    # Dashboard config
│   ├── grafana_datasources.yml   # Data sources
│   ├── grafana_dashboards.yml    # Dashboard provisioning
│   └── alertmanager.yml          # Alert routing
├── k8s/
│   ├── 01-namespace-configmap.yml
│   ├── 02-secrets.yml
│   ├── 03-deployment-service.yml
│   ├── 04-ingress-hpa-network.yml
│   ├── 05-rbac-serviceaccount.yml
│   ├── 06-prometheus-grafana.yml
├── scripts/
│   ├── deploy.sh                 # Linux/Mac deployment
│   └── deploy.ps1                # Windows deployment
├── kind-config.yaml              # Kind cluster config
├── docker-compose.monitoring.yml # Local monitoring stack
└── KUBERNETES_DEPLOYMENT_GUIDE.md
```

---

## 🔧 Experiment 11: Monitoring Setup

### Components Deployed

1. **Custom Metrics (`metrics.py`)**
   - Prediction latency tracking
   - Model accuracy monitoring
   - Business metrics (approval rate)
   - Data quality scoring
   - Error tracking

2. **Prometheus** (Time-series database)
   - Scrapes metrics from `/metrics` endpoint
   - 30-day retention
   - 15-second scrape interval

3. **Grafana** (Visualization)
   - Pre-configured dashboard
   - Real-time visualization
   - Auto-provision via ConfigMap

4. **AlertManager** (Alert routing)
   - Slack notifications
   - Critical alerts to PagerDuty
   - Warning alerts categorized

### Key Metrics

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| `ml_prediction_latency_seconds` | Response time | p95 > 2s |
| `ml_model_accuracy` | Model performance | < 85% |
| `ml_approval_rate` | Business metric | < 20% |
| `ml_api_errors_total` | System health | > 5% error rate |
| `ml_predictions_total` | Request volume | (informational) |
| `ml_data_quality_score` | Data health | < 70% |

### Access Monitoring

```bash
# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# Query: http://localhost:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Login: http://localhost:3000 (admin/admin123)

# Check alerts
kubectl get alerts -n monitoring
kubectl describe alert <name> -n monitoring
```

---

## ☸️ Experiment 12: Kubernetes Setup

### Architecture Overview

```
┌─────────────────────────────────────┐
│         Kubernetes Cluster           │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   loan-risk-ml namespace     │  │
│  │                              │  │
│  │  ┌──────────────────────┐   │  │
│  │  │  Load Balancer       │   │  │
│  │  └──────────┬───────────┘   │  │
│  │             │                │  │
│  │  ┌──────────▼───────────┐   │  │
│  │  │     Ingress          │   │  │
│  │  └──────────┬───────────┘   │  │
│  │             │                │  │
│  │  ┌──────────▼───────────────────┐
│  │  │   Service (ClusterIP)        │
│  │  └──────────┬──────────────────┐
│  │             │                  │
│  │  ┌──────────▼──────────┐       │
│  │  │   Pod 1 (Replica)   │       │
│  │  │  - API Container    │       │
│  │  │  - Prometheus Exporter
│  │  └─────────────────────┘       │
│  │                                │
│  │  ┌──────────────────────┐      │
│  │  │   Pod 2 (Replica)    │      │
│  │  └──────────────────────┘      │
│  │                                │
│  │  ┌──────────────────────┐      │
│  │  │   Pod 3 (Replica)    │      │
│  │  └──────────────────────┘      │
│  │                                │
│  │  ┌──────────────────────┐      │
│  │  │  HPA (Auto-scaler)   │      │
│  │  │  (min: 3, max: 10)   │      │
│  │  └──────────────────────┘      │
│  │                                │
│  │  ┌──────────────────────┐      │
│  │  │  ConfigMap & Secrets │      │
│  │  └──────────────────────┘      │
│  └──────────────────────────────┘  │
│                                     │
│  ┌──────────────────────────────┐  │
│  │   monitoring namespace       │  │
│  │                              │  │
│  │  ┌──────────────────────┐   │  │
│  │  │    Prometheus        │   │  │
│  │  └──────────────────────┘   │  │
│  │                              │  │
│  │  ┌──────────────────────┐   │  │
│  │  │     Grafana          │   │  │
│  │  └──────────────────────┘   │  │
│  │                              │  │
│  │  ┌──────────────────────┐   │  │
│  │  │   AlertManager       │   │  │
│  │  └──────────────────────┘   │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

### Deployment Features

1. **High Availability**
   - 3 replicas by default
   - Pod anti-affinity (spread across nodes)
   - Pod Disruption Budget

2. **Auto-scaling**
   - CPU-based: Scale when > 70% utilization
   - Memory-based: Scale when > 80% utilization
   - Custom metric: Prediction latency

3. **Security**
   - Non-root user (mluser:1000)
   - Read-only root filesystem options
   - Network policies
   - RBAC roles and bindings
   - Secret management

4. **Health Checks**
   - Liveness probe (restart if unhealthy)
   - Readiness probe (no traffic if not ready)
   - Startup probe (for slow-starting apps)

5. **Resource Management**
   - CPU requests: 500m, limits: 1000m
   - Memory requests: 512Mi, limits: 1Gi
   - Resource quotas per namespace

### Deployment Process

```bash
# Step 1: Prepare cluster
kind create cluster --config kind-config.yaml

# Step 2: Build & load image
docker build -t loan-risk-api:latest backend/
kind load docker-image loan-risk-api:latest

# Step 3: Deploy infrastructure
kubectl apply -f k8s/01-namespace-configmap.yml
kubectl apply -f k8s/02-secrets.yml
kubectl apply -f k8s/05-rbac-serviceaccount.yml

# Step 4: Deploy application
kubectl apply -f k8s/03-deployment-service.yml
kubectl apply -f k8s/04-ingress-hpa-network.yml

# Step 5: Deploy monitoring
kubectl apply -f k8s/06-prometheus-grafana.yml

# Step 6: Verify
kubectl get all -n loan-risk-ml
kubectl get all -n monitoring
```

---

## 🔍 Monitoring Your Deployment

### Check Pod Status

```bash
# Get all pods
kubectl get pods -n loan-risk-ml -o wide

# Check specific pod
kubectl describe pod <pod-name> -n loan-risk-ml

# View logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f
```

### Monitor Metrics

```bash
# CPU and memory usage
kubectl top pods -n loan-risk-ml

# HPA status
kubectl get hpa -n loan-risk-ml
kubectl describe hpa loan-risk-hpa -n loan-risk-ml

# Check if scaling is happening
kubectl get events -n loan-risk-ml --sort-by='.lastTimestamp'
```

### Access Services

```bash
# API
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8000:80

# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
```

---

## 🚨 Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n loan-risk-ml

# View pod events
kubectl describe pod <pod-name> -n loan-risk-ml

# Check logs
kubectl logs -n loan-risk-ml <pod-name>
```

### High Memory Usage

```bash
# Check current usage
kubectl top pods -n loan-risk-ml

# Increase limits
kubectl set resources deployment loan-risk-api \
  --limits=memory=2Gi \
  --requests=memory=1Gi \
  -n loan-risk-ml
```

### Scaling Issues

```bash
# Check HPA
kubectl get hpa -n loan-risk-ml

# View HPA details
kubectl describe hpa loan-risk-hpa -n loan-risk-ml

# Manual scale
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml
```

---

## 📊 Grafana Dashboard Setup

The deployment automatically creates a dashboard with:

1. **Prediction Metrics**
   - Prediction rate (per minute)
   - Prediction latency (p95, p99)
   - API errors

2. **Model Performance**
   - Model accuracy
   - Precision, Recall, F1 score
   - Approval rate

3. **Business Metrics**
   - Loans approved vs rejected
   - Average loan amount
   - Data quality score

4. **System Health**
   - Active predictions
   - Error rates
   - High-risk applications

---

## 🔐 Security Checklist

- [ ] Change default Grafana password
- [ ] Update API_KEY in secrets
- [ ] Configure TLS/SSL certificates
- [ ] Enable authentication
- [ ] Set network policies
- [ ] Enable RBAC
- [ ] Use private container registry
- [ ] Implement resource quotas
- [ ] Configure pod security policies
- [ ] Regular security audits

---

## 📈 Production Considerations

1. **Database**: Migrate from SQLite to PostgreSQL with PersistentVolumeClaim
2. **Logging**: Centralize logs with ELK, Loki, or Splunk
3. **Tracing**: Add distributed tracing (Jaeger)
4. **Backup**: Implement cluster backups
5. **DR**: Multi-region deployment strategy
6. **Cost**: Monitor and optimize resource usage
7. **GitOps**: Use ArgoCD or Flux for declarative deployment

---

## 📚 Additional Resources

- [Kubernetes Official Docs](https://kubernetes.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Dashboards](https://grafana.com/grafana/dashboards/)
- [Kind Docs](https://kind.sigs.k8s.io/)

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] All pods are running
- [ ] Services have IP addresses
- [ ] HPA is active and monitoring
- [ ] Prometheus is scraping metrics
- [ ] Grafana dashboard displays data
- [ ] Alerts are configured
- [ ] Load test passes (>100 req/sec)
- [ ] Pod auto-scaling works
- [ ] Logs are accessible
- [ ] Metrics are being collected

---

Generated: April 23, 2026
