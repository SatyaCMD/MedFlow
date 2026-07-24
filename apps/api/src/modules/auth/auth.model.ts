/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Schema, model, Document } from 'mongoose';
import { Role, ROLES } from '@medicore360/shared';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  passwordSalt: string;
  firstName: string;
  lastName: string;
  role: Role;
  hospitalId: string;
  kycStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  medicalLicenseNumber?: string;
  specialty?: string;
  department?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    passwordSalt: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: Object.values(ROLES),
      default: ROLES.PATIENT,
    },
    hospitalId: { type: String, required: true, index: true },
    kycStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'REJECTED'],
      default: 'VERIFIED',
    },
    medicalLicenseNumber: { type: String, default: null },
    specialty: { type: String, default: null },
    department: { type: String, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export const User = model<IUser>('User', userSchema);


