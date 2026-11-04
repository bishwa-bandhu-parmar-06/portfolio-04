/**
 * Runs before every `next build` (npm "prebuild" hook), locally and on Vercel.
 *
 * Every public page is pre-rendered from the API at build time. If the API is
 * missing or asleep, the build would fail halfway or ship broken pages, so this
 * script checks the configuration and wakes the API (Render's free tier can take
 * ~50s) before the build starts. If anything is wrong, it fails fast with a
 * clear message, and Vercel keeps the previous deployment live.
 */
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), false);

const onVercel = process.env.VERCEL === '1';
const WAKE_TIMEOUT_MS = Number(process.env.PREBUILD_WAKE_TIMEOUT_MS) || 120_000;
const problems = [];
const warnings = [];

function required(name, check, hint) {
  const value = process.env[name]?.trim();
  if (!value || value.includes('PASTE_ME')) problems.push(`${name} is not set. ${hint}`);
  else if (check && !check(value)) problems.push(`${name}="${value}" looks wrong. ${hint}`);
  return value;
}

const isUrl = (v) => /^https?:\/\/[^\s/]+/.test(v) && !v.endsWith('/');

const apiUrl = required('API_URL', isUrl, 'Use the API base URL without a trailing slash, e.g. https://portfolio-api.onrender.com');
required('NEXT_PUBLIC_SITE_URL', isUrl, 'Use the public site URL without a trailing slash, e.g. https://bishwabandhu.me');

for (const name of ['REVALIDATE_SECRET', 'PROXY_SECRET']) {
  const value = process.env[name]?.trim();
  if (!value) (onVercel ? problems : warnings).push(`${name} is not set. Copy the same value from the API's environment.`);
}

if (onVercel && apiUrl && /localhost|127\.0\.0\.1/.test(apiUrl)) {
  problems.push(`API_URL points at ${apiUrl}, which Vercel cannot reach. Use your Render URL.`);
}

if (problems.length) {
  console.error('\n✖ Build stopped: fix these environment variables first\n');
  for (const p of problems) console.error(`  • ${p}`);
  console.error(`\n  ${onVercel ? 'Vercel → Project → Settings → Environment Variables' : 'client/.env.local'}\n`);
  process.exit(1);
}
for (const w of warnings) console.warn(`⚠ ${w}`);

async function wakeApi() {
  const started = Date.now();
  let attempt = 0;
  let lastError = '';
  console.log(`→ Checking the API at ${apiUrl} (waking it up if it is asleep)…`);
  while (Date.now() - started < WAKE_TIMEOUT_MS) {
    attempt++;
    try {
      const res = await fetch(`${apiUrl}/health`, { signal: AbortSignal.timeout(30_000) });
      const body = await res.json().catch(() => ({}));
      if (res.ok && body.db === 'connected') {
        const site = await fetch(`${apiUrl}/api/public/site`, { signal: AbortSignal.timeout(30_000) });
        if (!site.ok) throw new Error(`/api/public/site responded ${site.status}. Did you run "npm run seed"?`);
        console.log(`✓ API is up (${Math.round((Date.now() - started) / 1000)}s, attempt ${attempt})`);
        return;
      }
      lastError = res.ok ? 'API is up but not connected to MongoDB yet' : `/health responded ${res.status}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (lastError.includes('npm run seed')) break;
    }
    await new Promise((r) => setTimeout(r, 5_000));
  }
  console.error(`\n✖ Build stopped: the API at ${apiUrl} did not respond (${lastError}).`);
  console.error('  Open the API URL + /health in a browser to wake it, check API_URL, then redeploy.\n');
  process.exit(1);
}

await wakeApi();
