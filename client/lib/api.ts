import 'server-only';
import { cacheLife, cacheTag } from 'next/cache';
import type { ProjectDetail, SiteData } from './types';

/** Every cached read shares this tag; the API calls /api/revalidate with it after admin edits. */
export const CONTENT_TAG = 'portfolio';

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

async function getJson<T>(path: string): Promise<T | null> {
  // Render's free tier can take ~50s to wake up, so allow a generous timeout.
  const res = await fetch(`${API_URL}${path}`, {
    headers: { accept: 'application/json' },
    signal: AbortSignal.timeout(60_000),
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`API ${path} responded ${res.status}`);
  return res.json() as Promise<T>;
}

/**
 * All home-page content. Cached until the API reports a change (on-demand
 * revalidation), with a daily refresh as a safety net.
 */
export async function getSite(): Promise<SiteData> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('days');
  const data = await getJson<SiteData>('/api/public/site');
  if (!data) throw new Error('Site content not found');
  return data;
}

export async function getProjectSlugs(): Promise<string[]> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('days');
  const data = await getJson<{ items: { slug: string }[] }>('/api/public/projects');
  return data?.items.map((p) => p.slug) ?? [];
}

export async function getProject(slug: string): Promise<ProjectDetail | null> {
  'use cache';
  cacheTag(CONTENT_TAG);
  cacheLife('days');
  return getJson<ProjectDetail>(`/api/public/projects/${encodeURIComponent(slug)}`);
}
