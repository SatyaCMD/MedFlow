/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { AIService } from './ai.service.js';

export class AIController {
  private service = new AIService();

  // POST /api/v1/ai - Create AI record
  createAi = async (req: Request, res: Response): Promise<void> => {
    try {
      const record = await this.service.createAi(req.body);
      res.status(201).json({ success: true, message: 'AI clinical record created', data: record });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

  // GET /api/v1/ai - List AI records
  getAllAis = async (req: Request, res: Response): Promise<void> => {
    try {
      const { patientId, status } = req.query;
      const filter: any = {};
      if (patientId) filter.patientId = patientId;
      if (status) filter.status = status;

      const records = await this.service.getAllAis(filter);
      res.status(200).json({ success: true, count: records.length, data: records });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // GET /api/v1/ai/:id - Get AI record details
  getAiById = async (req: Request, res: Response): Promise<void> => {
    try {
      const record = await this.service.getAiById(req.params.id);
      res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  };

  // PUT /api/v1/ai/:id - Update AI record
  updateAi = async (req: Request, res: Response): Promise<void> => {
    try {
      const record = await this.service.updateAi(req.params.id, req.body);
      res.status(200).json({ success: true, message: 'AI clinical record updated', data: record });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  };

  // DELETE /api/v1/ai/:id - Delete AI record
  deleteAi = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.service.deleteAi(req.params.id);
      res.status(200).json({ success: true, message: 'AI clinical record deleted successfully' });
    } catch (error: any) {
      res.status(error.statusCode || 404).json({ success: false, message: error.message });
    }
  };

  // POST /api/v1/ai/soap-note - Generate SOAP note
  generateSoapNote = async (req: Request, res: Response): Promise<void> => {
    try {
      const { transcript } = req.body;
      const note = await this.service.generateSoapNote(transcript);
      res.status(200).json({ success: true, data: note });
    } catch (error: any) {
      res.status(error.statusCode || 400).json({ success: false, message: error.message });
    }
  };
}
