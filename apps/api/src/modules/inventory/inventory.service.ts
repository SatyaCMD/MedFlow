/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { InventoryRepository } from './inventory.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class InventoryService {
  private repository = new InventoryRepository();

  async getInventoryList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getInventoryById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Inventory not found', 404, 'NOT_FOUND');
    return item;
  }

  async createInventory(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateInventory(id: string, data: any, hospitalId: string) {
    await this.getInventoryById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteInventory(id: string, hospitalId: string) {
    await this.getInventoryById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

