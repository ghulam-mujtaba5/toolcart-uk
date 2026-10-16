import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export function middleware(request: NextRequest) {
  // Local development and automated tests use mocked admin data. Every deployed
  // environment fails closed until a real admin session layer is configured.
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return NextResponse.next();
  }

  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'Admin API is disabled until authentication is configured.' }, { status: 503 });
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader || !timingSafeEqualStr(authHeader, `Bearer ${token}`)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.next();
}

export const config = { matcher: ['/api/admin/:path*', '/admin/:path*'] };
