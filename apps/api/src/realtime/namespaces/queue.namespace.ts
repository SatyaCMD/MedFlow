import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS, QueueTokenPayload } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class QueueNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/queue');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const hospitalId = socket.user?.hospitalId || 'HOSPITAL-GLOBAL';
      logger.info({ socketId: socket.id, userId: socket.user?.userId }, 'Client connected to /queue namespace');

      socket.join(`hospital:${hospitalId}`);

      // Doctor/Patient subscribe to doctor OPD room
      socket.on('join_doctor_opd', (doctorId: string) => {
        socket.join(`doctor_opd:${doctorId}`);
        logger.debug({ socketId: socket.id, doctorId }, 'Joined Doctor OPD Queue room.');
      });

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /queue namespace');
      });
    });
  }

  public broadcastQueueTokenUpdate(hospitalId: string, payload: QueueTokenPayload): void {
    this.nsp.to(`hospital:${hospitalId}`).to(`doctor_opd:${payload.doctorId}`).emit(SOCKET_EVENTS.QUEUE_TOKEN_UPDATED, payload);
  }
}
