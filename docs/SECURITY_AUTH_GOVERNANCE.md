# Security, Authentication, RBAC & Audit Governance Architecture

This document defines the zero-trust security model, multi-tenant authentication scheme, Role-Based Access Control (RBAC) permissions matrix, and tamper-evident audit logging mechanisms for **MedFlow**.

---

## 1. Multi-Tenant Dual-Token Authentication Lifecycle

MedFlow uses a dual-token authentication scheme utilizing Argon2id password hashing, HTTP-Only SameSite refresh cookies, short-lived JWT access tokens, and Redis session tracking.

```mermaid
sequenceDiagram
    autonumber
    actor User as Clinical / Staff User
    participant Web as Next.js Web App
    participant Edge as NGINX / Gateway
    participant API as Express API Server
    participant AuthMod as Auth Module (Argon2id)
    participant Redis as Redis Session Store
    participant DB as MongoDB Users Collection

    User->>Web: Input Credentials (Email, Password, Tenant ID)
    Web->>Edge: POST /api/v1/auth/login
    Edge->>API: Forward Login Payload + IP / User-Agent

    API->>DB: Query User Record by Email & Tenant ID
    DB-->>API: User Record + Stored Argon2id Hash
    
    API->>AuthMod: Verify Password Hash (Argon2id Memory-Hard)
    AuthMod-->>API: Verification Success

    API->>Redis: Create Active Session (Key: `session:{tenantId}:{userId}`, TTL 7 Days)
    
    API-->>Web: 200 OK + Set HTTP-Only Cookie (`refreshToken`, SameSite=Strict) + Return Bearer JWT (`accessToken`, Exp: 15m)

    Note over Web, API: Subsequent API Requests

    Web->>Edge: Request with `Authorization: Bearer <accessToken>`
    Edge->>API: Validate Token Signature & Expiry
    API->>Redis: Check Session Status (Ensure not revoked)
    Redis-->>API: Session Active
    API-->>Web: 200 OK Response Data
```

---

## 2. Role-Based Access Control (RBAC) Permission Matrix

Access permissions are enforced centrally via express middleware (`requireRole([...roles])`).

```mermaid
flowchart TD
    subgraph Roles ["MedFlow System Roles"]
        R1["ADMIN"]
        R2["DOCTOR"]
        R3["NURSE"]
        R4["RECEPTIONIST"]
        R5["PHARMACIST"]
        R6["LAB_TECH"]
        R7["EMERGENCY_TECH"]
        R8["PATIENT"]
    end

    subgraph Middleware ["Authorization Guard Middleware"]
        AuthGuard{"jwtAuthGuard & checkRole"}
    end

    subgraph Resources ["Protected Domain APIs"]
        P1["EMR Records & Prescriptions"]
        P2["Emergency Dispatch & Triage"]
        P3["Pharmacy Stock & Dispense"]
        P4["Blood Bank & Cross-Match"]
        P5["Billing & Payments"]
        P6["System Audit Logs & Settings"]
    end

    R1 --> AuthGuard --> P6 & P5 & P1
    R2 --> AuthGuard --> P1 & P3
    R3 --> AuthGuard --> P1 & P2
    R4 --> AuthGuard --> P5
    R5 --> AuthGuard --> P3
    R6 --> AuthGuard --> P4
    R7 --> AuthGuard --> P2
    R8 --> AuthGuard --> P1
```

### RBAC Detailed Matrix:

| Domain Resource | ADMIN | DOCTOR | NURSE | RECEPTION | PHARMACIST | LAB TECH | EMERGENCY | PATIENT |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **User & Tenant Management** | Write | Read | Read | - | - | - | - | - |
| **EMR Records (SOAP, Diagnoses)** | Read | **Full** | Read/Update | - | Read (Prescr) | - | Read | Read (Self) |
| **Appointments & Queue** | Full | Full | Full | **Full** | - | - | - | Read/Book |
| **Emergency Triage & GPS** | Full | Read | Read | Read | - | - | **Full** | SOS Trigger |
| **Pharmacy & Drug Stock** | Full | Read (Meds) | - | - | **Full** | - | - | - |
| **Blood Bank Units & Matching** | Full | Read | - | - | - | **Full** | Read | - |
| **Billing & Stripe Invoices** | **Full** | - | - | Full | - | - | - | Pay Only |
| **Audit Logs & System Specs** | **Full** | - | - | - | - | - | - | - |

---

## 3. Data Scrubbing & Immutable Audit Logging Pipeline

To ensure non-repudiation and regulatory compliance, all write/update actions produce append-only audit entries.

```mermaid
flowchart LR
    subgraph RequestContext ["HTTP Request Context"]
        Req["User Action\n(e.g., Update EMR Record)"]
    end

    subgraph SecurityMiddleware ["Security & Audit Middleware"]
        TraceInjector["Inject Trace ID & Correlation ID"]
        Scrubber["PII Scrubber\n(Mask SSN, Phone, Address)"]
    end

    subgraph DataStore ["Database & Audit Engine"]
        DomainDB[("Primary MongoDB\nCollections")]
        AuditDB[("Append-Only AuditLog\nCollection (TTL Locked)")]
    end

    Req --> TraceInjector
    TraceInjector --> Scrubber
    Scrubber -->|Atomic Session Tx| DomainDB
    Scrubber -->|Insert Audit Record| AuditDB
```

### Audit Log Schema Structure:
* `timestamp`: ISO 8601 UTC timestamp.
* `hospitalId`: Tenant Identifier.
* `userId`: Actor User Identifier.
* `userRole`: Role at execution time.
* `action`: Action verb (`CREATE_EMR`, `DISPENSE_DRUG`, `UPDATE_VITAL`).
* `resourceId`: Affected document `_id`.
* `ipAddress`: Remote client IP address.
* `correlationId`: Tracing UUID.
* `changes`: `{ before: EncryptedHash, after: EncryptedHash }`.
