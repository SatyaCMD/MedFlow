/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { MessagingRepository } from './messaging.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class MessagingService {
  private repository = new MessagingRepository();

  async getMessagingList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getMessagingById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Messaging not found', 404, 'NOT_FOUND');
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

