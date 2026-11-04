import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';
import { trusted } from 'mongoose';
import { env, isProd } from '../config/env';
import { Admin, type AdminDoc } from '../models';
import { AppError, unauthorized } from '../utils/errors';

export const MAX_FAILED_ATTEMPTS = 5;
export const LOCK_DURATION_MS = 15 * 60 * 1000;
const BCRYPT_ROUNDS = 12;

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync('not-the-password', BCRYPT_ROUNDS);

export interface TokenPayload {
  sub: string;
  /** Admin.sessionVersion at sign-in; bumping it revokes every outstanding token. */
  v: number;
  iat: number;
  exp: number;
}

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

export function signToken(admin: Pick<AdminDoc, 'id' | 'sessionVersion'>): string {
  return jwt.sign({ v: admin.sessionVersion ?? 0 }, env.JWT_SECRET, {
    subject: admin.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
    algorithm: 'HS256',
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, env.JWT_SECRET, { algorithms: ['HS256'] }) as TokenPayload;
}

function cookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    path: '/',
  };
}

export function setAuthCookie(res: Response, token: string): void {
  const { exp } = jwt.decode(token) as TokenPayload;
  res.cookie(env.COOKIE_NAME, token, { ...cookieOptions(), expires: new Date(exp * 1000) });
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(env.COOKIE_NAME, cookieOptions());
}

/** Tokens from before the last logout or password change are no longer valid. */
export function tokenIsStale(admin: AdminDoc, payload: TokenPayload): boolean {
  if ((payload.v ?? 0) !== (admin.sessionVersion ?? 0)) return true;
  if (!admin.passwordChangedAt) return false;
  return Math.floor(admin.passwordChangedAt.getTime() / 1000) > payload.iat;
}

/** Invalidate every session (logout, password change). */
export async function revokeSessions(adminId: string): Promise<AdminDoc | null> {
  return Admin.findByIdAndUpdate(adminId, { $inc: { sessionVersion: 1 } }, { new: true });
}

/**
 * Check credentials, applying the lockout policy: after MAX_FAILED_ATTEMPTS
 * wrong passwords the account is locked for LOCK_DURATION_MS.
 *
 * Each attempt atomically claims one of the MAX_FAILED_ATTEMPTS slots *before*
 * the (slow) bcrypt check, so a burst of parallel requests can't all read
 * "0 failures" and slip past the limit.
 */
export async function authenticate(email: string, password: string): Promise<AdminDoc> {
  const admin = await Admin.findOne({ email }).select('+passwordHash');

  if (!admin) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw unauthorized('Invalid email or password');
  }

  const now = new Date();
  if (admin.lockUntil && admin.lockUntil > now) throw lockedError(admin.lockUntil);

  const claimed = await Admin.findOneAndUpdate(
    {
      _id: admin._id,
      failedAttempts: trusted({ $lt: MAX_FAILED_ATTEMPTS }),
      $or: [{ lockUntil: null }, { lockUntil: trusted({ $lte: now }) }],
    },
    { $inc: { failedAttempts: 1 } },
    { new: true },
  );
  if (!claimed) throw await lock(admin.id);

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    if (claimed.failedAttempts >= MAX_FAILED_ATTEMPTS) throw await lock(admin.id);
    throw unauthorized('Invalid email or password');
  }

  const updated = await Admin.findByIdAndUpdate(
    admin._id,
    { $set: { failedAttempts: 0, lockUntil: null, lastLoginAt: new Date() } },
    { new: true },
  );
  return updated ?? admin;
}

/** Start (or report) the lockout window and return the error to throw. */
async function lock(adminId: string): Promise<AppError> {
  const until = new Date(Date.now() + LOCK_DURATION_MS);
  // Only the first request to hit the limit sets the window; later ones report it.
  await Admin.updateOne(
    { _id: adminId, $or: [{ lockUntil: null }, { lockUntil: trusted({ $lte: new Date() }) }] },
    { $set: { lockUntil: until, failedAttempts: 0 } },
  );
  const current = await Admin.findById(adminId).select('lockUntil');
  return lockedError(current?.lockUntil ?? until);
}

function lockedError(until: Date): AppError {
  const minutes = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60_000));
  return new AppError(423, `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, 'LOCKED', {
    lockedUntil: until.toISOString(),
  });
}
