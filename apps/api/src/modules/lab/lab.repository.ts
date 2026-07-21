/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Lab, ILab } from './lab.model.js';

export class LabRepository extends BaseRepository<ILab> {
  constructor() {
    super(Lab);
  }
}

