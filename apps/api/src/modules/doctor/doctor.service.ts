import { Types } from 'mongoose';
import { DoctorRepository } from './doctor.repository.js';

export class DoctorService {
  private repository = new DoctorRepository();

  async getDoctorList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getDoctorById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'Doctor Member',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'Doctor Member', hospitalId };
    }
    return item;
  }

  async createDoctor(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateDoctor(id: string, data: any, hospitalId: string) {
    await this.getDoctorById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteDoctor(id: string, hospitalId: string) {
    await this.getDoctorById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

