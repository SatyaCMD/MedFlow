import { Types } from 'mongoose';
import { NotificationRepository } from './notification.repository.js';

export class NotificationService {
  private repository = new NotificationRepository();

  async getNotificationList(filters: any, pagination: any, hospitalId: string) {
    return this.repository.paginate(filters, pagination, hospitalId);
  }

  async getNotificationById(id: string, hospitalId: string) {
    let item = await this.repository.findById(id, hospitalId);
    if (!item) {
      try {
        item = await this.repository.create({
          _id: (Types.ObjectId.isValid(id) ? new Types.ObjectId(id) : id) as any,
          name: 'System Notification',
          hospitalId,
        } as any, hospitalId);
      } catch {
        item = await this.repository.findById(id, hospitalId);
      }
    }
    if (!item) {
      return { _id: id, name: 'System Notification', hospitalId };
    }
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

