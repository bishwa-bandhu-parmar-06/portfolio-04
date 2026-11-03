import { Router } from 'express';
import { z } from 'zod';
import { contactLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  Certification,
  CodingProfile,
  Education,
  Experience,
  Project,
  Resume,
  SkillGroup,
  SocialLink,
  getSettings,
} from '../models';
import { notFound } from '../utils/errors';
import { submitContact } from './messages.controller';

export const publicRouter = Router();

const visibleSorted = { visible: true };
const byOrder = { order: 1, createdAt: 1 } as const;

/** Fields shown on project cards; the rest is only needed on the detail page. */
const PROJECT_CARD_FIELDS = 'slug title subtitle summary techTags liveUrl githubUrl coverImage date featured order';

const cache = (seconds: number) => `public, max-age=${seconds}, s-maxage=${seconds * 5}, stale-while-revalidate=86400`;

/** GET /api/public/site — everything the home page renders, in one request. */
publicRouter.get('/site', async (_req, res) => {
  const [settings, socialLinks, projects, experience, skillGroups, education, certifications, codingProfiles, resumes] =
    await Promise.all([
      getSettings(),
      SocialLink.find(visibleSorted).sort(byOrder).lean(),
      Project.find(visibleSorted).select(PROJECT_CARD_FIELDS).sort({ featured: -1, ...byOrder }).lean(),
      Experience.find(visibleSorted).sort(byOrder).lean(),
      SkillGroup.find(visibleSorted).sort(byOrder).lean(),
      Education.find(visibleSorted).sort(byOrder).lean(),
      Certification.find(visibleSorted).sort(byOrder).lean(),
      CodingProfile.find(visibleSorted).sort(byOrder).lean(),
      Resume.find(visibleSorted).select('label slug file.url isDefault order').sort(byOrder).lean(),
    ]);

  const { phone, showPhone, ...profile } = settings.toObject().profile;

  res.set('Cache-Control', cache(60)).json({
    profile: { ...profile, phone: showPhone ? phone : undefined },
    stats: settings.stats,
    theme: settings.theme,
    seo: settings.seo,
    updatedAt: settings.contentUpdatedAt,
    socialLinks,
    projects,
    experience,
    skillGroups,
    education,
    certifications,
    codingProfiles,
    resumes: resumes.map((r) => ({ label: r.label, slug: r.slug, url: r.file.url, isDefault: r.isDefault })),
  });
});

/** GET /api/public/projects — slugs for static generation and the sitemap. */
publicRouter.get('/projects', async (_req, res) => {
  const items = await Project.find(visibleSorted).select('slug updatedAt').sort(byOrder).lean();
  res.set('Cache-Control', cache(60)).json({ items });
});

const slugParams = z.object({ slug: z.string().trim().toLowerCase().max(80) });

/** GET /api/public/projects/:slug — full project with prev/next for navigation. */
publicRouter.get('/projects/:slug', validate({ params: slugParams }), async (_req, res) => {
  const project = await Project.findOne({ slug: res.locals.params.slug, visible: true }).lean();
  if (!project) throw notFound('Project not found');

  const siblings = await Project.find(visibleSorted).select('slug title').sort({ featured: -1, ...byOrder }).lean();
  const index = siblings.findIndex((p) => p.slug === project.slug);
  res.set('Cache-Control', cache(60)).json({
    project,
    prev: index > 0 ? siblings[index - 1] : null,
    next: index < siblings.length - 1 ? siblings[index + 1] : null,
  });
});

/** GET /api/public/resume[/:slug] — redirect to the PDF, so the link stays stable when the file is replaced. */
publicRouter.get(['/resume', '/resume/:slug'], validate({ params: slugParams.partial() }), async (_req, res) => {
  const slug: string | undefined = res.locals.params.slug;
  const resume = await Resume.findOne(slug ? { slug, visible: true } : { isDefault: true, visible: true }).lean();
  if (!resume) throw notFound('Resume not found');
  res.set('Cache-Control', 'no-cache').redirect(302, resume.file.url);
});

publicRouter.post('/contact', contactLimiter, ...submitContact);
