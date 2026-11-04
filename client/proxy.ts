import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = process.env.COOKIE_NAME ?? 'pf_session';
const PROXY_SECRET = process.env.PROXY_SECRET ?? '';

/**
 * /api/*: forward the visitor's IP to the Express API with a shared secret, so
 * its rate limits count real visitors rather than this server. Headers a
 * visitor sends with the same names are always discarded first.
 */
function forwardToApi(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.delete('x-client-ip');
  headers.delete('x-proxy-secret');
  // On Vercel these are set by the platform from the real connection.
  const ip = request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  if (PROXY_SECRET && ip) {
    headers.set('x-client-ip', ip);
    headers.set('x-proxy-secret', PROXY_SECRET);
  }
  return NextResponse.next({ request: { headers } });
}

/**
 * /admin: send visitors without a session cookie to the login page before any
 * admin UI is served. This only checks that the cookie exists; the API verifies
 * it on every request, and the admin shell signs out on any 401. Keeping the
 * JWT secret off the web server means it can't be used to mint tokens there.
 */
function guardAdmin(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === '/admin/login';
  const hasCookie = Boolean(request.cookies.get(COOKIE_NAME)?.value);

  if (!isLogin && !hasCookie) {
    const url = new URL('/admin/login', request.url);
    if (pathname !== '/admin') url.searchParams.set('next', pathname + search);
    return NextResponse.redirect(url);
  }

  const response = NextResponse.next();
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.headers.set('Cache-Control', 'no-store');
  return response;
}

export function proxy(request: NextRequest) {
  return request.nextUrl.pathname.startsWith('/api/') ? forwardToApi(request) : guardAdmin(request);
}

export const config = {
  // Uploads skip the proxy: they are admin-only (no per-visitor limits needed), and keeping
  // multi-megabyte bodies out of the proxy function avoids platform request-size caps.
  matcher: ['/admin', '/admin/:path*', '/api/((?!admin/uploads).*)'],
};
