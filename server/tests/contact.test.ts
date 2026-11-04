import { afterEach, describe, expect, it } from 'vitest';
import { Message } from '../src/models';
import { api, loginCookie, useTestDb } from './helpers';

useTestDb();

const valid = {
  name: 'Recruiter Riya',
  email: 'riya@example.com',
  subject: 'SDE opening',
  message: 'Hi Bishwa, we would love to talk about an SDE role.',
};

describe('contact form', () => {
  afterEach(() => {
    delete process.env.RATE_LIMIT_IN_TESTS;
  });

  it('stores a valid message as unread', async () => {
    await api().post('/api/public/contact').send(valid).expect(201);
    const saved = await Message.findOne().select('+ipHash');
    expect(saved).toMatchObject({ name: valid.name, status: 'unread' });
    // The raw IP is never stored, only a salted hash.
    expect(saved!.ipHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it('silently drops honeypot submissions', async () => {
    await api().post('/api/public/contact').send({ ...valid, website: 'http://spam.example' }).expect(201);
    expect(await Message.countDocuments()).toBe(0);
  });

  it('returns field errors for invalid input', async () => {
    const res = await api().post('/api/public/contact').send({ ...valid, email: 'nope', message: 'short' }).expect(400);
    const paths = res.body.error.fields.map((f: { path: string }) => f.path);
    expect(paths).toEqual(expect.arrayContaining(['email', 'message']));
  });

  it('rate-limits to 5 messages per hour per IP', async () => {
    process.env.RATE_LIMIT_IN_TESTS = 'true';
    for (let i = 0; i < 5; i++) {
      await api().post('/api/public/contact').set('X-Forwarded-For', '203.0.113.9').send(valid).expect(201);
    }
    await api().post('/api/public/contact').set('X-Forwarded-For', '203.0.113.9').send(valid).expect(429);
  });
});

describe('admin inbox', () => {
  it('lists, searches, updates status and deletes messages', async () => {
    const cookie = await loginCookie();
    await Message.create([
      { ...valid, subject: 'SDE opening' },
      { ...valid, name: 'Aman', email: 'aman@example.com', subject: 'Freelance project', status: 'read' },
    ]);

    const all = await api().get('/api/admin/messages').set('Cookie', cookie).expect(200);
    expect(all.body).toMatchObject({ total: 2, unread: 1 });

    const search = await api().get('/api/admin/messages?q=freelance').set('Cookie', cookie).expect(200);
    expect(search.body.items).toHaveLength(1);
    expect(search.body.items[0].name).toBe('Aman');

    // Regex characters in the search are treated literally.
    await api().get('/api/admin/messages?q=.*').set('Cookie', cookie).expect(200).then((r) => expect(r.body.total).toBe(0));

    const unread = await api().get('/api/admin/messages?status=unread').set('Cookie', cookie).expect(200);
    const id = unread.body.items[0]._id;
    const replied = await api().patch(`/api/admin/messages/${id}`).set('Cookie', cookie).send({ status: 'replied' }).expect(200);
    expect(replied.body.item.repliedAt).toBeTruthy();

    await api().delete(`/api/admin/messages/${id}`).set('Cookie', cookie).expect(204);
    expect(await Message.countDocuments()).toBe(1);

    const dash = await api().get('/api/admin/dashboard').set('Cookie', cookie).expect(200);
    expect(dash.body.counts).toMatchObject({ unreadMessages: 0, totalMessages: 1 });
  });
});
