'use client';

/**
 * next/image loader for Cloudinary: asks Cloudinary for the exact width the
 * browser needs, in the best format it supports (AVIF/WebP).
 */
export default function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (!src.includes('res.cloudinary.com') || !src.includes('/image/upload/')) return src;
  const transforms = ['f_auto', 'c_limit', `w_${width}`, `q_${quality ?? 'auto'}`].join(',');
  return src.replace('/image/upload/', `/image/upload/${transforms}/`);
}
