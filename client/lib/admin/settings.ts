'use client';

import type { FieldDef } from './fields';

export const profileFields: FieldDef[] = [
  { name: 'photo', label: 'Profile photo', type: 'image', folder: 'profile', hint: 'Square, at least 600×600' },
  { name: 'name', label: 'Full name', type: 'text', required: true },
  { name: 'title', label: 'Current job title', type: 'text', required: true },
  { name: 'company', label: 'Current company', type: 'text' },
  { name: 'companyUrl', label: 'Company website', type: 'url' },
  { name: 'tagline', label: 'Tagline', type: 'text', full: true, maxLength: 200, hint: 'One line under your name' },
  { name: 'bio', label: 'Bio', type: 'textarea', rows: 6, maxLength: 2000, hint: 'Blank lines start new paragraphs' },
  { name: 'location', label: 'Location', type: 'text' },
  { name: 'availability', label: 'Availability', type: 'text', placeholder: 'Open to SDE roles' },
  { name: 'openToWork', label: 'Open to work', type: 'boolean', description: 'Shows a pulsing green dot next to your availability.' },
  { name: 'email', label: 'Public email', type: 'email' },
  { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'showPhone', label: 'Show phone on site', type: 'boolean', description: 'Off by default. When off, the number never leaves the server.' },
];

export const statsFields: FieldDef[] = [
  {
    name: 'stats',
    label: 'Quick stats',
    hint: 'Shown in the About section (max 8)',
    type: 'objectList',
    inline: true,
    max: 8,
    addLabel: 'Add stat',
    newItem: () => ({ value: '', label: '' }),
    fields: [
      { name: 'value', label: 'Value', type: 'text', required: true, placeholder: '1,500+' },
      { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'DSA problems solved' },
    ],
  },
];

export const SECTION_LABELS = {
  about: 'About',
  experience: 'Experience',
  projects: 'Projects',
  skills: 'Skills',
  coding: 'Coding profiles',
  education: 'Education & certifications',
  contact: 'Contact',
} as const;

export const sectionFields: FieldDef[] = Object.entries(SECTION_LABELS).map(([key, label]) => ({
  name: key,
  label,
  type: 'group' as const,
  fields: [
    { name: 'eyebrow', label: 'Eyebrow', type: 'text' as const, maxLength: 40, placeholder: 'ABOUT' },
    { name: 'title', label: 'Heading', type: 'text' as const, required: true, maxLength: 120 },
    { name: 'description', label: 'Intro text', type: 'textarea' as const, rows: 2, maxLength: 300, full: true },
  ],
}));

export const seoFields: FieldDef[] = [
  { name: 'title', label: 'Site title', type: 'text', full: true, maxLength: 70, hint: 'Aim for under 60 characters' },
  { name: 'description', label: 'Meta description', type: 'textarea', rows: 3, maxLength: 170, hint: 'Aim for 120-160 characters' },
  { name: 'keywords', label: 'Keywords', type: 'tags' },
  { name: 'ogImage', label: 'Open Graph image', type: 'image', folder: 'seo', hint: '1200×630, shown when the link is shared' },
];
