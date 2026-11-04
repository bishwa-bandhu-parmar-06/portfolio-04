import { brandIcon } from '@/lib/brand-icon';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Favicon. Also served at /favicon.ico (see next.config.ts) for clients that ask for it directly. */
export default function Icon() {
  return brandIcon(64, true);
}
