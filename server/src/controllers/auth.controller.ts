import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { loginLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import { Admin, type AdminDoc } from '../models';
import {
  authenticate,
  clearAuthCookie,
  hashPassword,
  revokeSessions,
  setAuthCookie,
  signToken,
  verifyToken,
} from '../services/auth.service';
import { env } from '../config/env';
import { changePasswordBody, loginBody } from '../validators/auth';
import { AppError } from '../utils/errors';
import bcrypt from 'bcryptjs';

export const authRouter = Router();

const publicAdmin = (admin: AdminDoc) => ({
  id: admin.id,
  email: admin.email,
  lastLoginAt: admin.lastLoginAt,
});

authRouter.post('/login', loginLimiter, validate({ body: loginBody }), async (req, res) => {
  const admin = await authenticate(req.body.email, req.body.password);
  setAuthCookie(res, signToken(admin));
  res.json({ admin: publicAdmin(admin) });
});

/** Logging out revokes the session on the server too, so a copied cookie stops working. */
authRouter.post('/logout', async (req, res) => {
  const token: string | undefined = req.cookies?.[env.COOKIE_NAME];
  if (token) {
    try {
      await revokeSessions(verifyToken(token).sub);
    } catch {
      /* invalid or expired token: nothing to revoke */
    }
  }
  clearAuthCookie(res);
  res.status(204).end();
});

authRouter.get('/me', requireAuth, (_req, res) => {
  res.json({ admin: publicAdmin(res.locals.admin) });
});

authRouter.patch('/password', requireAuth, loginLimiter, validate({ body: changePasswordBody }), async (req, res) => {
  const admin = await Admin.findById(res.locals.admin.id).select('+passwordHash');
  if (!admin) throw new AppError(401, 'Not authenticated', 'UNAUTHORIZED');

  const ok = await bcrypt.compare(req.body.currentPassword, admin.passwordHash);
  if (!ok) throw new AppError(400, 'Current password is incorrect', 'BAD_REQUEST', { field: 'currentPassword' });

  admin.passwordHash = await hashPassword(req.body.newPassword);
  admin.passwordChangedAt = new Date();
  admin.sessionVersion = (admin.sessionVersion ?? 0) + 1;
  await admin.save();

  // Every other session is now invalid; keep this one signed in with a fresh token.
  setAuthCookie(res, signToken(admin));
  res.json({ ok: true });
});
