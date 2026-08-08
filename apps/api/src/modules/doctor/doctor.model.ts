/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Schema, model, Document } from 'mongoose';

export interface IDoctor extends Document {
  hospitalId: string;
  name: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    hospitalId: { type: String, required: true, index: true },
    name: { type: String, required: true },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// High-Throughput Compound Indexes
doctorSchema.index({ hospitalId: 1, deletedAt: 1, createdAt: -1 });
doctorSchema.index({ hospitalId: 1, name: 1 });

export const Doctor = model<IDoctor>('Doctor', doctorSchema);

