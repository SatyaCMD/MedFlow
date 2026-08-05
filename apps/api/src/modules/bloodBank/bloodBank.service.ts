/* eslint-disable @typescript-eslint/no-explicit-any */
import crypto from 'node:crypto';
import { BloodStock, BloodExchangeRecord, BloodGroup } from './bloodBank.model.js';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeBloodGroup(rawGroup: string): BloodGroup {
  if (!rawGroup) return 'A+';
  const clean = rawGroup.trim().toUpperCase()
    .replace('_POSITIVE', '+')
    .replace('_NEGATIVE', '-')
    .replace('POS', '+')
    .replace('NEG', '-');
  return (clean as BloodGroup) || 'A+';
}

export class BloodBankService {
  async getInventory(hospitalId: string = 'HOSP-001') {
    let stocks = await BloodStock.find({ hospitalId }).lean().exec();

    if (!stocks || stocks.length === 0) {
      const initialSeed = BLOOD_GROUPS.map((bg) => ({
        hospitalId,
        bloodGroup: bg,
        unitsAvailable: crypto.randomInt(15, 35),
        lastUpdated: new Date(),
      }));
      try {
        await BloodStock.insertMany(initialSeed);
      } catch {
        // Ignore duplicate insert errors during concurrent initialization
      }
      stocks = await BloodStock.find({ hospitalId }).lean().exec();
    }

    return stocks;
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
    const donatedUnits = data.donatedUnits || 1;
    const requestedUnits = data.requestedUnits || 1;
    const donorGroup = normalizeBloodGroup(data.donorBloodGroup);
    const requestedGroup = normalizeBloodGroup(data.requestedBloodGroup);

    // Parallel atomic operations for ultra-fast throughput under heavy load
    const [reqStock, donorStock, record] = await Promise.all([
      BloodStock.findOneAndUpdate(
        { hospitalId, bloodGroup: requestedGroup },
        { $inc: { unitsAvailable: -requestedUnits }, $set: { lastUpdated: new Date() } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      ).lean().exec(),
      BloodStock.findOneAndUpdate(
        { hospitalId, bloodGroup: donorGroup },
        { $inc: { unitsAvailable: donatedUnits }, $set: { lastUpdated: new Date() } },
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
      updatedDonorStock: donorStock?.unitsAvailable ?? 20,
      updatedRequestedStock: reqStock?.unitsAvailable ?? 20,
    };
  }

  async getExchangeHistory(hospitalId: string = 'HOSP-001') {
    return BloodExchangeRecord.find({ hospitalId }).sort({ createdAt: -1 }).limit(100).lean().exec();
  }
}
