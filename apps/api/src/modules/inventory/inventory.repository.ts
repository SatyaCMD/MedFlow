/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { BaseRepository } from '../BaseRepository.js';
import { Inventory, IInventory } from './inventory.model.js';

export class InventoryRepository extends BaseRepository<IInventory> {
  constructor() {
    super(Inventory);
  }
}

