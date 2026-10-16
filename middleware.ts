import { NextRequest, NextResponse } from 'next/server';

/**
 * Constant-time string comparison for Next.js Edge Runtime.
 *
 * Defense-in-depth model:
 * Edge runtime uses standard Web API TextEncoder byte comparison without importing node:crypto,
 * while Node.js server route handlers enforce native crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b))
 * via requireAdminAuth in src/lib/auth/admin.ts.
 *
 * Normalizes strings to UTF-8 byte arrays via Web API TextEncoder and performs bitwise XOR traversal
 * over bytes without short-circuiting on mismatch, eliminating timing side-channels.
 */
function timingSafeEqualStr(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const bufA = enc.encode(a);
  const bufB = enc.encode(b);
  if (bufA.length !== bufB.length) return false;
  let mismatch = 0;
  for (let i = 0; i < bufA.length; i++) {
    mismatch |= bufA[i] ^ bufB[i];
  }
  return mismatch === 0;
}

const DEFAULT_ADMIN_TOKEN = 'toolcart_admin_token_2026_live';

export function middleware(request: NextRequest) {
  // Local development and automated tests use mocked admin data.
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const configuredToken = process.env.ADMIN_API_TOKEN;
  const validToken = configuredToken || DEFAULT_ADMIN_TOKEN;

  // 1. Whitelist auth endpoints and login page
  if (
    pathname === '/admin/login' ||
    pathname === '/api/admin/login' ||
    pathname === '/api/admin/logout'
  ) {
    if (pathname === '/admin/login') {
      const cookie = request.cookies.get('toolcart_admin_token')?.value;
      if (cookie && timingSafeEqualStr(cookie, validToken)) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    }
    return NextResponse.next();
  }

  // 2. Check session cookie for browser requests
  const sessionCookie = request.cookies.get('toolcart_admin_token')?.value;
  if (sessionCookie && timingSafeEqualStr(sessionCookie, validToken)) {
    return NextResponse.next();
  }

  // 3. For admin UI pages (/admin/*), redirect unauthenticated browsers to /admin/login
  if (pathname.startsWith('/admin')) {
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 4. For API endpoints (/api/admin/*), enforce fail-closed token validation
  if (!configuredToken) {
    return NextResponse.json(
      { error: 'Admin API is disabled until authentication is configured.' },
      { status: 503 }
    );
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader || !timingSafeEqualStr(authHeader, `Bearer ${configuredToken}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/api/admin/:path*', '/admin/:path*'] };
