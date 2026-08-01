# Kubernetes Infrastructure, GitOps & CI/CD Deployment Architecture

This document defines the production Kubernetes topology, Helm chart structure, ArgoCD GitOps continuous deployment pipeline, and disaster recovery specifications for **MedFlow**.

---

## 1. Kubernetes Production Cluster Topology

MedFlow is deployed into a multi-tenant, high-availability Kubernetes cluster configured with NGINX Ingress, Horizontal Pod Autoscalers (HPA), and isolated namespaces.

```mermaid
flowchart TD
    subgraph Internet
        DNS["Route53 / Cloudflare DNS"]
    end

    subgraph EdgeIngress ["Kubernetes Ingress Layer"]
        NGINXIngress["NGINX Ingress Controller Pods\n(SSL Termination, Rate Limiting, TLS cert-manager)"]
    end

    subgraph AppNamespace ["Namespace: medflow-prod"]
        subgraph WebTier ["Web Application Layer"]
            WebPods["MedFlow Next.js Pods\n(Replicas: 3, HPA Target: 70% CPU)"]
        end

        subgraph APITier ["Backend API Layer"]
            APIPods["MedFlow Express API Pods\n(Replicas: 4, HPA Target: 75% CPU)"]
            WorkerPods["Outbox Worker Pods\n(Replicas: 2, CDC Poller)"]
        end
    end

    subgraph InfrastructureNamespace ["Namespace: medflow-infra"]
        RedisCluster[("Redis Sentinel Cluster\n(Cache & Session Store)")]
        KafkaCluster[["Apache Kafka Event Broker\n(3-Node Cluster)"]]
        RabbitMQCluster[["RabbitMQ Queue Broker\n(2-Node Cluster)"]]
        MongoCluster[("MongoDB Replica Set\n(Primary + 2 Secondaries)")]
    end

    DNS --> NGINXIngress
    NGINXIngress -->|Path: /| WebPods
    NGINXIngress -->|Path: /api/v1| APIPods
    
    APIPods --> RedisCluster
    APIPods --> MongoCluster
    WorkerPods --> MongoCluster
    WorkerPods --> KafkaCluster
    WorkerPods --> RabbitMQCluster
```

---

## 2. GitOps Continuous Deployment Pipeline (ArgoCD & Helm)

MedFlow follows a declarative GitOps workflow. Any commit pushed to `main` triggers automated container building, security scanning, Helm chart updates, and ArgoCD synchronization.

```mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer / SRE
    participant GitHub as GitHub Monorepo (`main`)
    participant GHA as GitHub Actions Runner
    participant Registry as GHCR / Docker Hub
    participant Argo as ArgoCD Controller
    participant K8s as Production K8s Cluster

    Dev->>GitHub: Push Release Tag (`v1.4.0`) / Merge PR
    
    par CI Build & Scan Phase
        GitHub->>GHA: Trigger `.github/workflows/ci.yml`
        GHA->>GHA: Run Unit Tests & ESLint
        GHA->>GHA: SonarQube Code Quality & Vulnerability Gate
        GHA->>Registry: Build & Push Docker Image (`medflow-api:v1.4.0`)
    end

    GHA->>GitHub: Update `infra/helm/medflow/values.yaml` image.tag -> `v1.4.0`

    par GitOps Sync Phase
        Argo->>GitHub: Poll Git Repository for Helm Chart Changes (Every 3m)
        GitHub-->>Argo: Out-of-Sync Detected (`v1.4.0` != Active Cluster State)
        Argo->>K8s: Apply Helm Manifests (Rolling Update Strategy)
        K8s->>K8s: Spin Up New Pods -> Health Probes Pass -> Terminate Old Pods
        Argo-->>Dev: Deployment Status Sync Complete (Slack / Teams Notification)
    end
```

---

## 3. High-Availability Failover & Disaster Recovery (DR)

MedFlow maintains strict RTO (Recovery Time Objective) and RPO (Recovery Point Objective) metrics.

```mermaid
flowchart LR
    subgraph PrimaryRegion ["Primary Region (us-east-1)"]
        K8sPrimary["K8s Cluster (Active)"]
        MongoPrimary[("MongoDB Primary")]
    end

    subgraph SecondaryRegion ["DR Region (us-west-2)"]
        K8sDR["K8s Standby Cluster (Passive)"]
        MongoDR[("MongoDB Secondary (Cross-Region Async Sync)")]
    end

    subgraph HealthChecker ["Global Traffic Manager"]
        Route53["AWS Route53 Health Checks"]
    end

    K8sPrimary --> PrimaryRegion
    Route53 -->|Healthy| K8sPrimary
    Route53 -.->|Failover on Primary Outage| K8sDR
    MongoPrimary -.->|"Async Replication (Sub-Second Lag)"| MongoDR
```

### Reliability Targets:
* **Recovery Time Objective (RTO)**: `< 15 minutes` (Automated DNS failover).
* **Recovery Point Objective (RPO)**: `< 1 minute` (Continuous Mongo Write-Ahead Log replication).
* **Pod Disruption Budgets (PDB)**: `minAvailable: 2` across API and Web deployments.
* **Auto-Scaling Criteria**: HPA triggers scale-out when CPU exceeds 70% or memory exceeds 80% over a 3-minute window.
