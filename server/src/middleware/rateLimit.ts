import rateLimit, { ipKeyGenerator, type Options } from 'express-rate-limit';
import { isTest } from '../config/env';
import { clientIp } from '../utils/clientIp';

const base: Partial<Options> = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => ipKeyGenerator(clientIp(req)),
  skip: () => isTest && process.env.RATE_LIMIT_IN_TESTS !== 'true',
};

/** Login: 10 tries per 15 minutes per IP (the per-account lockout kicks in at 5). */
export const loginLimiter = rateLimit({
  ...base,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many login attempts. Please wait 15 minutes.' } },
});

/** Contact form: 5 messages per hour per IP. */
export const contactLimiter = rateLimit({
  ...base,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many messages. Please try again later.' } },
});

/** Broad cap on everything else. */
export const apiLimiter = rateLimit({
  ...base,
  windowMs: 60 * 1000,
  limit: 300,
  message: { error: { code: 'RATE_LIMITED', message: 'Too many requests.' } },
});
