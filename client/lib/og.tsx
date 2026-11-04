import { ImageResponse } from 'next/og';
import type { Media, Theme } from './types';

export const OG_SIZE = { width: 1200, height: 630 };

/** If the admin uploaded an image, serve it (resized by Cloudinary) instead of the generated card. */
export async function uploadedImage(media: Media | null | undefined): Promise<Response | null> {
  if (!media?.url.includes('/image/upload/')) return null;
  const url = media.url.replace('/image/upload/', '/image/upload/c_fill,w_1200,h_630,f_png,q_auto/');
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(15_000) });
    if (!res.ok) return null;
    return new Response(await res.arrayBuffer(), {
      headers: { 'content-type': 'image/png', 'cache-control': 'public, max-age=86400, s-maxage=604800' },
    });
  } catch {
    return null;
  }
}

/** Branded 1200×630 card used when no image is uploaded. */
export function ogCard({ eyebrow, title, subtitle, footer, theme }: { eyebrow: string; title: string; subtitle: string; footer: string; theme: Theme }) {
  const { primary, secondary } = theme.dark;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: `radial-gradient(circle at 85% 10%, ${primary}55, transparent 45%), radial-gradient(circle at 10% 100%, ${secondary}40, transparent 50%), #0A0F1C`,
          color: '#E5E7EB',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, textTransform: 'uppercase', color: secondary }}>{eyebrow}</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: title.length > 26 ? 72 : 88, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ display: 'flex', marginTop: 28, fontSize: 34, color: '#94A3B8', maxWidth: 980, lineHeight: 1.35 }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, fontSize: 26, color: '#94A3B8' }}>
          <div style={{ display: 'flex', width: 56, height: 8, borderRadius: 4, background: `linear-gradient(90deg, ${primary}, ${secondary})` }} />
          {footer}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
