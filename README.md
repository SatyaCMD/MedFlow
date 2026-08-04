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
<!-- - [💳 Patient Portal, Digital Wallet & Ongoing Diagnosis Protocol](#-patient-portal-digital-wallet--ongoing-diagnosis-protocol) -->

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

> [!NOTE]
> **Blue Architecture Logic — Layered Domain Decoupling**
> - **Frontend Application (`apps/web`)**: Built on Next.js 14 App Router, dynamic `useAuth` hook profile resolution, and Framer Motion micro-interactions.
> - **Backend API Engine (`apps/api`)**: Modular Express.js service-repository layout enforcing RBAC, rate-limiting, and SHA-256 clinical audit trails.

> [!TIP]
> **Green Component Best Practice — Shared Monorepo DTOs**
> - **`packages/shared`**: Centralizes Zod DTO validation schemas, type definitions, and permission matrices so frontend and backend remain strictly synchronized.
> - **`packages/config`**: Standardizes ESLint, Prettier, and TypeScript compilation targets.

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

> [!IMPORTANT]
> **Cryptographic Security Logic — Argon2id + Salt + Pepper**
> - **Argon2id Key Derivation**: High-memory, time-cost password hashing.
> - **Dynamic 16-Byte Salt**: Cryptographically generated per user registration to eliminate rainbow table vectors.
> - **Server-Side Chili Pepper**: High-entropy `APP_PEPPER` secret key prevents password leaks even during database exposure.

> [!WARNING]
> **Red Security Alert — 5-Minute OTP Verification TTL**
> - **Redis TTL Invalidation**: 6-digit OTP verification codes expire after **5 minutes (300 seconds)** in Redis.
> - **Single-Use Verification**: Tokens are deleted from Redis upon single successful use to prevent replay attacks.

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

> [!NOTE]
> **Blue DevSecOps Protocol — Continuous Quality & Vulnerability Auditing**
> - **Static Code Analysis**: SonarQube scans TypeScript code quality, hotspots, and code smells on `http://localhost:9000`.
> - **CVE Container Auditing**: Trivy scans filesystem dependencies and Docker container layers before pushing to registry.

> [!TIP]
> **Green Telemetry Protocol — Prometheus & Grafana Observability**
> - **Metrics Scraper**: Prometheus scrapes API response latencies, memory footprint, and HTTP request counters on port `9090`.
> - **Visual Telemetry**: Grafana renders real-time color charts and SLA uptime metrics on port `3005`.

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

> [!IMPORTANT]
> **Prerequisites Checklist**
> - Ensure **Node.js (v20+)**, **pnpm (v10+)**, and **Docker Desktop** are installed and running on host machine.

### 2. Install Dependencies
Run this command from the root workspace directory to fetch and link all packages:
```bash
pnpm install
```

### 3. Choose How to Run the Application

---

#### 💡 OPTION A: Full Docker Mode (Zero Configuration)

> [!WARNING]
> **Red Port Binding Conflict Notice**
> - Before starting Full Docker Mode, ensure no local Express API or Next.js app is occupying port `4000` or `3000`.

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

> [!TIP]
> **Recommended Developer Workflow**
> - Mixed Mode provides hot-reloading for code edits while running backing databases (MongoDB, Redis, Mailpit) isolated in Docker.

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

> [!NOTE]
> **Blue Jenkins Pipeline Architecture & Execution Logic**
> - **Stage 1 (Checkout)**: Clones latest code from `main` branch.
> - **Stage 2 (Install & Audit)**: Restores workspace dependencies via `pnpm install` and runs ESLint static code audits.
> - **Stage 3 (SonarQube Analysis)**: Dispatches code metrics to SonarQube Server (`http://localhost:9000`) and waits for Quality Gate approval.
> - **Stage 4 (Trivy Security Gate)**: Scans monorepo dependencies for vulnerabilities (`trivy fs`).
> - **Stage 5 (Container Build)**: Constructs production multi-stage Docker images for API and Web.
> - **Stage 6 (Container Scan)**: Scans generated Docker image layers for CVEs (`trivy image`).
> - **Stage 7 (Helm Release)**: Deploys Helm chart releases into Kubernetes EKS cluster.

> [!IMPORTANT]
> **Important SonarQube Token Setup**
> - Generate a token string (`sqp_...`) in SonarQube (`http://localhost:9000`).
> - Add credential in Jenkins (`http://localhost:8080` $\rightarrow$ Manage Jenkins $\rightarrow$ System $\rightarrow$ SonarQube servers) as Secret Text.

> [!TIP]
> **Trivy Vulnerability Threshold Tip**
> - Trivy automatically halts pipeline deployment if any `HIGH` or `CRITICAL` vulnerability severity is detected in container layers.

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

> [!TIP]
> **Green Upstash Cloud Redis Protocol**
> - **TLS Double-S Protocol**: When connecting to Upstash, use `rediss://` (with double `s`) to enable TLS encryption.
> - **Connection String**: `REDIS_URI=rediss://default:PASSWORD@your-db.upstash.io:6379`.

> [!IMPORTANT]
> **Production Driver Capabilities (`ioredis`)**
> - MedFlow's backend driver in `apps/api/src/lib/redis.ts` uses `ioredis`, which automatically handles SSL/TLS authentication, retry strategies, 5-min OTP TTL, and session management.

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
> [!WARNING]
> **Host Socket Error Diagnosis**
> - Port `4000` is occupied because `pnpm dev` is running on host machine. Start databases in Docker without duplicate API containers:
>   ```bash
>   docker compose -f docker-compose.dev.yml up -d mongo redis mailpit
>   ```

---

## 🚀 High-Throughput Production Execution Guide (Scaling to Millions/Billions of Requests)

<div align="center">

![PM2 Cluster](https://img.shields.io/badge/PM2-Cluster%20Mode-2B037A?style=for-the-badge&logo=pm2)
![NGINX LB](https://img.shields.io/badge/NGINX-Load%20Balancer-009639?style=for-the-badge&logo=nginx)
![Redis Sentinel](https://img.shields.io/badge/Redis-Cache%20Aside-DC382D?style=for-the-badge&logo=redis)
![BullMQ](https://img.shields.io/badge/BullMQ-Async%20Workers-FF4500?style=for-the-badge&logo=redis)
![k6 Load Test](https://img.shields.io/badge/k6-Headless%20Load%20Test-7D64FF?style=for-the-badge&logo=k6)

</div>

To run **MedFlow** in production so it can handle **millions/billions of requests** with high availability and sub-50ms latency, follow these step-by-step execution instructions:

---

### 📊 Enterprise Scaling Architecture Flow

```mermaid
flowchart TD
    Client["Client Requests / Web Dashboard / Mobile"] --> ALB["AWS ALB / NGINX Load Balancer"]
    
    subgraph ComputeLayer ["Horizontal Container / Cluster Layer"]
        ALB --> WorkerNode1["Node.js API Container - Process 1..N"]
        ALB --> WorkerNode2["Node.js API Container - Process 1..N"]
        ALB --> WorkerNode3["Node.js API Container - Process 1..N"]
    end

    subgraph DataCachingLayer ["Data & Caching Layer"]
        WorkerNode1 <-->|Read/Write Cache| RedisCluster[("Redis Sentinel / Cluster")]
        WorkerNode1 <-->|Read Secondary / Write Primary| MongoReplica[("MongoDB Replica Set")]
        WorkerNode2 <--> RedisCluster
        WorkerNode2 <--> MongoReplica
        WorkerNode3 <--> RedisCluster
        WorkerNode3 <--> MongoReplica
    end

    subgraph AsyncProcessingLayer ["Async Processing Layer"]
        WorkerNode1 -->|Enqueue PDF / Email / S3 Jobs| BullMQ["BullMQ Job Queues (Redis-backed)"]
        WorkerNode2 -->|Enqueue Jobs| BullMQ
        BullMQ --> WorkerPool1["Background Worker Service 1"]
        BullMQ --> WorkerPool2["Background Worker Service 2"]
        
        WorkerPool1 --> AWS_S3["AWS S3 Bucket"]
        WorkerPool1 --> SMTP["SMTP / AWS SES Email"]
        WorkerPool1 --> PDF["PDFKit Engine"]
    end
```

---

### ⚡ Step-by-Step Operational Execution Guide

#### STEP 1: Build All Workspace Packages
Before launching cluster processes, compile TypeScript across all workspace packages and applications:

```bash
pnpm run build
```

---

#### STEP 2: Launch Infrastructure (MongoDB + Redis + NGINX)
Spin up high-performance database and caching containers using [`docker-compose.prod.yml`](./docker-compose.prod.yml):

```bash
docker-compose -f docker-compose.prod.yml up -d mongo redis mailpit
```

> [!IMPORTANT]
> **MongoDB Replica Set Verification**
> - Ensure your MongoDB connection URI points to a replica set (`replicaSet=rs0`) so read queries are automatically offloaded to secondary nodes (`readPreference=secondaryPreferred`).

---

#### STEP 3: Launch Multi-Core / Multi-Container Scaled API

Choose **Option A** (Docker Multi-Container) or **Option B** (PM2 Bare-Metal/VM Cluster Mode):

##### 🚀 Option A: Docker Production Scaling (Cloud Containers / K8s)
Scale the API to 4+ parallel container instances behind the NGINX Reverse Proxy:

```bash
# Spin up 4 API container replicas dynamically
docker-compose -f docker-compose.prod.yml up -d --scale api=4 --build

# Verify running containers
docker-compose -f docker-compose.prod.yml ps
```

##### ⚡ Option B: PM2 Cluster Mode (Bare-Metal / AWS EC2 VMs)
Use PM2 to spawn 1 worker per CPU core on your server host using [`ecosystem.config.cjs`](./ecosystem.config.cjs):

```bash
# Start PM2 in cluster mode (auto-detects all available CPU cores)
npx pm2 start ecosystem.config.cjs

# Check cluster status and live resource usage
npx pm2 status
npx pm2 monit
```

---

#### STEP 4: Run Dedicated Background Queue Workers (BullMQ)
To keep API response times **< 50ms**, heavy synchronous tasks (PDF prescription rendering, AWS S3 uploads, SMTP email dispatching) are offloaded to BullMQ background workers:

```bash
# Start BullMQ worker processes separately from API HTTP instances
NODE_ENV=production node apps/api/dist/workers/prescriptionWorker.js
```

> [!TIP]
> **Worker Process Isolation**
> - Running background queue workers as independent processes ensures CPU rendering spikes never degrade HTTP API request latency.

---

#### STEP 5: Verify High-Throughput Setup with k6 Load Testing

Run headless distributed load testing using the k6 script ([`tests/load/api-load-test.js`](./tests/load/api-load-test.js)):

1. **Install k6 (if not already installed):**
   - **Windows (winget):** `winget install k6`
   - **macOS:** `brew install k6`
   - **Linux:** `sudo apt-get install k6`

2. **Execute high-concurrency load test (2,000+ Virtual Users / ~20,000 requests/sec):**
   ```bash
   k6 run tests/load/api-load-test.js
   ```

**Target Threshold Benchmark Results:**
- `http_req_duration (p95)`: **< 50ms**
- `http_req_failed`: **< 0.01%**

---

#### STEP 6: Real-Time Operational Monitoring

Monitor server health, connection pools, and memory footprint during peak traffic:

```bash
# Docker Container Resource Usage (CPU, Memory, Network I/O)
docker stats

# PM2 Real-Time Process Monitor
npx pm2 monit

# Tail live application logs
npx pm2 logs medflow-api
```

---

### 🎯 Summary Performance & Scaling Matrix

| Phase | Milestone | Tools / Technology | Target Metric / SLA |
| :--- | :--- | :--- | :--- |
| **Phase 1** | Node.js Cluster + NGINX LB | PM2, Docker Compose (`deploy.replicas`), NGINX | 100% CPU core utilization across nodes |
| **Phase 2** | DB Compound Indexes & Redis Caching | MongoDB Indexing, Redis Cache-Aside | Database query time < 10ms |
| **Phase 3** | Offload PDF, S3, SMTP to Workers | BullMQ, Redis Queues, Isolated Worker Process | API HTTP response time < 50ms |
| **Phase 4** | Headless Cloud Load Testing | k6, Newman, Grafana Dashboard | Zero request drops at 10,000+ RPS |

