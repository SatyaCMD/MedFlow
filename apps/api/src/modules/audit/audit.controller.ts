/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AuditService } from './audit.service.js';

export class AuditController {
  // POST /api/v1/audit - Create audit log entry
  static async createAudit(req: Request, res: Response): Promise<void> {
    try {
      const log = await AuditService.createAudit(req.body);
      res.status(201).json({ success: true, message: 'Audit log created', data: log });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/audit - List audit logs
  static async getAllAudits(req: Request, res: Response): Promise<void> {
    try {
      const { hospitalId, action, userId } = req.query;
      const filter: any = {};
      if (hospitalId) filter.hospitalId = hospitalId;
      if (action) filter.action = action;
      if (userId) filter.userId = userId;

      const logs = await AuditService.getAllAudits(filter);
      res.status(200).json({ success: true, count: logs.length, data: logs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/audit/:id - Get audit log details
  static async getAuditById(req: Request, res: Response): Promise<void> {
    try {
      const log = await AuditService.getAuditById(req.params.id);
      res.status(200).json({ success: true, data: log });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  }

  // PUT /api/v1/audit/:id - Update audit log entry
  static async updateAudit(req: Request, res: Response): Promise<void> {
    try {
      const log = await AuditService.updateAudit(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'Audit log updated', data: log });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/v1/audit/:id - Delete audit log entry
  static async deleteAudit(req: Request, res: Response): Promise<void> {
    try {
      await AuditService.deleteAudit(req.params.id);
      res.status(200).json({ success: true, message: 'Audit log deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  }
}
