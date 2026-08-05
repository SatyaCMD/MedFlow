import { Types } from 'mongoose';
import { StaffRepository } from './staff.repository.js';

export class StaffService {
  private repository = new StaffRepository();

  async getStaffList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getStaffById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'Staff Member',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'Staff Member', hospitalId };
    }
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

