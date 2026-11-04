import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ quiet: true });

const csv = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim().replace(/\/$/, ''))
      .filter(Boolean),
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  TRUST_PROXY: z.coerce.number().int().min(0).default(1),

  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('1d'),
  COOKIE_NAME: z.string().default('pf_session'),

  CLIENT_ORIGINS: csv.default(['http://localhost:3000']),
  CLIENT_URL: z.url().default('http://localhost:3000'),
  REVALIDATE_SECRET: z.string().default(''),

  CLOUDINARY_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_API_KEY: z.string().default(''),
  CLOUDINARY_API_SECRET: z.string().default(''),
  CLOUDINARY_FOLDER: z.string().default('portfolio'),

  RESEND_API_KEY: z.string().default(''),
  MAIL_FROM: z.string().default('Portfolio <noreply@bishwabandhu.me>'),
  CONTACT_NOTIFY_EMAIL: z.string().default(''),

  IP_HASH_SALT: z.string().default('dev-only-ip-hash-salt'),
  /** Shared with the Next.js app; proves `x-client-ip` came from our own proxy. */
  PROXY_SECRET: z.string().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

// Secrets with dev defaults must be set explicitly in production.
if (parsed.data.NODE_ENV === 'production') {
  const weak = (['IP_HASH_SALT', 'PROXY_SECRET', 'REVALIDATE_SECRET'] as const).filter(
    (key) => parsed.data[key].length < 32 || parsed.data[key].startsWith('dev-only'),
  );
  if (weak.length) {
    console.error(`Set a random value of at least 32 characters for: ${weak.join(', ')}`);
    process.exit(1);
  }
}

export const env = parsed.data;
export const isProd = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';
export const cloudinaryEnabled = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET,
);
