import { Schema, model } from 'mongoose';
import { mediaSchema, type Media } from './media';

export const SECTION_KEYS = ['about', 'experience', 'projects', 'skills', 'coding', 'education', 'contact'] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];

export interface SectionCopy {
  eyebrow: string;
  title: string;
  description: string;
}

export const THEME_PRESETS = ['indigo-cyan', 'emerald-teal', 'violet-pink', 'amber-orange', 'custom'] as const;

interface Palette {
  primary: string;
  secondary: string;
}

export interface SiteSettingsAttrs {
  profile: {
    name: string;
    title: string;
    company: string;
    companyUrl?: string;
    tagline: string;
    bio: string;
    location: string;
    availability: string;
    openToWork: boolean;
    email: string;
    phone?: string;
    showPhone: boolean;
    photo?: Media | null;
  };
  stats: { label: string; value: string }[];
  /** Heading copy for each home-page section. */
  sections: Record<SectionKey, SectionCopy>;
  theme: {
    preset: (typeof THEME_PRESETS)[number];
    dark: Palette;
    light: Palette;
    defaultMode: 'dark' | 'light';
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: Media | null;
  };
  /** Bumped after every admin edit that changes public content. */
  contentUpdatedAt: Date;
}

const paletteSchema = new Schema<Palette>(
  {
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
  },
  { _id: false },
);

const sectionCopySchema = new Schema<SectionCopy>(
  {
    eyebrow: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
  },
  { _id: false },
);

const siteSettingsSchema = new Schema<SiteSettingsAttrs>(
  {
    profile: {
      name: { type: String, default: '' },
      title: { type: String, default: '' },
      company: { type: String, default: '' },
      companyUrl: { type: String, default: '' },
      tagline: { type: String, default: '' },
      bio: { type: String, default: '' },
      location: { type: String, default: '' },
      availability: { type: String, default: '' },
      openToWork: { type: Boolean, default: true },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      showPhone: { type: Boolean, default: false },
      photo: { type: mediaSchema, default: null },
    },
    stats: {
      type: [new Schema({ label: String, value: String }, { _id: false })],
      default: [],
    },
    sections: Object.fromEntries(SECTION_KEYS.map((key) => [key, { type: sectionCopySchema, default: () => ({}) }])),
    theme: {
      preset: { type: String, enum: THEME_PRESETS, default: 'indigo-cyan' },
      dark: { type: paletteSchema, default: () => ({ primary: '#6366F1', secondary: '#22D3EE' }) },
      light: { type: paletteSchema, default: () => ({ primary: '#4F46E5', secondary: '#0891B2' }) },
      defaultMode: { type: String, enum: ['dark', 'light'], default: 'dark' },
    },
    seo: {
      title: { type: String, default: '' },
      description: { type: String, default: '' },
      keywords: { type: [String], default: [] },
      ogImage: { type: mediaSchema, default: null },
    },
    contentUpdatedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true },
);

export const SiteSettings = model<SiteSettingsAttrs>('SiteSettings', siteSettingsSchema);

/** The settings collection holds exactly one document; create it on first access. */
export async function getSettings() {
  const existing = await SiteSettings.findOne();
  if (existing) return existing;
  return SiteSettings.create({});
}
