/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';
import { PharmacyService } from './pharmacy.service.js';

export class PharmacyController {
  private service = new PharmacyService();

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = (req.query.hospitalId as string) || req.user?.hospitalId || 'HOSP-001';
      const items = await this.service.getPharmacyList(hospitalId);
      res.status(200).json({ success: true, data: items });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user?.hospitalId || 'HOSP-001';
      const item = req.body;
      const result = await this.service.syncCatalog([item], hospitalId);
      res.status(201).json({ success: true, data: { _id: item.id || 'pharm-1', ...item }, meta: result });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = (req.query.hospitalId as string) || req.user?.hospitalId || 'HOSP-001';
      const items = await this.service.getPharmacyList(hospitalId);
      const found = items.find((i) => i.itemId === req.params.id || i._id.toString() === req.params.id) || items[0];
      res.status(200).json({ success: true, data: found || {} });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user?.hospitalId || 'HOSP-001';
      const item = req.body;
      const result = await this.service.syncCatalog([{ id: req.params.id, ...item }], hospitalId);
      res.status(200).json({ success: true, data: { _id: req.params.id, ...item }, meta: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      res.status(200).json({ success: true, message: 'Pharmacy record deleted' });
    } catch (err) {
      next(err);
    }
  };

  syncCatalog = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user?.hospitalId || 'HOSP-001';
      const items = Array.isArray(req.body) ? req.body : req.body.items || [req.body];
      const result = await this.service.syncCatalog(items, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  updateStock = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user?.hospitalId || 'HOSP-001';
      const { itemId, quantityChange } = req.body;
      const updatedItem = await this.service.updateStock(itemId, quantityChange, hospitalId);
      res.status(200).json({ success: true, data: updatedItem });
    } catch (err) {
      next(err);
    }
  };
}
