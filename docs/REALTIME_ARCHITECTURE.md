# Real-Time Event-Driven Enterprise Architecture

This document specifies the production-grade real-time event-driven communication topology for the MedFlow Hospital Management System.

## Architecture Diagram (Mermaid)

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        Web["MedFlow Web App (Next.js 15)\n(Dashboards: Doctor, Nurse, Reception, Emergency, Patient, Blood Bank, Pharmacy, Admin)"]
    end

    subgraph EdgeLayer ["Edge & Ingress Layer"]
        NGINX["NGINX Ingress / Edge Gateway"]
    end

    subgraph GatewayLayer ["API Gateway & Security Layer"]
        APIGateway["Enterprise API Gateway\n(JWT Auth, Rate Limiting, Correlation ID, Request Validation, Versioning, Circuit Breakers)"]
    end

    subgraph ServiceLayer ["Domain & Realtime Gateway Layer"]
        RESTServices["REST Domain Services\n(Modular Monolith Services + Mongo Transactions)"]
        SocketGateway["Dedicated WebSocket Gateway\n(Socket.IO Server Layer)"]
    end

    subgraph PersistenceLayer ["Transactional Persistence & CQRS"]
        OutboxDB[("Outbox Collection\n& CQRS Read Models")]
        OutboxWorker["Outbox Worker\n(CDC / Transactional Poller)"]
    end

    subgraph EventBridgeLayer ["Real-Time Event Relay"]
        EventBridge["Real-Time Event Bridge\n(Kafka Consumer Service)"]
    end

    subgraph EventBusLayer ["Unified Event Abstraction"]
        EventBus["Unified Event Bus Abstraction\n(EventBus.publish / subscribe)"]
    end

    subgraph MessagingBrokers ["Messaging & Streaming Infrastructure"]
        Kafka[["Apache Kafka Event Engine\n(Topics: patient, appointment, billing, doctor, inventory, emergency, etc.)"]]
        RabbitMQ[["RabbitMQ Async Queue Broker\n(DLQ, Priority Queues, Email/SMS Async Worker Queues)"]]
    end

    subgraph Observability ["Observability & Distributed Tracing"]
        OTel["OpenTelemetry + Jaeger Tracing\n(Correlation ID, Trace & Span ID)"]
    end

    %% Connection Flows
    Web -->|WebSockets & REST| NGINX
    NGINX --> APIGateway
    APIGateway -->|REST Requests| RESTServices
    APIGateway -->|WS Handshake| SocketGateway
    
    RESTServices -->|1. Atomic Mongo Transaction| OutboxDB
    OutboxDB -->|2. Polled Unsent Events| OutboxWorker
    OutboxWorker -->|3. Dispatches via| EventBus
    
    EventBus -->|Publish Streaming Events| Kafka
    EventBus -->|Publish Async Queues| RabbitMQ
    
    Kafka -->|4. Streamed Events| EventBridge
    EventBridge -->|5. Relays Live Events| SocketGateway
    SocketGateway -->|6. Real-time UI Broadcasts| Web

    Kafka -.->|Trace Context| OTel
    RabbitMQ -.->|Trace Context| OTel
```

## Core Architectural Components

1. **NGINX Edge Gateway & API Gateway**: Handles incoming HTTP and WebSocket traffic, SSL termination, JWT validation, Correlation ID injection (`x-correlation-id`, `x-trace-id`), rate limiting, and circuit breaker guards.
2. **REST Domain Services**: Encapsulates core business logic within MongoDB transactions. All domain writes write to primary MongoDB collections and insert an Outbox event within the same atomic session transaction.
3. **Transactional Outbox & Worker**: Ensures 100% reliable event delivery. The Outbox Worker polls MongoDB outbox entries and publishes events to Kafka/RabbitMQ without event loss.
4. **Unified Event Bus (`EventBus`)**: Standardized abstraction (`EventBus.publish()`) handling event envelopes, versioning, trace context propagation, and fallback logic.
5. **Apache Kafka Event Engine**: High-throughput event streaming broker maintaining partitioned topics for analytics, audit logs, and real-time state synchronization.
6. **RabbitMQ Message Queue Broker**: Handles asynchronous background tasks, email/SMS dispatch, dead-letter queues (DLQ), and priority emergency processing.
7. **Dedicated WebSocket Gateway & Real-time Event Bridge**: Decouples domain REST services from WebSocket broadcasting. Kafka event bridge consumer forwards streamed events to the Socket.IO server layer for live UI updates.
8. **Distributed Tracing (OpenTelemetry + Jaeger)**: Tracks requests end-to-end with trace IDs and span IDs across HTTP, Outbox, Kafka, RabbitMQ, and WebSockets.
