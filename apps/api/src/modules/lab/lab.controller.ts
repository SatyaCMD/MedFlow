/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Request, Response, NextFunction } from 'express';
import { LabService } from './lab.service.js';

export class LabController {
  private service = new LabService();

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      
      const results = await this.service.getLabList(
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
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.getLabById(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.createLab(req.body, hospitalId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.updateLab(req.params.id, req.body, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      await this.service.deleteLab(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };
}

