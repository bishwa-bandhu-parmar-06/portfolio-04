import { getSite } from '@/lib/api';
import { OG_SIZE, ogCard, uploadedImage } from '@/lib/og';
import { SITE_URL } from '@/lib/site';

export const size = OG_SIZE;
export const contentType = 'image/png';
export const alt = 'Portfolio preview';

export default async function OpenGraphImage() {
  const { profile, seo, theme } = await getSite();
  return (
    (await uploadedImage(seo.ogImage)) ??
    ogCard({
      eyebrow: profile.availability || 'Portfolio',
      title: profile.name,
      subtitle: profile.tagline || profile.title,
      footer: [profile.title, profile.company && `@ ${profile.company}`, new URL(SITE_URL).host].filter(Boolean).join('  ·  '),
      theme,
    })
  );
}
