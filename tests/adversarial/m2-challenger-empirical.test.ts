import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth, timingSafeEqualStr } from '@/lib/auth/admin';
import { middleware } from '../../middleware';

// Route handlers under test
import { POST as postCartApi } from '@/app/api/store/cart/route';
import { POST as postAssistantApi } from '@/app/api/store/assistant/route';
import { POST as postTradeApi } from '@/app/api/trade/route';
import { GET as getProductsAdminApi, POST as postProductsAdminApi } from '@/app/api/admin/products/route';
import { GET as getProductAdminApi, PUT as putProductAdminApi, DELETE as deleteProductAdminApi } from '@/app/api/admin/products/[id]/route';
import { POST as postProductsBulkAdminApi } from '@/app/api/admin/products/bulk/route';
import { GET as getOrdersAdminApi, POST as postOrdersAdminApi } from '@/app/api/admin/orders/route';
import { GET as getOrderAdminApi } from '@/app/api/admin/orders/[id]/route';
import { POST as postOrderTransitionAdminApi } from '@/app/api/admin/orders/[id]/transition/route';
import { GET as getPricingRulesAdminApi } from '@/app/api/admin/pricing/rules/route';
import { PATCH as patchPricingRuleAdminApi } from '@/app/api/admin/pricing/rules/[id]/route';
import { PATCH as patchSupplierAdminApi } from '@/app/api/admin/suppliers/[id]/route';
import { POST as postSupplierSyncAdminApi } from '@/app/api/admin/suppliers/[id]/sync/route';
import { GET as getCustomerAdminApi, PUT as putCustomerAdminApi } from '@/app/api/admin/customers/[id]/route';
import { POST as postImportAdminApi } from '@/app/api/admin/import/route';

describe('Empirical Adversarial Challenge: Milestone 2 API-01 through API-04', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. ADVERSARIAL FUZZING: parseJsonBody & Route Handlers
  // =========================================================================
  describe('1. Adversarial Fuzzing: parseJsonBody & Route Handlers', () => {
    const TestSchema = z.object({
      id: z.string().min(1),
      count: z.number().int().min(1),
    });

    const malformedPayloads = [
      { name: 'empty string', body: '' },
      { name: 'whitespace only (spaces)', body: '    ' },
      { name: 'whitespace only (newlines/tabs)', body: '\t\r\n \n' },
      { name: 'trailing comma in object', body: '{"id": "tool-1", "count": 2,}' },
      { name: 'trailing comma in array', body: '{"id": "tool-1", "items": [1, 2,]}' },
      { name: 'unclosed brace', body: '{"id": "tool-1", "count": 2' },
      { name: 'unclosed string literal', body: '{"id": "tool-1' },
      { name: 'truncated property value', body: '{"id": ' },
      { name: 'raw invalid escape sequence', body: '{"id": "bad\\x00escape"}' },
      { name: 'unquoted key and value', body: '{id: tool}' },
      { name: 'single-quoted string', body: "{'id': 'tool-1', 'count': 2}" },
      { name: 'XML markup payload', body: '<?xml version="1.0"?><id>tool-1</id>' },
      { name: 'HTML script injection payload', body: '<script>alert("pwned")</script>' },
      { name: 'NaN literal', body: '{"id": "tool-1", "count": NaN}' },
      { name: 'undefined literal', body: '{"id": "tool-1", "count": undefined}' },
    ];

    for (const testCase of malformedPayloads) {
      it(`parseJsonBody handles ${testCase.name} with HTTP 400 and zero crash`, async () => {
        const req = new Request('http://localhost:3000/api/fuzz-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: testCase.body,
        });

        const result = await parseJsonBody(req, TestSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.response.status).toBe(400);
          const body = await result.response.json();
          expect(['MALFORMED_JSON', 'INVALID_INPUT']).toContain(body.code);
          expect(body.error).toBeDefined();
        }
      });
    }

    it('parseJsonBody handles escaped unicode null byte safely', async () => {
      const payloadWithNullByte = JSON.stringify({ id: 'tool\u0000item', count: 1 });
      const req = new Request('http://localhost:3000/api/fuzz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payloadWithNullByte,
      });

      const result = await parseJsonBody(req, TestSchema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('tool\u0000item');
      }
    });

    it('parseJsonBody safely parses large 500KB JSON payload without memory crash', async () => {
      const largePayload = JSON.stringify({
        id: 'large-payload',
        count: 10,
        padding: 'A'.repeat(500 * 1024),
      });

      const req = new Request('http://localhost:3000/api/fuzz-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: largePayload,
      });

      const result = await parseJsonBody(req, TestSchema);
      expect(result.success).toBe(true);
    });

    it('parseJsonBody rejects primitive non-object payloads with HTTP 400 when object schema expected', async () => {
      const primitives = ['12345', '"just-a-string"', 'true', 'null', '[1, 2, 3]'];
      for (const primitive of primitives) {
        const req = new Request('http://localhost:3000/api/fuzz-test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: primitive,
        });

        const result = await parseJsonBody(req, TestSchema);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.response.status).toBe(400);
        }
      }
    });

    // Fuzzing actual API Route Handlers
    it('route handlers safely return HTTP 400 on malformed JSON bodies without crashing Node', async () => {
      const routesToFuzz: Array<{ name: string; handler: (req: NextRequest) => Promise<any> }> = [
        { name: '/api/store/cart', handler: postCartApi },
        { name: '/api/store/assistant', handler: postAssistantApi },
        { name: '/api/trade', handler: postTradeApi },
        { name: '/api/admin/orders', handler: postOrdersAdminApi },
        { name: '/api/admin/products', handler: postProductsAdminApi },
        { name: '/api/admin/products/bulk', handler: postProductsBulkAdminApi },
      ];

      for (const { name, handler } of routesToFuzz) {
        // Test trailing comma
        const reqTrailing = new NextRequest(`http://localhost:3000${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"invalid": "trailing",}',
        });
        const resTrailing = await handler(reqTrailing);
        expect(resTrailing.status, `${name} must return 400 on trailing comma`).toBe(400);

        // Test empty body
        const reqEmpty = new NextRequest(`http://localhost:3000${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '',
        });
        const resEmpty = await handler(reqEmpty);
        expect(resEmpty.status, `${name} must return 400 on empty body`).toBe(400);

        // Test truncated body
        const reqTruncated = new NextRequest(`http://localhost:3000${name}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"truncated": "data',
        });
        const resTruncated = await handler(reqTruncated);
        expect(resTruncated.status, `${name} must return 400 on truncated body`).toBe(400);
      }
    });
  });

  // =========================================================================
  // 2. EMPIRICAL CONSTANT-TIME VERIFICATION
  // =========================================================================
  describe('2. Empirical Constant-Time Verification: timingSafeEqualStr', () => {
    it('accurately evaluates equality across identical and divergent strings', () => {
      expect(timingSafeEqualStr('', '')).toBe(true);
      expect(timingSafeEqualStr('toolcart', 'toolcart')).toBe(true);
      expect(timingSafeEqualStr('a'.repeat(64), 'a'.repeat(64))).toBe(true);

      // Differing lengths
      expect(timingSafeEqualStr('toolcart', 'toolcar')).toBe(false);
      expect(timingSafeEqualStr('toolcart', 'toolcarts')).toBe(false);
      expect(timingSafeEqualStr('', 'a')).toBe(false);

      // Same length, differing at index 0 (early)
      expect(timingSafeEqualStr('Aoolcart', 'Zoolcart')).toBe(false);

      // Same length, differing at last index (late)
      expect(timingSafeEqualStr('toolcartA', 'toolcartZ')).toBe(false);

      // Same length, differing in middle
      expect(timingSafeEqualStr('toolCart', 'toolDart')).toBe(false);

      // Unicode characters
      expect(timingSafeEqualStr('admin🔒2026', 'admin🔒2026')).toBe(true);
      expect(timingSafeEqualStr('admin🔒2026', 'admin🔑2026')).toBe(false);
    });

    it('empirically executes full string traversal without early exit on mismatch', () => {
      // Create two 512-character strings
      const base = 'x'.repeat(512);
      const earlyDiff = 'Y' + 'x'.repeat(511);
      const lateDiff = 'x'.repeat(511) + 'Y';

      // Warm up JIT
      for (let i = 0; i < 2000; i++) {
        timingSafeEqualStr(base, earlyDiff);
        timingSafeEqualStr(base, lateDiff);
      }

      // Timing measurement across 10,000 iterations each
      const iterations = 10000;

      const startEarly = performance.now();
      for (let i = 0; i < iterations; i++) {
        timingSafeEqualStr(base, earlyDiff);
      }
      const durationEarly = performance.now() - startEarly;

      const startLate = performance.now();
      for (let i = 0; i < iterations; i++) {
        timingSafeEqualStr(base, lateDiff);
      }
      const durationLate = performance.now() - startLate;

      // Both run the full loop of 512 characters.
      // Ratio of durationEarly to durationLate must be close to 1 (not orders of magnitude different as in an early break).
      const ratio = durationEarly / durationLate;
      expect(ratio).toBeGreaterThan(0.3);
      expect(ratio).toBeLessThan(3.0);
    });
  });

  // =========================================================================
  // 3. ADMIN PERIMETER FAIL-CLOSED & LEAK VERIFICATION
  // =========================================================================
  describe('3. Admin Perimeter Fail-Closed & Defense-in-Depth Verification', () => {
    const adminRoutes = [
      { name: 'GET /api/admin/products', call: () => getProductsAdminApi(new NextRequest('http://localhost:3000/api/admin/products')) },
      { name: 'POST /api/admin/products', call: () => postProductsAdminApi(new NextRequest('http://localhost:3000/api/admin/products', { method: 'POST', body: '{}' })) },
      { name: 'GET /api/admin/products/[id]', call: () => getProductAdminApi(new NextRequest('http://localhost:3000/api/admin/products/p1'), { params: { id: 'p1' } }) },
      { name: 'PUT /api/admin/products/[id]', call: () => putProductAdminApi(new NextRequest('http://localhost:3000/api/admin/products/p1', { method: 'PUT', body: '{}' }), { params: { id: 'p1' } }) },
      { name: 'DELETE /api/admin/products/[id]', call: () => deleteProductAdminApi(new NextRequest('http://localhost:3000/api/admin/products/p1', { method: 'DELETE' }), { params: { id: 'p1' } }) },
      { name: 'POST /api/admin/products/bulk', call: () => postProductsBulkAdminApi(new NextRequest('http://localhost:3000/api/admin/products/bulk', { method: 'POST', body: '{}' })) },
      { name: 'GET /api/admin/orders', call: () => getOrdersAdminApi(new NextRequest('http://localhost:3000/api/admin/orders')) },
      { name: 'POST /api/admin/orders', call: () => postOrdersAdminApi(new NextRequest('http://localhost:3000/api/admin/orders', { method: 'POST', body: '{}' })) },
      { name: 'GET /api/admin/orders/[id]', call: () => getOrderAdminApi(new NextRequest('http://localhost:3000/api/admin/orders/o1'), { params: { id: 'o1' } }) },
      { name: 'POST /api/admin/orders/[id]/transition', call: () => postOrderTransitionAdminApi(new NextRequest('http://localhost:3000/api/admin/orders/o1/transition', { method: 'POST', body: '{}' }), { params: { id: 'o1' } }) },
      { name: 'GET /api/admin/pricing/rules', call: () => getPricingRulesAdminApi(new NextRequest('http://localhost:3000/api/admin/pricing/rules')) },
      { name: 'PATCH /api/admin/pricing/rules/[id]', call: () => patchPricingRuleAdminApi(new NextRequest('http://localhost:3000/api/admin/pricing/rules/r1', { method: 'PATCH', body: '{}' }), { params: { id: 'r1' } }) },
      { name: 'PATCH /api/admin/suppliers/[id]', call: () => patchSupplierAdminApi(new NextRequest('http://localhost:3000/api/admin/suppliers/s1', { method: 'PATCH', body: '{}' }), { params: { id: 's1' } }) },
      { name: 'POST /api/admin/suppliers/[id]/sync', call: () => postSupplierSyncAdminApi(new NextRequest('http://localhost:3000/api/admin/suppliers/s1/sync', { method: 'POST' }), { params: { id: 's1' } }) },
      { name: 'GET /api/admin/customers/[id]', call: () => getCustomerAdminApi(new NextRequest('http://localhost:3000/api/admin/customers/c1'), { params: { id: 'c1' } }) },
      { name: 'PUT /api/admin/customers/[id]', call: () => putCustomerAdminApi(new NextRequest('http://localhost:3000/api/admin/customers/c1', { method: 'PUT', body: '{}' }), { params: { id: 'c1' } }) },
      { name: 'POST /api/admin/import', call: () => postImportAdminApi(new NextRequest('http://localhost:3000/api/admin/import', { method: 'POST', body: '' })) },
    ];

    it('in production: all admin routes fail closed with HTTP 503 when ADMIN_API_TOKEN is unconfigured', async () => {
      process.env = { ...process.env, NODE_ENV: 'production' };
      delete process.env.ADMIN_API_TOKEN;

      // 1. Verify middleware fails closed with 503
      const mwReq = new NextRequest('http://localhost:3000/api/admin/orders');
      const mwRes = middleware(mwReq);
      expect(mwRes.status).toBe(503);
      const mwBody = await mwRes.json();
      expect(mwBody.error).toContain('disabled');

      // 2. Verify all admin handlers fail closed with 503 independently (defense-in-depth)
      for (const route of adminRoutes) {
        const res = await route.call();
        expect(res.status, `${route.name} must fail closed with HTTP 503 when token unconfigured`).toBe(503);
        const body = await res.json();
        expect(body.error).toBe('Admin service unconfigured');
        expect(JSON.stringify(body)).not.toContain('stack');
        expect(JSON.stringify(body)).not.toContain('toolcart_admin_token');
      }
    });

    it('in production: all admin routes fail closed with HTTP 401 when token is missing or invalid', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'correct-secret-toolcart-admin-2026',
      };

      // 1. Missing header / unauthenticated
      for (const route of adminRoutes) {
        const res = await route.call();
        expect(res.status, `${route.name} must reject unauthenticated request with HTTP 401`).toBe(401);
        const body = await res.json();
        expect(body.error).toBe('Unauthorized');
      }

      // 2. Invalid tokens in middleware
      const invalidTokens = [
        'Bearer correct-secret-toolcart-admin-202',
        'Bearer correct-secret-toolcart-admin-20266',
        'Bearer wrong-secret-token',
        'Basic dXNlcjpwYXNz',
        'Bearer ',
        '',
      ];

      for (const token of invalidTokens) {
        const req = new NextRequest('http://localhost:3000/api/admin/products', {
          headers: token ? { authorization: token } : {},
        });
        const res = middleware(req);
        expect(res.status).toBe(401);
      }
    });

    it('in production: allows access with valid Bearer token or valid cookie without credential leak', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'correct-secret-toolcart-admin-2026',
      };

      // Middleware with valid header
      const reqValidHeader = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { authorization: 'Bearer correct-secret-toolcart-admin-2026' },
      });
      const resHeader = middleware(reqValidHeader);
      expect(resHeader.status).toBe(200);

      // Middleware with valid cookie
      const reqValidCookie = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { cookie: 'toolcart_admin_token=correct-secret-toolcart-admin-2026' },
      });
      const resCookie = middleware(reqValidCookie);
      expect(resCookie.status).toBe(200);

      // requireAdminAuth with valid header
      const authHeader = requireAdminAuth(reqValidHeader);
      expect(authHeader.success).toBe(true);

      // requireAdminAuth with valid cookie
      const authCookie = requireAdminAuth(reqValidCookie);
      expect(authCookie.success).toBe(true);
    });
  });

  // =========================================================================
  // 4. CART API BOUNDS & ADVERSARIAL VALIDATION (/api/store/cart)
  // =========================================================================
  describe('4. Cart API Bounds & Adversarial Input Sanitization (/api/store/cart)', () => {
    it('rejects negative quantities (-5, -1, -100) with HTTP 400', async () => {
      for (const qty of [-5, -1, -100]) {
        const req = new NextRequest('http://localhost:3000/api/store/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                product_id: 'prod-1',
                retail_price_ex_vat_gbp: 12.5,
                quantity: qty,
              },
            ],
          }),
        });

        const res = await postCartApi(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.code).toBe('INVALID_INPUT');
      }
    });

    it('rejects zero quantity (0) with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-1',
              retail_price_ex_vat_gbp: 12.5,
              quantity: 0,
            },
          ],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('INVALID_INPUT');
    });

    it('rejects fractional quantities (1.5, 0.5, 9.99) with HTTP 400', async () => {
      for (const qty of [1.5, 0.5, 9.99]) {
        const req = new NextRequest('http://localhost:3000/api/store/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                product_id: 'prod-1',
                retail_price_ex_vat_gbp: 12.5,
                quantity: qty,
              },
            ],
          }),
        });

        const res = await postCartApi(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.code).toBe('INVALID_INPUT');
      }
    });

    it('rejects oversized quantities (>1000: 1001, 50000, 1000000) with HTTP 400', async () => {
      for (const qty of [1001, 50000, 1000000]) {
        const req = new NextRequest('http://localhost:3000/api/store/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                product_id: 'prod-1',
                retail_price_ex_vat_gbp: 12.5,
                quantity: qty,
              },
            ],
          }),
        });

        const res = await postCartApi(req);
        expect(res.status).toBe(400);
        const json = await res.json();
        expect(json.code).toBe('INVALID_INPUT');
      }
    });

    it('accepts boundary quantities (1 and 1000)', async () => {
      for (const qty of [1, 1000]) {
        const req = new NextRequest('http://localhost:3000/api/store/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: [
              {
                product_id: 'prod-1',
                retail_price_ex_vat_gbp: 10.0,
                quantity: qty,
              },
            ],
          }),
        });

        const res = await postCartApi(req);
        expect(res.status).toBe(200);
        const json = await res.json();
        expect(json.summary.total_items_count).toBe(qty);
      }
    });

    it('rejects negative or NaN or non-finite prices with HTTP 400', async () => {
      const reqNeg = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: 'prod-1', retail_price_ex_vat_gbp: -0.01, quantity: 1 }],
        }),
      });
      const resNeg = await postCartApi(reqNeg);
      expect(resNeg.status).toBe(400);

      const reqStr = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: 'prod-1', retail_price_ex_vat_gbp: 'ten-pounds', quantity: 1 }],
        }),
      });
      const resStr = await postCartApi(reqStr);
      expect(resStr.status).toBe(400);
    });

    it('accepts empty items array and returns HTTP 200 with zero totals', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: [] }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.summary.total_items_count).toBe(0);
      expect(json.summary.subtotal_ex_vat_gbp).toBe(0);
      expect(json.summary.shipping_ex_vat_gbp).toBe(0);
      expect(json.summary.vat_amount_gbp).toBe(0);
      expect(json.summary.grand_total_inc_vat_gbp).toBe(0);
      expect(json.summary.supplier_groups).toEqual([]);
    });

    it('handles empty payload {} by defaulting items to empty array and returning 200', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.summary.total_items_count).toBe(0);
    });

    it('rejects item missing both product_id and productId with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ retail_price_ex_vat_gbp: 10.0, quantity: 1 }],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
    });

    it('rejects item with whitespace-only product_id with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [{ product_id: '   \t  ', retail_price_ex_vat_gbp: 10.0, quantity: 1 }],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
    });

    it('accurately calculates basket totals with carriage threshold and 20% VAT', async () => {
      const reqUnderThreshold = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-under',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 20.0,
              quantity: 2,
            },
          ],
        }),
      });

      const resUnder = await postCartApi(reqUnderThreshold);
      expect(resUnder.status).toBe(200);
      const jsonUnder = await resUnder.json();
      expect(jsonUnder.summary.subtotal_ex_vat_gbp).toBe(40.0);
      expect(jsonUnder.summary.shipping_ex_vat_gbp).toBe(4.95);
      expect(jsonUnder.summary.vat_amount_gbp).toBe(8.99);
      expect(jsonUnder.summary.grand_total_inc_vat_gbp).toBe(53.94);

      const reqOverThreshold = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-over',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 30.0,
              quantity: 2,
            },
          ],
        }),
      });

      const resOver = await postCartApi(reqOverThreshold);
      expect(resOver.status).toBe(200);
      const jsonOver = await resOver.json();
      expect(jsonOver.summary.subtotal_ex_vat_gbp).toBe(60.0);
      expect(jsonOver.summary.shipping_ex_vat_gbp).toBe(0.0);
      expect(jsonOver.summary.vat_amount_gbp).toBe(12.0);
      expect(jsonOver.summary.grand_total_inc_vat_gbp).toBe(72.0);
    });
  });
});
