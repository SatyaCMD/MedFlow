/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Staff, IStaff } from './staff.model.js';

export class StaffRepository extends BaseRepository<IStaff> {
  constructor() {
    super(Staff);
  }
}

