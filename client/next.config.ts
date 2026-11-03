import type { NextConfig } from 'next';

const API_URL = (process.env.API_URL ?? 'http://localhost:4000').replace(/\/$/, '');

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
  async rewrites() {
    // Route handlers in app/api (e.g. /api/revalidate) take precedence over this rewrite.
    return [{ source: '/api/:path*', destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
