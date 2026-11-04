import { timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';
import { env } from '../config/env';

function secretMatches(given: string | undefined): boolean {
  if (!env.PROXY_SECRET || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(env.PROXY_SECRET);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The visitor's IP, for rate limiting and contact-form hashing.
 *
 * Requests that come through the website carry `x-client-ip` set by the
 * Next.js proxy, which is only trusted together with the shared PROXY_SECRET.
 * Anything else (including direct hits on the Render URL) is keyed by the
 * connecting address, so spoofed X-Forwarded-For headers buy nothing.
 */
export function clientIp(req: Request): string {
  const forwarded = req.get('x-client-ip');
  if (forwarded && secretMatches(req.get('x-proxy-secret'))) return forwarded.trim().slice(0, 64);
  return req.ip ?? req.socket.remoteAddress ?? 'unknown';
}
