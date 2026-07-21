/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { LabRepository } from './lab.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class LabService {
  private repository = new LabRepository();

  async getLabList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getLabById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Lab not found', 404, 'NOT_FOUND');
    return item;
  }

  async createLab(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateLab(id: string, data: any, hospitalId: string) {
    await this.getLabById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteLab(id: string, hospitalId: string) {
    await this.getLabById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

