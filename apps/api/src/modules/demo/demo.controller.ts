/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Request, Response, NextFunction } from 'express';
import { DemoService } from './demo.service.js';

export class DemoController {
  private service = new DemoService();

  private getHospitalId(req: Request): string {
    return req.user?.hospitalId || (req.headers['x-hospital-id'] as string) || 'HOSP-001';
  }

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = this.getHospitalId(req);
      
      const page = req.query.page ? Number.parseInt(req.query.page as string, 10) : undefined;
      const limit = req.query.limit ? Number.parseInt(req.query.limit as string, 10) : undefined;
      const sortBy = req.query.sortBy as string | undefined;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' | undefined;

      const filters = { ...req.query };
      delete filters.page;
      delete filters.limit;
      delete filters.sortBy;
      delete filters.sortOrder;

      const results = await this.service.getDemoList(
        filters,
        { page, limit, sortBy, sortOrder },
        hospitalId
      );
      
      res.status(200).json({
        success: true,
        data: results.items,
        meta: results.meta,
      });
    } catch (err) {
      next(err);
    }
  };

  getOne = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = this.getHospitalId(req);
      const result = await this.service.getDemoById(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = this.getHospitalId(req);
      const result = await this.service.createDemo(req.body, hospitalId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = this.getHospitalId(req);
      const result = await this.service.updateDemo(req.params.id, req.body, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = this.getHospitalId(req);
      await this.service.deleteDemo(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };
}

