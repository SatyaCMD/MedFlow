import mongoose, { Schema, Document } from 'mongoose';
import { EventTraceContext } from '@medicore360/shared';

export interface IOutbox extends Document {
  eventId: string;
  eventType: string;
  eventVersion: string;
  hospitalId: string;
  producer: string;
  payload: Record<string, any>;
  traceContext: EventTraceContext;
  status: 'PENDING' | 'PROCESSING' | 'SENT' | 'FAILED';
  retryCount: number;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
  processedAt?: Date;
}

const OutboxSchema = new Schema<IOutbox>(
  {
    eventId: { type: String, required: true, unique: true, index: true },
    eventType: { type: String, required: true, index: true },
    eventVersion: { type: String, required: true, default: '1.0' },
    hospitalId: { type: String, required: true, index: true },
    producer: { type: String, required: true, default: 'medflow-api' },
    payload: { type: Schema.Types.Mixed, required: true },
    traceContext: {
      correlationId: { type: String, required: true },
      traceId: { type: String },
      spanId: { type: String },
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'SENT', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    retryCount: { type: Number, default: 0 },
    errorMessage: { type: String },
    processedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

OutboxSchema.index({ status: 1, createdAt: 1 });

export const OutboxModel = mongoose.model<IOutbox>('Outbox', OutboxSchema);
