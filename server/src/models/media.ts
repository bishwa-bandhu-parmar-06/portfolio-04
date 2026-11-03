import { Schema } from 'mongoose';

export interface Media {
  url: string;
  publicId: string;
  resourceType: 'image' | 'raw';
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

/** A file stored on Cloudinary. Embedded wherever an entity owns an upload. */
export const mediaSchema = new Schema<Media>(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    resourceType: { type: String, enum: ['image', 'raw'], default: 'image' },
    format: String,
    bytes: Number,
    width: Number,
    height: Number,
  },
  { _id: false },
);
