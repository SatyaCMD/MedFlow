import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS, EmergencyAlertPayload } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class EmergencyNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/emergency');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const hospitalId = socket.user?.hospitalId || 'HOSPITAL-GLOBAL';
      logger.info({ socketId: socket.id, userId: socket.user?.userId }, 'Client connected to /emergency namespace');

      socket.join(`hospital:${hospitalId}`);

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /emergency namespace');
      });
    });
  }

  public broadcastEmergencyAlert(hospitalId: string, payload: EmergencyAlertPayload): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.EMERGENCY_ALERT_BROADCAST, payload);
  }
}
