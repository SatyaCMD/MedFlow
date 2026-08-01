# MediCore 360 (MedFlow EHMS)

<div align="center">

![MediCore 360 Banner](https://img.shields.io/badge/MediCore%20360-Enterprise%20EHMS-0052CC?style=for-the-badge&logo=hospital&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge&logo=github-actions)
![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)
![Express](https://img.shields.io/badge/Express-4.19-000000?style=for-the-badge&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Enabled-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Kubernetes](https://img.shields.io/badge/Kubernetes-EKS-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white)
![HIPAA](https://img.shields.io/badge/HIPAA-Compliant-008080?style=for-the-badge&logo=shield)

**Production-grade, multi-tenant Enterprise Hospital Management System (EHMS) structured as a clean-architecture monorepo with distinct frontend and backend services, fully integrated with a modern DevOps, DevSecOps, and secure authentication stack.**

[Architecture](#-complete-end-to-end-system-architecture) • [Role Portals](#-role-based-dashboards--demo-credentials) • [Getting Started](#-getting-started) • [Enterprise Stacks](#-enterprise-docker-infrastructure-stacks) • [Jenkins CI/CD](#-jenkins-cicd-integration-port-8080) • [Observability](#4-running-infrastructure--observability-stack-docker-compose)

</div>

---

## 📋 Table of Contents
- [🏗️ Complete End-to-End System Architecture](#-complete-end-to-end-system-architecture)
  - [🧩 System Component Breakdown](#-system-component-breakdown)
- [👑 Role-Based Dashboards & Demo Credentials](#-role-based-dashboards--demo-credentials)
- [🛡️ Secure Authentication System](#%EF%B8%8F-secure-authentication-system)
- [⚙️ DevOps & DevSecOps Stack Overview](#%EF%B8%8F-devops--devsecops-stack-overview)
- [🚀 Getting Started](#-getting-started)
  - [1. Prerequisites](#1-prerequisites)
  - [2. Install Dependencies](#2-install-dependencies)
  - [3. Choose How to Run the Application](#3-choose-how-to-run-the-application)
    - [💡 OPTION A: Full Docker Mode (Zero Configuration)](#-option-a-full-docker-mode-zero-configuration)
    - [💻 OPTION B: Mixed Mode (Databases in Docker + Code on Host)](#-option-b-mixed-mode-databases-in-docker--code-on-host)
- [🐳 Enterprise Docker Infrastructure Stacks](#-enterprise-docker-infrastructure-stacks)
- [🛠️ Workspace Command Summary](#%EF%B8%8F-workspace-command-summary)
- [🔗 Jenkins CI/CD Integration (Port 8080)](#-jenkins-cicd-integration-port-8080)
  - [1. Prerequisite Installations on Jenkins Host](#1-prerequisite-installations-on-jenkins-host)
  - [2. Configure Jenkins Pipeline Job](#2-configure-jenkins-pipeline-job)
  - [3. Pipeline & SonarQube Server Setup](#3-pipeline--sonarqube-server-setup-httplocalhost9000)
  - [4. Running Infrastructure & Observability Stack](#4-running-infrastructure--observability-stack-docker-compose)
  - [5. Grafana Setup](#5-grafana-setup-httplocalhost3005)
  - [6. Prometheus Verification](#6-prometheus-verification-httplocalhost9090)
  - [7. Mailpit Email Inspector](#7-mailpit-email-inspector-httplocalhost8025)
  - [8. Running Your Jenkins CI/CD Pipeline](#8-running-your-jenkins-cicd-pipeline)
- [⚡ How to Connect a Production Redis Instance](#-how-to-connect-a-production-redis-instance)
- [☁️ How to Use Terraform for AWS Cloud KYC Storage](#%EF%B8%8F-how-to-use-terraform-for-aws-cloud-kyc-storage-s3_kyc-tf)
- [🐛 Troubleshooting: Docker Compose Port 4000 Error](#-troubleshooting-docker-compose-port-4000-error)

---

## 🏗️ Complete End-to-End System Architecture

The project is structured as an enterprise-grade monorepo featuring a clean layered architecture, robust persistence mechanisms, and an automated DevOps & DevSecOps delivery pipeline:

```mermaid
graph TB
    subgraph Client ["💻 Frontend Client (apps/web)"]
        direction TB
        WebUI["Next.js App Router (TypeScript)"]
        Dashboards["Role Dashboards\n(SuperAdmin | HospitalAdmin | AmbulanceAdmin | Doctor | Nurse | Pharmacist | Patient)"]
        WebPages["Core Modules\n(Auth | Appointments | EMR | Billing | Patients | Settings)"]
        WebUI --> Dashboards
        WebUI --> WebPages
    end

    subgraph API ["⚡ RESTful Backend API (apps/api)"]
        direction TB
        ExpressAPI["Express.js API Engine"]
        
        subgraph Middlewares ["Middleware Layer"]
            AuthGuard["Argon2id + Salt + Pepper Guard"]
            RBAC["Role-Based Access Control"]
            RateLimit["Rate Limiter & Audit Logger"]
        end

        subgraph CoreModules ["Domain Services"]
            ModAuth["Auth & 2FA/OTP"]
            ModPatient["Patient & EMR"]
            ModAppt["Appointments"]
            ModBilling["Billing & Pharmacy"]
            ModLab["Lab & Inventory"]
            ModAI["AI & Messaging"]
            ModAudit["Audit & Staff"]
        end

        ExpressAPI --> Middlewares
        Middlewares --> CoreModules
    end

    subgraph SharedPkg ["📦 Monorepo Packages (packages/)"]
        SharedLib["packages/shared\n(Zod Schemas, Types, RBAC Constants)"]
        ConfigLib["packages/config\n(ESLint & TypeScript Presets)"]
    end

    subgraph DataServices ["🗄️ Persistence & Async Processing"]
        MongoDB[("MongoDB Primary DB\n(Patient Records, EMR, Invoices)")]
        Redis[("Redis In-Memory Store\n(Sessions, OTP Codes, Rate Limits)")]
        Mailpit["Mailpit / SMTP Server\n(Transactional Emails)"]
        BullMQ["BullMQ\n(Async Queue Processing)"]
    end

    subgraph DevOps ["🚀 Infrastructure, DevOps & Security Layer"]
        subgraph IaC ["Terraform Cloud Infra"]
            Terraform["AWS Terraform\n(EKS Cluster, VPC, ECR, IAM)"]
        end
        
        subgraph K8sStack ["Kubernetes & GitOps"]
            K8s["EKS Kubernetes Cluster"]
            Helm["Helm Charts"]
            ArgoCD["Argo CD (GitOps Delivery)"]
            NginxIngress["Nginx Ingress Controller"]
            NginxIngress --> K8s
            Helm --> K8s
            ArgoCD --> K8s
        end

        subgraph CICD ["Jenkins CI/CD & Security"]
            Jenkins["Jenkins Pipeline (Port 8080)"]
            SonarQube["SonarQube (Code Quality)"]
            Trivy["Trivy (Security Audit Scanner)"]
            Postman["Postman API Suite"]
            Jenkins --> SonarQube
            Jenkins --> Trivy
            Jenkins --> Postman
        end

        subgraph Monitoring ["Observability Stack"]
            Prometheus["Prometheus"]
            Grafana["Grafana Dashboards"]
            Prometheus --> Grafana
        end
    end

    %% Dependencies
    Client -. Shared Code .-> SharedLib
    API -. Shared Code .-> SharedLib
    Client -. Shared Config .-> ConfigLib
    API -. Shared Config .-> ConfigLib

    %% Network Flow
    Client -- "HTTP / REST API" --> ExpressAPI
    ExpressAPI --> MongoDB
    ExpressAPI --> Redis
    ExpressAPI --> Mailpit
    ExpressAPI --> BullMQ

    %% Infra Connections
    Terraform -. Provisions .-> K8sStack
    CICD -. Scans & Deploys .-> K8sStack
    Monitoring -. Scrapes Telemetry .-> API
    Monitoring -. Scrapes Metrics .-> K8sStack
```

### 🧩 System Component Breakdown

* **Frontend Web Application (`apps/web`)**: Next.js (App Router) with TypeScript, Tailwind CSS, Framer Motion, and Axios. Features role-tailored dashboards for SuperAdmins, HospitalAdmins, AmbulanceAdmins, Doctors, Nurses, Pharmacists, Lab Techs, Blood Bank, and Patients, plus dedicated pages for Appointments, EMR, Billing, Patients, Settings, and Auth flows.
* **Backend REST API (`apps/api`)**: Built with Express.js and TypeScript, following modular service-repository architecture. Implements domain services for Auth (Argon2id + Salt + Pepper + OTP), Patients, Appointments, EMR, Billing, Pharmacy, Inventory, Lab, Messaging, AI, and Auditing.
* **Shared Workspace Packages (`packages/`)**:
  * `packages/shared`: Shared Zod validation DTO schemas, TypeScript type declarations, and RBAC matrix constants.
  * `packages/config`: Common ESLint, Prettier, and TypeScript base presets.
* **Data & Persistence Layer**:
  * **MongoDB**: Primary NoSQL data store managed via Mongoose ODM for patient records, medical records, invoices, and system entities.
  * **Redis**: In-memory caching layer for user session management, 5-minute OTP code TTL, rate-limiting counters, and BullMQ queue backend.
  * **Mailpit / SMTP**: Captures transactional emails and OTP verification messages in development environments.
  * **BullMQ**: Asynchronous background worker queue for non-blocking operations.
* **DevOps & DevSecOps Infrastructure**:
  * **Terraform (`infra/terraform`)**: Infrastructure as Code (IaC) provisioning AWS cloud resources including VPC, subnets, EKS Kubernetes Cluster, ECR registries, and IAM roles.
  * **Kubernetes & Helm (`infra/k8s`, `infra/helm`)**: Production manifests and Helm chart releases for container orchestration with liveness/readiness probes, HPA (Horizontal Pod Autoscaler), and Nginx Ingress routing.
  * **Argo CD (`infra/argo`)**: GitOps continuous deployment controller reconciling cluster state with repository updates.
  * **Jenkins Pipeline (`Jenkinsfile`)**: CI/CD automation executing lint checks, SonarQube static code analysis, Trivy vulnerability scanning (repo & Docker image), and container builds.
  * **Monitoring (`infra/monitoring`)**: Integrated Prometheus metrics scraping and Grafana dashboard visualization for API performance, memory usage, and cluster health.
  * **Automated Testing (`tests/postman`)**: Postman API collection for automated integration testing across authentication and core endpoints.

---

## 👑 Role-Based Dashboards & Demo Credentials

MedFlow provides 8 specialized role portals out-of-the-box. Access any portal via `/login` with 1-click preset authentication:

| Role Portal | Demo User ID / Email | Password | Primary Key Capabilities & Scope |
| :--- | :--- | :--- | :--- |
| 👑 **Super Admin** | `SuperAdmin` | `Admin@321` | Multi-tenant governance, security audit logs, global EMR vault, enterprise settings |
| 🏢 **Hospital Admin** | `HospitalAdmin` | `Hospital@321` | Real-time facility bed census (88%), department analytics, staff roster scheduling |
| 🚨 **Ambulance Admin** | `AmbulanceAdmin` | `Ambulance@321` | Live GPS dispatch tracker map, emergency call queue, fleet telemetry & vehicle registration |
| 🩺 **Doctor / Physician** | `Dr. Anup Singh` | `Doctor@321` | Clinical OPD workstation, EMR patient charts, prescription studio & lab orders |
| ❤️ **Nurse & Caregiver** | `Sunita Patel` | `Caregiver@321` | Inpatient bed vitals log, triage queue, ward round management & care plans |
| 💊 **Pharmacist** | `Pharmacist Dispensary` | `Pharmacist@321` | Prescription fulfillment studio, drug inventory stock control & dispensing |
| 🧪 **Lab Technician** | `Rajesh Kumar` | `Technician@321` | Diagnostic pathology audits, specimen upload, lab report publishing |
| 🩸 **Blood Bank** | `Blood Bank Reserve` | `BloodBank@321` | Blood group stock reserves (A+, O-, etc.), donor registry & emergency supply matching |

---

## 🛡️ Secure Authentication System

The system implements a robust, industry-standard authentication flow:
1.  **Password Hashing (Argon2 + Dynamic Salt + Chili Pepper)**:
    *   **Argon2id**: Utilizes the secure Argon2 key derivation function.
    *   **Dynamic Salt**: Generates a cryptographically secure random 16-byte salt per user on registration.
    *   **Chili (Pepper)**: Uses a server-side high-entropy pepper (`APP_PEPPER`) configured in environment variables, protecting user passwords against database compromise.
2.  **Multi-Factor OTP Verification**:
    *   Generates a secure 6-digit verification code stored in **Redis** with a strict 5-minute time-to-live (TTL).
    *   Dispatches the code via **SMTP** to the user's email.
    *   Enforces single-use verification (invalidates OTP from Redis immediately upon use) and starts a secure 7-day session.

---

## ⚙️ DevOps & DevSecOps Stack Overview

A complete pipeline is provided to deploy and monitor the application securely:

*   **Docker**: Multi-stage production container configuration for lightweight images (`api.prod.Dockerfile`, `web.prod.Dockerfile`) and multi-container setups (`docker-compose.yml`, `docker-compose.dev.yml`).
*   **Redis**: Caches session records and tracks temporary verification states (OTP).
*   **SMTP (Mailpit)**: Captures transactional registration and authentication mails.
*   **Jenkins**: Automates the CI/CD pipeline, building images, auditing repositories, running quality checkers, and deploying using Helm (configured in `Jenkinsfile`).
*   **Postman**: Comprehensive integration testing suite for verifying endpoint validation logic and authentication states (located at [tests/postman](tests/postman)).
*   **SonarQube**: Automatically analyzes static code quality, checking for security vulnerabilities, hotspots, and code smells.
*   **Trivy**: DevSecOps scanner integrated into Jenkins pipeline stages to check dependency vulnerabilities (repo audit) and scan built Docker images for CVEs.
*   **Prometheus & Grafana**: Monitors application telemetry, API latency, and database connectivity.
*   **Helm**: Deploys the release components (Next.js, Express, databases) into Kubernetes namespaces.
*   **Kubernetes (K8s)**: Container orchestration configuration with resource specifications, readiness/liveness probes, and ingress ssl-redirect annotation settings.
*   **Argo CD**: Implements GitOps deployment mechanics, reconciling Helm chart configurations directly into the EKS production cluster.
*   **Terraform**: Provisions core cloud resources including VPC, routing tables, and the EKS Kubernetes cluster in AWS (located in [infra/terraform](infra/terraform)).

---

## 🚀 Getting Started

### 1. Prerequisites
Ensure you have the following installed on your machine:
*   [Node.js (v20+)](https://nodejs.org/)
*   [pnpm (v10+)](https://pnpm.io/)
*   [Docker Desktop](https://www.docker.com/)

### 2. Install Dependencies
Run this command from the root workspace directory to fetch and link all packages:
```bash
pnpm install
```

### 3. Choose How to Run the Application

You can run the entire MedFlow ecosystem using one of the two options below, depending on whether you want to run the application code inside Docker or directly on your host machine.

---

#### 💡 OPTION A: Full Docker Mode (Zero Configuration)
Use this option if you want to run all databases (MongoDB, Redis), SMTP mock server (Mailpit), the Express backend, and the Next.js frontend together inside Docker containers.

1. **Stop conflicting local services** on your machine (e.g., if you have native MongoDB, Redis, or Mailpit running).
2. **Start the containers** from the root workspace directory:
   ```bash
   docker compose -f docker-compose.dev.yml up -d
   ```
3. **Verify the running services**:
   *   **Frontend UI (Next.js)**: [http://localhost:3000](http://localhost:3000)
   *   **Backend API (Express)**: [http://localhost:4000/ready](http://localhost:4000/ready) (use this to check system health)
   *   **Mailbox UI (Mailpit)**: [http://localhost:8026](http://localhost:8026) (this catches OTP emails for login)

---

#### 💻 OPTION B: Mixed Mode (Databases in Docker + Code on Host)
This is the recommended method for active development. Databases and the Mail service run in Docker, while the Express API and Next.js Frontend run directly on your host machine for instant hot-reloading and debug visibility.

1. **Start backing databases and services in Docker**:
   ```bash
   docker compose -f docker-compose.dev.yml up -d mongo redis mailpit
   ```
2. **Ensure dependencies are installed and built**:
   ```bash
   pnpm install
   pnpm run build
   ```
3. **Launch the backend and frontend dev servers concurrently**:
   ```bash
   pnpm run dev
   ```
   *Note: This command runs the Express API on port `4000` and the Next.js Web Frontend on port `3000` concurrently.*
4. **Access the application URLs**:
   *   **Frontend App**: [http://localhost:3000](http://localhost:3000)
   *   **Backend API**: [http://localhost:4000](http://localhost:4000)
   *   **Mailpit Webbox**: [http://localhost:8026](http://localhost:8026) (to fetch verification OTP codes)

---

### 🐳 Enterprise Docker Infrastructure Stacks

| Docker Stack File | Services Included | Key Ports | Usage Command |
| :--- | :--- | :--- | :--- |
| `docker-compose.prod.yml` | Nginx, API, Web, Mongo, Redis, Mailpit | `80`, `443`, `4000`, `3000` | `docker compose -f docker-compose.prod.yml up -d` |
| `docker-compose.monitoring.yml` | Prometheus, Grafana, Node Exporter, Redis Exporter | `9090`, `3001`, `9100`, `9121` | `docker compose -f docker-compose.monitoring.yml up -d` |
| `docker-compose.ci.yml` | Jenkins CI/CD, SonarQube, Sonar PostgreSQL DB | `8080`, `9000`, `50000` | `docker compose -f docker-compose.ci.yml up -d` |
| `docker-compose.security.yml` | Trivy CVE Scanner, OWASP Dependency-Check | Automated Scans | `docker compose -f docker-compose.security.yml run trivy-scanner` |

---

## 🛠️ Workspace Command Summary

Run these scripts from the monorepo root:
*   `pnpm run dev`: Spin up all services concurrently on the host.
*   `pnpm run build`: Compile and build all workspaces.
*   `pnpm run lint`: Execute ESLint checks across all directories.
*   `pnpm run typecheck`: Verify TypeScript compilations.
*   `pnpm run format`: Format all codebase files using Prettier rules.

---

## 🔗 Jenkins CI/CD Integration (Port 8080)

The repository includes a production-grade `Jenkinsfile` pipeline that automatically automates your build, dependency audits, static code analysis (SonarQube), dependency security scanning (Trivy), Docker containerization, and Helm chart deployment configurations.

To connect your project to a Jenkins server running on **port 8080**:

### 1. Prerequisite Installations on Jenkins Host
Ensure the following tools are installed and configured on your machine:
*   **Docker Engine / Docker Desktop**: Required to build and package production-ready images.
*   **Helm CLI**: Kubernetes Package Manager CLI.
    * Install on Windows via PowerShell:
      ```powershell
      winget install Helm.Helm
      ```
    * Verify installation: `helm version`
*   **Trivy Security Scanner**: Vulnerability & secret scanner for filesystem and container layers.
    * Install on Windows via PowerShell:
      ```powershell
      winget install AquaSecurity.Trivy
      ```
    * Verify installation: `trivy --version`

### 2. Configure Jenkins Pipeline Job
1. Open your Jenkins console at [http://localhost:8080](http://localhost:8080).
2. Click **New Item** on the top-left sidebar.
3. Enter `MediCore360` in the name box, select **Pipeline**, and click **OK**.
4. Scroll down to the **Pipeline** configuration panel:
   * **Definition**: Choose `Pipeline script from SCM` from the dropdown.
   * **SCM**: Select `Git`.
   * **Repository URL**: Enter the GitHub repository URL:
     `https://github.com/SatyaCMD/MedFlow.git`
   * **Branch Specifier**: Enter `*/main` (or the branch you are actively developing on).
   * **Script Path**: Verify it is set to `Jenkinsfile`.
5. Click **Save**.

### 3. Pipeline & SonarQube Server Setup (http://localhost:9000)

#### A. Configure SonarQube Project:
1. Open your SonarQube dashboard at [http://localhost:9000](http://localhost:9000) (Log in with `admin` / `admin`).
2. On the screen **"How do you want to create your project?"**, click **Create a local project** at the bottom.
3. Fill in the project parameters:
   * **Project Display Name**: `MedFlow`
   * **Project Key**: `MedFlow` *(matches `sonar.projectKey` in `sonar-project.properties`)*
   * **Main branch name**: `main`
4. Click **Next** $\rightarrow$ select **Use global setting** $\rightarrow$ click **Create project**.
5. Under **How do you want to analyze your repository?**, select **Locally** (or **With Jenkins**).
6. Enter a Token Name (e.g. `jenkins-scanner-token`) $\rightarrow$ click **Generate** $\rightarrow$ Copy the generated token string (`sqp_...`).

#### B. Configure SonarQube Scanner in Jenkins:
1. Go to your Jenkins console at [http://localhost:8080](http://localhost:8080).
2. Go to **Manage Jenkins** $\rightarrow$ **System** $\rightarrow$ Scroll to **SonarQube servers**.
3. Click **Add SonarQube**, set:
   * **Name**: `SonarQubeServer`
   * **Server URL**: `http://127.0.0.1:9000`
   * **Server authentication token**: Add Secret Text credential with your generated token `sqp_...`.
4. Go to **Manage Jenkins** $\rightarrow$ **Tools** $\rightarrow$ Scroll to **SonarQube Scanner** installations.
5. Click **Add SonarQube Scanner**, set the name to `SonarScanner`, enable **Install automatically**, select version `SonarQube Scanner 8.1.0.6389`, and click **Save**.

### 4. Running Infrastructure & Observability Stack (Docker Compose)

To launch your backend databases, monitoring (Prometheus & Grafana), Mailpit, and SonarQube quality scanner:

```powershell
docker compose -f docker-compose.backend.yml up -d mongo redis mailpit prometheus grafana sonarqube
```

| Service | Access URL | Default Credentials |
| :--- | :--- | :--- |
| **MedFlow Web App** | [http://localhost:3000](http://localhost:3000) | Workstation Login |
| **Jenkins CI/CD** | [http://localhost:8080](http://localhost:8080) | Local Windows Jenkins |
| **Prometheus Telemetry** | [http://localhost:9090](http://localhost:9090) | Public Metrics Scraper |
| **Grafana Dashboards** | [http://localhost:3005](http://localhost:3005) | User: `admin` \| Pass: `admin` |
| **SonarQube Scanner** | [http://localhost:9000](http://localhost:9000) | User: `admin` \| Pass: `admin` |
| **Mailpit SMTP Portal** | [http://localhost:8025](http://localhost:8025) | Web Mail Inspector |

### 5. Grafana Setup (http://localhost:3005)

#### A. Add Prometheus Data Source:
1. Open Grafana at [http://localhost:3005](http://localhost:3005) (Default login: `admin` / `admin`).
2. Click **Connections** $\rightarrow$ **Data Sources** on the left menu.
3. Click **Add data source** and select **Prometheus**.
4. In the **Prometheus server URL** field, enter: `http://medflow-prometheus:9090`.
5. Scroll down to the bottom and click **Save & test**. You will see a green badge: **"Data source is working"**.

#### B. Import the MedFlow Telemetry Dashboard:
1. In Grafana, click the **`+`** icon at the top right $\rightarrow$ select **Import dashboard**.
2. Click **Upload dashboard JSON file**.
3. Browse and select the file from your workspace: `infra/monitoring/medflow-dashboard.json`.
4. **Crucial Step**: At the bottom dropdown under **Prometheus**, select your **Prometheus** data source (instead of leaving it default).
5. Click **Import**.
6. *(If panels show "No data", click **Dashboard Settings** ⚙ at top right $\rightarrow$ select your **Prometheus** data source $\rightarrow$ click **Save**).*
7. You will now see live color graphs for **HTTP Request Volume**, **p95 Response Latencies**, **Success vs Errors**, and **Process Memory & CPU Usage**!

### 6. Prometheus Verification (http://localhost:9090)
1. Open Prometheus at [http://localhost:9090](http://localhost:9090).
2. Click **Status** on the top menu bar $\rightarrow$ select **Targets**.
3. You will see your active scrape targets (`prometheus` and `medflow-api`) with state **UP**.
4. To test a metric query:
   * In the search bar, type `up` and click **Execute**. It will return `1` indicating services are healthy.

### 7. Mailpit Email Inspector (http://localhost:8025)
1. Open Mailpit at [http://localhost:8025](http://localhost:8025).
2. This is your local SMTP mail server. Whenever you log in or request a 6-digit OTP code in MedFlow, the email will appear instantly in this inbox for verification testing.

### 8. Running Your Jenkins CI/CD Pipeline

Now that Helm, Trivy, Docker, Prometheus, and Grafana are ready, trigger your pipeline:

#### Step 1: Push latest code to GitHub
Run the following commands in your PowerShell terminal:
```powershell
git add .
git commit -m "ci(jenkins): finalize pipeline stages, telemetry metrics, and devsecops tools"
git push origin main
```

#### Step 2: Run Pipeline in Jenkins
1. Open Jenkins at [http://localhost:8080](http://localhost:8080).
2. Click your **MediCore360** project.
3. Click **Build Now** on the left menu.
4. All pipeline stages (**Checkout**, **Dependencies**, **Lint**, **Build**, **SonarQube**, **Trivy**, **Docker**, **Trivy Container**, **Helm Deployment**, and **Prometheus/Grafana Monitoring**) will run smoothly!

---

## ⚡ How to Connect a Production Redis Instance

To switch from local Redis (`redis://localhost:6380`) to **Production Redis**, update line 10 in your `.env` file with your production Redis connection URI.

Here are the 3 standard options depending on your cloud provider:

### Option 1: Upstash Serverless Redis (Recommended & Easiest)
Upstash provides a free, serverless Cloud Redis with TLS encryption:
1. Create a free database at [upstash.com](https://upstash.com).
2. Copy your connection string and paste it into your `.env` file:
   ```env
   REDIS_URI=rediss://default:YOUR_UPSTASH_PASSWORD@your-db-name.upstash.io:6379
   ```
   *Note the `rediss://` protocol (with double `s`) which enables TLS/SSL encryption for cloud connections.*

### Option 2: Redis Cloud / Redis Labs
If using Redis Cloud (Redis Enterprise):
1. Create a free database at [redis.com/try-free](https://redis.com/try-free).
2. Copy your endpoint host, port, and password.
3. Update `.env`:
   ```env
   REDIS_URI=redis://default:YOUR_REDIS_CLOUD_PASSWORD@redis-12345.c1.cloud.redislabs.com:12345
   ```

### Option 3: Managed Production Server / AWS ElastiCache / Azure Cache
If deploying Redis on your cloud server with a password:
```env
REDIS_URI=redis://:YOUR_SECURE_PASSWORD@your-production-server-ip:6379
```

### How MedFlow API Handles Production Redis Automatically:
MedFlow's backend driver in `apps/api/src/lib/redis.ts` uses `ioredis`. As soon as you paste your production `REDIS_URI` into `.env`, `ioredis` automatically:
* Handles SSL/TLS encryption (`rediss://`)
* Authenticates cloud passwords
* Manages connection retry strategies
* Executes all session lockouts, failed login counters, and OTP caching in production!

---

## ☁️ How to Use Terraform for AWS Cloud KYC Storage (`s3_kyc.tf`)

We created `infra/terraform/s3_kyc.tf` which provisions a HIPAA-compliant AWS S3 Bucket (`medflow-kyc-documents-production`) with KMS Server-Side Encryption and IAM upload policies.

### How to Run Terraform:
```bash
# 1. Navigate to terraform directory
cd infra/terraform

# 2. Initialize AWS providers
terraform init

# 3. Preview AWS infrastructure plan
terraform plan

# 4. Deploy to AWS Cloud
terraform apply
```

---

## 🐛 Troubleshooting: Docker Compose Port 4000 Error

### Why It Happened:
Port `4000` is occupied because `pnpm dev` (the local Express API process) is running on your host machine in your terminal. Docker Compose tries to bind container port `4000` to host port `4000`, causing Windows socket bind error `bind: Only one usage of each socket address is normally permitted`.

### Solution:

* **Option A (If running dev server locally via `pnpm dev`)**: Start database containers in Docker without the duplicate API container:
  ```bash
  docker compose -f docker-compose.dev.yml up -d mongo redis mailpit
  ```

---

## 💳 Patient Portal, Digital Wallet & Ongoing Diagnosis Protocol

<div align="center">

![Patient Portal](https://img.shields.io/badge/Patient%20Portal-Active-0052CC?style=for-the-badge&logo=shield)
![Digital Wallet](https://img.shields.io/badge/Digital%20Wallet-Auto--Refund-10B981?style=for-the-badge&logo=wallet)
![Follow Up Discount](https://img.shields.io/badge/Follow--Up-50%25--75%25%20Discount-EF4444?style=for-the-badge&logo=tag)

</div>

### 1. Patient Digital Wallet & Payment Gateway Redemption

> [!TIP]
> **Green Protection Tier — Instant Wallet Redemption & Guarantee**
> - **Wallet Redemption at Checkout**: Patients can redeem funds directly from their **Patient Digital Wallet** inside the Checkout Payment Gateway (`PaymentModal`).
> - **100% Covered Checkout**: If wallet balance covers the total bill, the transaction is processed instantly without needing external cards or UPI.
> - **Partial Wallet Redemption**: If the bill exceeds the wallet balance, wallet funds are applied as a credit discount, allowing the remaining balance to be paid via Razorpay UPI or Stripe Card.

---

### 2. 3-Day Doctor Approval Expiration & Auto-Refund Guarantee

> [!WARNING]
> **Red Critical Alert — 3-Day Auto-Refund Rule**
> - **Automatic Expiry**: When a patient books and pays for a consultation, it is assigned `PENDING DOCTOR APPROVAL`.
> - **72-Hour Expiration Window**: If the doctor does not approve the appointment request within **3 Days (72 Hours)**, the system automatically marks the appointment as `EXPIRED & REFUNDED`.
> - **Instant Wallet Credit**: The paid consultation fee (e.g. ₹1,500) is credited back into the patient's **Digital Wallet**, generating an audit log and real-time toast notification.

---

### 3. Dedicated "Ongoing Diagnosis" Tab & Follow-Up Visit Discounts

> [!NOTE]
> **Blue Information Tier — Dedicated Ongoing Evaluation Workstation**
> - **Dedicated Ongoing Diagnosis Tab**: Active diagnoses and pending lab tests are displayed in a dedicated tab (`Ongoing Diagnosis`) alongside Medical History.
> - **Completed Medical Vault**: In the `Medical & Prescription History` tab, all records are archived as completed with dual download buttons:
>   - **`[Download Prescription PDF 📜]`**: Generates encrypted digital prescription PDF.
>   - **`[Download Lab Report PDF 🧪]`**: Generates NABL-certified pathology report PDF.
> - **50% to 75% Follow-Up Visit Discount**: When booking a 2nd/follow-up consultation for the same ongoing diagnosis with test reports, patients receive a **50% to 75% fee discount** (e.g. ₹1,500 initial fee → ₹600 follow-up fee).

---

### 4. Layout Architecture & Fixed Sidebar Guarantee

> [!IMPORTANT]
> **Blue Architectural Rule — Fixed Workstation Layout**
> - **Non-Scrolling Sidebar**: Side menu navigation in `AppShell` uses `sticky top-0 h-screen overflow-y-auto` layout architecture.
> - **Independent Main Scroll**: Page content scrolls independently inside the main workspace container (`main`), preventing sidebar displacement while scrolling.

