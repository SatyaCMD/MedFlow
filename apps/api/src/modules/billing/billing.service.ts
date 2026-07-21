/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BillingRepository } from './billing.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class BillingService {
  private repository = new BillingRepository();

  async getBillingList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getBillingById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Billing not found', 404, 'NOT_FOUND');
    return item;
  }

  async createBilling(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateBilling(id: string, data: any, hospitalId: string) {
    await this.getBillingById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteBilling(id: string, hospitalId: string) {
    await this.getBillingById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

