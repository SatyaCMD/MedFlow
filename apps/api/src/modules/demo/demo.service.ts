/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { DemoRepository } from './demo.repository.js';
import { AppError } from '../../middleware/errorHandler.js';
import { PaginationOptions } from '../BaseRepository.js';

export class DemoService {
  private repository = new DemoRepository();

  async getDemoList(filters: Record<string, unknown>, pagination: PaginationOptions, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getDemoById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Demo not found', 404, 'NOT_FOUND');
    return item;
  }

  async createDemo(data: Record<string, unknown>, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateDemo(id: string, data: Record<string, unknown>, hospitalId: string) {
    await this.getDemoById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteDemo(id: string, hospitalId: string) {
    await this.getDemoById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

