# Clinical Care Pathways, Electronic Medical Records (EMR) & AI Governance

This document defines the architectural specification, data model standards, patient care state transitions, and AI-assisted clinical documentation governance for the **MedFlow Hospital Management System**.

---

## 1. Patient Lifecycle & Clinical Care Pathway

The patient journey through clinical departments progresses through strict operational stages to ensure patient safety, data integrity, and compliance.

```mermaid
stateDiagram-v2
    [*] --> Scheduled: Appointment Booked / Walk-In
    Scheduled --> CheckedIn: Reception Check-In & Identity Verification
    CheckedIn --> Triaged: Nurse Vital Signs & Initial Assessment
    
    state InConsultation {
        [*] --> HistoryTaking: Review Past Records & Chief Complaint
        HistoryTaking --> Examination: Physical Exam & Vital Sign Sync
        Examination --> ClinicalNotes: SOAP Note Recording (AI Drafted)
        ClinicalNotes --> OrderEntry: Lab & Pharmacy Orders Issued
    }

    Triaged --> InConsultation: Doctor Called
    InConsultation --> PendingLabPharmacy: Diagnostics / Medication Issued
    
    state PendingLabPharmacy {
        [*] --> LabProcessing: Specimen Analysis in Lab
        [*] --> PharmacyDispense: Prescription Verification in Pharmacy
        LabProcessing --> DiagnosticsComplete: Results Verified & Uploaded
        PharmacyDispense --> MedsDispensed: Medication Picked Up
    }

    PendingLabPharmacy --> FinalReview: Physician Final Sign-off
    FinalReview --> Discharged: Discharge Summary & Billing Clearance
    Discharged --> [*]
```

### Key Care Pathway Stages:
1. **Reception Check-In**: Patient identity verified against National ID / Health Insurance card. Patient status updated to `CHECKED_IN`.
2. **Nurse Triage**: Nurse logs vital signs (Heart rate, Blood Pressure, SpO2, Temperature, Respiratory Rate). Emergency Severity Index (ESI) computed automatically.
3. **Doctor Consultation**: Doctor conducts SOAP (Subjective, Objective, Assessment, Plan) consultation. AI Clinical Copilot listens or processes raw notes into structured format.
4. **Order Entry & Execution**: Lab tests and medication orders are dispatched asynchronously via MongoDB atomic transactions and WebSocket event broadcasts.
5. **Physician Final Sign-off**: EMR entry locked; digital signature applied; encrypted entry committed.

---

## 2. AI Clinical Copilot & HIPAA Governance

The AI Clinical Copilot automates clinical transcription and SOAP note generation while maintaining strict HIPAA compliance and zero-leakage PII policies.

```mermaid
sequenceDiagram
    autonumber
    actor Doctor as Attending Physician
    participant Web as MedFlow Web Client
    participant API as Express API Server
    participant Scrub as HIPAA PII Anonymizer
    participant LLM as AI Clinical Service (Gemini API)
    participant DB as MongoDB EMR Collection
    participant Audit as Immutability Audit Log

    Doctor->>Web: Input Raw Voice/Text Clinical Notes
    Web->>API: POST /api/v1/emr/ai-summarize (Payload + Auth Token)
    
    API->>Scrub: Pipe Raw Text to PII Scrubbing Middleware
    Scrub->>Scrub: Strip Patient Name, DOB, Phone, Address, SSN
    Scrub-->>API: Return Anonymized Clinical Transcript
    
    API->>LLM: Send Anonymized Text + Prompts (Strict Schema Constraints)
    LLM-->>API: Return Structured JSON (Subjective, Objective, Assessment, Plan)
    
    API->>Audit: Record AI Prompt & Token Usage (No PII stored)
    API-->>Web: Return Candidate SOAP Note for Doctor Review
    
    Doctor->>Web: Review, Modify, and Digitally Sign SOAP Note
    Web->>API: POST /api/v1/emr/records (Signed EMR)
    API->>DB: Save Encrypted EMR Document (AES-256 GCM)
    API->>Audit: Log Doctor Approval Event with Timestamp
```

### Clinical AI Rules:
- **Human-in-the-Loop**: AI outputs are *never* committed directly to patient records without explicit physician verification and signature.
- **Data Scrubbing**: Middleware strips 18 HIPAA PII identifiers before sending prompts out-of-process.
- **Audit Traceability**: Every generated prompt and response is logged in the `AuditLog` collection with model details, execution latency, and token consumption.

---

## 3. EMR Data Architecture & Entity Relationships

The EMR system utilizes tenant-isolated documents indexed for sub-50ms retrieval.

```mermaid
erDiagram
    PATIENT ||--o{ EMR_RECORD : "has history of"
    DOCTOR ||--o{ EMR_RECORD : "authors"
    EMR_RECORD ||--o{ DIAGNOSIS : "contains"
    EMR_RECORD ||--o{ PRESCRIPTION : "includes"
    EMR_RECORD ||--o{ VITAL_SIGNS : "records"
    EMR_RECORD ||--o| AI_METADATA : "attaches"

    EMR_RECORD {
        string _id PK
        string hospitalId FK
        string patientId FK
        string doctorId FK
        string appointmentId FK
        object soapNotes
        string status
        datetime createdAt
        datetime signedAt
    }

    DIAGNOSIS {
        string icd10Code
        string description
        string severity
    }

    PRESCRIPTION {
        string drugId
        string dosage
        string frequency
        int durationDays
    }

    VITAL_SIGNS {
        float bloodPressureSystolic
        float bloodPressureDiastolic
        int heartRate
        float temperatureCelsius
        int oxygenSaturation
    }

    AI_METADATA {
        string promptId
        float confidenceScore
        boolean humanEdited
    }
```

---

## 4. Encryption & Security Standards for EMR

1. **Field-Level Encryption (FLE)**: Sensitive fields within `soapNotes` (e.g. `subjective`, `assessment`) are encrypted prior to insertion into MongoDB using AES-256-GCM.
2. **Access Control**: EMR view access requires valid JWT with explicit role authorization (`DOCTOR`, `NURSE`, or self-service `PATIENT` for their own records only).
3. **Retention & Archival**: Records soft-deleted (`deletedAt != null`) are preserved for a mandatory 7-year retention period per healthcare compliance regulations.
