/**
 * Usage:
 *   npm run seed                 create the admin (if none) and fill any empty collections
 *   npm run seed -- --force      wipe and reload all content (messages and the admin are kept)
 *   npm run seed -- --reset-admin  replace the admin's email and password with ADMIN_EMAIL / ADMIN_PASSWORD
 */
import { trusted, type Model } from 'mongoose';
import { z } from 'zod';
import { connectDB, disconnectDB } from '../config/db';
import {
  Admin,
  Certification,
  CodingProfile,
  Education,
  Experience,
  Project,
  SiteSettings,
  SkillGroup,
  SocialLink,
} from '../models';
import { hashPassword } from '../services/auth.service';
import { refreshSiteNow } from '../services/revalidate.service';
import { strongPassword } from '../validators/auth';
import * as data from './data';

const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const RESET_ADMIN = args.has('--reset-admin');

async function seedAdmin() {
  const creds = z
    .object({ ADMIN_EMAIL: z.email().toLowerCase(), ADMIN_PASSWORD: strongPassword })
    .safeParse(process.env);

  const existing = await Admin.findOne();
  if (existing && !RESET_ADMIN) {
    console.log(`• Admin already exists (${existing.email}); leaving it unchanged.`);
    return;
  }

  if (!creds.success) {
    const problems = creds.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n    ');
    throw new Error(`Set ADMIN_EMAIL and a strong ADMIN_PASSWORD in .env to create the admin:\n    ${problems}`);
  }

  const passwordHash = await hashPassword(creds.data.ADMIN_PASSWORD);
  if (existing) {
    await Admin.deleteMany({ _id: trusted({ $ne: existing._id }) });
    existing.set({ email: creds.data.ADMIN_EMAIL, passwordHash, failedAttempts: 0, lockUntil: null, passwordChangedAt: new Date() });
    await existing.save();
    console.log(`• Admin reset to ${creds.data.ADMIN_EMAIL} (all existing sessions signed out).`);
  } else {
    await Admin.create({ email: creds.data.ADMIN_EMAIL, passwordHash });
    console.log(`• Admin created: ${creds.data.ADMIN_EMAIL}`);
  }
}

async function seedCollection(name: string, model: Model<any>, docs: readonly object[]) {
  if (FORCE) await model.deleteMany({});
  else if ((await model.estimatedDocumentCount()) > 0) {
    console.log(`• ${name}: already has data, skipped`);
    return;
  }
  await model.insertMany(docs.map((doc, order) => ({ ...doc, order })));
  console.log(`• ${name}: ${docs.length} added`);
}

async function seedSettings() {
  const existing = await SiteSettings.findOne();
  // The API creates a blank settings document the first time anything reads it, so
  // "exists but has no name" means it was never seeded, not that it was edited.
  if (existing && existing.profile?.name && !FORCE) {
    console.log('• Site settings: already exist, skipped');
    return;
  }
  await SiteSettings.deleteMany({});
  await SiteSettings.create(data.settings);
  console.log('• Site settings: created');
}

async function main() {
  await connectDB();
  console.log(FORCE ? 'Seeding (force: replacing all content)…' : 'Seeding…');

  // A problem with the admin credentials shouldn't stop the content from loading.
  let adminError: Error | null = null;
  await seedAdmin().catch((err: Error) => (adminError = err));
  await seedSettings();
  await seedCollection('Social links', SocialLink, data.socialLinks);
  await seedCollection('Experience', Experience, data.experience);
  await seedCollection('Projects', Project, data.projects);
  await seedCollection('Skill groups', SkillGroup, data.skillGroups);
  await seedCollection('Education', Education, data.education);
  await seedCollection('Certifications', Certification, data.certifications);
  await seedCollection('Coding profiles', CodingProfile, data.codingProfiles);

  // The seed writes straight to the database, so tell the website its cached pages are stale.
  console.log(
    (await refreshSiteNow())
      ? '• Website cache refreshed'
      : '• Website not reachable at CLIENT_URL; it will show the new content after its next build or refresh',
  );

  if (adminError) {
    console.error(`\n⚠ Content loaded, but the admin account was NOT created:\n  ${(adminError as Error).message}`);
    console.error('  Fix ADMIN_EMAIL / ADMIN_PASSWORD in .env and run "npm run seed" again.');
    process.exitCode = 1;
    return;
  }
  console.log('Done. Upload your photo and resumes from the admin dashboard.');
}

main()
  .catch((err) => {
    console.error(`Seed failed: ${err.message}`);
    process.exitCode = 1;
  })
  .finally(() => disconnectDB());
