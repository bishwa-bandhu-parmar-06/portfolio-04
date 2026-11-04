import { ImageResponse } from 'next/og';
import { getSite } from '@/lib/api';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/** Favicon: the owner's initials on the accent gradient, so it follows theme changes. */
export default async function Icon() {
  const { profile, theme } = await getSite();
  const initials = profile.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 14,
          background: `linear-gradient(135deg, ${theme.dark.primary}, ${theme.dark.secondary})`,
          color: 'white',
          fontSize: 30,
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        {initials}
      </div>
    ),
    size,
  );
}
