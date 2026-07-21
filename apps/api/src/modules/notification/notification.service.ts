/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { NotificationRepository } from './notification.repository.js';
import { AppError } from '../../middleware/errorHandler.js';

export class NotificationService {
  private repository = new NotificationRepository();

  async getNotificationList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getNotificationById(id: string, hospitalId: string) {
    const item = await this.repository.findById(id, hospitalId);
    if (!item) throw new AppError('Notification not found', 404, 'NOT_FOUND');
    return item;
  }

  async createNotification(data: any, hospitalId: string) {
    return this.repository.create(data, hospitalId);
  }

  async updateNotification(id: string, data: any, hospitalId: string) {
    await this.getNotificationById(id, hospitalId); // verify exists
    return this.repository.update(id, data, hospitalId);
  }

  async deleteNotification(id: string, hospitalId: string) {
    await this.getNotificationById(id, hospitalId); // verify exists
    return this.repository.softDelete(id, hospitalId);
  }
}

