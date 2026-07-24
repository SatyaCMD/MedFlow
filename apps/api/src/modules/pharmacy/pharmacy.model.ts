/* eslint-disable @typescript-eslint/no-explicit-any */
import { Schema, model, Document } from 'mongoose';

export interface IPharmacy extends Document {
  hospitalId: string;
  name: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacySchema = new Schema<IPharmacy>(
  {
    hospitalId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const Pharmacy = model<IPharmacy>('Pharmacy', pharmacySchema);

export interface IPharmacyItem extends Document {
  hospitalId: string;
  itemId: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  stock: number;
  batch: string;
  expiry: string;
  description: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const pharmacyItemSchema = new Schema<IPharmacyItem>(
  {
    hospitalId: { type: String, required: true, index: true },
    itemId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    unit: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    batch: { type: String, required: true },
    expiry: { type: String, required: true },
    description: { type: String, default: '' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const PharmacyItemModel = model<IPharmacyItem>('PharmacyItem', pharmacyItemSchema);
