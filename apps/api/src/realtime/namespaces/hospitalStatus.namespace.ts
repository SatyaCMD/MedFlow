import { Namespace, Server } from 'socket.io';
import { AuthenticatedSocket, socketAuthMiddleware } from '../socketAuth.middleware.js';
import { SOCKET_EVENTS } from '@medicore360/shared';
import { logger } from '../../lib/logger.js';

export class HospitalStatusNamespace {
  private nsp: Namespace;

  constructor(io: Server) {
    this.nsp = io.of('/hospital-status');
    this.nsp.use(socketAuthMiddleware as any);
    this.setupListeners();
  }

  private setupListeners(): void {
    this.nsp.on('connection', (socket: AuthenticatedSocket) => {
      const hospitalId = socket.user?.hospitalId || 'HOSPITAL-GLOBAL';
      logger.info({ socketId: socket.id, userId: socket.user?.userId }, 'Client connected to /hospital-status namespace');

      socket.join(`hospital:${hospitalId}`);

      socket.on('disconnect', () => {
        logger.debug({ socketId: socket.id }, 'Disconnected from /hospital-status namespace');
      });
    });
  }

  public broadcastBedStatus(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.BED_STATUS_UPDATED, payload);
  }

  public broadcastBloodStock(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.BLOOD_STOCK_UPDATED, payload);
  }

  public broadcastDoctorStatus(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.DOCTOR_STATUS_CHANGED, payload);
  }

  public broadcastOTStatus(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.OT_STATUS_UPDATED, payload);
  }

  public broadcastPharmacyStock(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.PHARMACY_STOCK_UPDATED, payload);
  }

  public broadcastLabStatus(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.LAB_STATUS_UPDATED, payload);
  }

  public broadcastLiveMetrics(hospitalId: string, payload: any): void {
    this.nsp.to(`hospital:${hospitalId}`).emit(SOCKET_EVENTS.METRICS_UPDATED, payload);
  }
}
