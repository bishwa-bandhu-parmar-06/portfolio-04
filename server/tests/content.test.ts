import { describe, expect, it } from 'vitest';
import { Project, SiteSettings } from '../src/models';
import { api, loginCookie, useTestDb } from './helpers';

useTestDb();

const cloudinaryImage = {
  url: 'https://res.cloudinary.com/demo/image/upload/v1/portfolio/projects/a.webp',
  publicId: 'portfolio/projects/a',
  resourceType: 'image',
};

describe('admin content CRUD', () => {
  it('creates a project with an auto slug, then updates and deletes it', async () => {
    const cookie = await loginCookie();
    const created = await api()
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ title: 'My Cool App', techTags: ['React'], liveUrl: 'https://example.com', coverImage: cloudinaryImage })
      .expect(201);
    expect(created.body.item.slug).toBe('my-cool-app');
    const id = created.body.item._id;

    const updated = await api()
      .patch(`/api/admin/projects/${id}`)
      .set('Cookie', cookie)
      .send({ featured: true })
      .expect(200);
    expect(updated.body.item.featured).toBe(true);
    // Fields left out of a PATCH are kept.
    expect(updated.body.item.liveUrl).toBe('https://example.com');
    expect(updated.body.item.slug).toBe('my-cool-app');

    await api().delete(`/api/admin/projects/${id}`).set('Cookie', cookie).expect(204);
    await api().get(`/api/admin/projects/${id}`).set('Cookie', cookie).expect(404);
  });

  it('rejects javascript: links, non-Cloudinary images and bad ids', async () => {
    const cookie = await loginCookie();
    const bad = await api()
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ title: 'X', liveUrl: 'javascript:alert(1)' })
      .expect(400);
    expect(bad.body.error.fields[0].path).toBe('liveUrl');

    await api()
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ title: 'X', coverImage: { ...cloudinaryImage, url: 'https://evil.example/a.png' } })
      .expect(400);

    await api().patch('/api/admin/projects/not-an-id').set('Cookie', cookie).send({}).expect(400);
  });

  it('strips HTML from text fields', async () => {
    const cookie = await loginCookie();
    const res = await api()
      .post('/api/admin/projects')
      .set('Cookie', cookie)
      .send({ title: 'Safe<script>alert(1)</script> <b>App</b>', summary: '<img src=x onerror=alert(1)>Hi' })
      .expect(201);
    expect(res.body.item.title).toBe('Safe App');
    expect(res.body.item.summary).toBe('Hi');
  });

  it('returns 409 for a duplicate slug', async () => {
    const cookie = await loginCookie();
    await api().post('/api/admin/projects').set('Cookie', cookie).send({ title: 'Dup' }).expect(201);
    await api().post('/api/admin/projects').set('Cookie', cookie).send({ title: 'Dup' }).expect(409);
  });

  it('reorders items', async () => {
    const cookie = await loginCookie();
    const ids: string[] = [];
    for (const label of ['A', 'B', 'C']) {
      const res = await api()
        .post('/api/admin/social-links')
        .set('Cookie', cookie)
        .send({ platform: 'website', label, url: `https://${label.toLowerCase()}.example.com` })
        .expect(201);
      ids.push(res.body.item._id);
    }
    const res = await api()
      .patch('/api/admin/social-links/reorder')
      .set('Cookie', cookie)
      .send({ ids: [ids[2], ids[0], ids[1]] })
      .expect(200);
    expect(res.body.items.map((i: { label: string }) => i.label)).toEqual(['C', 'A', 'B']);
  });

  it('keeps exactly one default resume', async () => {
    const cookie = await loginCookie();
    const file = (n: string) => ({
      url: `https://res.cloudinary.com/demo/raw/upload/v1/portfolio/resumes/${n}.pdf`,
      publicId: `portfolio/resumes/${n}.pdf`,
      resourceType: 'raw',
    });
    const a = await api().post('/api/admin/resumes').set('Cookie', cookie).send({ label: 'SDE / Full Stack', file: file('a') });
    const b = await api().post('/api/admin/resumes').set('Cookie', cookie).send({ label: 'Frontend', file: file('b') });
    expect(a.body.item.slug).toBe('sde-full-stack');

    let list = await api().get('/api/admin/resumes').set('Cookie', cookie);
    expect(list.body.items.filter((r: { isDefault: boolean }) => r.isDefault)).toHaveLength(1);

    const res = await api().patch(`/api/admin/resumes/${b.body.item._id}/default`).set('Cookie', cookie).expect(200);
    expect(res.body.items.find((r: { isDefault: boolean }) => r.isDefault).label).toBe('Frontend');

    await api().delete(`/api/admin/resumes/${b.body.item._id}`).set('Cookie', cookie).expect(204);
    list = await api().get('/api/admin/resumes').set('Cookie', cookie);
    expect(list.body.items[0].isDefault).toBe(true);

    const redirect = await api().get('/api/public/resume').expect(302);
    expect(redirect.headers.location).toContain('/a.pdf');
  });

  it('updates profile, theme and SEO settings with validation', async () => {
    const cookie = await loginCookie();
    await api()
      .patch('/api/admin/settings/profile')
      .set('Cookie', cookie)
      .send({ name: 'Bishwa', phone: '+91 9142364660', showPhone: false })
      .expect(200);
    await api().patch('/api/admin/settings/theme').set('Cookie', cookie).send({ dark: { primary: 'red', secondary: '#000000' } }).expect(400);
    const theme = await api()
      .patch('/api/admin/settings/theme')
      .set('Cookie', cookie)
      .send({ preset: 'custom', dark: { primary: '#10B981', secondary: '#22D3EE' } })
      .expect(200);
    expect(theme.body.settings.theme.dark.primary).toBe('#10B981');
    // Untouched sections stay as they were.
    expect(theme.body.settings.profile.name).toBe('Bishwa');
  });
});

describe('public API', () => {
  it('returns visible content only and hides the phone unless enabled', async () => {
    await SiteSettings.create({ profile: { name: 'Bishwa', phone: '+91 9142364660', showPhone: false } });
    await Project.create([
      { slug: 'shown', title: 'Shown', description: 'Long text', featured: false, order: 0 },
      { slug: 'hidden', title: 'Hidden', visible: false, order: 1 },
      { slug: 'star', title: 'Star', featured: true, order: 2 },
    ]);

    const res = await api().get('/api/public/site').expect(200);
    expect(res.body.profile.name).toBe('Bishwa');
    expect(res.body.profile.phone).toBeUndefined();
    expect(res.body.projects.map((p: { slug: string }) => p.slug)).toEqual(['star', 'shown']);
    // Card payload leaves out the long detail fields.
    expect(res.body.projects[1].description).toBeUndefined();
    expect(res.headers['cache-control']).toMatch(/public/);

    await SiteSettings.updateOne({}, { 'profile.showPhone': true });
    const withPhone = await api().get('/api/public/site').expect(200);
    expect(withPhone.body.profile.phone).toBe('+91 9142364660');
  });

  it('serves project details with prev/next and 404s for hidden projects', async () => {
    await Project.create([
      { slug: 'one', title: 'One', order: 0 },
      { slug: 'two', title: 'Two', order: 1, description: 'Full description' },
      { slug: 'secret', title: 'Secret', visible: false },
    ]);
    const res = await api().get('/api/public/projects/two').expect(200);
    expect(res.body.project.description).toBe('Full description');
    expect(res.body.prev.slug).toBe('one');
    expect(res.body.next).toBeNull();
    await api().get('/api/public/projects/secret').expect(404);
  });

  it('reports health', async () => {
    const res = await api().get('/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', db: 'connected' });
  });

  it('sends security headers and refuses unknown CORS origins', async () => {
    const ok = await api().get('/api/public/site').set('Origin', 'http://localhost:3000');
    expect(ok.headers['access-control-allow-origin']).toBe('http://localhost:3000');
    expect(ok.headers['x-content-type-options']).toBe('nosniff');
    expect(ok.headers['x-powered-by']).toBeUndefined();

    const evil = await api().get('/api/public/site').set('Origin', 'https://evil.example');
    expect(evil.headers['access-control-allow-origin']).toBeUndefined();
  });
});

describe('root route', () => {
  it('describes the API instead of returning 404', async () => {
    const res = await api().get('/').expect(200);
    expect(res.body).toMatchObject({ name: 'portfolio-api', status: 'ok', endpoints: { health: '/health' } });
  });
});
