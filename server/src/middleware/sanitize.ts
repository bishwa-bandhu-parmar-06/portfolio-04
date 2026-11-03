import type { RequestHandler } from 'express';

/** Fields that must reach the handler untouched. Markdown is rendered without raw HTML on the client. */
const RAW_KEYS = new Set(['password', 'currentPassword', 'newPassword', 'description', 'architecture']);

const HTML_TAG = /<\/?[a-z][a-z0-9-]*\b[^<>]*>/gi;
const DANGEROUS_BLOCK = /<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1\s*>/gi;

export function stripHtml(value: string): string {
  return value.replace(/\0/g, '').replace(DANGEROUS_BLOCK, '').replace(HTML_TAG, '');
}

/**
 * Defence in depth on top of Zod and `mongoose.set('sanitizeFilter')`:
 * drops `$`/dotted keys (NoSQL operator injection) and strips HTML from strings (XSS).
 */
export function sanitizeValue(value: unknown, key?: string, depth = 0): unknown {
  if (depth > 20) return undefined;
  if (typeof value === 'string') {
    return key && RAW_KEYS.has(key) ? value.replace(/\0/g, '') : stripHtml(value);
  }
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(item, key, depth + 1));
  if (value && typeof value === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (k.startsWith('$') || k.includes('.') || k === '__proto__' || k === 'constructor') continue;
      clean[k] = sanitizeValue(v, k, depth + 1);
    }
    return clean;
  }
  return value;
}

export const sanitizeBody: RequestHandler = (req, _res, next) => {
  if (req.body && typeof req.body === 'object') req.body = sanitizeValue(req.body);
  next();
};
