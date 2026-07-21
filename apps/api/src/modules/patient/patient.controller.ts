/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Request, Response, NextFunction } from 'express';
import { PatientService } from './patient.service.js';

export class PatientController {
  private service = new PatientService();

  getMany = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const { page, limit, sortBy, sortOrder, ...filters } = req.query;
      
      const results = await this.service.getPatientList(
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
      const result = await this.service.getPatientById(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.createPatient(req.body, hospitalId);
      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      const result = await this.service.updatePatient(req.params.id, req.body, hospitalId);
      res.status(200).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  };

  delete = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hospitalId = req.user!.hospitalId;
      await this.service.deletePatient(req.params.id, hospitalId);
      res.status(200).json({ success: true, data: null });
    } catch (err) {
      next(err);
    }
  };
}

