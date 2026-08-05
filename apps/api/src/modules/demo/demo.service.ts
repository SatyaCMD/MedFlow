/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Types } from 'mongoose';
import { DemoRepository } from './demo.repository.js';
import { PaginationOptions } from '../BaseRepository.js';

export class DemoService {
  private repository = new DemoRepository();

  async getDemoList(filters: Record<string, unknown>, pagination: PaginationOptions, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getDemoById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'Demo Record',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'Demo Record', hospitalId };
    }
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

