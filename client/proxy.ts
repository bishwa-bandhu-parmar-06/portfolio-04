import { jwtVerify } from 'jose';
import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'pf_session';
const secret = process.env.JWT_SECRET ? new TextEncoder().encode(process.env.JWT_SECRET) : null;

/**
 * Optimistic gate for /admin: bounce visitors without a valid session cookie to
 * the login page before any admin UI is sent. The API still checks the session
 * on every request, so this is about UX, not the security boundary.
 */
async function hasSession(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return false;
  // Without the shared secret (e.g. a misconfigured preview) fall back to "cookie present".
  if (!secret) return true;
  try {
    await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return true;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === '/admin/login';
  const signedIn = await hasSession(request);

  if (!isLogin && !signedIn) {
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }
  if (isLogin && signedIn) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
