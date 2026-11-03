import { describe, expect, it } from 'vitest';
import * as data from '../src/seed/data';
import { detectFileType } from '../src/utils/fileType';
import { sanitizeValue } from '../src/middleware/sanitize';
import * as v from '../src/validators/content';
import { profileBody, sectionsBody, seoBody, statsBody, themeBody } from '../src/validators/settings';
import { api, loginCookie, useTestDb } from './helpers';

useTestDb();

describe('file type detection', () => {
  const pad = (bytes: number[]) => Buffer.concat([Buffer.from(bytes), Buffer.alloc(16)]);

  it('recognises the allowed formats by their magic bytes', () => {
    expect(detectFileType(pad([0xff, 0xd8, 0xff, 0xe0]))?.mime).toBe('image/jpeg');
    expect(detectFileType(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))?.mime).toBe('image/png');
    expect(detectFileType(Buffer.from('RIFF\0\0\0\0WEBPVP8 ....'))?.mime).toBe('image/webp');
    expect(detectFileType(Buffer.from('%PDF-1.7\n%....'))?.mime).toBe('application/pdf');
  });

  it('rejects anything else, whatever it is named', () => {
    expect(detectFileType(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'))).toBeNull();
    expect(detectFileType(Buffer.from('GIF89a..........'))).toBeNull();
    expect(detectFileType(Buffer.from('MZ\x90\0 executable....'))).toBeNull();
  });
});

describe('sanitizer', () => {
  it('drops operator keys and keeps passwords and markdown intact', () => {
    expect(
      sanitizeValue({
        email: { $gt: '' },
        'a.b': 1,
        password: 'P<a>ss',
        description: 'Use `Map<string, number>`',
        title: '<i>Hi</i>',
      }),
    ).toEqual({ email: {}, password: 'P<a>ss', description: 'Use `Map<string, number>`', title: 'Hi' });
  });
});

describe('uploads', () => {
  it('returns 503 when Cloudinary is not configured', async () => {
    const cookie = await loginCookie();
    await api()
      .post('/api/admin/uploads?kind=image')
      .set('Cookie', cookie)
      .attach('file', Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]), 'a.jpg')
      .expect(503);
  });

  it('rejects files over 5 MB', async () => {
    const cookie = await loginCookie();
    await api()
      .post('/api/admin/uploads?kind=pdf')
      .set('Cookie', cookie)
      .attach('file', Buffer.alloc(5 * 1024 * 1024 + 1), 'big.pdf')
      .expect(413);
  });
});

describe('seed data', () => {
  it('passes the same validation as the admin API', () => {
    expect(() => profileBody.parse(data.settings.profile)).not.toThrow();
    expect(() => statsBody.parse({ stats: data.settings.stats })).not.toThrow();
    expect(() => themeBody.parse(data.settings.theme)).not.toThrow();
    expect(() => sectionsBody.parse(data.settings.sections)).not.toThrow();
    expect(() => seoBody.parse(data.settings.seo)).not.toThrow();
    for (const s of data.socialLinks) v.socialLinkCreate.parse(s);
    for (const e of data.experience) v.experienceCreate.parse(e);
    for (const p of data.projects) v.projectCreate.parse(p);
    for (const g of data.skillGroups) v.skillGroupCreate.parse(g);
    for (const e of data.education) v.educationCreate.parse(e);
    for (const c of data.certifications) v.certificationCreate.parse(c);
    for (const c of data.codingProfiles) v.codingProfileCreate.parse(c);
  });

  it('keeps SEO text within search-result limits', () => {
    expect(data.settings.seo.title.length).toBeLessThanOrEqual(60);
    expect(data.settings.seo.description.length).toBeLessThanOrEqual(160);
  });
});
