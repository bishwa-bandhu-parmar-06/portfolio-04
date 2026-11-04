'use client';

import type { CollectionConfig, Item } from '@/components/admin/CollectionManager';
import { formatMonth, formatRange, hostname } from '@/lib/format';
import type { Media } from '@/lib/types';
import type { FieldDef } from './fields';

/**
 * One config per content collection. Field names match the server's Zod
 * schemas (server/src/validators/content.ts), so validation errors map back
 * onto the right input.
 */

const visible: FieldDef = { name: 'visible', label: 'Show on site', type: 'boolean', description: 'Hidden items stay saved but are not shown publicly.' };

const media = (item: Item, key: string) => (item[key] as Media | null | undefined)?.url ?? '';

export const projectsConfig: CollectionConfig = {
  resource: 'projects',
  title: 'Projects',
  singular: 'project',
  description: 'Featured projects always appear first; within each group the order below is used.',
  sortNote: 'Featured projects (★) always stay above the rest. Drag to reorder within the featured and non-featured groups.',
  wideEditor: true,
  defaults: { visible: true, featured: false, techTags: [], features: [], screenshots: [] },
  rowTitle: (p) => String(p.title),
  rowSubtitle: (p) => [p.subtitle, formatMonth(p.date as string)].filter(Boolean).join(' · '),
  rowThumb: (p) => media(p, 'coverImage'),
  fields: [
    { name: 'title', label: 'Title', type: 'text', required: true, maxLength: 100 },
    { name: 'slug', label: 'URL slug', type: 'text', omitEmpty: true, hint: 'Leave empty to generate from the title', placeholder: 'my-project' },
    { name: 'subtitle', label: 'Subtitle', type: 'text', full: true, maxLength: 160, placeholder: 'Multi-Tenant Restaurant Ordering SaaS' },
    { name: 'summary', label: 'Card summary', type: 'textarea', rows: 3, maxLength: 400, hint: 'Shown on the project card' },
    { name: 'liveUrl', label: 'Live URL', type: 'url' },
    { name: 'githubUrl', label: 'GitHub URL', type: 'url' },
    { name: 'date', label: 'Date', type: 'month', nullable: true },
    { name: 'featured', label: 'Featured', type: 'boolean', description: 'Pin to the top of the projects grid.' },
    { name: 'techTags', label: 'Tech stack', type: 'tags', placeholder: 'React, Node.js…' },
    { name: 'coverImage', label: 'Cover image', type: 'image', folder: 'projects', hint: '16:9 works best' },
    { name: 'description', label: 'Overview', type: 'markdown', rows: 8 },
    { name: 'features', label: 'Key features', type: 'list', addLabel: 'Add feature' },
    { name: 'architecture', label: 'Architecture', type: 'markdown', rows: 8 },
    {
      name: 'screenshots',
      label: 'Screenshots',
      type: 'objectList',
      max: 12,
      addLabel: 'Add screenshot',
      itemTitle: (s, i) => String(s.caption || `Screenshot ${i + 1}`),
      newItem: () => ({ image: null, caption: '' }),
      fields: [
        { name: 'image', label: 'Image', type: 'image', folder: 'projects' },
        { name: 'caption', label: 'Caption', type: 'text', full: true },
      ],
    },
    visible,
  ],
};

export const experienceConfig: CollectionConfig = {
  resource: 'experience',
  title: 'Experience',
  singular: 'position',
  wideEditor: true,
  defaults: { workMode: 'remote', visible: true, roles: [{ title: '', startDate: null, endDate: null, note: '' }], bullets: [] },
  rowTitle: (e) => String(e.company),
  rowSubtitle: (e) => {
    const roles = (e.roles as { title: string; startDate: string; endDate?: string | null }[]) ?? [];
    return roles.map((r) => `${r.title} (${formatRange(r.startDate, r.endDate)})`).join(' · ');
  },
  fields: [
    { name: 'company', label: 'Company', type: 'text', required: true },
    { name: 'companyUrl', label: 'Company website', type: 'url' },
    { name: 'location', label: 'Location', type: 'text', placeholder: 'Pune / Mumbai, India' },
    {
      name: 'workMode',
      label: 'Work mode',
      type: 'select',
      options: [
        { value: 'remote', label: 'Remote' },
        { value: 'hybrid', label: 'Hybrid' },
        { value: 'onsite', label: 'On-site' },
      ],
    },
    {
      name: 'roles',
      label: 'Roles at this company',
      hint: 'Newest first. Leave the end date empty for a current role.',
      type: 'objectList',
      addLabel: 'Add role (e.g. a promotion)',
      itemTitle: (r, i) => String(r.title || `Role ${i + 1}`),
      newItem: () => ({ title: '', startDate: '', endDate: '', note: '' }),
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true, full: true },
        { name: 'startDate', label: 'Start', type: 'month', required: true },
        { name: 'endDate', label: 'End', type: 'month', nullable: true, hint: 'Empty = Present' },
        { name: 'note', label: 'Note', type: 'text', full: true, placeholder: 'Converted to full-time' },
      ],
    },
    { name: 'bullets', label: 'Highlights', type: 'list', hint: '2-3 work best', addLabel: 'Add bullet' },
    visible,
  ],
};

export const skillsConfig: CollectionConfig = {
  resource: 'skill-groups',
  title: 'Skills',
  singular: 'skill group',
  description:
    'Icons use simpleicons.org slugs (react, docker, nodedotjs) or lucide:<name> (lucide:database). Unknown names show a generic icon.',
  wideEditor: true,
  defaults: { visible: true, skills: [] },
  rowTitle: (g) => String(g.name),
  rowSubtitle: (g) => ((g.skills as { name: string }[]) ?? []).map((s) => s.name).join(', '),
  fields: [
    { name: 'name', label: 'Group name', type: 'text', required: true, full: true },
    {
      name: 'skills',
      label: 'Skills',
      type: 'objectList',
      inline: true,
      addLabel: 'Add skill',
      newItem: () => ({ name: '', icon: '' }),
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'icon', label: 'Icon', type: 'text', placeholder: 'react' },
      ],
    },
    visible,
  ],
};

export const educationConfig: CollectionConfig = {
  resource: 'education',
  title: 'Education',
  singular: 'education entry',
  defaults: { visible: true },
  rowTitle: (e) => `${e.degree}${e.field ? `, ${e.field}` : ''}`,
  rowSubtitle: (e) => `${e.institution} · ${e.startYear} – ${e.endYear ?? 'Present'}`,
  fields: [
    { name: 'degree', label: 'Degree', type: 'text', required: true, placeholder: 'B.Tech' },
    { name: 'field', label: 'Field of study', type: 'text', placeholder: 'Computer Science and Engineering' },
    { name: 'institution', label: 'Institution', type: 'text', required: true },
    { name: 'university', label: 'University', type: 'text' },
    { name: 'startYear', label: 'Start year', type: 'number', required: true, min: 1950, max: 2100 },
    { name: 'endYear', label: 'End year', type: 'number', nullable: true, min: 1950, max: 2100, hint: 'Empty = Present' },
    { name: 'grade', label: 'Grade', type: 'text', placeholder: 'CGPA 8.13/10' },
    visible,
  ],
};

export const certificationsConfig: CollectionConfig = {
  resource: 'certifications',
  title: 'Certifications',
  singular: 'certification',
  defaults: { visible: true },
  rowTitle: (c) => String(c.name),
  rowSubtitle: (c) => [c.issuer, c.platform && `via ${c.platform}`, formatMonth(c.date as string)].filter(Boolean).join(' · '),
  fields: [
    { name: 'name', label: 'Name', type: 'text', required: true, full: true },
    { name: 'issuer', label: 'Issuer', type: 'text', required: true, placeholder: 'Google' },
    { name: 'platform', label: 'Platform', type: 'text', placeholder: 'Coursera' },
    { name: 'date', label: 'Date', type: 'month', nullable: true },
    { name: 'url', label: 'Certificate link', type: 'url' },
    visible,
  ],
};

const PLATFORM_NAMES: Record<string, string> = {
  leetcode: 'LeetCode',
  geeksforgeeks: 'GeeksforGeeks',
  codeforces: 'Codeforces',
  codechef: 'CodeChef',
  hackerrank: 'HackerRank',
  other: 'Other',
};

export const codingConfig: CollectionConfig = {
  resource: 'coding-profiles',
  title: 'Coding profiles',
  singular: 'coding profile',
  description: 'The section title can include {total}, which shows the sum of "problems solved" across visible profiles.',
  defaults: { platform: 'leetcode', visible: true, breakdown: {}, highlights: [] },
  rowTitle: (c) => `${PLATFORM_NAMES[String(c.platform)] ?? c.platform} · @${c.username}`,
  rowSubtitle: (c) => `${c.totalSolved} problems solved`,
  fields: [
    {
      name: 'platform',
      label: 'Platform',
      type: 'select',
      options: Object.entries(PLATFORM_NAMES).map(([value, label]) => ({ value, label })),
    },
    { name: 'username', label: 'Username', type: 'text', required: true },
    { name: 'url', label: 'Profile URL', type: 'url', required: true, full: true },
    { name: 'totalSolved', label: 'Problems solved', type: 'number', min: 0 },
    {
      name: 'breakdown',
      label: 'Difficulty breakdown (optional)',
      type: 'group',
      fields: [
        { name: 'easy', label: 'Easy', type: 'number', nullable: true, min: 0 },
        { name: 'medium', label: 'Medium', type: 'number', nullable: true, min: 0 },
        { name: 'hard', label: 'Hard', type: 'number', nullable: true, min: 0 },
      ],
    },
    {
      name: 'highlights',
      label: 'Highlights',
      hint: 'e.g. Coding score · 2,834',
      type: 'objectList',
      inline: true,
      max: 8,
      addLabel: 'Add highlight',
      newItem: () => ({ label: '', value: '' }),
      fields: [
        { name: 'label', label: 'Label', type: 'text', required: true },
        { name: 'value', label: 'Value', type: 'text', required: true },
      ],
    },
    visible,
  ],
};

const SOCIAL_OPTIONS = [
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
].map((v) => ({ value: v, label: v === 'x' ? 'X (Twitter)' : v.charAt(0).toUpperCase() + v.slice(1) }));

export const socialConfig: CollectionConfig = {
  resource: 'social-links',
  title: 'Social links',
  singular: 'link',
  description: 'Shown in the hero, contact section and footer, in this order.',
  defaults: { platform: 'linkedin', visible: true },
  rowTitle: (l) => String(l.label),
  rowSubtitle: (l) => hostname(String(l.url)),
  fields: [
    { name: 'platform', label: 'Platform (sets the icon)', type: 'select', options: SOCIAL_OPTIONS },
    { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'LinkedIn' },
    { name: 'url', label: 'URL', type: 'text', required: true, full: true, placeholder: 'https://… or mailto:you@example.com' },
    visible,
  ],
};

export const resumesConfig: CollectionConfig = {
  resource: 'resumes',
  title: 'Resumes',
  singular: 'resume',
  description: 'Upload a PDF for each version. The default one is used by every "Resume" and "Download Resume" button.',
  defaults: { visible: true },
  rowTitle: (r) => String(r.label),
  rowSubtitle: (r) => `/api/public/resume/${r.slug}`,
  fields: [
    { name: 'label', label: 'Label', type: 'text', required: true, placeholder: 'SDE / Full Stack' },
    { name: 'slug', label: 'Slug', type: 'text', omitEmpty: true, hint: 'Optional; generated from the label' },
    { name: 'file', label: 'PDF file', type: 'pdf', folder: 'resumes', required: true },
    visible,
  ],
};
