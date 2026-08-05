/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Types } from 'mongoose';
import { MessagingRepository } from './messaging.repository.js';

export class MessagingService {
  private repository = new MessagingRepository();

  async getMessagingList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getMessagingById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'System Message',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'System Message', hospitalId };
    }
    return item;
  }

  async createMessaging(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateMessaging(id: string, data: any, hospitalId: string) {
    await this.getMessagingById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteMessaging(id: string, hospitalId: string) {
    await this.getMessagingById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

