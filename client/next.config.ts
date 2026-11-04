import type { NextConfig } from 'next';

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');
const isDev = process.env.NODE_ENV === 'development';

/**
 * Static CSP (no nonces): nonces would force every page to render per request,
 * which defeats the pre-rendered, API-independent public site. Inline scripts
 * are limited to Next's own bootstrap, the theme script and JSON-LD.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https://res.cloudinary.com",
  "font-src 'self'",
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "media-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "manifest-src 'self'",
  ...(isDev ? [] : ['upgrade-insecure-requests']),
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  ...(isDev ? [] : [{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' }]),
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      '*.css': {
        loaders: ['@tailwindcss/turbopack'],
        as: '*.css',
      },
    },
  },
  images: {
    // Cloudinary resizes and converts images itself, so Next's optimizer isn't needed.
    loader: 'custom',
    loaderFile: './lib/cloudinary-loader.ts',
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  async rewrites() {
    // Route handlers in app/api (e.g. /api/revalidate) take precedence over this rewrite.
    return [
      { source: '/api/:path*', destination: `${API_URL}/api/:path*` },
      // Browsers and crawlers request these fixed paths even when the page links its icons.
      { source: '/favicon.ico', destination: '/icon' },
      { source: '/apple-touch-icon.png', destination: '/apple-icon' },
      { source: '/apple-touch-icon-precomposed.png', destination: '/apple-icon' },
    ];
  },
};

export default nextConfig;
