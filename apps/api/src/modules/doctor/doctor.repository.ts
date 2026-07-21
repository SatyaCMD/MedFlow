/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Doctor, IDoctor } from './doctor.model.js';

export class DoctorRepository extends BaseRepository<IDoctor> {
  constructor() {
    super(Doctor);
  }
}

