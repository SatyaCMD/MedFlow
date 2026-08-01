import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class NotificationsNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/notifications');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const userId = socket.user?.userId;
      const role = socket.user?.role;
      const hospitalId = socket.user?.hospitalId || 'HOSPITAL-GLOBAL';

      logger.info({ socketId: socket.id, userId, role }, 'Client connected to /notifications namespace');

      if (userId) socket.join(`user:${userId}`);
      if (role) socket.join(`role:${role}`);
      if (hospitalId) socket.join(`hospital:${hospitalId}`);

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /notifications namespace');
      });
    });
  }

  public sendNotificationToUser(userId: string, notification: any): void {
    this.nsp.to(`user:${userId}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  }

  public sendNotificationToRole(role: string, notification: any): void {
    this.nsp.to(`role:${role}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  }

  public broadcastNotification(hospitalId: string, notification: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.NOTIFICATION_CREATED, notification);
  }
}
