/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Request, Response, NextFunction } from 'express';
import { DoctorService } from './doctor.service.js';

export class DoctorController {
  private service = new DoctorService();

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      
      const results = await this.service.getDoctorList(
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
      const result = await this.service.getDoctorById(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.createDoctor(req.body, hospitalId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.updateDoctor(req.params.id, req.body, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      await this.service.deleteDoctor(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };
}

