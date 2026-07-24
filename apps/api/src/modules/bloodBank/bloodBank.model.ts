/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document } from 'mongoose';

export type BloodGroup = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export interface IBloodStock extends Document {
  hospitalId: string;
  bloodGroup: BloodGroup;
  unitsAvailable: number;
  lastUpdated: Date;
}

export interface IBloodExchangeRecord extends Document {
  hospitalId: string;
  patientName: string;
  relativeDonorName: string;
  donorBloodGroup: BloodGroup;
  donatedUnits: number;
  requestedBloodGroup: BloodGroup;
  requestedUnits: number;
  exchangeStatus: 'COMPLETED' | 'PENDING' | 'REJECTED';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bloodStockSchema = new Schema<IBloodStock>(
  {
    hospitalId: { type: String, required: true, index: true },
    bloodGroup: { type: String, required: true },
    unitsAvailable: { type: Number, required: true, default: 10 },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const bloodExchangeRecordSchema = new Schema<IBloodExchangeRecord>(
  {
    hospitalId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    relativeDonorName: { type: String, required: true },
    donorBloodGroup: { type: String, required: true },
    donatedUnits: { type: Number, required: true, default: 1 },
    requestedBloodGroup: { type: String, required: true },
    requestedUnits: { type: Number, required: true, default: 1 },
    exchangeStatus: { type: String, enum: ['COMPLETED', 'PENDING', 'REJECTED'], default: 'COMPLETED' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const BloodStock = model<IBloodStock>('BloodStock', bloodStockSchema);
export const BloodExchangeRecord = model<IBloodExchangeRecord>('BloodExchangeRecord', bloodExchangeRecordSchema);
