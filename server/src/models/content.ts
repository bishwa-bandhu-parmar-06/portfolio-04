import { Schema, model } from 'mongoose';
import { mediaSchema, type Media } from './media';

/**
 * Orderable content collections shown on the public site.
 * Each has `order` (ascending, set by drag-and-drop in the admin) and `visible`.
 */

const orderable = {
  order: { type: Number, default: 0, index: true },
  visible: { type: Boolean, default: true },
};

// ---------- Resume ----------
export interface ResumeAttrs {
  label: string;
  slug: string;
  file: Media;
  isDefault: boolean;
  order: number;
  visible: boolean;
}

const resumeSchema = new Schema<ResumeAttrs>(
  {
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    file: { type: mediaSchema, required: true },
    isDefault: { type: Boolean, default: false },
    ...orderable,
  },
  { timestamps: true },
);
export const Resume = model<ResumeAttrs>('Resume', resumeSchema);

// ---------- Social link ----------
export const SOCIAL_PLATFORMS = [
  'linkedin',
  'github',
  'leetcode',
  'geeksforgeeks',
  'x',
  'fiverr',
  'instagram',
  'facebook',
  'youtube',
  'medium',
  'website',
  'email',
  'other',
] as const;

export interface SocialLinkAttrs {
  platform: (typeof SOCIAL_PLATFORMS)[number];
  label: string;
  url: string;
  order: number;
  visible: boolean;
}

const socialLinkSchema = new Schema<SocialLinkAttrs>(
  {
    platform: { type: String, enum: SOCIAL_PLATFORMS, required: true },
    label: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    ...orderable,
  },
  { timestamps: true },
);
export const SocialLink = model<SocialLinkAttrs>('SocialLink', socialLinkSchema);

// ---------- Project ----------
export interface ProjectAttrs {
  slug: string;
  title: string;
  subtitle: string;
  summary: string;
  description: string;
  features: string[];
  architecture: string;
  techTags: string[];
  liveUrl?: string;
  githubUrl?: string;
  coverImage?: Media | null;
  screenshots: { image: Media; caption?: string }[];
  date?: Date | null;
  featured: boolean;
  order: number;
  visible: boolean;
}

const projectSchema = new Schema<ProjectAttrs>(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    subtitle: { type: String, default: '' },
    summary: { type: String, default: '' },
    description: { type: String, default: '' },
    features: { type: [String], default: [] },
    architecture: { type: String, default: '' },
    techTags: { type: [String], default: [] },
    liveUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    coverImage: { type: mediaSchema, default: null },
    screenshots: {
      type: [new Schema({ image: { type: mediaSchema, required: true }, caption: String }, { _id: false })],
      default: [],
    },
    date: { type: Date, default: null },
    featured: { type: Boolean, default: false },
    ...orderable,
  },
  { timestamps: true },
);
export const Project = model<ProjectAttrs>('Project', projectSchema);

// ---------- Experience ----------
export interface ExperienceAttrs {
  company: string;
  companyUrl?: string;
  location?: string;
  workMode: 'remote' | 'onsite' | 'hybrid';
  roles: { title: string; startDate: Date; endDate?: Date | null; note?: string }[];
  bullets: string[];
  order: number;
  visible: boolean;
}

const experienceSchema = new Schema<ExperienceAttrs>(
  {
    company: { type: String, required: true, trim: true },
    companyUrl: { type: String, default: '' },
    location: { type: String, default: '' },
    workMode: { type: String, enum: ['remote', 'onsite', 'hybrid'], default: 'remote' },
    roles: {
      type: [
        new Schema(
          {
            title: { type: String, required: true },
            startDate: { type: Date, required: true },
            endDate: { type: Date, default: null },
            note: { type: String, default: '' },
          },
          { _id: false },
        ),
      ],
      default: [],
    },
    bullets: { type: [String], default: [] },
    ...orderable,
  },
  { timestamps: true },
);
export const Experience = model<ExperienceAttrs>('Experience', experienceSchema);

// ---------- Skill group ----------
export interface SkillGroupAttrs {
  name: string;
  skills: { name: string; icon?: string }[];
  order: number;
  visible: boolean;
}

const skillGroupSchema = new Schema<SkillGroupAttrs>(
  {
    name: { type: String, required: true, trim: true },
    skills: {
      type: [new Schema({ name: { type: String, required: true }, icon: String }, { _id: false })],
      default: [],
    },
    ...orderable,
  },
  { timestamps: true },
);
export const SkillGroup = model<SkillGroupAttrs>('SkillGroup', skillGroupSchema);

// ---------- Education ----------
export interface EducationAttrs {
  institution: string;
  university?: string;
  degree: string;
  field?: string;
  startYear: number;
  endYear?: number | null;
  grade?: string;
  order: number;
  visible: boolean;
}

const educationSchema = new Schema<EducationAttrs>(
  {
    institution: { type: String, required: true, trim: true },
    university: { type: String, default: '' },
    degree: { type: String, required: true },
    field: { type: String, default: '' },
    startYear: { type: Number, required: true },
    endYear: { type: Number, default: null },
    grade: { type: String, default: '' },
    ...orderable,
  },
  { timestamps: true },
);
export const Education = model<EducationAttrs>('Education', educationSchema);

// ---------- Certification ----------
export interface CertificationAttrs {
  name: string;
  issuer: string;
  platform?: string;
  date?: Date | null;
  url?: string;
  order: number;
  visible: boolean;
}

const certificationSchema = new Schema<CertificationAttrs>(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, required: true, trim: true },
    platform: { type: String, default: '' },
    date: { type: Date, default: null },
    url: { type: String, default: '' },
    ...orderable,
  },
  { timestamps: true },
);
export const Certification = model<CertificationAttrs>('Certification', certificationSchema);

// ---------- Coding profile ----------
export interface CodingProfileAttrs {
  platform: 'leetcode' | 'geeksforgeeks' | 'codeforces' | 'codechef' | 'hackerrank' | 'other';
  username: string;
  url: string;
  totalSolved: number;
  breakdown: { easy?: number | null; medium?: number | null; hard?: number | null };
  highlights: { label: string; value: string }[];
  order: number;
  visible: boolean;
}

const codingProfileSchema = new Schema<CodingProfileAttrs>(
  {
    platform: {
      type: String,
      enum: ['leetcode', 'geeksforgeeks', 'codeforces', 'codechef', 'hackerrank', 'other'],
      required: true,
    },
    username: { type: String, required: true, trim: true },
    url: { type: String, required: true, trim: true },
    totalSolved: { type: Number, default: 0 },
    breakdown: {
      easy: { type: Number, default: null },
      medium: { type: Number, default: null },
      hard: { type: Number, default: null },
    },
    highlights: {
      type: [new Schema({ label: String, value: String }, { _id: false })],
      default: [],
    },
    ...orderable,
  },
  { timestamps: true },
);
export const CodingProfile = model<CodingProfileAttrs>('CodingProfile', codingProfileSchema);
