# Emergency Department Triage & Ambulance Fleet Dispatch

This document details the emergency response architecture, Emergency Severity Index (ESI) triage algorithm, real-time GPS fleet telemetry relay, and high-priority event handling in **MedFlow**.

---

## 1. Emergency Incident Triage & GPS Dispatch Flow

When an emergency incident is logged, sub-second dispatch and triage prioritization occur in parallel.

```mermaid
flowchart LR
    subgraph Caller ["Emergency Call / Incident"]
        SOS["SOS Incident Logged\n(Phone Call / Mobile SOS)"]
    end

    subgraph CommandCenter ["ER Dispatch Command Center"]
        TriageEngine["ESI Triage Scoring Engine\n(ESI Level 1 - 5)"]
        FleetLocator["Geospatial Fleet Locator\n(2km Radius Search)"]
    end

    subgraph FleetUnit ["Ambulance Unit"]
        AmbPod["Ambulance Unit #402\n(GPS Tracker + Tablet)"]
    end

    subgraph ERHospital ["Hospital ER Unit"]
        TraumaBay["Trauma Bay Reservation\n(Bed & Ventilator Auto-Lock)"]
        ERTeam["ER Medical Team Alerted\n(Realtime Push Notification)"]
    end

    SOS --> TriageEngine
    TriageEngine -->|Priority ESI-1 / ESI-2| FleetLocator
    FleetLocator -->|Assign Nearest Ambulance| AmbPod
    AmbPod -->|Stream Live GPS Coordinates| CommandCenter
    CommandCenter -->|Auto-Reserve Bed| TraumaBay
    CommandCenter -->|Broadcast Shock Alert| ERTeam
```

### Emergency Severity Index (ESI) Triage Classification Matrix:

| ESI Level | Category | Description & Clinical Condition | SLA Response Target | Bed Allocation |
| :--- | :--- | :--- | :--- | :--- |
| **ESI-1** | Resuscitation | Immediate life support needed (Cardiac Arrest, Severe Trauma) | `< 0 seconds` (Immediate) | Resuscitation / Trauma Bay 1 |
| **ESI-2** | Emergent | High risk, confused/lethargic, severe pain (Chest Pain, Stroke) | `< 10 minutes` | ER Acute Bed |
| **ESI-3** | Urgent | Requires multiple resources, vital signs stable | `< 30 minutes` | ER Standard Bed |
| **ESI-4** | Less Urgent | Requires 1 resource (X-Ray or Simple Stitches) | `< 60 minutes` | Fast-Track Clinic |
| **ESI-5** | Non-Urgent | No resources required (Prescription Refill, Minor Wound) | `< 120 minutes` | Outpatient Clinic |

---

## 2. Real-Time Telemetry Broadcast Sequence

Ambulance GPS telemetry is broadcasted via WebSockets to the ER Command Center map view every 2 seconds.

```mermaid
sequenceDiagram
    autonumber
    actor Driver as Ambulance Crew
    participant Mobile as Ambulance Mobile Unit
    participant Edge as Gateway / NGINX
    participant WS as Socket.IO Gateway
    participant Broker as RabbitMQ Emergency Priority Queue
    participant Dashboard as ER Command Center Web App

    Driver->>Mobile: Start Incident Navigation
    loop Every 2 Seconds
        Mobile->>Edge: WSS GPS Telemetry Ping (Lat, Long, Speed, Vital Status)
        Edge->>WS: Validate Session & Forward Payload
        WS->>Broker: Publish to 'emergency.telemetry' Queue
        WS-->>Dashboard: WebSocket Broadcast to Room 'emergency:hosp-001'
        Dashboard->>Dashboard: Smooth Map Marker Animation & ETA Recalculation
    end
    Mobile->>Edge: Emergency Status Update (Arrived at Scene / Patient Onboard)
    Edge->>WS: Broadcast Status Transition
    WS-->>Dashboard: Update ER Pre-Arrival Status Board
```

---

## 3. High-Priority Emergency Event Architecture

Emergency events override standard event queues by utilizing high-priority dedicated RabbitMQ channels and dedicated Kafka partitions.

```mermaid
flowchart TD
    subgraph Ingress Layer
        SOSAPI["POST /api/v1/emergency/dispatch"]
    end

    subgraph Priority Dispatcher
        Router{"Priority Classifier"}
        CriticalQueue[["RabbitMQ Priority Queue\n(x-max-priority: 10)"]]
        NormalQueue[["RabbitMQ Standard Queue\n(x-max-priority: 1)"]]
    end

    subgraph Consumer Service
        EmergWorker["Emergency Priority Worker\n(Dedicated Pool: 8 Threads)"]
        SMSGateway["Twilio SMS / Push Gateway"]
        PagingSystem["Hospital Overhead Paging System"]
    end

    SOSAPI --> Router
    Router -->|ESI 1 or 2| CriticalQueue
    Router -->|ESI 3, 4 or 5| NormalQueue

    CriticalQueue -->|High-Priority Consumer| EmergWorker
    EmergWorker --> SMSGateway
    EmergWorker --> PagingSystem
```

---

## 4. Ambulance Equipment & Medication Readiness

Every ambulance unit maintains an immutable checklist logged prior to shift start:
* **Life Support**: Defibrillator/AED (battery > 90%), Portable Ventilator, Oxygen Cylinders (> 1500 PSI).
* **Medications**: Epinephrine 1mg/ml, Atropine, Morphine, Nitroglycerin, Saline Solution.
* **Telemetry**: 5G Dual-SIM failover router, encrypted GPS transponder, portable tablet scanner.
