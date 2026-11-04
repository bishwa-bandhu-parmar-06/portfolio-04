import multer from 'multer';

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

/** Files stay in memory (max 5 MB) until their bytes are checked and streamed to Cloudinary. */
export const uploadSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES, files: 1, fields: 5 },
}).single('file');
