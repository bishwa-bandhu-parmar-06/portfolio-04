import type { MetadataRoute } from 'next';
import { getProjectIndex, getSite } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [site, projects] = await Promise.all([getSite(), getProjectIndex()]);
  return [
    { url: SITE_URL, lastModified: new Date(site.updatedAt), changeFrequency: 'monthly', priority: 1 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/projects/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
  ];
}
