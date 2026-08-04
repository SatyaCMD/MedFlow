import mongoose, { Schema, Document } from 'mongoose';

export interface IKycDocument extends Document {
  userId: string;
  userName: string;
  userRole: string;
  userEmail?: string;
  docType: string;
  idNumber: string;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  s3Key?: string;
  s3Url?: string;
  bucket?: string;
  rejectionReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const KycDocumentSchema = new Schema<IKycDocument>(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    userEmail: { type: String },
    docType: { type: String, required: true, default: 'Aadhaar Card' },
    idNumber: { type: String, required: true },
    status: { type: String, enum: ['PENDING', 'VERIFIED', 'REJECTED'], default: 'VERIFIED' },
    s3Key: { type: String },
    s3Url: { type: String },
    bucket: { type: String },
    rejectionReason: { type: String },
  },
  { timestamps: true }
);

export const KycModel = mongoose.model<IKycDocument>('KycDocument', KycDocumentSchema);
