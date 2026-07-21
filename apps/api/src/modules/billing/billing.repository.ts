/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Billing, IBilling } from './billing.model.js';

export class BillingRepository extends BaseRepository<IBilling> {
  constructor() {
    super(Billing);
  }
}

