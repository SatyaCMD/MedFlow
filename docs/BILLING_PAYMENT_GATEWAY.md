# Billing Engine, Stripe Payment Gateway & Financial Ledger Architecture

This document defines the architectural specifications for invoice generation, insurance copay splitting, Stripe payment processing, webhook idempotency, and financial auditing in **MedFlow**.

---

## 1. Automated Billing & Stripe Webhook Lifecycle

MedFlow automates patient billing upon consultation or service completion, providing seamless integration with the Stripe Payment Gateway.

```mermaid
sequenceDiagram
    autonumber
    actor Patient as Patient / Receptionist
    participant Web as Next.js Web Client
    participant API as Express API Server
    participant Stripe as Stripe API Gateway
    participant Webhook as Stripe Webhook Receiver
    participant DB as MongoDB Billing Collection
    participant Outbox as Outbox Queue (Kafka/RabbitMQ)

    Patient->>Web: Select Invoice & Click "Pay Now via Card"
    Web->>API: POST /api/v1/billing/create-checkout-session
    
    API->>DB: Fetch Invoice & Calculate Tax + Insurance Split
    API->>Stripe: Create Stripe Checkout Session (with Idempotency Key)
    Stripe-->>API: Return Checkout URL & Payment Intent ID
    API-->>Web: Redirect to Stripe Hosted Checkout
    
    Patient->>Stripe: Complete Card Payment on Stripe
    Stripe-->>Web: Redirect to /payment/success?session_id=cs_test_123
    
    par Asynchronous Webhook Processing
        Stripe->>Webhook: POST /api/v1/billing/webhook (event: payment_intent.succeeded)
        Webhook->>Webhook: Verify Stripe Signature (`stripe-signature` header)
        Webhook->>DB: Check Idempotency (Ensure event ID not processed)
        Webhook->>DB: Update Invoice Status -> `PAID` (Atomic Mongo Transaction)
        Webhook->>Outbox: Push `billing.payment_received` Event
        Outbox-->>Web: WebSockets Broadcast -> Update Dashboard Status
    end
```

---

## 2. Invoice Financial State Transitions

An invoice transitions through well-defined lifecycle states from initial drafting to settlement or insurance claim adjustment.

```mermaid
stateDiagram-v2
    [*] --> Draft: Service / Consultation Completed
    Draft --> PendingPayment: Itemized Line Items Calculated & Approved
    
    state PendingPayment {
        [*] --> PatientPortion: Patient Copay Outstanding
        [*] --> InsurancePortion: Insurance Claim Submitted
    }

    PendingPayment --> Paid: Stripe Payment Received (100% Settled)
    PendingPayment --> PartiallyPaid: Partial Payment / Down-Payment Recorded
    PendingPayment --> Overdue: Grace Period Expired (> 30 Days)
    
    PartiallyPaid --> Paid: Remaining Balance Settled
    Overdue --> Collection: Sent to Financial Claims Review
    
    Paid --> Refunded: Refund Request Approved & Executed on Stripe
    Refunded --> [*]
    Paid --> [*]
```

---

## 3. Financial Audit & Insurance Claim Processing Pipeline

MedFlow handles insurance claims by generating standard ANSI 837 health claim formats and tracking insurance reimbursement reconciliation.

```mermaid
flowchart TD
    subgraph BillingEngine ["1. Invoice Generation Engine"]
        EMR["Completed Consultation / EMR"] --> Itemizer["Line Item Builder\n(Doctor Fee, Meds, Lab Tests)"]
        Itemizer --> TaxCalc["Tax & Discount Calculator"]
    end

    subgraph Splitter ["2. Copay & Insurance Splitter"]
        TaxCalc --> SplitterLogic{"Insurance Policy Active?"}
        SplitterLogic -->|Yes| InsSplit["Split Invoice:\nPatient Copay: 20%\nInsurance Portion: 80%"]
        SplitterLogic -->|No| SelfPay["Patient Self-Pay: 100%"]
    end

    subgraph ClaimsEngine ["3. Insurance Claims Gateway"]
        InsSplit --> ClaimGen["Generate Health Claim (ANSI 837)"]
        ClaimGen --> InsPortal["Submit to Insurance Clearinghouse"]
        InsPortal --> Reconciliation{"Claim Approved?"}
        Reconciliation -->|Approved| PayIns["Insurance Remittance Received"]
        Reconciliation -->|Rejected| Reappeal["Appeal Claim / Rebill Patient"]
    end

    PayIns --> Ledger[("Immutable Financial Ledger DB")]
    SelfPay --> Ledger
```

---

## 4. Financial Calculations & Idempotency Rules

### 1. Payment Idempotency
All payment creation requests pass a unique `Idempotency-Key` header generated as `idempotency:billing:{hospitalId}:{invoiceId}:{timestamp_hour}`. This prevents double-charging in network timeout scenarios.

### 2. Copay Split Formula
$$\text{Total Invoice} = \sum (\text{Service Line Price} \times \text{Quantity}) + \text{Tax}$$
$$\text{Patient Copay} = \min(\text{Total Invoice}, \text{Deductible Remaining}) + (\text{Remaining Balance} \times \text{Coinsurance Rate})$$
$$\text{Insurance Liability} = \text{Total Invoice} - \text{Patient Copay}$$

### 3. Stripe Signature Security
Webhook requests without a valid `stripe-signature` cryptographically matched against the `STRIPE_WEBHOOK_SECRET` environment key are rejected with HTTP 400 Bad Request.
