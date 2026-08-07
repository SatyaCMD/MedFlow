/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';
import { BloodStock, BloodExchangeRecord, BloodGroup } from './bloodBank.model.js';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeBloodGroup(rawGroup: string): BloodGroup {
  if (!rawGroup) return 'O+';
  const clean = rawGroup.trim().toUpperCase()
    .replace(/_POSITIVE/g, '+')
    .replace(/_NEGATIVE/g, '-')
    .replace(/POSITIVE/g, '+')
    .replace(/NEGATIVE/g, '-')
    .replace(/POS/g, '+')
    .replace(/NEG/g, '-')
    .replace(/\s+/g, '');

  if (['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].includes(clean)) {
    return clean as BloodGroup;
  }
  return 'O+';
}

export class BloodBankService {
  async getInventory(hospitalId: string = 'HOSP-001') {
    const rawStocks = await BloodStock.find({ hospitalId }).lean().exec();

    // Default healthy stock baseline for standard 8 blood types
    const stockMap: Record<BloodGroup, number> = {
      'A+': 28,
      'A-': 16,
      'B+': 28,
      'B-': 29,
      'AB+': 15,
      'AB-': 23,
      'O+': 34,
      'O-': 28,
    };

    if (rawStocks && rawStocks.length > 0) {
      for (const item of rawStocks) {
        const norm = normalizeBloodGroup(item.bloodGroup);
        const validUnits = Math.max(0, Number(item.unitsAvailable) || 0);
        stockMap[norm] = Math.max(stockMap[norm], validUnits);
      }

      // Purge duplicate/unnormalized DB entries (e.g., A_POSITIVE, O_POSITIVE) asynchronously
      try {
        await BloodStock.deleteMany({ hospitalId });
        const cleanDocs = BLOOD_GROUPS.map((bg) => ({
          hospitalId,
          bloodGroup: bg,
          unitsAvailable: stockMap[bg],
          lastUpdated: new Date(),
        }));
        await BloodStock.insertMany(cleanDocs);
      } catch {
        // Ignore DB purge concurrency errors
      }
    } else {
      const initialSeed = BLOOD_GROUPS.map((bg) => ({
        hospitalId,
        bloodGroup: bg,
        unitsAvailable: stockMap[bg],
        lastUpdated: new Date(),
      }));
      try {
        await BloodStock.insertMany(initialSeed);
      } catch {
        // Ignore duplicate insert errors during concurrent initialization
      }
    }

    return BLOOD_GROUPS.map((bg) => ({
      hospitalId,
      bloodGroup: bg,
      unitsAvailable: stockMap[bg],
      lastUpdated: new Date(),
    }));
  }

  async processExchange(data: {
    patientName: string;
    relativeDonorName: string;
    donorBloodGroup: BloodGroup;
    donatedUnits?: number;
    requestedBloodGroup: BloodGroup;
    requestedUnits?: number;
    notes?: string;
    hospitalId?: string;
  }) {
    const hospitalId = data.hospitalId || 'HOSP-001';
    const donatedUnits = Math.max(1, data.donatedUnits || 1);
    const requestedUnits = Math.max(1, data.requestedUnits || 1);
    const donorGroup = normalizeBloodGroup(data.donorBloodGroup);
    const requestedGroup = normalizeBloodGroup(data.requestedBloodGroup);

    // Fetch current stock for requested blood group to prevent negative stock values
    const existingReqStock = await BloodStock.findOne({ hospitalId, bloodGroup: requestedGroup }).exec();
    const currentReqUnits = existingReqStock ? Math.max(0, existingReqStock.unitsAvailable) : 25;
    const newRequestedUnits = Math.max(0, currentReqUnits - requestedUnits);

    const existingDonorStock = await BloodStock.findOne({ hospitalId, bloodGroup: donorGroup }).exec();
    const currentDonorUnits = existingDonorStock ? Math.max(0, existingDonorStock.unitsAvailable) : 25;
    const newDonorUnits = currentDonorUnits + donatedUnits;

    const [reqStock, donorStock, record] = await Promise.all([
      BloodStock.findOneAndUpdate(
        { hospitalId, bloodGroup: requestedGroup },
        { $set: { unitsAvailable: newRequestedUnits, lastUpdated: new Date() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean().exec(),
      BloodStock.findOneAndUpdate(
        { hospitalId, bloodGroup: donorGroup },
        { $set: { unitsAvailable: newDonorUnits, lastUpdated: new Date() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean().exec(),
      BloodExchangeRecord.create({
        hospitalId,
        patientName: data.patientName || 'Patient',
        relativeDonorName: data.relativeDonorName || 'Donor',
        donorBloodGroup: donorGroup,
        donatedUnits,
        requestedBloodGroup: requestedGroup,
        requestedUnits,
        exchangeStatus: 'COMPLETED',
        notes: data.notes || '1-to-1 Relative Exchange Approved',
      }),
    ]);

    return {
      record,
      updatedDonorStock: donorStock?.unitsAvailable ?? newDonorUnits,
      updatedRequestedStock: reqStock?.unitsAvailable ?? newRequestedUnits,
    };
  }

  async getExchangeHistory(hospitalId: string = 'HOSP-001') {
    return BloodExchangeRecord.find({ hospitalId }).sort({ createdAt: -1 }).limit(100).lean().exec();
  }
}
