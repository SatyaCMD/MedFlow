#!/usr/bin/env bash
set -e

echo "🚀 Starting MedFlow Enterprise Kubernetes Deployment..."

# 1. Tag local Docker images
echo "🏷️  Checking & tagging local Docker images for Kubernetes..."
docker tag medflow-api:latest medicore360/api:latest || true
docker tag medflow-web:latest medicore360/web:latest || true

# 2. Apply Kustomize Stack
echo "📦 Applying complete Kubernetes stack..."
kubectl apply -k .

# 3. Rollout checks
echo "⏳ Waiting for services..."
kubectl rollout status statefulset/medflow-mongodb -n medflow --timeout=120s
kubectl rollout status deployment/medflow-redis -n medflow --timeout=60s
kubectl rollout status statefulset/rabbitmq -n medflow --timeout=120s
kubectl rollout status deployment/kafka -n medflow --timeout=120s
kubectl rollout status deployment/medflow-api -n medflow --timeout=120s
kubectl rollout status deployment/medflow-web -n medflow --timeout=120s

echo "✅ MedFlow Enterprise Kubernetes Cluster Successfully Deployed!"
kubectl get pods,svc,ingress,hpa,pdb,netpol -n medflow
