import { NextRequest, NextResponse } from 'next/server';
import crypto from 'node:crypto';

function timingSafeEqualStr(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

export const DEFAULT_ADMIN_EMAIL = 'admin@toolcart.co.uk';
export const DEFAULT_ADMIN_PASSWORD = 'ToolCart2026!Admin';
export const DEFAULT_ADMIN_TOKEN = 'toolcart_admin_token_2026_live';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password, token } = body;

    const expectedEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
    const expectedPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;
    const expectedToken = process.env.ADMIN_API_TOKEN || DEFAULT_ADMIN_TOKEN;

    let isAuthenticated = false;

    // Check token directly if provided
    if (typeof token === 'string' && token.length > 0) {
      if (timingSafeEqualStr(token, expectedToken)) {
        isAuthenticated = true;
      }
    }

    // Check email & password credentials
    if (typeof email === 'string' && typeof password === 'string') {
      const emailMatch = email.trim().toLowerCase() === expectedEmail.toLowerCase();
      const passwordMatch = timingSafeEqualStr(password, expectedPassword);
      if (emailMatch && passwordMatch) {
        isAuthenticated = true;
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json(
        { error: 'Invalid email, password, or security token.' },
        { status: 401 }
      );
    }

    // Set secure httpOnly cookie with the active token
    const response = NextResponse.json({
      success: true,
      message: 'Admin session authenticated successfully.',
    });

    response.cookies.set({
      name: 'toolcart_admin_token',
      value: expectedToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days session
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: 'Authentication failed due to an unexpected error.' },
      { status: 500 }
    );
  }
}
