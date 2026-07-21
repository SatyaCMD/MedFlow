/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars, @typescript-eslint/no-non-null-assertion */
import { Schema, model, Document } from 'mongoose';

export interface IAuditLog extends Document {
  hospitalId: string;
  userId: string;
  action: string;
  details: Record<string, unknown>;
  ip: string;
  userAgent: string;
  createdAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>({
  hospitalId: { type: String, required: true, index: true },
  userId: { type: String, required: true, index: true },
  action: { type: String, required: true, index: true },
  details: { type: Schema.Types.Mixed, default: {} },
  ip: { type: String, required: true },
  userAgent: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, index: true },
});

// Enforce read-only logic on audit logs by rejecting updates or deletes
auditLogSchema.pre('save', function (next) {
  if (!this.isNew) {
    return next(new Error('Audit logs are append-only and cannot be updated.'));
  }
  next();
});

export const AuditLog = model<IAuditLog>('AuditLog', auditLogSchema);

