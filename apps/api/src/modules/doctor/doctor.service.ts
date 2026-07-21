/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { DoctorRepository } from './doctor.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class DoctorService {
  private repository = new DoctorRepository();

  async getDoctorList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getDoctorById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Doctor not found', 404, 'NOT_FOUND');
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

