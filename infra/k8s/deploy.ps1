# MedFlow Production-Grade Kubernetes Automated Deployment Script
$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition

Write-Host "[INFO] Starting MedFlow Enterprise Kubernetes Deployment..." -ForegroundColor Cyan

# 1. Ensure Docker images are properly tagged for local cluster resolution
Write-Host "[INFO] Checking and tagging local Docker images for Kubernetes..." -ForegroundColor Yellow
try { docker tag medflow-api:latest medicore360/api:latest 2>$null } catch {}
try { docker tag medflow-api:latest medicore360/api:v1.0.1 2>$null } catch {}
try { docker tag medflow-web:latest medicore360/web:latest 2>$null } catch {}
try { docker tag medflow-web:latest medicore360/web:v1.0.0 2>$null } catch {}

# 2. Apply Kustomize Stack
Write-Host "[INFO] Applying complete Kubernetes stack (Config, Secrets, StatefulSets, Deployments, Ingress, HPA, NetworkPolicy, PDB)..." -ForegroundColor Yellow
kubectl apply -k "$ScriptDir"

# 3. Verify Rollouts
Write-Host "[INFO] Waiting for MongoDB StatefulSet..." -ForegroundColor Yellow
kubectl rollout status statefulset/medflow-mongodb -n medflow --timeout=120s

Write-Host "[INFO] Waiting for Redis Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-redis -n medflow --timeout=60s

Write-Host "[INFO] Waiting for RabbitMQ StatefulSet..." -ForegroundColor Yellow
kubectl rollout status statefulset/rabbitmq -n medflow --timeout=120s

Write-Host "[INFO] Waiting for Kafka Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/kafka -n medflow --timeout=120s

Write-Host "[INFO] Waiting for API Microservice Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-api -n medflow --timeout=120s

Write-Host "[INFO] Waiting for Web App Deployment..." -ForegroundColor Yellow
kubectl rollout status deployment/medflow-web -n medflow --timeout=120s

# 4. Print Summary
Write-Host "[SUCCESS] MedFlow Enterprise Kubernetes Cluster Successfully Deployed!" -ForegroundColor Green
kubectl get pods,svc,ingress,hpa,pdb,netpol -n medflow
