import { Router } from 'express';
import { trusted } from 'mongoose';
import {
  Certification,
  CodingProfile,
  Education,
  Experience,
  Project,
  Resume,
  SkillGroup,
  SocialLink,
  type ProjectAttrs,
  type ResumeAttrs,
} from '../models';
import { slugify } from '../utils/strings';
import { validate } from '../middleware/validate';
import { idParams } from '../validators/common';
import * as v from '../validators/content';
import { notFound } from '../utils/errors';
import { crudRouter } from './crud';

export const projectsRouter = crudRouter<ProjectAttrs>({
  model: Project,
  createSchema: v.projectCreate,
  updateSchema: v.projectUpdate,
  sort: { featured: -1, order: 1, createdAt: 1 },
  mediaOf: (p) => [p.coverImage, ...(p.screenshots ?? []).map((s) => s.image)],
  prepare: (body, existing) => {
    if (!body.slug && typeof body.title === 'string' && !existing) body.slug = slugify(body.title);
    return body;
  },
});

/** Exactly one resume is the default whenever at least one exists. */
async function ensureSingleDefault(preferredId?: string): Promise<void> {
  if (preferredId) {
    // `trusted` lets this server-built operator past mongoose's sanitizeFilter.
    await Resume.updateMany({ _id: trusted({ $ne: preferredId }) }, { $set: { isDefault: false } });
    return;
  }
  const current = await Resume.findOne({ isDefault: true });
  if (!current) {
    const first = await Resume.findOne().sort({ order: 1, createdAt: 1 });
    if (first) await Resume.updateOne({ _id: first._id }, { $set: { isDefault: true } });
  }
}

const resumesCrud = crudRouter<ResumeAttrs>({
  model: Resume,
  createSchema: v.resumeCreate,
  updateSchema: v.resumeUpdate,
  mediaOf: (r) => [r.file],
  prepare: (body, existing) => {
    if (!body.slug && typeof body.label === 'string' && !existing) body.slug = slugify(body.label);
    return body;
  },
  afterWrite: async (doc) => ensureSingleDefault(doc.isDefault ? doc.id : undefined),
  afterDelete: async () => ensureSingleDefault(),
});

export const resumesRouter = Router();
resumesRouter.patch('/:id/default', validate({ params: idParams }), async (_req, res) => {
  const doc = await Resume.findByIdAndUpdate(res.locals.params.id, { $set: { isDefault: true } }, { new: true });
  if (!doc) throw notFound();
  await ensureSingleDefault(doc.id);
  const items = await Resume.find().sort({ order: 1, createdAt: 1 }).lean();
  res.json({ items });
});
resumesRouter.use(resumesCrud);

export const socialLinksRouter = crudRouter({
  model: SocialLink,
  createSchema: v.socialLinkCreate,
  updateSchema: v.socialLinkUpdate,
});

export const experienceRouter = crudRouter({
  model: Experience,
  createSchema: v.experienceCreate,
  updateSchema: v.experienceUpdate,
});

export const skillGroupsRouter = crudRouter({
  model: SkillGroup,
  createSchema: v.skillGroupCreate,
  updateSchema: v.skillGroupUpdate,
});

export const educationRouter = crudRouter({
  model: Education,
  createSchema: v.educationCreate,
  updateSchema: v.educationUpdate,
});

export const certificationsRouter = crudRouter({
  model: Certification,
  createSchema: v.certificationCreate,
  updateSchema: v.certificationUpdate,
});

export const codingProfilesRouter = crudRouter({
  model: CodingProfile,
  createSchema: v.codingProfileCreate,
  updateSchema: v.codingProfileUpdate,
});
