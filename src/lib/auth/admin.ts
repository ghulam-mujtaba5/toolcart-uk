import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

export function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

/**
 * Defense-in-depth authentication helper for admin route handlers.
 * Ensures admin requests are validated even if middleware execution is bypassed.
 */
export function requireAdminAuth(
  request: Request
): { success: true } | { success: false; response: NextResponse } {
  // Allow development and test environments to run unauthenticated
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    return { success: true };
  }

  const token = process.env.ADMIN_API_TOKEN;
  if (!token) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Admin service unconfigured' },
        { status: 503 }
      ),
    };
  }

  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ') || !timingSafeEqualStr(authHeader, `Bearer ${token}`)) {
    return {
      success: false,
      response: NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      ),
    };
  }

  return { success: true };
}
