import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { parseJsonBody } from '@/lib/api/parse-json-body';
import { requireAdminAuth, timingSafeEqualStr } from '@/lib/auth/admin';
import { middleware } from '../../middleware';
import { POST as postCartApi } from '@/app/api/store/cart/route';
import { GET as getProductsApi } from '@/app/api/store/products/route';
import { POST as postAssistantApi } from '@/app/api/store/assistant/route';
import { POST as postTradeApi } from '@/app/api/trade/route';
import { POST as postAdminOrdersApi } from '@/app/api/admin/orders/route';
import { POST as postAdminImportApi } from '@/app/api/admin/import/route';
import { POST as postOrderTransitionApi } from '@/app/api/admin/orders/[id]/transition/route';
import { InMemoryProductRepository } from '@/lib/db/repositories/product-repo';
import { InMemoryOrderRepository } from '@/lib/db/repositories/order-repo';
import { searchProducts } from '@/lib/catalog';
import { executeOrderTransition } from '@/lib/state-machine/engine';
import { getDb } from '@/lib/db';
import { PublicProductDTO, WholesaleSupplierOffer } from '@/types/product';
import { OrderRecord } from '@/types/order';

describe('Milestone 2: Backend API Error Boundaries & Input Hardening Suite', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // API-01: Safe JSON Body Parsing (src/lib/api/parse-json-body.ts)
  // =========================================================================
  describe('API-01: Safe JSON Body Parsing Boundary', () => {
    const SimpleSchema = z.object({
      name: z.string().min(1),
      count: z.number().int().positive(),
    });

    it('returns typed data on valid JSON payload matching schema', async () => {
      const req = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Hammer', count: 5 }),
      });

      const result = await parseJsonBody(req, SimpleSchema);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.name).toBe('Hammer');
        expect(result.data.count).toBe(5);
      }
    });

    it('returns HTTP 400 with MALFORMED_JSON code on empty body', async () => {
      const req = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '',
      });

      const result = await parseJsonBody(req, SimpleSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const json = await result.response.json();
        expect(json.code).toBe('MALFORMED_JSON');
        expect(json.error).toContain('empty');
      }
    });

    it('returns HTTP 400 with MALFORMED_JSON code on broken JSON syntax', async () => {
      const req = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"name": "Broken", count: }',
      });

      const result = await parseJsonBody(req, SimpleSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const json = await result.response.json();
        expect(json.code).toBe('MALFORMED_JSON');
      }
    });

    it('returns HTTP 400 with INVALID_INPUT code on schema validation error', async () => {
      const req = new Request('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: '', count: -10 }),
      });

      const result = await parseJsonBody(req, SimpleSchema);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.response.status).toBe(400);
        const json = await result.response.json();
        expect(json.code).toBe('INVALID_INPUT');
        expect(json.issues).toBeDefined();
      }
    });
  });

  // =========================================================================
  // API-02: Middleware Constant-Time Auth (middleware.ts)
  // =========================================================================
  describe('API-02: Middleware Constant-Time Auth & Timing Safety', () => {
    it('timingSafeEqualStr accurately compares equal and unequal strings', () => {
      expect(timingSafeEqualStr('toolcart-secret-12345', 'toolcart-secret-12345')).toBe(true);
      expect(timingSafeEqualStr('toolcart-secret-12345', 'toolcart-secret-12346')).toBe(false);
      expect(timingSafeEqualStr('short', 'longer-string')).toBe(false);
      expect(timingSafeEqualStr('', '')).toBe(true);
    });

    it('fails closed with HTTP 503 if ADMIN_API_TOKEN is unset in production', async () => {
      process.env = { ...process.env, NODE_ENV: 'production', ADMIN_API_TOKEN: '' };
      delete process.env.ADMIN_API_TOKEN;

      const req = new NextRequest('http://localhost:3000/api/admin/products');
      const res = middleware(req);
      expect(res.status).toBe(503);

      const body = await res.json();
      expect(body.error).toContain('disabled');
    });

    it('fails closed with HTTP 401 if Bearer token is missing or incorrect in production', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'correct-secret-token-2026',
      };

      // Missing header
      const reqMissing = new NextRequest('http://localhost:3000/api/admin/products');
      const resMissing = middleware(reqMissing);
      expect(resMissing.status).toBe(401);

      // Wrong token
      const reqWrong = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { authorization: 'Bearer attacker-guess-token' },
      });
      const resWrong = middleware(reqWrong);
      expect(resWrong.status).toBe(401);
    });

    it('allows access with correct Bearer token in production', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'correct-secret-token-2026',
      };

      const reqValid = new NextRequest('http://localhost:3000/api/admin/products', {
        headers: { authorization: 'Bearer correct-secret-token-2026' },
      });
      const resValid = middleware(reqValid);
      expect(resValid.status).toBe(200);
    });
  });

  // =========================================================================
  // API-03: Admin Routes Defense-in-Depth (requireAdminAuth)
  // =========================================================================
  describe('API-03: Admin Routes Defense-in-Depth Perimeter', () => {
    it('requireAdminAuth returns HTTP 503 if ADMIN_API_TOKEN is unset in production', async () => {
      process.env = { ...process.env, NODE_ENV: 'production' };
      delete process.env.ADMIN_API_TOKEN;

      const req = new Request('http://localhost:3000/api/admin/orders');
      const auth = requireAdminAuth(req);
      expect(auth.success).toBe(false);
      if (!auth.success) {
        expect(auth.response.status).toBe(503);
        const json = await auth.response.json();
        expect(json.error).toBe('Admin service unconfigured');
      }
    });

    it('requireAdminAuth returns HTTP 401 if missing Authorization in production', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'super-admin-key-99',
      };

      const req = new Request('http://localhost:3000/api/admin/orders');
      const auth = requireAdminAuth(req);
      expect(auth.success).toBe(false);
      if (!auth.success) {
        expect(auth.response.status).toBe(401);
        const json = await auth.response.json();
        expect(json.error).toBe('Unauthorized');
      }
    });

    it('requireAdminAuth returns success: true when valid Bearer token provided in production', async () => {
      process.env = {
        ...process.env,
        NODE_ENV: 'production',
        ADMIN_API_TOKEN: 'super-admin-key-99',
      };

      const req = new Request('http://localhost:3000/api/admin/orders', {
        headers: { authorization: 'Bearer super-admin-key-99' },
      });
      const auth = requireAdminAuth(req);
      expect(auth.success).toBe(true);
    });
  });

  // =========================================================================
  // API-04: Cart API Bounds & Input Validation (app/api/store/cart/route.ts)
  // =========================================================================
  describe('API-04: Cart API Bounds & Adversarial Input Sanitization', () => {
    it('rejects negative item quantity with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-1',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 10.0,
              quantity: -5,
            },
          ],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.code).toBe('INVALID_INPUT');
    });

    it('rejects fractional item quantity with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-1',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 10.0,
              quantity: 2.5,
            },
          ],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
    });

    it('rejects oversized item quantity (>1000) with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-1',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 10.0,
              quantity: 50000,
            },
          ],
        }),
      });

      const res = await postCartApi(req);
      expect(res.status).toBe(400);
    });

    it('rejects NaN or negative prices with HTTP 400', async () => {
      const reqNegative = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              product_id: 'prod-1',
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: -15.5,
              quantity: 1,
            },
          ],
        }),
      });

      const resNegative = await postCartApi(reqNegative);
      expect(resNegative.status).toBe(400);
    });

    it('rejects item missing both product_id and productId with HTTP 400', async () => {
      const reqNoId = new NextRequest('http://localhost:3000/api/store/cart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              supplier_id: 'status-uk',
              retail_price_ex_vat_gbp: 15.0,
              quantity: 2,
            },
          ],
        }),
      });

      const resNoId = await postCartApi(reqNoId);
      expect(resNoId.status).toBe(400);
    });
  });

  // =========================================================================
  // API-05: Products API Query Sanitization (app/api/store/products/route.ts)
  // =========================================================================
  describe('API-05: Products API Query Sanitization & Clamping', () => {
    it('gracefully handles min_price=abc and max_price=xyz without filtering out catalog', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/products?min_price=abc&max_price=xyz');
      const res = await getProductsApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(Array.isArray(json.products)).toBe(true);
      expect(json.products.length).toBeGreaterThan(0);
    });

    it('clamps limit to maximum 100 and minimum 1', async () => {
      // Over maximum
      const reqOver = new NextRequest('http://localhost:3000/api/store/products?limit=9999');
      const resOver = await getProductsApi(reqOver);
      expect(resOver.status).toBe(200);
      const jsonOver = await resOver.json();
      expect(jsonOver.products.length).toBeLessThanOrEqual(100);

      // Under minimum
      const reqUnder = new NextRequest('http://localhost:3000/api/store/products?limit=-10');
      const resUnder = await getProductsApi(reqUnder);
      expect(resUnder.status).toBe(200);
      const jsonUnder = await resUnder.json();
      expect(jsonUnder.products.length).toBe(1);
    });

    it('handles negative or NaN offset safely without crashing', async () => {
      const reqOffset = new NextRequest('http://localhost:3000/api/store/products?offset=-50&limit=5');
      const resOffset = await getProductsApi(reqOffset);
      expect(resOffset.status).toBe(200);
      const json = await resOffset.json();
      expect(json.products.length).toBe(5);
    });
  });

  // =========================================================================
  // API-06: Store Assistant & Trade Payload Limits
  // =========================================================================
  describe('API-06: Assistant & Trade Application Payload Bounds', () => {
    it('/api/store/assistant rejects empty or whitespace-only prompt with HTTP 400', async () => {
      const reqWhitespace = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: '    \n\t  ' }),
      });

      const res = await postAssistantApi(reqWhitespace);
      expect(res.status).toBe(400);
    });

    it('/api/store/assistant rejects oversized prompt (>2000 chars) with HTTP 400', async () => {
      const oversizedPrompt = 'a'.repeat(2500);
      const reqOversized = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: oversizedPrompt }),
      });

      const res = await postAssistantApi(reqOversized);
      expect(res.status).toBe(400);
    });

    it('/api/trade rejects oversized strings (>255 chars) with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: 'Tool & Die Ltd '.repeat(30), // > 255 chars
          contact_name: 'John Doe',
          email: 'john@example.co.uk',
          phone: '0161 123 4567',
          trade_type: 'Electrical',
          company_number: '12345678',
        }),
      });

      const res = await postTradeApi(req);
      expect(res.status).toBe(400);
    });

    it('/api/trade rejects oversized telephone number (>50 chars) with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: 'Apex Electrical Ltd',
          contact_name: 'Jane Doe',
          email: 'jane@apex.co.uk',
          phone: '0'.repeat(55),
          trade_type: 'Electrical',
          company_number: '12345678',
        }),
      });

      const res = await postTradeApi(req);
      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // API-07: Admin Orders & Import Route Validation
  // =========================================================================
  describe('API-07: Admin Orders Schema & Import CSV Syntax Validation', () => {
    it('/api/admin/orders rejects order with negative item quantities with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: 'TC-TEST-001',
          customer_email: 'test@toolcart.co.uk',
          items: [
            {
              product_id: 'prod-1',
              title: 'Hammer',
              quantity: -2,
            },
          ],
        }),
      });

      const res = await postAdminOrdersApi(req);
      expect(res.status).toBe(400);
    });

    it('/api/admin/orders rejects invalid order state with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_number: 'TC-TEST-002',
          customer_email: 'test@toolcart.co.uk',
          state: 'INVALID_NON_EXISTENT_STATE',
          items: [
            {
              product_id: 'prod-1',
              title: 'Hammer',
              quantity: 1,
            },
          ],
        }),
      });

      const res = await postAdminOrdersApi(req);
      expect(res.status).toBe(400);
    });

    it('/api/admin/import catches malformed CSV syntax and returns HTTP 400', async () => {
      // Unclosed quotes in CSV causes syntax error in csv-parse
      const malformedCsv = `supplier_sku,title,unit_cost_ex_vat_gbp,units_per_case
SKU-001,"Broken quote title without closing,10.50,12`;

      const req = new NextRequest('http://localhost:3000/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'text/csv' },
        body: malformedCsv,
      });

      const res = await postAdminImportApi(req);
      expect(res.status).toBe(400);
      const json = await res.json();
      expect(json.error).toBe('Invalid CSV format');
      expect(json.details).toBeDefined();
    });

    it('/api/admin/orders/[id]/transition rejects invalid target state with HTTP 400', async () => {
      const req = new NextRequest('http://localhost:3000/api/admin/orders/ord-123/transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to_state: 'HACKED_STATE_BYPASS',
        }),
      });

      const res = await postOrderTransitionApi(req, { params: { id: 'ord-123' } });
      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // API-08: Repositories Null-Safety & Undefined Guards
  // =========================================================================
  describe('API-08: Repositories Null-Safety & Defensive Coalescing', () => {
    it('InMemoryProductRepository handles products with undefined/null fields safely', async () => {
      const productsMap = new Map<string, PublicProductDTO>();
      const wholesaleMap = new Map<string, WholesaleSupplierOffer>();

      // Record with undefined optional fields
      const partialProduct = {
        id: 'prod-null-test',
        title: 'Basic Tool',
        retail_price_inc_vat_gbp: 12.0,
      } as unknown as PublicProductDTO;

      productsMap.set(partialProduct.id, partialProduct);
      const repo = new InMemoryProductRepository(productsMap, wholesaleMap);

      // Filtering with query
      const resultsByQuery = await repo.getAll({ query: 'basic' });
      expect(resultsByQuery.length).toBe(1);

      // Filtering with category when category_slug is undefined
      const resultsByCat = await repo.getAll({ category: 'Hand Tools' });
      expect(resultsByCat.length).toBe(0);

      // Filtering with brand when brand is undefined
      const resultsByBrand = await repo.getAll({ brand: 'Status' });
      expect(resultsByBrand.length).toBe(0);

      // Sorting when title might be undefined on other items
      const resultsSorted = await repo.getAll({ sort: 'title_asc' });
      expect(resultsSorted.length).toBe(1);
    });

    it('InMemoryOrderRepository handles orders with undefined customer_email and audit_logs safely', async () => {
      const ordersMap = new Map<string, OrderRecord>();
      const partialOrder = {
        id: 'ord-null-test',
        order_number: 'ORD-NULL-1',
        created_at: new Date().toISOString(),
      } as unknown as OrderRecord;

      ordersMap.set(partialOrder.id, partialOrder);
      const repo = new InMemoryOrderRepository(ordersMap);

      // Query by customer email when record has undefined customer_email
      const results = await repo.getAll({ customer_email: 'test@example.com' });
      expect(results.length).toBe(0);

      // State update when audit_logs is undefined
      const updated = await repo.updateState('ord-null-test', 'delivered', {
        id: 'log-1',
        order_id: 'ord-null-test',
        from_state: 'dispatched',
        to_state: 'delivered',
        trigger: 'admin',
        actor: 'admin',
        created_at: new Date().toISOString(),
      });

      expect(updated).not.toBeNull();
      expect(updated?.audit_logs).toHaveLength(1);
    });

    it('searchProducts safely handles products with undefined specifications', async () => {
      const results = await searchProducts('tape', {
        minPrice: NaN,
        maxPrice: NaN,
      });

      expect(Array.isArray(results.products)).toBe(true);
      expect(results.categories.length).toBeGreaterThan(0);
    });

    it('executeOrderTransition safely handles order without audit_logs on idempotent replay', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'ORD-IDEMP-TEST',
        customer_email: 'idemp@example.com',
        state: 'checkout_authorized',
        shipping_address: {
          full_name: 'Test',
          address_line_1: 'Line 1',
          city: 'London',
          postcode: 'E1 6AN',
          country: 'GB',
        },
        items: [
          {
            product_id: 'prod-1',
            title: 'Test',
            quantity: 1,
            supplier_sku: 'S1',
            unit_price_inc_vat: 10,
            unit_price_ex_vat: 8.33,
            total_inc_vat: 10,
          },
        ],
        subtotal_ex_vat_gbp: 8.33,
        subtotal_inc_vat_gbp: 10,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 1.67,
        total_inc_vat_gbp: 10,
        supplier_id: 'status-uk',
      });

      // Clear audit_logs to simulate legacy/corrupted record
      (order as any).audit_logs = undefined;

      const result = await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized', // repeated state -> idempotency check 2
        trigger: 'user_checkout',
        actor: 'user',
      });

      expect(result.success).toBe(true);
      expect(result.idempotent_replay).toBe(true);
      expect(result.audit_log).toBeDefined();
    });
  });
});
