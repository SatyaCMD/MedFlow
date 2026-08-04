/* eslint-disable @typescript-eslint/no-explicit-any */
import { AuditLog, IAuditLog } from './AuditLog.model.js';
import { AppError } from '../../middleware/errorHandler.js';

export class AuditService {
  static async createAudit(data: Partial<IAuditLog>): Promise<IAuditLog> {
    const log = new AuditLog({
      hospitalId: data.hospitalId || 'HOSP-001',
      userId: data.userId || 'usr_admin',
      action: data.action || 'SYSTEM_AUDIT_EVENT',
      details: data.details || {},
      ip: data.ip || '127.0.0.1',
      userAgent: data.userAgent || 'PostmanRuntime/7.36.0',
    });
    return log.save();
  }

  static async getAllAudits(filter: any = {}): Promise<IAuditLog[]> {
    return AuditLog.find(filter).sort({ createdAt: -1 });
  }

  static async getAuditById(id: string): Promise<IAuditLog> {
    const log = await AuditLog.findById(id);
    if (!log) throw new AppError('Audit record not found', 404, 'NOT_FOUND');
    return log;
  }

  static async updateAudit(id: string, _data: Partial<IAuditLog>): Promise<IAuditLog> {
    const log = await AuditLog.findById(id);
    if (!log) throw new AppError('Audit record not found', 404, 'NOT_FOUND');
    return log;
  }

  static async deleteAudit(id: string): Promise<IAuditLog> {
    const log = await AuditLog.findByIdAndDelete(id);
    if (!log) throw new AppError('Audit record not found', 404, 'NOT_FOUND');
    return log;
  }
}
