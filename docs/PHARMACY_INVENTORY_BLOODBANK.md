# Pharmacy Inventory, Medication Dispensing & Blood Bank Cold-Chain Architecture

This document defines the architectural specifications for inventory control, automated Medication Fulfillment (FEFO/FIFO rules), Blood Bank Donor matching, and cold-chain temperature monitoring in **MedFlow**.

---

## 1. Pharmacy Inventory & Prescription Fulfillment Pipeline

Medication dispensing follows strict inventory validation and automated stock deduction to prevent stockouts and medication dispensing errors.

```mermaid
stateDiagram-v2
    [*] --> PrescriptionReceived: Doctor EMR Prescription Created
    PrescriptionReceived --> PharmacistReview: Pharmacist Verification & Allergy Check
    
    state InventoryDeduction {
        [*] --> CheckStock: Batch Availability Lookup
        CheckStock --> SelectFEFO: Select Batch with Earliest Expiry (FEFO)
        SelectFEFO --> LockStock: Reserve Units in Redis (TTL 15m)
    }

    PharmacistReview --> InventoryDeduction: Verification Passed
    InventoryDeduction --> Dispensed: Pharmacist Handout & Barcode Scan
    Dispensed --> StockDeducted: MongoDB Atomic Stock Update
    StockDeducted --> CheckReorderLevel: Quantity < Reorder Threshold?
    
    state ReorderWorkflow {
        [*] --> GeneratePO: Auto-Generate Purchase Order
        GeneratePO --> SupplierSent: Send PO to Supplier
    }

    CheckReorderLevel --> ReorderWorkflow: Yes (Stock Low)
    CheckReorderLevel --> Completed: No (Stock Sufficient)
    Completed --> [*]
```

### Dispensing Policies:
* **FEFO (First-Expired-First-Out)**: System mandates picking batches with the nearest expiration date to minimize waste.
* **Barcoded Verification**: Scanning medication barcode before dispensing validates National Drug Code (NDC) against prescription.
* **Allergy Cross-Check**: Automated warning system triggers if prescribed drug conflicts with patient's recorded allergies in EMR.

---

## 2. Blood Bank Cold-Chain & Donor Cross-Matching Flow

The Blood Bank management system ensures strict temperature monitoring and donor-to-recipient compatibility checks.

```mermaid
flowchart TD
    subgraph DonorPhase ["1. Donor Registration & Testing"]
        Donor["Blood Donor"] --> Registration["Donor Screening & Health Questionnaire"]
        Registration --> Collection["Blood Collection (Unit Bag Barcode Generated)"]
        Collection --> LabTesting["Mandatory Serology Screening\n(HIV, Hepatitis B/C, Syphilis, Malaria)"]
    end

    subgraph ColdChainPhase ["2. Cold-Chain Storage & Monitoring"]
        LabTesting -->|Passed Screening| Storage["Cold Storage Refrigerator (2°C - 6°C)"]
        LabTesting -->|Failed Screening| Quarantine["Quarantine & Safe Disposal"]
        Storage -.-> TempSensor["IoT Temperature Sensor Relay\n(Alert if Temp < 2°C or > 6°C)"]
    end

    subgraph MatchingPhase ["3. Cross-Matching & Dispatch"]
        RecipientReq["ER / Surgery Blood Request"] --> CrossMatch["Major & Minor Cross-Matching"]
        CrossMatch -->|Compatible| Reserve["Reserve Unit for Patient"]
        Reserve --> Issuance["Dispense to Surgical Team with Dual Verification"]
    end

    TempSensor -->|Temp Excursion Alert| ColdChainAlert["Trigger Emergency SMS to Blood Bank Supervisor"]
```

---

## 3. Pharmacy & Blood Bank Data Model (ERD)

```mermaid
erDiagram
    MEDICATION ||--o{ MED_BATCH : "has stock in"
    MED_BATCH ||--o{ DISPENSE_LOG : "dispensed via"
    BLOOD_DONOR ||--o{ BLOOD_UNIT : "donates"
    BLOOD_UNIT ||--o{ CROSS_MATCH : "tested against"
    PATIENT ||--o{ CROSS_MATCH : "receives"

    MEDICATION {
        string _id PK
        string hospitalId FK
        string brandName
        string genericName
        string ndcCode
        int reorderThreshold
    }

    MED_BATCH {
        string batchNumber PK
        string medicationId FK
        int initialQuantity
        int currentQuantity
        date expiryDate
        string storageLocation
    }

    BLOOD_UNIT {
        string unitId PK
        string bloodGroup
        string rhFactor
        string donorId FK
        string componentType
        datetime collectionDate
        datetime expiryDate
        string coldStorageStatus
    }

    CROSS_MATCH {
        string requestId PK
        string unitId FK
        string patientId FK
        string resultStatus
        string verifiedByDoctorId
    }
```

---

## 4. Blood Compatibility Matrix

The system enforces compatibility logic prior to reserving blood bags:

| Recipient Blood Type | Compatible Red Cell Units | Compatible Plasma Units |
| :--- | :--- | :--- |
| **O-** | O- only | O-, O+, A-, A+, B-, B+, AB-, AB+ (Universal Donor) |
| **O+** | O-, O+ | O+, A+, B+, AB+ |
| **A-** | O-, A- | A-, A+, AB-, AB+ |
| **A+** | O-, O+, A-, A+ | A+, AB+ |
| **B-** | O-, B- | B-, B+, AB-, AB+ |
| **B+** | O-, O+, B-, B+ | B+, AB+ |
| **AB-** | O-, A-, B-, AB- | AB-, AB+ |
| **AB+** | ALL TYPES (Universal Recipient) | AB+ only |
