/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Pharmacy, IPharmacy } from './pharmacy.model.js';

export class PharmacyRepository extends BaseRepository<IPharmacy> {
  constructor() {
    super(Pharmacy);
  }
}

