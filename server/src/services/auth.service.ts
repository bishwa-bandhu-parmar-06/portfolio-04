import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import type { CookieOptions, Response } from 'express';
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
  iat: number;
  exp: number;
}

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_ROUNDS);

export function signToken(adminId: string): string {
  return jwt.sign({}, env.JWT_SECRET, {
    subject: adminId,
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

/** Tokens issued before the last password change are no longer valid. */
export function tokenIsStale(admin: AdminDoc, iat: number): boolean {
  if (!admin.passwordChangedAt) return false;
  return Math.floor(admin.passwordChangedAt.getTime() / 1000) > iat;
}

/**
 * Check credentials, applying the lockout policy: after MAX_FAILED_ATTEMPTS
 * wrong passwords the account is locked for LOCK_DURATION_MS.
 */
export async function authenticate(email: string, password: string): Promise<AdminDoc> {
  const admin = await Admin.findOne({ email }).select('+passwordHash');

  if (!admin) {
    await bcrypt.compare(password, DUMMY_HASH);
    throw unauthorized('Invalid email or password');
  }

  if (admin.lockUntil && admin.lockUntil.getTime() > Date.now()) {
    throw lockedError(admin.lockUntil);
  }

  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) {
    const attempts = admin.failedAttempts + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      admin.failedAttempts = 0;
      admin.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      await admin.save();
      throw lockedError(admin.lockUntil);
    }
    admin.failedAttempts = attempts;
    await admin.save();
    throw unauthorized('Invalid email or password');
  }

  admin.failedAttempts = 0;
  admin.lockUntil = null;
  admin.lastLoginAt = new Date();
  await admin.save();
  return admin;
}

function lockedError(until: Date): AppError {
  const minutes = Math.max(1, Math.ceil((until.getTime() - Date.now()) / 60_000));
  return new AppError(423, `Too many failed attempts. Try again in ${minutes} minute${minutes === 1 ? '' : 's'}.`, 'LOCKED', {
    lockedUntil: until.toISOString(),
  });
}
