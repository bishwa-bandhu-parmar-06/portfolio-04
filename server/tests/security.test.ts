import { afterEach, describe, expect, it } from 'vitest';
import { stripHtml } from '../src/middleware/sanitize';
import { Admin, Message } from '../src/models';
import { slugify } from '../src/utils/strings';
import { ADMIN, api, createAdmin, loginCookie, useTestDb } from './helpers';

useTestDb();

describe('sanitizer performance (ReDoS)', () => {
  it('handles hostile 200 KB strings in linear time', () => {
    for (const payload of ['<' + 'a-'.repeat(100_000), '<script '.repeat(25_000), '<'.repeat(200_000)]) {
      const start = performance.now();
      stripHtml(payload);
      expect(performance.now() - start).toBeLessThan(100);
    }
  });

  it('still removes tags and script blocks', () => {
    expect(stripHtml('a<script>alert(1)</script>b<B onclick="x">c</B><iframe src=x></iframe>d')).toBe('abcd');
    expect(stripHtml('1 < 2 and 3 > 2')).toBe('1 < 2 and 3 > 2');
  });

  it('rejects an oversized body quickly instead of parsing it', async () => {
    const start = performance.now();
    await api()
      .post('/api/public/contact')
      .set('content-type', 'application/json')
      .send(JSON.stringify({ message: '<' + 'a-'.repeat(150_000) }))
      .expect(413);
    expect(performance.now() - start).toBeLessThan(2000);
  });
});

describe('login lockout under concurrency', () => {
  it('allows at most 5 password checks even when requests arrive in parallel', async () => {
    await createAdmin();
    const results = await Promise.all(
      Array.from({ length: 12 }, () => api().post('/api/auth/login').send({ ...ADMIN, password: 'wrong' })),
    );
    const statuses = results.map((r) => r.status);
    // At most 4 plain failures; everything else is refused as locked.
    expect(statuses.filter((s) => s === 401).length).toBeLessThanOrEqual(4);
    expect(statuses.filter((s) => s === 423).length).toBeGreaterThanOrEqual(8);
    const admin = await Admin.findOne({ email: ADMIN.email });
    expect(admin!.lockUntil!.getTime()).toBeGreaterThan(Date.now());
    // The correct password is refused while locked.
    await api().post('/api/auth/login').send(ADMIN).expect(423);
  });
});

describe('session revocation', () => {
  it('logout invalidates the token on the server, not just in the browser', async () => {
    const cookie = await loginCookie();
    await api().get('/api/auth/me').set('Cookie', cookie).expect(200);
    await api().post('/api/auth/logout').set('Cookie', cookie).expect(204);
    // Replaying the old cookie (e.g. a copied one) no longer works.
    await api().get('/api/auth/me').set('Cookie', cookie).expect(401);
    // Logging in again works normally.
    await api().post('/api/auth/login').send(ADMIN).expect(200);
  });
});

describe('client IP for rate limiting', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_IN_TESTS;
  });

  const valid = { name: 'Tester', email: 't@example.com', subject: 'Hello there', message: 'A long enough message body.' };

  it('ignores a spoofed x-client-ip header without the proxy secret', async () => {
    process.env.RATE_LIMIT_IN_TESTS = 'true';
    for (let i = 0; i < 5; i++) {
      await api().post('/api/public/contact').set('X-Client-Ip', `198.51.100.${i}`).send(valid).expect(201);
    }
    // A new fake IP doesn't reset the limit, and neither does a wrong secret.
    await api().post('/api/public/contact').set('X-Client-Ip', '198.51.100.99').send(valid).expect(429);
    await api().post('/api/public/contact').set('X-Client-Ip', '198.51.100.98').set('X-Proxy-Secret', 'guess').send(valid).expect(429);
  });

  it('counts visitors separately when the website proxy vouches for their IP', async () => {
    process.env.RATE_LIMIT_IN_TESTS = 'true';
    const viaProxy = (ip: string) =>
      api().post('/api/public/contact').set('X-Client-Ip', ip).set('X-Proxy-Secret', 'test-proxy-secret').send(valid);
    for (let i = 0; i < 5; i++) await viaProxy('192.0.2.10').expect(201);
    await viaProxy('192.0.2.10').expect(429);
    // A different real visitor is not blocked by the first one.
    await viaProxy('192.0.2.20').expect(201);
  });

  it('never stores the raw IP', async () => {
    await api().post('/api/public/contact').send(valid).expect(201);
    const saved = await Message.findOne().select('+ipHash');
    expect(saved!.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(saved)).not.toMatch(/127\.0\.0\.1|::1/);
  });
});

describe('media ownership', () => {
  it('refuses to save media from outside this site’s Cloudinary folder', async () => {
    const cookie = await loginCookie();
    const res = await api()
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({
        title: 'X',
        coverImage: { url: 'https://res.cloudinary.com/demo/image/upload/other.png', publicId: 'other-app/important', resourceType: 'image' },
      })
      .expect(400);
    expect(res.body.error.fields[0].path).toBe('coverImage.publicId');
  });
});

describe('slugify', () => {
  it('strips accents and punctuation', () => {
    expect(slugify('Café Résumé — Ñandú App')).toBe('cafe-resume-nandu-app');
  });
});
