/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Notification, INotification } from './notification.model.js';

export class NotificationRepository extends BaseRepository<INotification> {
  constructor() {
    super(Notification);
  }
}

