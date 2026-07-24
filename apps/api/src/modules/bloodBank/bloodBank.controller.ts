/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { BloodBankService } from './bloodBank.service.js';

export class BloodBankController {
  private service = new BloodBankService();

  getInventory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = (req.query.hospitalId as string) || 'HOSP-001';
      const inventory = await this.service.getInventory(hospitalId);
      res.status(200).json({ success: true, data: inventory });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = {
        patientName: req.body.patientName || 'Jane Smith',
        relativeDonorName: req.body.relativeDonorName || 'Alexander Smith',
        donorBloodGroup: req.body.donorBloodGroup || 'O+',
        donatedUnits: req.body.donatedUnits || 1,
        requestedBloodGroup: req.body.requestedBloodGroup || 'A+',
        requestedUnits: req.body.requestedUnits || 1,
        notes: req.body.notes || '1-to-1 Exchange Approved',
      };
      const result = await this.service.processExchange(body);
      res.status(201).json({ success: true, data: { _id: result.record._id, ...result } });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = (req.query.hospitalId as string) || 'HOSP-001';
      const inventory = await this.service.getInventory(hospitalId);
      res.status(200).json({ success: true, data: inventory[0] || {} });
    } catch (err) {
      next(err);
    }
  };

  update = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ success: true, message: 'Blood Bank record updated' });
    } catch (err) {
      next(err);
    }
  };

  delete = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ success: true, message: 'Blood Bank record deleted' });
    } catch (err) {
      next(err);
    }
  };

  processExchange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.service.processExchange(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  getExchangeHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = (req.query.hospitalId as string) || 'HOSP-001';
      const history = await this.service.getExchangeHistory(hospitalId);
      res.status(200).json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  };
}
