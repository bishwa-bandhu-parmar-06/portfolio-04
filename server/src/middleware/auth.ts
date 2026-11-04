import type { RequestHandler } from 'express';
import { env } from '../config/env';
import { Admin } from '../models';
import { tokenIsStale, verifyToken } from '../services/auth.service';
import { unauthorized } from '../utils/errors';

/** Require a valid admin session cookie. Sets `res.locals.admin`. */
export const requireAuth: RequestHandler = async (req, res, next) => {
  const token: string | undefined = req.cookies?.[env.COOKIE_NAME];
  if (!token) throw unauthorized();

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw unauthorized('Session expired. Please log in again.');
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || tokenIsStale(admin, payload)) {
    throw unauthorized('Session expired. Please log in again.');
  }

  res.locals.admin = admin;
  next();
};
