/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Messaging, IMessaging } from './messaging.model.js';

export class MessagingRepository extends BaseRepository<IMessaging> {
  constructor() {
    super(Messaging);
  }
}

