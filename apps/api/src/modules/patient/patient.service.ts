/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { PatientRepository } from './patient.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class PatientService {
  private repository = new PatientRepository();

  async getPatientList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getPatientById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Patient not found', 404, 'NOT_FOUND');
    return item;
  }

  async createPatient(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updatePatient(id: string, data: any, hospitalId: string) {
    await this.getPatientById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deletePatient(id: string, hospitalId: string) {
    await this.getPatientById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

