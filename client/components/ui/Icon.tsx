import 'server-only';
import { createElement } from 'react';
import { icons as lucideIcons, Code2, Globe, Mail, type LucideIcon } from 'lucide-react';
import * as simpleIcons from 'simple-icons';
import type { SocialPlatform } from '@/lib/types';

/**
 * Renders skill and social icons from a stored key:
 *   - "lucide:<kebab-name>"  → a lucide-react icon
 *   - "<slug>"               → a simple-icons brand logo (https://simpleicons.org)
 * Unknown keys fall back to a generic code icon, so a typo in the admin never breaks the page.
 * Server-only: the full icon sets never reach the browser bundle.
 */

type SimpleIcon = { title: string; path: string; hex: string };

// simple-icons no longer ships LinkedIn, so its mark is inlined here.
const LINKEDIN: SimpleIcon = {
  title: 'LinkedIn',
  hex: '0A66C2',
  path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
};

function findSimpleIcon(slug: string): SimpleIcon | null {
  if (slug === 'linkedin') return LINKEDIN;
  const key = `si${slug.charAt(0).toUpperCase()}${slug.slice(1)}` as keyof typeof simpleIcons;
  const icon = simpleIcons[key] as SimpleIcon | undefined;
  return icon?.path ? icon : null;
}

function findLucide(name: string): LucideIcon | null {
  const pascal = name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('') as keyof typeof lucideIcons;
  return lucideIcons[pascal] ?? null;
}

interface IconProps {
  name?: string;
  size?: number;
  className?: string;
  label?: string;
}

export function Icon({ name = '', size = 20, className, label }: IconProps) {
  const a11y = label ? { role: 'img' as const, 'aria-label': label } : { 'aria-hidden': true as const };

  if (name.startsWith('lucide:')) {
    // A lookup in a static map, not a new component, so createElement keeps the linter happy.
    return createElement(findLucide(name.slice(7)) ?? Code2, { size, className, strokeWidth: 1.75, ...a11y });
  }

  const brand = findSimpleIcon(name.toLowerCase());
  if (brand) {
    return (
      <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className} {...a11y}>
        <path d={brand.path} />
      </svg>
    );
  }

  return <Code2 size={size} className={className} strokeWidth={1.75} {...a11y} />;
}

const SOCIAL_ICON: Partial<Record<SocialPlatform, string>> = {
  linkedin: 'linkedin',
  github: 'github',
  leetcode: 'leetcode',
  geeksforgeeks: 'geeksforgeeks',
  x: 'x',
  fiverr: 'fiverr',
  instagram: 'instagram',
  facebook: 'facebook',
  youtube: 'youtube',
  medium: 'medium',
};

export function SocialIcon({ platform, size = 18, label }: { platform: SocialPlatform; size?: number; label?: string }) {
  if (platform === 'email') return <Mail size={size} aria-hidden />;
  const slug = SOCIAL_ICON[platform];
  if (!slug) return <Globe size={size} aria-hidden />;
  return <Icon name={slug} size={size} label={label} />;
}
