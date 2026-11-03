import { z } from 'zod';
import { THEME_PRESETS } from '../models/SiteSettings';
import { hexColor, labelValue, longText, media, optionalUrl, requiredText, text } from './common';

export const profileBody = z
  .object({
    name: requiredText(80),
    title: requiredText(80),
    company: text(120),
    companyUrl: optionalUrl,
    tagline: text(200),
    bio: longText(2000),
    location: text(120),
    availability: text(120),
    openToWork: z.boolean(),
    email: z.union([z.literal(''), z.email().max(254)]),
    phone: z
      .string()
      .trim()
      .max(25)
      .regex(/^[+\d\s()-]*$/, 'Only digits, spaces, +, - and ()'),
    showPhone: z.boolean(),
    photo: media.nullable(),
  })
  .partial();

export const statsBody = z.object({
  stats: z.array(labelValue).max(8),
});

const palette = z.object({ primary: hexColor, secondary: hexColor });

export const themeBody = z
  .object({
    preset: z.enum(THEME_PRESETS),
    dark: palette,
    light: palette,
    defaultMode: z.enum(['dark', 'light']),
  })
  .partial();

export const seoBody = z
  .object({
    title: text(70),
    description: text(170),
    keywords: z.array(requiredText(40)).max(20),
    ogImage: media.nullable(),
  })
  .partial();
