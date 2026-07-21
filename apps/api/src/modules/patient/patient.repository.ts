/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Patient, IPatient } from './patient.model.js';

export class PatientRepository extends BaseRepository<IPatient> {
  constructor() {
    super(Patient);
  }
}

