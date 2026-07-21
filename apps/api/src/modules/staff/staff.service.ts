/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { StaffRepository } from './staff.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class StaffService {
  private repository = new StaffRepository();

  async getStaffList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getStaffById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Staff not found', 404, 'NOT_FOUND');
    return item;
  }

  async createStaff(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateStaff(id: string, data: any, hospitalId: string) {
    await this.getStaffById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteStaff(id: string, hospitalId: string) {
    await this.getStaffById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

