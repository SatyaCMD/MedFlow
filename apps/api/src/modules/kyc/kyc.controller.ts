/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { KycService } from './kyc.service.js';

export class KycController {
  // POST /api/v1/kyc - Create KYC document entry
  static async createKyc(req: Request, res: Response): Promise<void> {
    try {
      const kyc = await KycService.createKyc(req.body);
      res.status(201).json({ success: true, message: 'KYC record created', data: kyc });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/kyc - List KYC records
  static async getAllKycs(req: Request, res: Response): Promise<void> {
    try {
      const { userId, status } = req.query;
      const filter: any = {};
      if (userId) filter.userId = userId;
      if (status) filter.status = status;

      const kycs = await KycService.getAllKycs(filter);
      res.status(200).json({ success: true, count: kycs.length, data: kycs });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  // GET /api/v1/kyc/:id - Get KYC details by ID
  static async getKycById(req: Request, res: Response): Promise<void> {
    try {
      const kyc = await KycService.getKycById(req.params.id);
      res.status(200).json({ success: true, data: kyc });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  }

  // PUT /api/v1/kyc/:id - Update KYC record
  static async updateKyc(req: Request, res: Response): Promise<void> {
    try {
      const kyc = await KycService.updateKyc(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'KYC record updated', data: kyc });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  }

  // DELETE /api/v1/kyc/:id - Delete KYC record
  static async deleteKyc(req: Request, res: Response): Promise<void> {
    try {
      await KycService.deleteKyc(req.params.id);
      res.status(200).json({ success: true, message: 'KYC record deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  }
}
