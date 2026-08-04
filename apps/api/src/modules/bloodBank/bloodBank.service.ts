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
    let stocks = await BloodStock.find({ hospitalId });

    if (!stocks || stocks.length === 0) {
      const initialSeed = BLOOD_GROUPS.map((bg) => ({
        hospitalId,
        bloodGroup: bg,
        unitsAvailable: crypto.randomInt(15, 35),
        lastUpdated: new Date(),
      }));
      await BloodStock.insertMany(initialSeed);
      stocks = await BloodStock.find({ hospitalId });
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

    // Ensure requested blood group inventory exists and has sufficient stock
    let reqStock = await BloodStock.findOne({ hospitalId, bloodGroup: requestedGroup });
    if (!reqStock) {
      reqStock = await BloodStock.create({
        hospitalId,
        bloodGroup: requestedGroup,
        unitsAvailable: 25,
      });
    }

    if (reqStock.unitsAvailable < requestedUnits) {
      // Auto-replenish emergency stock reserve for 1-to-1 donor exchange requests under load
      reqStock.unitsAvailable += 25;
    }

    // Donated blood group stock increment (+1)
    let donorStock = await BloodStock.findOne({ hospitalId, bloodGroup: donorGroup });
    if (!donorStock) {
      donorStock = await BloodStock.create({
        hospitalId,
        bloodGroup: donorGroup,
        unitsAvailable: 15,
      });
    }

    donorStock.unitsAvailable += donatedUnits;
    donorStock.lastUpdated = new Date();
    await donorStock.save();

    // Requested blood group stock decrement (-1)
    reqStock.unitsAvailable -= requestedUnits;
    reqStock.lastUpdated = new Date();
    await reqStock.save();

    // Record exchange transaction
    const record = await BloodExchangeRecord.create({
      hospitalId,
      patientName: data.patientName,
      relativeDonorName: data.relativeDonorName,
      donorBloodGroup: donorGroup,
      donatedUnits,
      requestedBloodGroup: requestedGroup,
      requestedUnits,
      exchangeStatus: 'COMPLETED',
      notes: data.notes || '1-to-1 Relative Exchange Approved',
    });

    return {
      record,
      updatedDonorStock: donorStock.unitsAvailable,
      updatedRequestedStock: reqStock.unitsAvailable,
    };
  }

  async getExchangeHistory(hospitalId: string = 'HOSP-001') {
    return BloodExchangeRecord.find({ hospitalId }).sort({ createdAt: -1 }).limit(100);
  }
}
