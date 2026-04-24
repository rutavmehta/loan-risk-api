@echo off
REM deploy.ps1 - Complete deployment script for loan-risk ML application (Windows)
REM Usage: .\deploy.ps1 -Environment dev

param(
    [string]$Environment = "dev",
    [string]$ClusterName = "loan-risk-cluster",
    [string]$Namespace = "loan-risk-ml",
    [string]$MonitoringNamespace = "monitoring"
)

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Deploying Loan Risk ML Application" -ForegroundColor Cyan
Write-Host "Environment: $Environment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Function to check prerequisites
function Check-Prerequisites {
    Write-Host "Checking prerequisites..." -ForegroundColor Yellow
    
    try {
        kubectl version --client | Out-Null
    }
    catch {
        Write-Host "kubectl not found. Please install kubectl." -ForegroundColor Red
        exit 1
    }
    
    try {
        docker version | Out-Null
    }
    catch {
        Write-Host "docker not found. Please install docker." -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✓ Prerequisites check passed" -ForegroundColor Green
}

# Function to build Docker image
function Build-Image {
    Write-Host "Building Docker image..." -ForegroundColor Yellow
    
    Push-Location backend
    docker build -t loan-risk-api:latest .
    Pop-Location
    
    Write-Host "✓ Docker image built successfully" -ForegroundColor Green
}

# Function to load image to Kind
function Load-Image-To-Kind {
    Write-Host "Loading image to Kind cluster..." -ForegroundColor Yellow
    
    kind load docker-image loan-risk-api:latest --name $ClusterName
    
    Write-Host "✓ Image loaded to Kind" -ForegroundColor Green
}

# Function to deploy infrastructure
function Deploy-Infrastructure {
    Write-Host "Deploying infrastructure..." -ForegroundColor Yellow
    
    kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace $MonitoringNamespace --dry-run=client -o yaml | kubectl apply -f -
    
    kubectl apply -f k8s/01-namespace-configmap.yml
    kubectl apply -f k8s/02-secrets.yml
    kubectl apply -f k8s/05-rbac-serviceaccount.yml
    
    Write-Host "✓ Infrastructure deployed" -ForegroundColor Green
}

# Function to deploy application
function Deploy-Application {
    Write-Host "Deploying application..." -ForegroundColor Yellow
    
    kubectl apply -f k8s/03-deployment-service.yml
    kubectl apply -f k8s/04-ingress-hpa-network.yml
    
    Write-Host "✓ Application deployed" -ForegroundColor Green
}

# Function to deploy monitoring
function Deploy-Monitoring {
    Write-Host "Deploying monitoring stack..." -ForegroundColor Yellow
    
    kubectl apply -f k8s/06-prometheus-grafana.yml
    
    Write-Host "✓ Monitoring stack deployed" -ForegroundColor Green
}

# Function to wait for deployments
function Wait-For-Deployments {
    Write-Host "Waiting for deployments to be ready..." -ForegroundColor Yellow
    
    kubectl rollout status deployment/loan-risk-api -n $Namespace --timeout=5m
    kubectl rollout status deployment/prometheus -n $MonitoringNamespace --timeout=5m -ErrorAction SilentlyContinue
    kubectl rollout status deployment/grafana -n $MonitoringNamespace --timeout=5m -ErrorAction SilentlyContinue
    
    Write-Host "✓ Deployments are ready" -ForegroundColor Green
}

# Function to display access information
function Display-Access-Info {
    Write-Host ""
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host "Deployment completed successfully!" -ForegroundColor Green
    Write-Host "==========================================" -ForegroundColor Green
    Write-Host ""
    
    Write-Host "Application:" -ForegroundColor Yellow
    Write-Host "  Port-forward: kubectl port-forward -n $Namespace svc/loan-risk-api-service 8000:80"
    Write-Host "  Access: http://localhost:8000"
    Write-Host ""
    
    Write-Host "Prometheus:" -ForegroundColor Yellow
    Write-Host "  Port-forward: kubectl port-forward -n $MonitoringNamespace svc/prometheus 9090:9090"
    Write-Host "  Access: http://localhost:9090"
    Write-Host ""
    
    Write-Host "Grafana:" -ForegroundColor Yellow
    Write-Host "  Port-forward: kubectl port-forward -n $MonitoringNamespace svc/grafana 3000:3000"
    Write-Host "  Access: http://localhost:3000"
    Write-Host "  Credentials: admin / admin123"
    Write-Host ""
    
    Write-Host "Pod Status:" -ForegroundColor Yellow
    kubectl get pods -n $Namespace -o wide
    Write-Host ""
    kubectl get pods -n $MonitoringNamespace -o wide
}

# Main execution
Check-Prerequisites
Build-Image

if ($Environment -eq "local" -or $Environment -eq "dev") {
    Load-Image-To-Kind
}

Deploy-Infrastructure
Deploy-Application
Deploy-Monitoring
Wait-For-Deployments
Display-Access-Info
