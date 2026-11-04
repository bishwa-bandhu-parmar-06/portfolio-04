import { ImageResponse } from 'next/og';
import { getSite } from './api';

/** The owner's initials on the accent gradient, so the icon follows theme changes. */
export async function brandIcon(px: number, rounded: boolean) {
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
          // iOS applies its own rounded mask to touch icons, so those stay square.
          borderRadius: rounded ? Math.round(px * 0.22) : 0,
          background: `linear-gradient(135deg, ${theme.dark.primary}, ${theme.dark.secondary})`,
          color: 'white',
          fontSize: Math.round(px * 0.47),
          fontWeight: 700,
          fontFamily: 'sans-serif',
        }}
      >
        {initials}
      </div>
    ),
    { width: px, height: px },
  );
}
