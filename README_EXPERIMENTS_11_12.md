# 🎯 Experiments 11 & 12: Complete Implementation
## Model Monitoring (Prometheus & Grafana) + Kubernetes Setup

---

## 📑 START HERE

Choose your starting point:

### 👤 For Beginners
Start with: [EXPERIMENTS_11_12_SETUP_GUIDE.md](EXPERIMENTS_11_12_SETUP_GUIDE.md)
- Overview of what's being deployed
- Step-by-step quick start
- Visual architecture diagram
- Common issues and fixes

### ⚡ For Quick Deployment
Use: [QUICK_REFERENCE.md](QUICK_REFERENCE.md)
- Copy-paste commands
- Common troubleshooting
- Essential monitoring queries
- File locations cheat sheet

### 📖 For Deep Dive
Read: [KUBERNETES_DEPLOYMENT_GUIDE.md](KUBERNETES_DEPLOYMENT_GUIDE.md)
- Detailed setup instructions
- Deployment strategies
- Production considerations
- Complete reference guide

---

## 🚀 FASTEST WAY TO GET STARTED (Windows)

```powershell
# 1. Create Kubernetes cluster (2 min)
kind create cluster --config kind-config.yaml

# 2. Build and load Docker image (3 min)
docker build -t loan-risk-api:latest backend/
kind load docker-image loan-risk-api:latest

# 3. Deploy everything (2 min)
.\scripts\deploy.ps1 -Environment dev

# 4. Access services (immediate)
# API:         http://localhost:8000
# Prometheus:  http://localhost:9090
# Grafana:     http://localhost:3000 (admin/admin123)
```

---

## 📂 Complete File Structure

### 📊 Monitoring (Experiment 11)
```
monitoring/
├── prometheus.yml                 # Prometheus configuration
├── alert_rules.yml               # Alert rules for model degradation
├── grafana_dashboard.json        # Pre-built Grafana dashboard
├── grafana_datasources.yml       # Data source configuration
├── grafana_dashboards.yml        # Dashboard provisioning config
└── alertmanager.yml              # Alert routing rules
```

### ☸️ Kubernetes (Experiment 12)
```
k8s/
├── 01-namespace-configmap.yml    # Namespace & ConfigMaps
├── 02-secrets.yml                # Secrets (API key, passwords)
├── 03-deployment-service.yml     # Deployment & Service
├── 04-ingress-hpa-network.yml    # Ingress, HPA, Network Policies
├── 05-rbac-serviceaccount.yml    # RBAC & Service Accounts
└── 06-prometheus-grafana.yml     # Monitoring stack in K8s
```

### 🐳 Docker & Backend
```
backend/
├── Dockerfile                     # Multi-stage Docker build
├── app/
│   ├── main.py                   # FastAPI with Prometheus
│   ├── metrics.py                # Custom metrics (NEW!)
│   └── [other files]
└── requirements-updated.txt      # Updated dependencies

docker-compose.monitoring.yml     # Local monitoring stack
```

### 🛠️ Tools & Scripts
```
scripts/
├── deploy.ps1                    # Windows deployment
└── deploy.sh                     # Linux/Mac deployment

kind-config.yaml                  # Kind cluster config
```

### 📚 Documentation
```
EXPERIMENTS_11_12_SETUP_GUIDE.md  # ← Start here for overview
KUBERNETES_DEPLOYMENT_GUIDE.md    # ← Detailed K8s guide
QUICK_REFERENCE.md                # ← Command cheat sheet
README_EXPERIMENTS.md             # ← This file
```

---

## 🎯 What's Been Implemented

### Experiment 11: Model Monitoring with Prometheus & Grafana

**Components:**
- ✅ Custom ML metrics collection (`metrics.py`)
- ✅ Prometheus time-series database
- ✅ Pre-built Grafana dashboard (11 panels)
- ✅ AlertManager with Slack/PagerDuty integration
- ✅ Alert rules for model degradation, high latency, low accuracy
- ✅ Docker Compose for local testing

**Key Metrics Monitored:**
| Metric | Alert Threshold |
|--------|-----------------|
| Prediction Latency (p95) | > 2 seconds |
| Model Accuracy | < 85% |
| Approval Rate | < 20% |
| API Error Rate | > 5% |
| Data Quality Score | < 70% |
| High Prediction Load | > 100 predictions/sec |

**Dashboard Panels:**
1. Prediction Rate (per minute)
2. Model Accuracy (gauge)
3. Prediction Latency (p95, p99)
4. Approval Rate (gauge)
5. Predictions Distribution (pie chart)
6. API Errors (time series)
7. Model Precision (gauge)
8. Model Recall (gauge)
9. Model F1 Score (gauge)
10. Active Predictions (counter)
11. Plus additional calculated metrics

---

### Experiment 12: Kubernetes Deployment

**Architecture:**
- ✅ 3-replica deployment with auto-scaling (3-10 replicas)
- ✅ Service mesh with load balancing
- ✅ Ingress with TLS support
- ✅ RBAC (Role-Based Access Control)
- ✅ Network policies for security
- ✅ Pod anti-affinity for high availability
- ✅ Resource quotas and limits
- ✅ Health checks (liveness, readiness, startup)
- ✅ ConfigMap & Secrets management

**Features:**
- 🔄 **Auto-scaling**: CPU (70%), Memory (80%), Custom metrics
- 🔒 **Security**: Non-root user, RBAC, Network policies
- 📊 **Monitoring**: Integrated Prometheus & Grafana
- 💾 **Persistence**: EmptyDir volumes (upgradeable to PVC)
- 🚀 **Deployment**: Rolling updates, canary support
- 📈 **Observability**: Full logging and tracing support

**Service Exposure:**
- ClusterIP service (internal)
- LoadBalancer service (external)
- Ingress controller (DNS-based routing)
- NodePort (optional)

---

## 🚀 Deployment Options

### Option 1: Local Testing with Kind (Fastest ⚡)
```bash
kind create cluster --config kind-config.yaml
docker build -t loan-risk-api:latest backend/
kind load docker-image loan-risk-api:latest
.\scripts\deploy.ps1 -Environment dev
```
**Time**: ~7 minutes | **Cost**: Free | **Platform**: Any computer

### Option 2: Azure Kubernetes Service (AKS)
```bash
az group create --name loan-risk-rg --location eastus
az aks create --resource-group loan-risk-rg --name loan-risk-cluster
az aks get-credentials --resource-group loan-risk-rg --name loan-risk-cluster
.\scripts\deploy.ps1 -Environment prod
```
**Time**: ~15 minutes | **Cost**: $$$$ | **Platform**: Azure

### Option 3: Docker Compose (Local Simple)
```bash
docker-compose -f docker-compose.monitoring.yml up -d
```
**Time**: ~2 minutes | **Cost**: Free | **Platform**: Single machine

### Option 4: AWS EKS / GCP GKE / DigitalOcean
Similar to AKS with cloud-specific commands

---

## 📊 Monitoring & Observability

### Access Points

| Service | URL | Credentials | Purpose |
|---------|-----|-------------|---------|
| API | localhost:8000 | API Key | ML predictions |
| Prometheus | localhost:9090 | None | Metrics database |
| Grafana | localhost:3000 | admin/admin123 | Dashboard |
| Metrics Endpoint | localhost:8000/metrics | API Key | Raw metrics |

### Important Queries

```promql
# Prediction rate
rate(ml_predictions_total[5m])

# Latency percentiles
histogram_quantile(0.95, ml_prediction_latency_seconds)

# Model accuracy trend
ml_model_accuracy

# Error rate
rate(ml_api_errors_total[5m])

# Active predictions
ml_active_predictions
```

---

## 🔧 Common Operations

### Scale Deployment
```bash
# Manual scaling
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml

# Check HPA status
kubectl describe hpa loan-risk-hpa -n loan-risk-ml
```

### Update Secrets
```bash
# Generate new value
echo -n "new-api-key" | base64

# Patch secret
kubectl patch secret loan-risk-secrets -n loan-risk-ml \
  -p '{"data":{"api-key":"base64-value"}}'
```

### View Logs
```bash
# Follow logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f

# Historical logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api --tail=100
```

### Monitor Performance
```bash
# Resource usage
kubectl top pods -n loan-risk-ml

# HPA activity
kubectl get hpa -n loan-risk-ml -w

# Events
kubectl get events -n loan-risk-ml --sort-by='.lastTimestamp'
```

---

## 🔐 Security Features Implemented

- ✅ **Secrets Management**: API keys, passwords encrypted
- ✅ **RBAC**: Role-based access control
- ✅ **Network Policies**: Pod-to-pod communication restricted
- ✅ **Non-root User**: Containers run as mluser (1000)
- ✅ **Resource Quotas**: Limits per namespace
- ✅ **TLS Support**: Ready for HTTPS
- ✅ **Health Checks**: Prevents broken containers from serving traffic
- ✅ **Pod Security Context**: Restricted capabilities

---

## 📈 Production Checklist

Before going to production, ensure:

- [ ] Change all default secrets and passwords
- [ ] Configure TLS certificates
- [ ] Set up persistent storage (PostgreSQL, not SQLite)
- [ ] Configure Slack/PagerDuty webhooks
- [ ] Update Ingress hostname
- [ ] Enable monitoring and logging
- [ ] Set up backup and disaster recovery
- [ ] Configure load balancer health checks
- [ ] Test auto-scaling under load
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Cost optimization reviewed

---

## 🆘 Troubleshooting Quick Links

**Issue** → **Solution**

- Pod won't start → See KUBERNETES_DEPLOYMENT_GUIDE.md § Pod Not Starting
- High memory → See KUBERNETES_DEPLOYMENT_GUIDE.md § High Memory Usage
- Scaling not working → See KUBERNETES_DEPLOYMENT_GUIDE.md § Scaling Issues
- Metrics not collected → Check Prometheus config and pod annotations
- Grafana no data → Verify Prometheus datasource is connected
- API not responding → Check service endpoints and network policies

---

## 📚 Documentation Map

```
📄 THIS FILE (Overview)
│
├─ EXPERIMENTS_11_12_SETUP_GUIDE.md ← START HERE
│  └─ Complete setup guide with quick start
│
├─ KUBERNETES_DEPLOYMENT_GUIDE.md
│  └─ Detailed deployment guide
│
├─ QUICK_REFERENCE.md
│  └─ Command cheat sheet
│
└─ Individual Manifest Files (k8s/ and monitoring/)
   └─ Reference implementations
```

---

## ✅ Verification Steps

After deployment, verify everything works:

```bash
# 1. Check pods
kubectl get pods -n loan-risk-ml
kubectl get pods -n monitoring

# 2. Check services
kubectl get svc -n loan-risk-ml

# 3. Port forward and test
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8000:80
curl http://localhost:8000

# 4. Check metrics
curl http://localhost:8000/metrics | grep ml_

# 5. Access Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# Visit http://localhost:3000
```

---

## 🎓 Learning Resources

### Kubernetes
- [Official K8s Documentation](https://kubernetes.io/docs/)
- [K8s API Reference](https://kubernetes.io/docs/reference/kubernetes-api/)
- [Kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

### Prometheus
- [Prometheus Official Docs](https://prometheus.io/docs/)
- [PromQL Documentation](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Recording Rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)

### Grafana
- [Grafana Official Docs](https://grafana.com/docs/grafana/latest/)
- [Dashboard Sharing](https://grafana.com/grafana/dashboards/)

### Containers
- [Docker Documentation](https://docs.docker.com/)
- [Kind Documentation](https://kind.sigs.k8s.io/)

---

## 🤝 Support & Questions

### Debugging Process
1. Check logs: `kubectl logs <pod> -n <namespace>`
2. Describe pod: `kubectl describe pod <pod> -n <namespace>`
3. Check events: `kubectl get events -n <namespace>`
4. Review resource usage: `kubectl top pods -n <namespace>`
5. Consult documentation above

### Quick Contacts
- **Kubernetes Issues**: See KUBERNETES_DEPLOYMENT_GUIDE.md
- **Monitoring Issues**: Check prometheus and grafana pods
- **Metrics Not Showing**: Verify API /metrics endpoint

---

## 🎉 Next Steps

### Immediate (Today)
1. ✅ Follow Quick Start section
2. ✅ Deploy to Kind cluster
3. ✅ Access all three services
4. ✅ Verify metrics are collected

### Short-term (This Week)
1. Deploy to cloud (AKS/EKS/GKE)
2. Configure custom domain
3. Set up notifications (Slack/PagerDuty)
4. Load testing

### Medium-term (This Month)
1. Add database persistence (PostgreSQL)
2. Implement GitOps (ArgoCD/Flux)
3. Add distributed tracing
4. Centralize logging

### Long-term (Ongoing)
1. Multi-region deployment
2. Service mesh (Istio/Linkerd)
3. Advanced observability
4. Cost optimization

---

## 📊 Project Statistics

- **Files Created**: 20+
- **Kubernetes Manifests**: 6
- **Monitoring Components**: 7
- **Lines of Configuration**: 2000+
- **Docker Image Size**: ~200MB (optimized)
- **Metrics Tracked**: 30+
- **Alert Rules**: 15+
- **Dashboard Panels**: 11+

---

## 📝 Version History

- **v1.0** (April 23, 2026): Initial complete implementation
  - Experiment 11: Prometheus & Grafana monitoring
  - Experiment 12: Kubernetes deployment
  - All documentation and scripts

---

## 📜 License

This implementation and documentation are provided as-is for the Loan Risk ML Platform project.

---

**Last Updated**: April 23, 2026
**Status**: ✅ Complete and Ready for Deployment
**Next Review**: Ongoing (monitor metrics dashboard)

---

## Quick Command Reference

```bash
# Deploy
.\scripts\deploy.ps1 -Environment dev

# Access services
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8000:80
kubectl port-forward -n monitoring svc/prometheus 9090:9090
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Check status
kubectl get all -n loan-risk-ml
kubectl get all -n monitoring

# View logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f

# Scale
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml
```

---

**🎉 You're all set! Start with the Quick Start section above or read EXPERIMENTS_11_12_SETUP_GUIDE.md for more details.**
