import { NextRequest, NextResponse } from 'next/server';
import {
  timingSafeEqualStr,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_PASSWORD,
  DEFAULT_ADMIN_TOKEN,
} from '@/lib/auth/admin';

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
  } catch {
    return NextResponse.json(
      { error: 'Authentication failed due to an unexpected error.' },
      { status: 500 }
    );
  }
}
