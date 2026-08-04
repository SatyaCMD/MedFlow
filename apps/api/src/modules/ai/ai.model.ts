import mongoose, { Schema, Document } from 'mongoose';

export interface IAiRecord extends Document {
  patientId?: string;
  transcript?: string;
  soapNote?: {
    subjective: string;
    objective: string;
    assessment: string;
    plan: string;
  };
  summary?: string;
  modelName: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const AiRecordSchema = new Schema<IAiRecord>(
  {
    patientId: { type: String, index: true },
    transcript: { type: String },
    soapNote: {
      subjective: { type: String },
      objective: { type: String },
      assessment: { type: String },
      plan: { type: String },
    },
    summary: { type: String },
    modelName: { type: String, default: 'MediCore-Clinical-CoPilot-v2' },
    status: { type: String, default: 'COMPLETED' },
  },
  { timestamps: true }
);

export const AiRecordModel = mongoose.model<IAiRecord>('AiRecord', AiRecordSchema);
