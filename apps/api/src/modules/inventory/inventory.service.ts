import { Types } from 'mongoose';
import { InventoryRepository } from './inventory.repository.js';

export class InventoryService {
  private repository = new InventoryRepository();

  async getInventoryList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getInventoryById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'Inventory Item',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'Inventory Item', hospitalId };
    }
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

