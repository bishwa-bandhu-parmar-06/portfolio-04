import { z } from 'zod';
import { SOCIAL_PLATFORMS } from '../models/content';
import {
  httpUrl,
  labelValue,
  longText,
  media,
  optionalDate,
  optionalUrl,
  orderable,
  requiredText,
  text,
} from './common';

const slug = z
  .string()
  .trim()
  .toLowerCase()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and dashes')
  .max(80);

const stringList = (maxItems: number, maxLen = 300) => z.array(requiredText(maxLen)).max(maxItems);

// ---------- Resume ----------
export const resumeCreate = z.object({
  label: requiredText(60),
  slug: slug.optional(),
  file: media.extend({ resourceType: z.literal('raw') }),
  isDefault: z.boolean().optional(),
  ...orderable,
});
export const resumeUpdate = resumeCreate.partial();

// ---------- Social link ----------
export const socialLinkCreate = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  label: requiredText(40),
  url: z.union([httpUrl, z.string().regex(/^mailto:[^\s@]+@[^\s@]+$/, 'Invalid mailto link')]),
  ...orderable,
});
export const socialLinkUpdate = socialLinkCreate.partial();

// ---------- Project ----------
export const projectCreate = z.object({
  title: requiredText(100),
  slug: slug.optional(),
  subtitle: text(160).optional(),
  summary: text(400).optional(),
  description: longText(20_000).optional(),
  features: stringList(30).optional(),
  architecture: longText(20_000).optional(),
  techTags: stringList(30, 40).optional(),
  liveUrl: optionalUrl.optional(),
  githubUrl: optionalUrl.optional(),
  coverImage: media.nullable().optional(),
  screenshots: z
    .array(z.object({ image: media, caption: text(200).optional() }))
    .max(12)
    .optional(),
  date: optionalDate,
  featured: z.boolean().optional(),
  ...orderable,
});
export const projectUpdate = projectCreate.partial();

// ---------- Experience ----------
const role = z
  .object({
    title: requiredText(100),
    startDate: z.coerce.date(),
    endDate: z.coerce.date().nullable().optional(),
    note: text(120).optional(),
  })
  .refine((r) => !r.endDate || r.endDate >= r.startDate, {
    path: ['endDate'],
    message: 'End date must be after the start date',
  });

export const experienceCreate = z.object({
  company: requiredText(120),
  companyUrl: optionalUrl.optional(),
  location: text(120).optional(),
  workMode: z.enum(['remote', 'onsite', 'hybrid']).optional(),
  roles: z.array(role).min(1).max(10),
  bullets: stringList(10).optional(),
  ...orderable,
});
export const experienceUpdate = experienceCreate.partial();

// ---------- Skill group ----------
export const skillGroupCreate = z.object({
  name: requiredText(60),
  skills: z
    .array(z.object({ name: requiredText(60), icon: text(60).optional() }))
    .max(60),
  ...orderable,
});
export const skillGroupUpdate = skillGroupCreate.partial();

// ---------- Education ----------
const year = z.number().int().min(1950).max(2100);
export const educationCreate = z.object({
  institution: requiredText(160),
  university: text(160).optional(),
  degree: requiredText(120),
  field: text(120).optional(),
  startYear: year,
  endYear: year.nullable().optional(),
  grade: text(40).optional(),
  ...orderable,
});
export const educationUpdate = educationCreate.partial();

// ---------- Certification ----------
export const certificationCreate = z.object({
  name: requiredText(160),
  issuer: requiredText(120),
  platform: text(120).optional(),
  date: optionalDate,
  url: optionalUrl.optional(),
  ...orderable,
});
export const certificationUpdate = certificationCreate.partial();

// ---------- Coding profile ----------
const count = z.number().int().min(0).max(100_000);
export const codingProfileCreate = z.object({
  platform: z.enum(['leetcode', 'geeksforgeeks', 'codeforces', 'codechef', 'hackerrank', 'other']),
  username: requiredText(60),
  url: httpUrl,
  totalSolved: count.optional(),
  breakdown: z
    .object({ easy: count.nullable(), medium: count.nullable(), hard: count.nullable() })
    .partial()
    .optional(),
  highlights: z.array(labelValue).max(8).optional(),
  ...orderable,
});
export const codingProfileUpdate = codingProfileCreate.partial();
