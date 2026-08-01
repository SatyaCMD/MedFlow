# Observability, Distributed Tracing & Telemetry Architecture

This document defines the distributed tracing architecture, OpenTelemetry collector configuration, Prometheus metric aggregation, Jaeger trace visualization, and correlation ID propagation across **MedFlow**.

---

## 1. End-to-End Distributed Telemetry Pipeline

MedFlow employs OpenTelemetry (OTel) instrumentation across HTTP REST, MongoDB queries, Redis cache lookups, Kafka event streaming, RabbitMQ message queues, and WebSocket broadcasts.

```mermaid
flowchart LR
    subgraph Clients
        WebClient["MedFlow Next.js Client"]
    end

    subgraph ServiceLayer ["Instrumentation Scope"]
        API["Express API Server\n(OTel Node.js SDK)"]
        Worker["Outbox Worker\n(OTel Consumer SDK)"]
        WSGateway["Socket.IO Gateway\n(OTel Broadcast SDK)"]
    end

    subgraph TelemetryCollector ["Telemetry Collector Pipeline"]
        OTelCollector["OpenTelemetry Collector\n(Port 4317 gRPC / 4318 HTTP)"]
    end

    subgraph StorageVisualization ["Storage & Dashboards"]
        Prometheus[("Prometheus TSDB\n(Metrics Aggregation)")]
        Jaeger[("Jaeger Tracing Backend\n(Trace Storage)")]
        Grafana["Grafana Unified Dashboard\n(SRE Alerting & Visualizer)"]
    end

    WebClient -->|Trace Parent Header| API
    API -->|Inject Trace ID| Worker
    Worker -->|Inject Trace ID| WSGateway
    
    API -.->|OTLP Spans & Metrics| OTelCollector
    Worker -.->|OTLP Spans & Metrics| OTelCollector
    WSGateway -.->|OTLP Spans & Metrics| OTelCollector

    OTelCollector -->|Push Metrics| Prometheus
    OTelCollector -->|Push Traces| Jaeger

    Prometheus --> Grafana
    Jaeger --> Grafana
```

---

## 2. Correlation ID Propagation Lifecycle

Every request entering the system receives a unique correlation ID (`x-correlation-id`) that is propagated across network boundaries, microservices, database operations, and logs.

```mermaid
sequenceDiagram
    autonumber
    actor User as Patient User
    participant Web as Web Client
    participant Nginx as Nginx Edge Gateway
    participant API as Express API Server
    participant Outbox as Mongo Outbox Collection
    participant Worker as Outbox Poller Worker
    participant Kafka as Kafka Event Broker
    participant WSS as WebSocket Server

    User->>Web: Click "Book Appointment"
    Web->>Nginx: POST /api/v1/appointment (Generate `x-correlation-id: uuid-9988`)
    Nginx->>API: Pass `x-correlation-id: uuid-9988`
    
    API->>API: Attach `uuid-9988` to Pino Logger Context
    API->>Outbox: Write Appointment + Insert Outbox Entry with `correlationId: uuid-9988`
    
    Worker->>Outbox: Poll Unsent Events
    Worker->>Kafka: Publish Event to `appointment.created` (Kafka Header `x-correlation-id: uuid-9988`)
    
    Kafka->>WSS: Streamed Event Received
    WSS->>Web: Broadcast WebSocket Push (Include `correlationId: uuid-9988`)
    Web->>Web: Log End-to-End Traced User Action in Browser Console
```

---

## 3. SRE Key Performance Indicators (SLOs & Metrics)

The system exports key Prometheus metrics monitored continuously in Grafana:

### Core System Metrics:
* `http_request_duration_seconds_bucket`: Latency histogram partitioned by `route`, `status_code`, and `method`.
* `websocket_active_connections_count`: Gauge tracking concurrent live Socket.IO connections.
* `outbox_unsent_events_total`: Gauge monitoring pending CDC events in MongoDB outbox queue.
* `redis_cache_hit_ratio`: Ratio of `keyspace_hits / (keyspace_hits + keyspace_misses)`.
* `database_transaction_duration_ms`: Latency of MongoDB session transactions.

### Service Level Objectives (SLOs):
1. **API Latency**: 95% of HTTP requests return in `< 500ms`.
2. **WebSocket Dispatch Latency**: 99% of outbox events are broadcasted to WebSockets in `< 200ms`.
3. **Availability**: `99.9%` uptime measured over a rolling 30-day window.
4. **Error Budget**: Maximum 0.1% HTTP 5xx responses per 100,000 requests.
