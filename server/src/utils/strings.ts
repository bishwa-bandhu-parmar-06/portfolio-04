import { createHmac } from 'node:crypto';
import { env } from '../config/env';

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** One-way hash so we can spot repeat senders without storing raw IP addresses. */
export function hashIp(ip: string | undefined): string {
  return createHmac('sha256', env.IP_HASH_SALT).update(ip ?? 'unknown').digest('hex');
}
