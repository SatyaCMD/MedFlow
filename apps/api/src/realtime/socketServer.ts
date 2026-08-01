import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { EventEnvelope, SOCKET_EVENTS } from '@medicore360/shared';
import { TrackingNamespace } from './namespaces/tracking.namespace.js';
import { QueueNamespace } from './namespaces/queue.namespace.js';
import { NotificationsNamespace } from './namespaces/notifications.namespace.js';
import { ChatNamespace } from './namespaces/chat.namespace.js';
import { HospitalStatusNamespace } from './namespaces/hospitalStatus.namespace.js';
import { EmergencyNamespace } from './namespaces/emergency.namespace.js';

export class SocketServer {
  private io: SocketIOServer | null = null;
  public trackingNsp!: TrackingNamespace;
  public queueNsp!: QueueNamespace;
  public notificationsNsp!: NotificationsNamespace;
  public chatNsp!: ChatNamespace;
  public hospitalStatusNsp!: HospitalStatusNamespace;
  public emergencyNsp!: EmergencyNamespace;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: '*', // Adjusted in NGINX gateway level
        credentials: true,
      },
      pingInterval: 25000,
      pingTimeout: 20000,
      transports: ['websocket', 'polling'],
    });

    // Attach Redis Adapter for scaling across multiple socket pod replicas
    try {
      const pubClient = redis;
      const subClient = redis.duplicate();
      this.io.adapter(createAdapter(pubClient, subClient));
      logger.info('🚀 Socket.IO Server attached to Redis Adapter for multi-node horizontal scaling.');
    } catch (adapterErr) {
      logger.warn({ adapterErr }, 'Failed to initialize Redis Adapter for Socket.IO. Running single-node mode.');
    }

    // Initialize Specialized Namespaces
    this.trackingNsp = new TrackingNamespace(this.io);
    this.queueNsp = new QueueNamespace(this.io);
    this.notificationsNsp = new NotificationsNamespace(this.io);
    this.chatNsp = new ChatNamespace(this.io);
    this.hospitalStatusNsp = new HospitalStatusNamespace(this.io);
    this.emergencyNsp = new EmergencyNamespace(this.io);

    logger.info('⚡ Dedicated WebSocket Gateway initialized with 6 Enterprise Namespaces.');
    return this.io;
  }

  // Unified Real-time Event Dispatcher (used by Event Bridge & Direct Domain Services)
  public broadcastEvent(envelope: EventEnvelope): void {
    const { eventType, hospitalId, data } = envelope;

    switch (eventType) {
      case SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATED:
        this.trackingNsp.broadcastLocationUpdate(hospitalId, data as any);
        break;

      case SOCKET_EVENTS.QUEUE_TOKEN_UPDATED:
      case SOCKET_EVENTS.QUEUE_NEXT_PATIENT:
      case SOCKET_EVENTS.QUEUE_PRIORITY_OVERRIDE:
        this.queueNsp.broadcastQueueTokenUpdate(hospitalId, data as any);
        break;

      case SOCKET_EVENTS.NOTIFICATION_CREATED:
        this.notificationsNsp.broadcastNotification(hospitalId, data);
        break;

      case SOCKET_EVENTS.BED_STATUS_UPDATED:
        this.hospitalStatusNsp.broadcastBedStatus(hospitalId, data);
        break;

      case SOCKET_EVENTS.BLOOD_STOCK_UPDATED:
      case SOCKET_EVENTS.BLOOD_ALERT_CRITICAL:
        this.hospitalStatusNsp.broadcastBloodStock(hospitalId, data);
        break;

      case SOCKET_EVENTS.DOCTOR_STATUS_CHANGED:
        this.hospitalStatusNsp.broadcastDoctorStatus(hospitalId, data);
        break;

      case SOCKET_EVENTS.OT_STATUS_UPDATED:
        this.hospitalStatusNsp.broadcastOTStatus(hospitalId, data);
        break;

      case SOCKET_EVENTS.PHARMACY_STOCK_UPDATED:
        this.hospitalStatusNsp.broadcastPharmacyStock(hospitalId, data);
        break;

      case SOCKET_EVENTS.LAB_STATUS_UPDATED:
        this.hospitalStatusNsp.broadcastLabStatus(hospitalId, data);
        break;

      case SOCKET_EVENTS.METRICS_UPDATED:
        this.hospitalStatusNsp.broadcastLiveMetrics(hospitalId, data);
        break;

      case SOCKET_EVENTS.CHAT_MESSAGE_SENT:
        this.chatNsp.broadcastChatMessage(data as any);
        break;

      case SOCKET_EVENTS.EMERGENCY_ALERT_BROADCAST:
        this.emergencyNsp.broadcastEmergencyAlert(hospitalId, data as any);
        break;

      default:
        logger.debug({ eventType }, 'Unmapped event type received in SocketServer broadcast.');
        break;
    }
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }
}

export const socketServer = new SocketServer();
