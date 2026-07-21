# MediCore 360 - Master Architectural Specifications

This document defines the system topology, C4 models, sequence diagrams, database collection maps, API standards, and reliability targets for **MediCore 360**.

---

## 1. C4 Architecture Diagrams

### 1.1 System Context (Level 1)
Shows how actors interact with MediCore 360:

```mermaid
graph TD
    User["Clinical User (Doctor/Staff/Admin)"]
    PatientUser["Patient (Self-Service)"]
    EHMS["MediCore 360 (EHMS Monorepo)"]
    SMS["SMS Gateway (Twilio)"]
    Email["SMTP Server (Mailpit)"]
    Stripe["Stripe Gateway"]

    User -->|Accesses Portal| EHMS
    PatientUser -->|Books Appointments| EHMS
    EHMS -->|Dispatches Alerts| SMS
    EHMS -->|Sends Invoices| Email
    EHMS -->|Processes Card Payments| Stripe
```

### 1.2 Container Diagram (Level 2)
Breaks down the system into container boundaries:

```mermaid
graph TD
    subgraph Client Application
        Web["Next.js Web Client"]
    end
    subgraph Load Balancer & Routing
        NGINX["Nginx API Gateway (Port 80/443)"]
    end
    subgraph Application Tier
        API["Express API Server (Port 4000)"]
    end
    subgraph Persistent Storage & Memory
        Mongo[("MongoDB Database")]
        Redis[("Redis Memory Cache")]
    end

    Web -->|HTTPS Requests| NGINX
    NGINX -->|Reverse Proxy /api/v1| API
    API -->|Queries & Updates| Mongo
    API -->|Caches Sessions / Limits| Redis
```

### 1.3 Component Diagram (Level 3)
Component routing maps inside the Express API:

```mermaid
graph TD
    Router["Express Router (app.ts)"]
    AuthM["Auth Middleware"]
    RateLim["Rate Limiting Middleware"]
    Controller["Controller Layer"]
    Service["Service Layer"]
    Repository["Repository Layer"]
    Mongo[("MongoDB Engine")]

    Router --> AuthM
    AuthM --> RateLim
    RateLim --> Controller
    Controller --> Service
    Service --> Repository
    Repository --> Mongo
```

---

## 2. Sequence Diagrams

### 2.1 User Login with Session Validation
```mermaid
sequenceDiagram
    autonumber
    actor User as Clinical User
    participant Web as Web Client
    participant API as Express API
    participant Redis as Redis Store
    participant DB as MongoDB

    User->>Web: Enter Email & Password
    Web->>API: POST /api/v1/auth/login
    API->>DB: Find User by Email
    DB-->>API: Return User Record & Hash
    API->>API: Verify Password with Argon2id + Pepper
    API->>Redis: Set session ID (TTL 7d)
    API-->>Web: Set HTTP-Only Cookie (Refresh Token) & Return Access Token
    Web-->>User: Redirect to Dashboard
```

### 2.2 Appointment Booking with Concurrency Locking
```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Doctor
    actor Patient as Patient
    participant API as Express API
    participant Redis as Redis Lock
    participant DB as MongoDB

    Patient->>API: POST /api/v1/appointment (Lock slot)
    API->>Redis: SET lock:doctor:slot NX PX 10000
    alt Lock Acquired
        Redis-->>API: OK (Lock granted)
        API->>DB: Check slot availability & create Appointment
        DB-->>API: Saved
        API->>Redis: Release lock
        API-->>Patient: 201 Created (Appointment Booked)
    else Lock Failed
        Redis-->>API: null (Lock denied)
        API-->>Patient: 429 Conflict (Slot is being booked)
    end
```

---

## 3. Database Schema Design (MongoDB)

### 3.1 Entity Relationship Diagram (ERD)
Defines relations between collections (tenant-scoped by `hospitalId`):

```mermaid
erDiagram
    HOSPITAL ||--o{ USER : contains
    HOSPITAL ||--o{ PATIENT : manages
    PATIENT ||--o{ APPOINTMENT : schedules
    USER ||--o{ APPOINTMENT : conducts
    PATIENT ||--o{ EMR : records
    APPOINTMENT ||--o{ BILLING : generates
```

### 3.2 Indexing Strategy per Collection
To maintain rapid query response times (<50ms):
*   `User`: `{ email: 1 }` (Unique), `{ hospitalId: 1, deletedAt: 1 }` (Compound index)
*   `Patient`: `{ hospitalId: 1, deletedAt: 1 }`, `{ hospitalId: 1, nationalId: 1 }` (Unique partial index)
*   `Appointment`: `{ hospitalId: 1, doctorId: 1, date: 1 }` (Compound index for schedules), `{ createdAt: 1 }`
*   `AuditLog`: `{ hospitalId: 1, createdAt: -1 }` (Compound sorted index)

### 3.3 Sample EMR Schema Document
```json
{
  "_id": "65b47a9ef38877bd64ef0182",
  "hospitalId": "HOSP-001",
  "patientId": "65b47a9ef38877bd64ef0100",
  "doctorId": "65b47a9ef38877bd64ef0101",
  "soapNotes": {
    "subjective": "Encrypted string format...",
    "objective": "Encrypted string format...",
    "assessment": "Encrypted string format...",
    "plan": "Encrypted string format..."
  },
  "diagnoses": ["ICD-10 J06.9", "LOINC 29463-7"],
  "createdAt": "2026-07-21T06:17:47.000Z",
  "deletedAt": null
}
```

---

## 4. API & Reliability Standards

### 4.1 REST Design Guidelines
*   **Versioning**: Mounted on `/api/v1/` prefixes.
*   **Error Envelopes**: Errors return `success: false` alongside standardized code models.
*   **Pagination**: Server limits page size. Offsets utilize standard limits:
    ```
    GET /api/v1/patient?page=1&limit=20&sortBy=createdAt&sortOrder=desc
    ```

### 4.2 SRE Targets & Reliability KPIs
*   **Availability**: Target `99.9%` uptime.
*   **Recovery Metrics**: RTO (Recovery Time Objective) < 4 hours, RPO (Recovery Point Objective) < 1 hour.
*   **SLO/SLIs**: 95% of request processing latency must reside under 500ms.
*   **Monitoring Metrics**:
    *   *Booking latency*: Target < 200ms.
    *   *Redis Cache Hit Ratio*: Target > 80%.

---

## 5. AI Governance & Compliance

To ensure compliance with clinical regulations (e.g. HIPAA):
1.  **HIPAA Data Scrubbing**: Before transmitting transcripts to the AI pipeline, fields matching PII (names, phone numbers, national identification keys) are scrubbed.
2.  **Audit Logs**: All AI prompts, responses, and token usage records are tracked inside the append-only `AuditLog` collection.
3.  **Governance Audits**: Human doctors review generated SOAP summaries and sign off manually.
