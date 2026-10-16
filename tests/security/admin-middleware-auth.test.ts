import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { middleware, config } from '../../middleware';

describe('Admin Middleware Fail-Closed Authentication Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  const setNodeEnv = (val: string) => {
    (process.env as Record<string, string | undefined>).NODE_ENV = val;
  };

  describe('Development & Test Bypass', () => {
    it('allows requests through when NODE_ENV is development', () => {
      setNodeEnv('development');
      const req = new NextRequest('http://localhost:3000/api/admin/products');
      const res = middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('allows requests through when NODE_ENV is test', () => {
      setNodeEnv('test');
      const req = new NextRequest('http://localhost:3000/api/admin/products');
      const res = middleware(req);
      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Production Fail-Closed Perimeter', () => {
    it('fails closed with 503 Service Unavailable when ADMIN_API_TOKEN is unset in production', async () => {
      setNodeEnv('production');
      delete process.env.ADMIN_API_TOKEN;

      const req = new NextRequest('http://localhost:3000/api/admin/products');
      const res = middleware(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('Admin API is disabled until authentication is configured.');
    });

    it('fails closed with 401 Unauthorized when authorization header is missing in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/api/admin/products');
      const res = middleware(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('fails closed with 401 Unauthorized when authorization token is invalid', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: {
          authorization: 'Bearer wrong-token-xyz',
        },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('fails closed with 401 Unauthorized when authorization scheme is not Bearer', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: {
          authorization: 'Basic secret-admin-token-123',
        },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('allows access (passes to next) when valid Bearer token is provided in production', () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: {
          authorization: 'Bearer secret-admin-token-123',
        },
      });
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('redirects unauthenticated browser requests for /admin to /admin/login', () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/admin');
      const res = middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('http://localhost:3000/admin/login?from=%2Fadmin');
    });

    it('allows unauthenticated access to /admin/login', () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/admin/login');
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('allows access to /admin pages when valid session cookie is present', () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'secret-admin-token-123';

      const req = new NextRequest('http://localhost:3000/admin', {
        headers: {
          cookie: 'toolcart_admin_token=secret-admin-token-123',
        },
      });
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('whitelists /api/admin/login and /api/admin/logout', () => {
      setNodeEnv('production');
      delete process.env.ADMIN_API_TOKEN;

      const reqLogin = new NextRequest('http://localhost:3000/api/admin/login');
      const resLogin = middleware(reqLogin);
      expect(resLogin.status).toBe(200);
      expect(resLogin.headers.get('x-middleware-next')).toBe('1');

      const reqLogout = new NextRequest('http://localhost:3000/api/admin/logout');
      const resLogout = middleware(reqLogout);
      expect(resLogout.status).toBe(200);
      expect(resLogout.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Route Matcher Config', () => {
    it('protects both /api/admin/* and /admin/* routes in middleware matcher config', () => {
      expect(config.matcher).toContain('/api/admin/:path*');
      expect(config.matcher).toContain('/admin/:path*');
    });
  });
});
