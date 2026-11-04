import { describe, expect, it } from 'vitest';
import { Admin } from '../src/models';
import { ADMIN, api, createAdmin, loginCookie, useTestDb } from './helpers';

useTestDb();

describe('auth', () => {
  it('logs in and sets an httpOnly session cookie', async () => {
    await createAdmin();
    const res = await api().post('/api/auth/login').send(ADMIN).expect(200);
    expect(res.body.admin.email).toBe(ADMIN.email);
    const cookie = res.get('Set-Cookie')?.[0] ?? '';
    expect(cookie).toMatch(/^pf_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(res.body.admin.passwordHash).toBeUndefined();
  });

  it('returns the same error for a wrong password and an unknown email', async () => {
    await createAdmin();
    const wrong = await api().post('/api/auth/login').send({ ...ADMIN, password: 'nope' }).expect(401);
    const unknown = await api().post('/api/auth/login').send({ email: 'x@example.com', password: 'nope' }).expect(401);
    expect(wrong.body.error.message).toBe(unknown.body.error.message);
  });

  it('locks the account for 15 minutes after 5 failed attempts', async () => {
    await createAdmin();
    for (let i = 0; i < 4; i++) {
      await api().post('/api/auth/login').send({ ...ADMIN, password: 'wrong' }).expect(401);
    }
    const fifth = await api().post('/api/auth/login').send({ ...ADMIN, password: 'wrong' }).expect(423);
    expect(fifth.body.error.code).toBe('LOCKED');

    // Even the right password is refused while locked.
    await api().post('/api/auth/login').send(ADMIN).expect(423);

    const admin = await Admin.findOne({ email: ADMIN.email });
    const minutes = (admin!.lockUntil!.getTime() - Date.now()) / 60_000;
    expect(minutes).toBeGreaterThan(14);
    expect(minutes).toBeLessThanOrEqual(15);

    // After the lock expires, the right password works again.
    await Admin.updateOne({}, { lockUntil: new Date(Date.now() - 1000) });
    await api().post('/api/auth/login').send(ADMIN).expect(200);
  });

  it('rejects NoSQL operator injection in the login body', async () => {
    await createAdmin();
    await api()
      .post('/api/auth/login')
      .send({ email: { $gt: '' }, password: { $gt: '' } })
      .expect(400);
  });

  it('protects admin routes and supports /me and logout', async () => {
    await api().get('/api/admin/dashboard').expect(401);
    await api().get('/api/auth/me').expect(401);

    const cookie = await loginCookie();
    const me = await api().get('/api/auth/me').set('Cookie', cookie).expect(200);
    expect(me.body.admin.email).toBe(ADMIN.email);
    await api().get('/api/admin/dashboard').set('Cookie', cookie).expect(200);

    const out = await api().post('/api/auth/logout').set('Cookie', cookie).expect(204);
    expect(out.get('Set-Cookie')?.[0]).toMatch(/pf_session=;/);
  });

  it('rejects a forged token', async () => {
    await api().get('/api/auth/me').set('Cookie', 'pf_session=eyJhbGciOiJIUzI1NiJ9.e30.bad').expect(401);
  });

  it('changes the password and signs out older sessions', async () => {
    const oldCookie = await loginCookie();
    // Tokens carry second-level timestamps; make sure the change lands in a later second.
    await new Promise((r) => setTimeout(r, 1100));

    await api()
      .patch('/api/auth/password')
      .set('Cookie', oldCookie)
      .send({ currentPassword: 'wrong', newPassword: 'Brand-New-Pass-99' })
      .expect(400);

    await api()
      .patch('/api/auth/password')
      .set('Cookie', oldCookie)
      .send({ currentPassword: ADMIN.password, newPassword: 'short' })
      .expect(400);

    const res = await api()
      .patch('/api/auth/password')
      .set('Cookie', oldCookie)
      .send({ currentPassword: ADMIN.password, newPassword: 'Brand-New-Pass-99' })
      .expect(200);
    const newCookie = res.get('Set-Cookie') ?? [];

    await api().get('/api/auth/me').set('Cookie', oldCookie).expect(401);
    await api().get('/api/auth/me').set('Cookie', newCookie).expect(200);
    await api().post('/api/auth/login').send({ email: ADMIN.email, password: 'Brand-New-Pass-99' }).expect(200);
  });

  it('has no signup route', async () => {
    await api().post('/api/auth/register').send(ADMIN).expect(404);
    await api().post('/api/auth/signup').send(ADMIN).expect(404);
  });
});
