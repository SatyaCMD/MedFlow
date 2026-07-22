# MedFlow Enterprise Kubernetes Automated Deployment Script
Write-Host "🚀 Starting MedFlow Kubernetes Deployment..." -ForegroundColor Cyan

# 1. Apply Kustomize Root
Write-Host "📦 Applying Kubernetes Manifests via Kustomize..." -ForegroundColor Yellow
kubectl apply -k .

# 2. Check Rollout Status
Write-Host "⏳ Waiting for MongoDB StatefulSet..." -ForegroundColor Yellow
kubectl rollout status statefulset/medflow-mongodb -n medflow --timeout=120s

Write-Host "⏳ Waiting for Redis Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-redis -n medflow --timeout=60s

Write-Host "⏳ Waiting for API Microservice Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-api -n medflow --timeout=120s

Write-Host "⏳ Waiting for Web App Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-web -n medflow --timeout=120s

# 3. Print Pod Summary
Write-Host "✅ MedFlow Kubernetes Cluster Resources Successfully Deployed!" -ForegroundColor Green
kubectl get pods,svc,ingress,hpa -n medflow
