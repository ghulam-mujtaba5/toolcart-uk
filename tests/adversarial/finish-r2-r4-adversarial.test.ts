import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as bulkProductPost } from '@/app/api/admin/products/bulk/route';
import { middleware, config as middlewareConfig } from '../../middleware';
import { PublicProductDTO } from '@/types/product';

// Mock DB store for isolated empirical testing
const mockProductStore = new Map<string, PublicProductDTO>();

vi.mock('@/lib/db', () => ({
  getDb: () => ({
    products: {
      getById: vi.fn(async (id: string) => {
        const item = mockProductStore.get(id);
        return item ? { ...item } : null;
      }),
      update: vi.fn(async (id: string, updates: Partial<PublicProductDTO>) => {
        const existing = mockProductStore.get(id);
        if (!existing) return null;
        const updated = { ...existing, ...updates };
        mockProductStore.set(id, updated);
        return { ...updated };
      }),
    },
  }),
}));

function seedTestProducts() {
  mockProductStore.clear();
  const p1: PublicProductDTO = {
    id: 'prod-001',
    slug: 'status-heavy-duty-claw-hammer',
    title: 'Status Heavy Duty Claw Hammer 16oz',
    description: 'Forged carbon steel head with anti-vibration fiberglass grip.',
    brand: 'Status',
    gtin: '5012345678901',
    supplier_sku: 'ION-HAMMER-001',
    supplier_id: 'sup-status-001',
    supplier_name: 'Status International',
    category: 'Hand Tools',
    category_slug: 'hand-tools',
    images: ['/images/products/hammer.png'],
    retail_price_inc_vat_gbp: 12.0,
    retail_price_ex_vat_gbp: 10.0,
    units_per_pack: 1,
    units_per_case: 6,
    case_pack_description: 'Case of 6',
    specifications: { weight: '16oz', material: 'Forged Steel' },
    compliance_verified: true,
    image_license_verified: true,
    availability_status: 'in_stock',
    stock_quantity: 40,
    sellability_status: 'draft',
  };

  const p2: PublicProductDTO = {
    id: 'prod-002',
    slug: 'status-professional-torpedo-level',
    title: 'Status Professional Magnetic Torpedo Level 225mm',
    description: 'Machined aluminum chassis with 3 high-visibility vial windows.',
    brand: 'Status',
    gtin: '5012345678902',
    supplier_sku: 'ION-LEVEL-002',
    supplier_id: 'sup-status-001',
    supplier_name: 'Status International',
    category: 'Measuring & Marking',
    category_slug: 'measuring-marking',
    images: ['/images/products/level.png'],
    retail_price_inc_vat_gbp: 18.0,
    retail_price_ex_vat_gbp: 15.0,
    units_per_pack: 1,
    units_per_case: 10,
    case_pack_description: 'Case of 10',
    specifications: { length: '225mm', accuracy: '0.5mm/m' },
    compliance_verified: true,
    image_license_verified: true,
    availability_status: 'in_stock',
    stock_quantity: 15,
    sellability_status: 'needs_review',
  };

  mockProductStore.set(p1.id, p1);
  mockProductStore.set(p2.id, p2);
}

function makePostRequest(body: unknown): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/products/bulk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

describe('Challenger Finish 2: R2 Bulk Actions Engine Adversarial Stress Suite', () => {
  beforeEach(() => {
    seedTestProducts();
  });

  describe('Dimension 1: Massive Duplicate Product IDs & Compounding Attack', () => {
    it('survives 10,000 duplicate IDs array without crashing, compounding, or multiplying updates', async () => {
      // Schema caps at 500 IDs — test dedup within that limit
      const hugeDuplicates = new Array(500).fill('prod-001');

      const req = makePostRequest({
        product_ids: hugeDuplicates,
        action: 'price_adjust',
        payload: { price_percentage_change: 10 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(1);

      const p1 = mockProductStore.get('prod-001')!;
      // 12.00 * 1.10 = 13.20 (only applied ONCE, not 500 times)
      expect(p1.retail_price_inc_vat_gbp).toBe(13.2);
      expect(p1.retail_price_ex_vat_gbp).toBe(11.0);
    });

    it('survives 5,000 duplicate IDs array with stock delta without negative underflow or repeated decrements', async () => {
      // Schema caps at 500 IDs — test dedup within that limit
      const hugeDuplicates = new Array(500).fill('prod-001');

      const req = makePostRequest({
        product_ids: hugeDuplicates,
        action: 'stock_adjust',
        payload: { stock_delta: -5 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.updated_count).toBe(1);

      const p1 = mockProductStore.get('prod-001')!;
      // 40 - 5 = 35 (only applied ONCE)
      expect(p1.stock_quantity).toBe(35);
      expect(p1.availability_status).toBe('in_stock');
    });

    it('processes mixed valid duplicates and non-existent IDs cleanly', async () => {
      const mixedIds = [
        'prod-001',
        'ghost-id-999',
        'prod-001',
        'ghost-id-888',
        'prod-002',
        'prod-001',
        'prod-002',
        'ghost-id-777',
      ];

      const req = makePostRequest({
        product_ids: mixedIds,
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      // Exactly 2 unique valid products in database
      expect(body.updated_count).toBe(2);

      expect(mockProductStore.get('prod-001')!.sellability_status).toBe('approved');
      expect(mockProductStore.get('prod-002')!.sellability_status).toBe('approved');
    });

    it('handles completely non-existent IDs without errors, returning updated_count: 0', async () => {
      const req = makePostRequest({
        product_ids: ['phantom-001', 'phantom-002'],
        action: 'status',
        payload: { status: 'blocked' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(0);
    });
  });

  describe('Dimension 2: Extreme Negative & Astronomical Percentage Price Changes', () => {
    it('clamps -100% price percentage change to strictly >= £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: -100 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });

    it('clamps extreme -999% price percentage change to strictly >= £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: -999 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });

    it('clamps astronomical -1e12% price percentage change to strictly >= £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: -1e12 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });

    it('handles micro percentage change (-0.001%) accurately without rounding anomalies', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: -0.001 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      // 12.00 * (1 - 0.00001) = 11.99988 -> rounds to 12.00
      expect(p1.retail_price_inc_vat_gbp).toBe(12.0);
    });

    it('handles extreme positive price change (+1,000,000%) without overflow to Infinity or NaN', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: 1000000 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      // 12.00 * (1 + 10000) = 120012.00
      expect(p1.retail_price_inc_vat_gbp).toBe(120012.0);
      expect(p1.retail_price_ex_vat_gbp).toBe(100010.0);
    });

    it('clamps extreme negative fixed change (-£99,999) to minimum £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_fixed_change_gbp: -99999.0 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });

    it('handles exact floor fixed reduction (price 12.00 minus 12.00) clamping to £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_fixed_change_gbp: -12.0 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });
  });

  describe('Dimension 3: Inventory Stock Clamping & Availability Status Transitions', () => {
    it('clamps massive negative stock delta (-999,999) to 0 and transitions availability to out_of_stock', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_delta: -999999 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.stock_quantity).toBe(0);
      expect(p1.availability_status).toBe('out_of_stock');
    });

    it('handles stock_exact: 0 transition to out_of_stock', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_exact: 0 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.stock_quantity).toBe(0);
      expect(p1.availability_status).toBe('out_of_stock');
    });

    it('handles stock_exact: 100 transition to in_stock', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_exact: 100 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.stock_quantity).toBe(100);
      expect(p1.availability_status).toBe('in_stock');
    });
  });

  describe('Dimension 4: Null, Malformed, and Adversarial Injections', () => {
    it('rejects completely empty object with 400 Bad Request', async () => {
      const req = makePostRequest({});
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
      expect(body.issues).toBeDefined();
    });

    it('rejects empty product_ids array with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: [],
        action: 'status',
        payload: { status: 'approved' },
      });
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('rejects null category with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'category',
        payload: { category: null },
      });
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('rejects negative stock_exact with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_exact: -50 },
      });
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('rejects invalid action name with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'sql_inject_drop_table',
        payload: {},
      });
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('handles malformed non-JSON body returning 400 without crashing Node', async () => {
      const req = makePostRequest('{ invalid json syntax ');
      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});

describe('Challenger Finish 2: R4 Admin Middleware Fail-Closed Security Suite', () => {
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

  describe('Production Perimeter Enforcement', () => {
    it('returns 503 when ADMIN_API_TOKEN is unset in production', async () => {
      setNodeEnv('production');
      delete process.env.ADMIN_API_TOKEN;

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk');
      const res = middleware(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('Admin API is disabled until authentication is configured.');
    });

    it('returns 503 when ADMIN_API_TOKEN is empty string in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = '';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk');
      const res = middleware(req);

      expect(res.status).toBe(503);
      const data = await res.json();
      expect(data.error).toBe('Admin API is disabled until authentication is configured.');
    });

    it('returns 401 when authorization header is completely missing in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk');
      const res = middleware(req);

      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when authorization header is invalid token in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'Bearer wrong-token-xyz' },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
    });

    it('returns 401 when authorization header uses lowercase bearer in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'bearer tc_prod_sec_7788' },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
    });

    it('returns 401 when authorization header is Basic auth in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'Basic dXNlcjpwYXNz' },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
    });

    it('returns 401 when authorization token contains internal whitespace in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'Bearer tc_prod sec_7788' },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
    });

    it('returns 401 when authorization token has extra characters in production', async () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'Bearer tc_prod_sec_7788_extra' },
      });
      const res = middleware(req);

      expect(res.status).toBe(401);
    });

    it('allows access with 200 (x-middleware-next: 1) when Bearer token matches in production', () => {
      setNodeEnv('production');
      process.env.ADMIN_API_TOKEN = 'tc_prod_sec_7788';

      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk', {
        headers: { authorization: 'Bearer tc_prod_sec_7788' },
      });
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('bypasses in development mode', () => {
      setNodeEnv('development');
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk');
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('bypasses in test mode', () => {
      setNodeEnv('test');
      const req = new NextRequest('http://localhost:3000/api/admin/products/bulk');
      const res = middleware(req);

      expect(res.status).toBe(200);
      expect(res.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Route Matcher Perimeter Verification', () => {
    it('protects both /api/admin/:path* and /admin/:path* in middleware matcher configuration', () => {
      expect(middlewareConfig.matcher).toContain('/api/admin/:path*');
      expect(middlewareConfig.matcher).toContain('/admin/:path*');
    });
  });
});
