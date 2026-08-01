import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS, AmbulanceLocationPayload } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';
import { socketRateLimiter } from '../socketRateLimit.middleware.js';

export class TrackingNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/tracking');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const hospitalId = socket.user?.hospitalId || 'HOSPITAL-GLOBAL';
      logger.info({ socketId: socket.id, userId: socket.user?.userId }, 'Client connected to /tracking namespace');

      // Automatically join hospital room & user room
      socket.join(`hospital:${hospitalId}`);

      // Drivers / Monitors can join specific ambulance room
      socket.on('join_ambulance_room', (ambulanceId: string) => {
        socket.join(`ambulance:${ambulanceId}`);
        logger.debug({ socketId: socket.id, ambulanceId }, 'Joined ambulance tracking room.');
      });

      // Driver App streams GPS coordinates
      socket.on('update_location', (payload: AmbulanceLocationPayload) => {
        if (!socketRateLimiter(socket, 50, 10000)) return;

        // Broadcast live GPS update to hospital room & ambulance specific room
        this.nsp.to(`hospital:${hospitalId}`).to(`ambulance:${payload.ambulanceId}`).emit(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATED, payload);
      });

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /tracking namespace');
      });
    });
  }

  public broadcastLocationUpdate(hospitalId: string, payload: AmbulanceLocationPayload): void {
    this.nsp.to(`hospital:${hospitalId}`).to(`ambulance:${payload.ambulanceId}`).emit(SOCKET_EVENTS.AMBULANCE_LOCATION_UPDATED, payload);
  }
}
