# Quick Reference Card: Experiments 11 & 12

## 🚀 QUICK COMMANDS

### Setup (First Time)
```bash
# 1. Create cluster
kind create cluster --config kind-config.yaml

# 2. Build image
docker build -t loan-risk-api:latest backend/

# 3. Load image
kind load docker-image loan-risk-api:latest

# 4. Deploy (choose one)
# Windows:
.\scripts\deploy.ps1 -Environment dev
# Linux/Mac:
bash scripts/deploy.sh dev
```

### Verify Deployment
```bash
# Check pods
kubectl get pods -n loan-risk-ml
kubectl get pods -n monitoring

# Check services
kubectl get svc -n loan-risk-ml
kubectl get svc -n monitoring

# Check deployments
kubectl get deployment -n loan-risk-ml
kubectl get deployment -n monitoring
```

### Access Services
```bash
# Application (API)
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8000:80
# → http://localhost:8000

# Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090
# → http://localhost:9090

# Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000
# → http://localhost:3000 (admin/admin123)
```

### View Logs
```bash
# Follow logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f

# Last 50 lines
kubectl logs -n loan-risk-ml deployment/loan-risk-api --tail=50

# All containers
kubectl logs -n loan-risk-ml deployment/loan-risk-api --all-containers=true
```

### Monitor
```bash
# CPU/Memory
kubectl top pods -n loan-risk-ml

# Scaling status
kubectl get hpa -n loan-risk-ml

# Events
kubectl get events -n loan-risk-ml --sort-by='.lastTimestamp'
```

### Scaling
```bash
# Manual scale
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml

# HPA status
kubectl describe hpa loan-risk-hpa -n loan-risk-ml

# Check metrics
kubectl get hpa loan-risk-hpa -n loan-risk-ml -w
```

### Debugging
```bash
# Pod describe
kubectl describe pod <pod-name> -n loan-risk-ml

# Shell access
kubectl exec -it <pod-name> -n loan-risk-ml -- bash

# Port-forward to pod
kubectl port-forward -n loan-risk-ml pod/<pod-name> 8000:8000

# Debug pod
kubectl debug -n loan-risk-ml pod/<pod-name> -it --image=busybox:1.35
```

---

## 📊 KEY METRICS TO MONITOR

| Metric | Query | Normal | Alert |
|--------|-------|--------|-------|
| Prediction Latency | `histogram_quantile(0.95, ml_prediction_latency_seconds)` | < 1s | > 2s |
| Model Accuracy | `ml_model_accuracy` | > 0.9 | < 0.85 |
| Approval Rate | `ml_approval_rate` | 40-60% | < 20% |
| Error Rate | `rate(ml_api_errors_total[5m])` | < 1% | > 5% |
| Active Predictions | `ml_active_predictions` | < 50 | > 100 |
| Data Quality | `ml_data_quality_score` | > 80 | < 70 |

---

## 🔍 COMMON TASKS

### Update Secret
```bash
# Generate base64
echo -n "new-value" | base64

# Update secret
kubectl patch secret loan-risk-secrets -n loan-risk-ml \
  -p '{"data":{"api-key":"base64-encoded-value"}}'
```

### Scale to Specific Replicas
```bash
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml
```

### Update Image
```bash
# Build new image
docker build -t loan-risk-api:v2 backend/
kind load docker-image loan-risk-api:v2

# Update deployment
kubectl set image deployment/loan-risk-api \
  loan-risk-api=loan-risk-api:v2 \
  -n loan-risk-ml
```

### Check Rollout Status
```bash
kubectl rollout status deployment/loan-risk-api -n loan-risk-ml
```

### Rollback Deployment
```bash
kubectl rollout undo deployment/loan-risk-api -n loan-risk-ml
```

### View Deployment History
```bash
kubectl rollout history deployment/loan-risk-api -n loan-risk-ml
```

---

## ⚠️ TROUBLESHOOTING QUICK FIXES

### Pod CrashLoopBackOff
```bash
# View logs
kubectl logs -n loan-risk-ml <pod-name> --previous

# Check events
kubectl describe pod -n loan-risk-ml <pod-name>
```

### OOMKilled
```bash
# Increase memory
kubectl set resources deployment loan-risk-api \
  --limits=memory=2Gi \
  --requests=memory=1Gi \
  -n loan-risk-ml
```

### ImagePullBackOff
```bash
# Load image locally (for Kind)
kind load docker-image loan-risk-api:latest
```

### Connection Refused
```bash
# Check service endpoints
kubectl get endpoints -n loan-risk-ml loan-risk-api-service

# Test DNS
kubectl exec -n loan-risk-ml pod/<name> -- nslookup kubernetes.default
```

---

## 📁 FILE LOCATIONS

```
k8s/
├── 01-namespace-configmap.yml    # Namespaces & config
├── 02-secrets.yml                # API keys, passwords
├── 03-deployment-service.yml     # Main app deployment
├── 04-ingress-hpa-network.yml    # Ingress & auto-scaling
├── 05-rbac-serviceaccount.yml    # Permissions
├── 06-prometheus-grafana.yml     # Monitoring stack

monitoring/
├── prometheus.yml                # Prometheus config
├── alert_rules.yml               # Alert rules
├── grafana_dashboard.json        # Dashboard
├── alertmanager.yml              # Alert routing

scripts/
├── deploy.ps1                    # Windows deploy
└── deploy.sh                     # Linux/Mac deploy
```

---

## 🔗 USEFUL LINKS

- K8s API Reference: https://kubernetes.io/docs/reference/kubernetes-api/
- Prometheus Query Language: https://prometheus.io/docs/prometheus/latest/querying/basics/
- Grafana Dashboards: https://grafana.com/grafana/dashboards/
- Kind: https://kind.sigs.k8s.io/

---

## 📞 SUPPORT

### Check Component Status
```bash
# Prometheus
kubectl logs -n monitoring deployment/prometheus -f

# Grafana  
kubectl logs -n monitoring deployment/grafana -f

# API
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f
```

### Get Help
1. Check pod logs first
2. Describe pod for events
3. Check available node resources
4. Review Kubernetes events
5. Check Prometheus for metric collection

---

Date: April 23, 2026
