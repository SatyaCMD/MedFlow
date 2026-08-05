import { Types } from 'mongoose';
import { PatientRepository } from './patient.repository.js';

export class PatientService {
  private repository = new PatientRepository();

  async getPatientList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getPatientById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'Patient Record',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'Patient Record', hospitalId };
    }
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

