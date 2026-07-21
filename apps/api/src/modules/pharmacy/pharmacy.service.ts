/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { PharmacyRepository } from './pharmacy.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class PharmacyService {
  private repository = new PharmacyRepository();

  async getPharmacyList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getPharmacyById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Pharmacy not found', 404, 'NOT_FOUND');
    return item;
  }

  async createPharmacy(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updatePharmacy(id: string, data: any, hospitalId: string) {
    await this.getPharmacyById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deletePharmacy(id: string, hospitalId: string) {
    await this.getPharmacyById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

