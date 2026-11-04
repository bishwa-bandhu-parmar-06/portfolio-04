import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import { getSite } from '@/lib/api';
import { SITE_URL } from '@/lib/site';
import { themeBootScript, themeCss } from '@/lib/theme';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk', display: 'swap' });
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains-mono', display: 'swap' });

export async function generateMetadata(): Promise<Metadata> {
  const { seo, profile } = await getSite();
  const title = seo.title || `${profile.name} | ${profile.title}`;
  const description = seo.description || profile.tagline;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s | ${profile.name}` },
    description,
    keywords: seo.keywords,
    authors: [{ name: profile.name }],
    creator: profile.name,
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      url: '/',
      siteName: profile.name,
      title,
      description,
      // og:image comes from app/opengraph-image.tsx, which serves the admin-uploaded image when one is set.
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)', color: '#0A0F1C' },
    { media: '(prefers-color-scheme: light)', color: '#F8FAFC' },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = await getSite();

  return (
    <html
      lang="en"
      // The boot script sets the mode class before paint, so the server markup won't match it.
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} ${theme.defaultMode === 'dark' ? 'dark' : ''}`}
    >
      <head>
        <style id="theme-vars" dangerouslySetInnerHTML={{ __html: themeCss(theme) }} />
        <script dangerouslySetInnerHTML={{ __html: themeBootScript(theme.defaultMode) }} />
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
