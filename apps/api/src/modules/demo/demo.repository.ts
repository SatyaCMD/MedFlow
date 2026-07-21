/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Demo, IDemo } from './demo.model.js';

export class DemoRepository extends BaseRepository<IDemo> {
  constructor() {
    super(Demo);
  }
}

