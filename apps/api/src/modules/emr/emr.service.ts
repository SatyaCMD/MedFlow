/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { EmrRepository } from './emr.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class EmrService {
  private repository = new EmrRepository();

  async getEmrList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getEmrById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Emr not found', 404, 'NOT_FOUND');
    return item;
  }

  async createEmr(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateEmr(id: string, data: any, hospitalId: string) {
    await this.getEmrById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteEmr(id: string, hospitalId: string) {
    await this.getEmrById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

