import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as loginHandler } from '../../app/api/admin/login/route';
import { POST as logoutHandler } from '../../app/api/admin/logout/route';

describe('Admin Authentication Endpoints', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/admin/login', () => {
    it('authenticates with default credentials when no custom env is set', async () => {
      delete process.env.ADMIN_EMAIL;
      delete process.env.ADMIN_PASSWORD;

      const req = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@toolcart.co.uk',
          password: 'ToolCart2026!Admin',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);

      const cookie = res.cookies.get('toolcart_admin_token');
      expect(cookie).toBeDefined();
      expect(cookie?.value).toBe('toolcart_admin_token_2026_live');
      expect(cookie?.httpOnly).toBe(true);
    });

    it('authenticates with custom env credentials when configured', async () => {
      process.env.ADMIN_EMAIL = 'custom-admin@toolcart.co.uk';
      process.env.ADMIN_PASSWORD = 'CustomPassword99!';
      process.env.ADMIN_API_TOKEN = 'custom_live_token_abc';

      const req = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'custom-admin@toolcart.co.uk',
          password: 'CustomPassword99!',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);

      const cookie = res.cookies.get('toolcart_admin_token');
      expect(cookie?.value).toBe('custom_live_token_abc');
    });

    it('authenticates directly with security token', async () => {
      process.env.ADMIN_API_TOKEN = 'secret-token-token-123';

      const req = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: 'secret-token-token-123',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(200);

      const cookie = res.cookies.get('toolcart_admin_token');
      expect(cookie?.value).toBe('secret-token-token-123');
    });

    it('rejects invalid credentials with 401', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@toolcart.co.uk',
          password: 'WrongPassword!',
        }),
      });

      const res = await loginHandler(req);
      expect(res.status).toBe(401);

      const data = await res.json();
      expect(data.error).toBe('Invalid email, password, or security token.');
    });
  });

  describe('POST /api/admin/logout', () => {
    it('clears session cookie', async () => {
      const res = await logoutHandler();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.success).toBe(true);

      const cookie = res.cookies.get('toolcart_admin_token');
      expect(cookie?.value).toBe('');
      expect(cookie?.maxAge).toBe(0);
    });
  });
});
