import { env, isTest } from '../config/env';
import { SiteSettings } from '../models';

let timer: NodeJS.Timeout | null = null;

/**
 * Called after every admin edit to public content. Records the update time and,
 * debounced so a burst of edits (e.g. drag-to-reorder) triggers one rebuild,
 * asks the Next.js app to refresh its cached pages.
 */
export function contentChanged(): void {
  SiteSettings.updateOne({}, { $set: { contentUpdatedAt: new Date() } }, { upsert: true }).catch((err) =>
    console.warn('[revalidate] Could not record update time:', err.message),
  );

  if (isTest || !env.REVALIDATE_SECRET) return;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    timer = null;
    void pingClient();
  }, 1500);
}

async function pingClient(): Promise<void> {
  try {
    const res = await fetch(new URL('/api/revalidate', env.CLIENT_URL), {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-revalidate-secret': env.REVALIDATE_SECRET },
      body: JSON.stringify({ tag: 'portfolio' }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!res.ok) console.warn(`[revalidate] Client responded ${res.status}`);
  } catch (err) {
    console.warn('[revalidate] Could not reach the client:', (err as Error).message);
  }
}
