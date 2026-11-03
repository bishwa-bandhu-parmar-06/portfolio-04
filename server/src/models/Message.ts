import { Schema, model } from 'mongoose';

export const MESSAGE_STATUSES = ['unread', 'read', 'replied'] as const;

export interface MessageAttrs {
  name: string;
  email: string;
  subject: string;
  message: string;
  status: (typeof MESSAGE_STATUSES)[number];
  repliedAt?: Date | null;
  ipHash?: string;
  userAgent?: string;
  createdAt: Date;
}

const messageSchema = new Schema<MessageAttrs>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: MESSAGE_STATUSES, default: 'unread', index: true },
    repliedAt: { type: Date, default: null },
    ipHash: { type: String, select: false },
    userAgent: { type: String, select: false },
  },
  { timestamps: true },
);

messageSchema.index({ createdAt: -1 });

export const Message = model<MessageAttrs>('Message', messageSchema);
