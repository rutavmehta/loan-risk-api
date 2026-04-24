# Kubernetes Deployment Guide for Loan Risk ML Application
## Experiments 11 & 12: Monitoring & Kubernetes Setup

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Detailed Setup](#detailed-setup)
4. [Deployment](#deployment)
5. [Monitoring](#monitoring)
6. [Troubleshooting](#troubleshooting)
7. [Production Considerations](#production-considerations)

---

## Prerequisites

### Required Tools
- **kubectl** (v1.24+): Kubernetes CLI
- **Docker**: Container runtime
- **Helm** (optional): Package manager for Kubernetes
- **Kind** or **Minikube**: Local Kubernetes cluster (for testing)
- **Azure CLI** (if deploying to AKS)

### Installation

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/windows/amd64/kubectl.exe"

# Install Docker
# Download from: https://www.docker.com/products/docker-desktop

# For local testing with Kind
go install sigs.k8s.io/kind@latest
```

---

## Quick Start

### 1. Create Local Cluster (for testing)

```bash
# Create Kind cluster
kind create cluster --name loan-risk-cluster --config kind-config.yaml

# Verify cluster
kubectl cluster-info
kubectl get nodes
```

### 2. Build and Load Docker Image

```bash
cd backend
docker build -t loan-risk-api:latest .

# Load into Kind (for local testing)
kind load docker-image loan-risk-api:latest --name loan-risk-cluster
```

### 3. Deploy to Kubernetes

```bash
# Create namespaces and resources
kubectl apply -f k8s/01-namespace-configmap.yml
kubectl apply -f k8s/02-secrets.yml
kubectl apply -f k8s/03-deployment-service.yml
kubectl apply -f k8s/04-ingress-hpa-network.yml
kubectl apply -f k8s/05-rbac-serviceaccount.yml

# Deploy monitoring stack
kubectl apply -f k8s/06-prometheus-grafana.yml

# Verify deployments
kubectl get deployments -n loan-risk-ml
kubectl get pods -n loan-risk-ml
```

### 4. Access the Application

```bash
# Get service IP
kubectl get svc -n loan-risk-ml

# Port forward for testing
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8000:80

# Access at: http://localhost:8000
```

---

## Detailed Setup

### Step 1: Update Secrets

**WARNING**: The secrets in `02-secrets.yml` are base64 encoded examples. Update them before deployment:

```bash
# Generate new base64 encoded values
echo -n "your-new-api-key" | base64
echo -n "your-new-password" | base64

# Update the secrets file
kubectl create secret generic loan-risk-secrets \
  --from-literal=api-key=your-new-api-key \
  --from-literal=db-password=your-new-password \
  -n loan-risk-ml \
  --dry-run=client -o yaml > k8s/02-secrets-updated.yml

kubectl apply -f k8s/02-secrets-updated.yml
```

### Step 2: Configure Ingress

Update the Ingress hostname in `04-ingress-hpa-network.yml`:

```yaml
spec:
  rules:
    - host: api.yourloanguard.com  # Change this
      http:
        paths:
          - path: /
            backend:
              service:
                name: loan-risk-api-service
                port:
                  number: 80
```

Then apply:
```bash
kubectl apply -f k8s/04-ingress-hpa-network.yml
```

### Step 3: Configure Resource Quotas

```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: loan-risk-quota
  namespace: loan-risk-ml
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "10Gi"
    limits.cpu: "20"
    limits.memory: "20Gi"
    pods: "100"
```

---

## Deployment

### Deployment Strategies

#### 1. Blue-Green Deployment

```bash
# Current deployment (blue)
kubectl apply -f k8s/03-deployment-service.yml

# Create new deployment (green)
kubectl set image deployment/loan-risk-api \
  loan-risk-api=loan-risk-api:new-version \
  -n loan-risk-ml

# Test the new version
kubectl port-forward -n loan-risk-ml svc/loan-risk-api-service 8001:80

# Switch traffic (if successful)
kubectl patch service loan-risk-api-service -n loan-risk-ml \
  -p '{"spec":{"selector":{"version":"v2"}}}'
```

#### 2. Canary Deployment

```bash
# Deploy canary with 10% traffic
kubectl patch deployment loan-risk-api -n loan-risk-ml \
  --type='json' \
  -p='[{"op": "replace", "path": "/spec/replicas", "value":3}]'

# Monitor metrics
kubectl top pods -n loan-risk-ml --containers
```

#### 3. Rolling Update (Default)

```bash
# Automatically handled by Deployment strategy
kubectl rollout status deployment/loan-risk-api -n loan-risk-ml

# Rollback if needed
kubectl rollout undo deployment/loan-risk-api -n loan-risk-ml
```

### Deployment to AKS

```bash
# Login to Azure
az login

# Create resource group
az group create --name loan-risk-rg --location eastus

# Create AKS cluster
az aks create \
  --resource-group loan-risk-rg \
  --name loan-risk-cluster \
  --node-count 3 \
  --enable-managed-identity \
  --network-plugin azure

# Get credentials
az aks get-credentials --resource-group loan-risk-rg --name loan-risk-cluster

# Deploy
kubectl apply -f k8s/01-namespace-configmap.yml
kubectl apply -f k8s/02-secrets.yml
kubectl apply -f k8s/03-deployment-service.yml
# ... and so on
```

---

## Monitoring

### Access Prometheus

```bash
# Port forward Prometheus
kubectl port-forward -n monitoring svc/prometheus 9090:9090

# Access at: http://localhost:9090
```

### Access Grafana

```bash
# Port forward Grafana
kubectl port-forward -n monitoring svc/grafana 3000:3000

# Access at: http://localhost:3000
# Login: admin / admin123
```

### Key Metrics to Monitor

1. **Prediction Latency**: `histogram_quantile(0.95, ml_prediction_latency_seconds)`
2. **Model Accuracy**: `ml_model_accuracy`
3. **Approval Rate**: `ml_approval_rate`
4. **API Errors**: `increase(ml_api_errors_total[5m])`
5. **Active Predictions**: `ml_active_predictions`

### View Logs

```bash
# Real-time logs
kubectl logs -n loan-risk-ml deployment/loan-risk-api -f

# Logs from specific pod
kubectl logs -n loan-risk-ml pod/loan-risk-api-xxxxx

# Last 100 lines
kubectl logs -n loan-risk-ml deployment/loan-risk-api --tail=100

# Logs from all containers
kubectl logs -n loan-risk-ml deployment/loan-risk-api --all-containers=true
```

### Health Checks

```bash
# Describe deployment
kubectl describe deployment loan-risk-api -n loan-risk-ml

# Check pod status
kubectl get pods -n loan-risk-ml -o wide

# View events
kubectl get events -n loan-risk-ml --sort-by='.lastTimestamp'
```

---

## Troubleshooting

### Pod Not Starting

```bash
# Check pod status
kubectl get pods -n loan-risk-ml

# Check pod logs
kubectl logs -n loan-risk-ml pod/loan-risk-api-xxxxx

# Check pod events
kubectl describe pod -n loan-risk-ml pod/loan-risk-api-xxxxx

# Check resource availability
kubectl top nodes
kubectl top pods -n loan-risk-ml
```

### Connection Issues

```bash
# Check service endpoints
kubectl get endpoints -n loan-risk-ml

# Test DNS
kubectl exec -it -n loan-risk-ml pod/loan-risk-api-xxxxx -- nslookup kubernetes.default

# Check network policies
kubectl get networkpolicies -n loan-risk-ml
```

### High Memory Usage

```bash
# Check memory limits
kubectl top pods -n loan-risk-ml

# Increase limits in deployment
kubectl set resources deployment loan-risk-api \
  --limits=memory=2Gi \
  --requests=memory=1Gi \
  -n loan-risk-ml
```

### Scaling Issues

```bash
# Check HPA status
kubectl get hpa -n loan-risk-ml

# View HPA details
kubectl describe hpa loan-risk-hpa -n loan-risk-ml

# Manual scaling
kubectl scale deployment loan-risk-api --replicas=5 -n loan-risk-ml
```

---

## Production Considerations

### 1. Security
- [ ] Use private container registry
- [ ] Implement Network Policies
- [ ] Enable Pod Security Policies
- [ ] Use RBAC for access control
- [ ] Encrypt secrets at rest
- [ ] Use TLS for all communications

### 2. High Availability
- [ ] Multi-node cluster (minimum 3 nodes)
- [ ] Pod Disruption Budgets
- [ ] Pod Anti-Affinity rules
- [ ] Load balancer with multiple replicas
- [ ] Multi-region deployment

### 3. Monitoring & Observability
- [ ] Central logging (ELK, Loki)
- [ ] Distributed tracing (Jaeger, Zipkin)
- [ ] Alert rules configured
- [ ] SLO/SLI tracking
- [ ] Regular metric reviews

### 4. Backup & Disaster Recovery
- [ ] Regular cluster backups
- [ ] Data persistence strategy
- [ ] Disaster recovery plan
- [ ] Regular DR drills

### 5. Cost Optimization
- [ ] Right-size resource requests
- [ ] Use cluster autoscaling
- [ ] Implement namespace quotas
- [ ] Monitor costs regularly

---

## Useful Commands

```bash
# General
kubectl cluster-info
kubectl get all -n loan-risk-ml
kubectl describe node node-name

# Pods
kubectl get pods -n loan-risk-ml -o wide
kubectl exec -it pod-name -n loan-risk-ml -- bash
kubectl logs pod-name -n loan-risk-ml

# Services
kubectl port-forward svc/loan-risk-api-service 8000:80 -n loan-risk-ml
kubectl get svc -n loan-risk-ml

# Deployments
kubectl rollout status deployment/loan-risk-api -n loan-risk-ml
kubectl rollout history deployment/loan-risk-api -n loan-risk-ml

# Monitoring
kubectl top pods -n loan-risk-ml
kubectl get hpa -n loan-risk-ml
kubectl describe hpa loan-risk-hpa -n loan-risk-ml

# Debugging
kubectl debug pod/pod-name -n loan-risk-ml -it --image=busybox:1.35
kubectl port-forward pod/loan-risk-api-xxxxx 8000:8000 -n loan-risk-ml
```

---

## Next Steps

1. **Set up CI/CD Pipeline**: GitHub Actions, GitLab CI, or Azure DevOps
2. **Implement GitOps**: ArgoCD or Flux for declarative deployments
3. **Add Service Mesh**: Istio or Linkerd for advanced traffic management
4. **Database Persistence**: Replace SQLite with PostgreSQL + PVC
5. **Multi-environment Setup**: Dev, Staging, Production clusters
