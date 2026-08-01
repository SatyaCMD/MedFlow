# MedFlow Production-Grade Kubernetes Automated Deployment Script
Write-Host "🚀 Starting MedFlow Enterprise Kubernetes Deployment..." -ForegroundColor Cyan

# 1. Ensure Docker images are properly tagged for local cluster resolution
Write-Host "🏷️  Checking & tagging local Docker images for Kubernetes..." -ForegroundColor Yellow
docker tag medflow-api:latest medicore360/api:latest 2>$null
docker tag medflow-web:latest medicore360/web:latest 2>$null

# 2. Apply Kustomize Stack
Write-Host "📦 Applying complete Kubernetes stack (Config, Secrets, StatefulSets, Deployments, Ingress, HPA, NetworkPolicy, PDB)..." -ForegroundColor Yellow
kubectl apply -k .

# 3. Verify Rollouts
Write-Host "⏳ Waiting for MongoDB StatefulSet..." -ForegroundColor Yellow
kubectl rollout status statefulset/medflow-mongodb -n medflow --timeout=120s

Write-Host "⏳ Waiting for Redis Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-redis -n medflow --timeout=60s

Write-Host "⏳ Waiting for RabbitMQ StatefulSet..." -ForegroundColor Yellow
kubectl rollout status statefulset/rabbitmq -n medflow --timeout=120s

Write-Host "⏳ Waiting for Kafka Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/kafka -n medflow --timeout=120s

Write-Host "⏳ Waiting for API Microservice Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-api -n medflow --timeout=120s

Write-Host "⏳ Waiting for Web App Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-web -n medflow --timeout=120s

# 4. Print Summary
Write-Host "✅ MedFlow Enterprise Kubernetes Cluster Successfully Deployed!" -ForegroundColor Green
kubectl get pods,svc,ingress,hpa,pdb,netpol -n medflow
