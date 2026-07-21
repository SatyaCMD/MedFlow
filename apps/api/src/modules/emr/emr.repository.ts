/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Emr, IEmr } from './emr.model.js';

export class EmrRepository extends BaseRepository<IEmr> {
  constructor() {
    super(Emr);
  }
}

