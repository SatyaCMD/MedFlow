/* eslint-disable @typescript-eslint/no-explicit-any */
import { PharmacyItemModel } from './pharmacy.model.js';

export class PharmacyService {
  async getPharmacyList(hospitalId: string = 'HOSP-001') {
    return PharmacyItemModel.find({ hospitalId, deletedAt: null }).sort({ category: 1, name: 1 });
  }

  async syncCatalog(items: any[], hospitalId: string = 'HOSP-001') {
    if (!items || items.length === 0) return { syncedCount: 0 };

    const operations = items.map((item) => ({
      updateOne: {
        filter: { hospitalId, itemId: item.id || item.itemId },
        update: {
          $set: {
            hospitalId,
            itemId: item.id || item.itemId,
            name: item.name,
            category: item.category || 'SURGICAL_SUPPLY',
            price: item.price || 100,
            unit: item.unit || 'Unit',
            stock: item.stock || 50,
            batch: item.batch || 'BATCH-001',
            expiry: item.expiry || 'Dec 2028',
            description: item.description || '',
            deletedAt: null,
          },
        },
        upsert: true,
      },
    }));

    const result = await PharmacyItemModel.bulkWrite(operations);
    return { syncedCount: (result.upsertedCount || 0) + (result.modifiedCount || 0) };
  }

  async updateStock(itemId: string, quantityChange: number, hospitalId: string = 'HOSP-001') {
    let item = await PharmacyItemModel.findOne({ hospitalId, itemId, deletedAt: null });

    if (!item) {
      // Auto-provision item if database catalog sync has not run yet
      item = await PharmacyItemModel.create({
        hospitalId,
        itemId,
        name: `Medical Equipment (${itemId})`,
        category: 'SURGICAL_SUPPLY',
        price: 350,
        unit: 'Set',
        stock: 50,
        batch: 'AUTO-SEED',
        expiry: 'Dec 2029',
        description: 'Auto-provisioned inventory item',
      });
    }

    const newStock = Math.max(0, item.stock + quantityChange);
    item.stock = newStock;
    await item.save();
    return item;
  }
}
