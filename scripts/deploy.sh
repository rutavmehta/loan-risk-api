#!/bin/bash
# deploy.sh - Complete deployment script for loan-risk ML application
# Usage: ./deploy.sh [dev|staging|prod]

set -e

ENVIRONMENT=${1:-dev}
CLUSTER_NAME="loan-risk-cluster"
NAMESPACE="loan-risk-ml"
MONITORING_NAMESPACE="monitoring"

echo "=========================================="
echo "Deploying Loan Risk ML Application"
echo "Environment: $ENVIRONMENT"
echo "=========================================="

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check prerequisites
check_prerequisites() {
    echo -e "${YELLOW}Checking prerequisites...${NC}"
    
    if ! command -v kubectl &> /dev/null; then
        echo -e "${RED}kubectl not found. Please install kubectl.${NC}"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${RED}docker not found. Please install docker.${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Prerequisites check passed${NC}"
}

# Build Docker image
build_image() {
    echo -e "${YELLOW}Building Docker image...${NC}"
    
    cd backend
    docker build -t loan-risk-api:latest .
    cd ..
    
    echo -e "${GREEN}✓ Docker image built successfully${NC}"
}

# Load image for Kind cluster
load_image_to_kind() {
    echo -e "${YELLOW}Loading image to Kind cluster...${NC}"
    
    kind load docker-image loan-risk-api:latest --name $CLUSTER_NAME
    
    echo -e "${GREEN}✓ Image loaded to Kind${NC}"
}

# Create namespaces and apply configurations
deploy_infrastructure() {
    echo -e "${YELLOW}Deploying infrastructure...${NC}"
    
    # Create namespaces
    kubectl create namespace $NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    kubectl create namespace $MONITORING_NAMESPACE --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply configurations
    kubectl apply -f k8s/01-namespace-configmap.yml
    kubectl apply -f k8s/02-secrets.yml
    kubectl apply -f k8s/05-rbac-serviceaccount.yml
    
    echo -e "${GREEN}✓ Infrastructure deployed${NC}"
}

# Deploy application
deploy_application() {
    echo -e "${YELLOW}Deploying application...${NC}"
    
    kubectl apply -f k8s/03-deployment-service.yml
    kubectl apply -f k8s/04-ingress-hpa-network.yml
    
    echo -e "${GREEN}✓ Application deployed${NC}"
}

# Deploy monitoring stack
deploy_monitoring() {
    echo -e "${YELLOW}Deploying monitoring stack...${NC}"
    
    kubectl apply -f k8s/06-prometheus-grafana.yml
    
    echo -e "${GREEN}✓ Monitoring stack deployed${NC}"
}

# Wait for deployments
wait_for_deployments() {
    echo -e "${YELLOW}Waiting for deployments to be ready...${NC}"
    
    kubectl rollout status deployment/loan-risk-api -n $NAMESPACE --timeout=5m
    kubectl rollout status deployment/prometheus -n $MONITORING_NAMESPACE --timeout=5m || true
    kubectl rollout status deployment/grafana -n $MONITORING_NAMESPACE --timeout=5m || true
    
    echo -e "${GREEN}✓ Deployments are ready${NC}"
}

# Display access information
display_access_info() {
    echo ""
    echo -e "${GREEN}=========================================="
    echo "Deployment completed successfully!"
    echo "==========================================${NC}"
    echo ""
    
    # Application
    echo -e "${YELLOW}Application:${NC}"
    echo "  Port-forward: kubectl port-forward -n $NAMESPACE svc/loan-risk-api-service 8000:80"
    echo "  Access: http://localhost:8000"
    echo ""
    
    # Prometheus
    echo -e "${YELLOW}Prometheus:${NC}"
    echo "  Port-forward: kubectl port-forward -n $MONITORING_NAMESPACE svc/prometheus 9090:9090"
    echo "  Access: http://localhost:9090"
    echo ""
    
    # Grafana
    echo -e "${YELLOW}Grafana:${NC}"
    echo "  Port-forward: kubectl port-forward -n $MONITORING_NAMESPACE svc/grafana 3000:3000"
    echo "  Access: http://localhost:3000"
    echo "  Credentials: admin / admin123"
    echo ""
    
    # Pods status
    echo -e "${YELLOW}Pod Status:${NC}"
    kubectl get pods -n $NAMESPACE -o wide
    echo ""
    kubectl get pods -n $MONITORING_NAMESPACE -o wide
}

# Main execution
main() {
    check_prerequisites
    build_image
    
    if [ "$ENVIRONMENT" = "local" ] || [ "$ENVIRONMENT" = "dev" ]; then
        load_image_to_kind
    fi
    
    deploy_infrastructure
    deploy_application
    deploy_monitoring
    wait_for_deployments
    display_access_info
}

main "$@"
