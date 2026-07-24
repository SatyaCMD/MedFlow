/* eslint-disable @typescript-eslint/no-explicit-any */
import { BloodStock, BloodExchangeRecord, BloodGroup } from './bloodBank.model.js';
import { AppError } from '../../middleware/errorHandler.js';

const BLOOD_GROUPS: BloodGroup[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export class BloodBankService {
  async getInventory(hospitalId: string = 'HOSP-001') {
    let stocks = await BloodStock.find({ hospitalId });

    if (!stocks || stocks.length === 0) {
      const initialSeed = BLOOD_GROUPS.map((bg) => ({
        hospitalId,
        bloodGroup: bg,
        unitsAvailable: Math.floor(Math.random() * 20) + 15,
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

    // Ensure requested blood group inventory exists and has sufficient stock
    let reqStock = await BloodStock.findOne({ hospitalId, bloodGroup: data.requestedBloodGroup });
    if (!reqStock) {
      reqStock = await BloodStock.create({
        hospitalId,
        bloodGroup: data.requestedBloodGroup,
        unitsAvailable: 20,
      });
    }

    if (reqStock.unitsAvailable < requestedUnits) {
      throw new AppError(
        `Insufficient units available for ${data.requestedBloodGroup}. Available: ${reqStock.unitsAvailable}, Requested: ${requestedUnits}`,
        400,
        'INSUFFICIENT_BLOOD_STOCK'
      );
    }

    // Donated blood group stock increment (+1)
    let donorStock = await BloodStock.findOne({ hospitalId, bloodGroup: data.donorBloodGroup });
    if (!donorStock) {
      donorStock = await BloodStock.create({
        hospitalId,
        bloodGroup: data.donorBloodGroup,
        unitsAvailable: 10,
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
      donorBloodGroup: data.donorBloodGroup,
      donatedUnits,
      requestedBloodGroup: data.requestedBloodGroup,
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
