import type { UploadApiResponse } from 'cloudinary';
import { cloudinary } from '../config/cloudinary';
import { cloudinaryEnabled, env } from '../config/env';
import type { Media } from '../models';
import { AppError, badRequest } from '../utils/errors';
import { detectFileType } from '../utils/fileType';

export type UploadKind = 'image' | 'pdf';

/** Check the real file type, then stream it to Cloudinary. */
export async function uploadFile(buffer: Buffer, kind: UploadKind, folder: string): Promise<Media> {
  if (!cloudinaryEnabled) {
    throw new AppError(503, 'File uploads are not configured on the server', 'UPLOADS_DISABLED');
  }

  const detected = detectFileType(buffer);
  if (!detected) throw badRequest('Only JPG, PNG, WEBP and PDF files are allowed');
  if (kind === 'image' && detected.mime === 'application/pdf') throw badRequest('Please upload an image (JPG, PNG or WEBP)');
  if (kind === 'pdf' && detected.mime !== 'application/pdf') throw badRequest('Please upload a PDF file');

  // PDFs go up as "raw" files so they download byte-for-byte and keep the .pdf extension.
  const resourceType = kind === 'pdf' ? 'raw' : 'image';

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `${env.CLOUDINARY_FOLDER}/${folder}`,
        resource_type: resourceType,
        ...(kind === 'pdf' ? { format: 'pdf' } : {}),
        use_filename: false,
        unique_filename: true,
        overwrite: false,
      },
      (error, res) => (error || !res ? reject(cloudinaryError(error)) : resolve(res)),
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    resourceType,
    format: detected.ext,
    bytes: result.bytes,
    ...(result.width ? { width: result.width, height: result.height } : {}),
  };
}

/**
 * Turn a Cloudinary failure into a message the admin can act on. The SDK reports
 * some rejections only as "unexpected status code", so map by HTTP status.
 */
function cloudinaryError(error: { http_code?: number; message?: string } | undefined): AppError {
  const code = error?.http_code;
  console.error('[cloudinary] upload failed:', code ?? '', error?.message ?? error);
  const message =
    code === 401
      ? 'Cloudinary rejected the API key or secret. Check CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server.'
      : code === 403
        ? 'Cloudinary refused the upload: this API key is not allowed to upload files. In Cloudinary → Settings → API Keys, use a key with full (Admin) permissions, or give this key upload access.'
        : code === 404
          ? 'Cloudinary account not found. Check CLOUDINARY_CLOUD_NAME on the server.'
          : code === 420 || code === 429
            ? 'Cloudinary rate limit reached. Please try again in a minute.'
            : 'Upload to Cloudinary failed. Please try again.';
  return new AppError(502, message, 'UPLOAD_FAILED');
}

export async function deleteFile(publicId: string, resourceType: Media['resourceType'] = 'image'): Promise<void> {
  if (!cloudinaryEnabled) return;
  // Never touch assets outside this site's folder, even if one was somehow saved on a document.
  if (!publicId.startsWith(`${env.CLOUDINARY_FOLDER}/`)) return;
  await cloudinary.uploader.destroy(publicId, { resource_type: resourceType, invalidate: true });
}

/** Delete files that are no longer referenced. Never fails the request that triggered it. */
export function cleanupMedia(files: (Media | null | undefined)[]): void {
  for (const file of files) {
    if (!file?.publicId) continue;
    deleteFile(file.publicId, file.resourceType).catch((err) =>
      console.warn(`Could not delete ${file.publicId} from Cloudinary:`, err?.message ?? err),
    );
  }
}

/** Media present in `before` but not in `after` (matched by publicId). */
export function removedMedia(before: (Media | null | undefined)[], after: (Media | null | undefined)[]): Media[] {
  const keep = new Set(after.filter(Boolean).map((m) => m!.publicId));
  return before.filter((m): m is Media => Boolean(m?.publicId) && !keep.has(m!.publicId));
}
