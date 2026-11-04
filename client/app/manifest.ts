import type { MetadataRoute } from 'next';
import { getSite } from '@/lib/api';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { profile } = await getSite();
  return {
    name: `${profile.name} | ${profile.title}`,
    short_name: profile.name.split(' ')[0] ?? profile.name,
    description: profile.tagline,
    start_url: '/',
    display: 'browser',
    background_color: '#0A0F1C',
    theme_color: '#0A0F1C',
    icons: [{ src: '/icon', sizes: '64x64', type: 'image/png' }],
  };
}
