import { Schema, model, type HydratedDocument } from 'mongoose';

export interface AdminAttrs {
  email: string;
  passwordHash: string;
  failedAttempts: number;
  lockUntil?: Date | null;
  passwordChangedAt?: Date | null;
  lastLoginAt?: Date | null;
}

const adminSchema = new Schema<AdminAttrs>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    failedAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true },
);

export type AdminDoc = HydratedDocument<AdminAttrs>;
export const Admin = model<AdminAttrs>('Admin', adminSchema);
