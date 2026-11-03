import { Router } from 'express';
import { z } from 'zod';
import { uploadSingle } from '../middleware/upload';
import { validate } from '../middleware/validate';
import { deleteFile, uploadFile } from '../services/media.service';
import { env } from '../config/env';
import { badRequest } from '../utils/errors';

export const uploadsRouter = Router();

const uploadQuery = z.object({
  kind: z.enum(['image', 'pdf']),
  folder: z.enum(['profile', 'projects', 'resumes', 'seo', 'misc']).default('misc'),
});

/** POST /api/admin/uploads?kind=image|pdf&folder=projects  (multipart field: "file") */
uploadsRouter.post('/', validate({ query: uploadQuery }), uploadSingle, async (req, res) => {
  if (!req.file) throw badRequest('No file received. Send it in a multipart field named "file".');
  const { kind, folder } = res.locals.query;
  const media = await uploadFile(req.file.buffer, kind, folder);
  res.status(201).json({ media });
});

const deleteBody = z.object({
  publicId: z
    .string()
    .trim()
    .min(1)
    .max(300)
    .refine((id) => id.startsWith(`${env.CLOUDINARY_FOLDER}/`), 'Can only delete files uploaded by this site'),
  resourceType: z.enum(['image', 'raw']).default('image'),
});

/** DELETE /api/admin/uploads  { publicId, resourceType } — discard an upload that was never saved. */
uploadsRouter.delete('/', validate({ body: deleteBody }), async (req, res) => {
  await deleteFile(req.body.publicId, req.body.resourceType);
  res.status(204).end();
});
