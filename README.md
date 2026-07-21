# MediCore 360 (MedFlow EHMS)

Production-grade, multi-tenant Enterprise Hospital Management System (EHMS) structured as a clean-architecture monorepo with distinct frontend and backend services, fully integrated with a modern DevOps, DevSecOps, and secure authentication stack.

---

## 🏗️ System Architecture & Workspace Separation

The codebase is split into isolated apps and packages under a unified monorepo manager:

```mermaid
graph TD
    subgraph Apps (Services)
        Web["apps/web (Next.js Frontend)"]
        API["apps/api (Express Backend)"]
    end
    subgraph Packages (Shared Libraries)
        Shared["packages/shared (Types, Schemas, RBAC constants)"]
        Config["packages/config (ESLint & TS Base Presets)"]
    end

    Web --> Shared
    API --> Shared
    Web --> Config
    API --> Config
```

*   **Separate Backend (`apps/api`)**: Built with Express.js, TypeScript, Mongoose, Redis, Nodemailer, and BullMQ. Serves a RESTful JSON API on port `4000`.
*   **Separate Frontend (`apps/web`)**: Built with Next.js (App Router), TypeScript, Tailwind CSS, Axios, and Framer Motion. Serves the user interface on port `3000`.
*   **Shared Code (`packages/shared`)**: Houses strict compile-time types, Zod DTO schemas, and RBAC permission models shared between frontend client and backend API.

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
*   **Postman**: Comprehensive integration testing suite for verifying endpoint validation logic and authentication states (located at [tests/postman](file:///c:/Users/SATYA/OneDrive/Desktop/MedFlow/tests/postman)).
*   **SonarQube**: Automatically analyzes static code quality, checking for security vulnerabilities, hotspots, and code smells.
*   **Trivy**: DevSecOps scanner integrated into Jenkins pipeline stages to check dependency vulnerabilities (repo audit) and scan built Docker images for CVEs.
*   **Prometheus & Grafana**: Monitors application telemetry, API latency, and database connectivity.
*   **Helm**: Deploys the release components (Next.js, Express, databases) into Kubernetes namespaces.
*   **Kubernetes (K8s)**: Container orchestration configuration with resource specifications, readiness/liveness probes, and ingress ssl-redirect annotation settings.
*   **Argo CD**: Implements GitOps deployment mechanics, reconciling Helm chart configurations directly into the EKS production cluster.
*   **Terraform**: Provisions core cloud resources including VPC, routing tables, and the EKS Kubernetes cluster in AWS (located in [infra/terraform](file:///c:/Users/SATYA/OneDrive/Desktop/MedFlow/infra/terraform)).

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
Ensure the following tools are installed and configured on the machine where Jenkins is running:
*   **Docker Engine**: Required to build and package production-ready images.
*   **Trivy Security Scanner**: Used for vulnerability scans on libraries and built container layers.
*   **Helm CLI**: Used to package and release charts to Kubernetes.

### 2. Configure Jenkins Pipeline Job
1. Open your Jenkins console at [http://localhost:8080](http://localhost:8080).
2. Click **New Item** on the top-left sidebar.
3. Enter `MediCore360` in the name box, select **Pipeline**, and click **OK**.
4. Scroll down to the **Pipeline** configuration panel:
   * **Definition**: Choose `Pipeline script from SCM` from the dropdown.
   * **SCM**: Select `Git`.
   * **Repository URL**: Enter the absolute path to this local repository:
     `c:\Users\SATYA\OneDrive\Desktop\MedFlow`
   * **Branch Specifier**: Enter `*/main` (or the branch you are actively developing on).
   * **Script Path**: Verify it is set to `Jenkinsfile`.
5. Click **Save**.

### 3. Pipeline Tool Configuration (Global Tool Configuration)
The Jenkinsfile looks up a SonarQube Scanner tool definition. If you are using SonarQube:
1. Go to **Manage Jenkins** -> **Tools**.
2. Scroll to **SonarQube Scanner** installations.
3. Click **Add SonarQube Scanner**, set the name to `SonarScanner`, and enable automatic installer or specify its installation path.

*Note: If you do not have SonarQube or Trivy installed yet and want to bypass these stages for initial testing, you can comment out the `SonarQube Static Scan`, `Trivy Repository Audit`, and `Trivy Container Scan` stages in the [Jenkinsfile](file:///c:/Users/SATYA/OneDrive/Desktop/MedFlow/Jenkinsfile).*

### 4. Running the Pipeline
Click **Build Now** in your Jenkins project dashboard. Jenkins will fetch your codebase from `c:\Users\SATYA\OneDrive\Desktop\MedFlow`, run security scans, compile applications, build Docker containers, and trigger production deployments.

