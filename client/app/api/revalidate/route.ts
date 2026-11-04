import { timingSafeEqual } from 'node:crypto';
import { revalidateTag } from 'next/cache';
import { NextResponse, type NextRequest } from 'next/server';
import { CONTENT_TAG } from '@/lib/api';

function secretMatches(given: string | null): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Called by the API after every admin edit, so the public site shows the change right away. */
export async function POST(request: NextRequest) {
  if (!secretMatches(request.headers.get('x-revalidate-secret'))) {
    return NextResponse.json({ error: { message: 'Invalid secret' } }, { status: 401 });
  }
  // expire: 0 → the next visitor gets fresh content rather than one more stale view.
  revalidateTag(CONTENT_TAG, { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
