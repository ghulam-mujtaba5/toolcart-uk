import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as bulkProductPost } from '@/app/api/admin/products/bulk/route';
import { BulkProductActionSchema } from '@/lib/schemas/product';
import { getDb } from '@/lib/db';
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

describe('Adversarial Stress Suite: Bulk Operations & Bulk Update API Route', () => {
  beforeEach(() => {
    seedTestProducts();
  });

  // =========================================================================
  // 1. Empty & Malformed Product ID Arrays
  // =========================================================================
  describe('1. Empty & Malformed Product ID Arrays', () => {
    it('rejects empty product_ids array with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: [],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
      expect(body.issues.product_ids).toBeDefined();
    });

    it('rejects missing product_ids field with 400 Bad Request', async () => {
      const req = makePostRequest({
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });

    it('rejects null product_ids with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: null,
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('rejects non-array product_ids (string or number) with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: 'prod-001',
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('rejects numeric elements in product_ids array with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: [123, 456],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('gracefully handles empty string ID without crashing or modifying products', async () => {
      const req = makePostRequest({
        product_ids: [''],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(0);

      // Verify no store pollution
      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('draft');
    });
  });

  // =========================================================================
  // 2. Non-Existent Product IDs and SQL / String Injections
  // =========================================================================
  describe('2. Non-Existent Product IDs and SQL / String Injections', () => {
    it('gracefully skips non-existent IDs and returns updated_count = 0', async () => {
      const req = makePostRequest({
        product_ids: ['prod-nonexistent-99999', 'prod-ghost-88888'],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(0);
    });

    it('neutralizes raw SQL injection attempts in product_ids', async () => {
      const injectionIds = [
        "'; DROP TABLE products; --",
        "' OR 1=1 --",
        "UNION SELECT * FROM information_schema.tables --",
        "admin'--",
      ];

      const req = makePostRequest({
        product_ids: injectionIds,
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(0);

      // Existing products must remain completely intact
      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('draft');
      expect(mockProductStore.get('prod-002')?.sellability_status).toBe('needs_review');
    });

    it('processes valid IDs while safely ignoring SQL injection IDs in the same batch', async () => {
      const req = makePostRequest({
        product_ids: ["'; DROP TABLE products; --", 'prod-001', 'nonexistent-xyz'],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.updated_count).toBe(1);

      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('approved');
      expect(mockProductStore.get('prod-002')?.sellability_status).toBe('needs_review');
    });
  });

  // =========================================================================
  // 3. Price Adjustments (Boundaries, Negatives, Extremes, NaN)
  // =========================================================================
  describe('3. Price Adjustments (Boundaries, Negatives, Extremes, NaN)', () => {
    it('handles extreme positive price increase (+10,000%) without overflow or NaN', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: 10000 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      // Initial price: 12.00; +10,000% => 12 * (1 + 100) = 1212.00
      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(1212.0);
      expect(p1.retail_price_ex_vat_gbp).toBe(1010.0);
    });

    it('clamps negative fixed price change to minimum of £0.01 via Math.max', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_fixed_change_gbp: -99999.0 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01); // 0.01 / 1.2 = 0.01
    });

    it('HARDENED: -100% price percentage change clamps retail price to £0.01', async () => {
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

    it('HARDENED: -150% price percentage change clamps retail price to £0.01', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: -150 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(0.01);
      expect(p1.retail_price_ex_vat_gbp).toBe(0.01);
    });

    it('rejects string price values with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: '10%' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });

    it('handles empty payload for price_adjust without throwing an error', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'price_adjust',
        payload: {},
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.retail_price_inc_vat_gbp).toBe(12.0);
    });
  });

  // =========================================================================
  // 4. Inventory Stock Adjustments (Extremes, Deltas, Negative Clamping)
  // =========================================================================
  describe('4. Inventory Stock Adjustments (Extremes, Deltas, Negative Clamping)', () => {
    it('rejects negative stock_exact with 400 Bad Request (enforced by Zod .nonnegative)', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_exact: -20 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });

    it('rejects floating-point stock_delta with 400 Bad Request (enforced by Zod .int)', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_delta: 5.75 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);
    });

    it('clamps excessive negative stock_delta to 0 and flips status to out_of_stock', async () => {
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

    it('sets exact stock to 0 and updates availability_status to out_of_stock', async () => {
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

    it('handles large stock values (1,000,000) and marks in_stock', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'stock_adjust',
        payload: { stock_exact: 1000000 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.stock_quantity).toBe(1000000);
      expect(p1.availability_status).toBe('in_stock');
    });
  });

  // =========================================================================
  // 5. Batch Status Transitions
  // =========================================================================
  describe('5. Batch Status Transitions', () => {
    it('rejects invalid status enum strings with 400 Bad Request', async () => {
      const invalidStatuses = ['archived', 'deleted', 'active', 'published', 'UNKNOWN', '123'];

      for (const st of invalidStatuses) {
        const req = makePostRequest({
          product_ids: ['prod-001'],
          action: 'status',
          payload: { status: st },
        });

        const res = await bulkProductPost(req);
        expect(res.status).toBe(400);

        const body = await res.json();
        expect(body.error).toBe('Validation failed');
      }
    });

    it('transitions multiple products to blocked status', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001', 'prod-002'],
        action: 'status',
        payload: { status: 'blocked' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('blocked');
      expect(mockProductStore.get('prod-002')?.sellability_status).toBe('blocked');
    });

    it('transitions multiple products to approved status', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001', 'prod-002'],
        action: 'status',
        payload: { status: 'approved' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('approved');
      expect(mockProductStore.get('prod-002')?.sellability_status).toBe('approved');
    });

    it('returns 200 with updated_count = 0 when payload is empty for status action', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'status',
        payload: {},
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.updated_count).toBe(0);
      expect(mockProductStore.get('prod-001')?.sellability_status).toBe('draft');
    });
  });

  // =========================================================================
  // 6. Category Reassignments & String / XSS Injections
  // =========================================================================
  describe('6. Category Reassignments & String / XSS Injections', () => {
    it('updates category and generates valid slug for standard category', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'category',
        payload: { category: 'Fixings & Fasteners' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.category).toBe('Fixings & Fasteners');
      expect(p1.category_slug).toBe('fixings-fasteners');
    });

    it('safely handles XSS strings in category name without crashing or executing script', async () => {
      const xssCategory = "<script>alert('xss')</script>";
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'category',
        payload: { category: xssCategory },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.category).toBe(xssCategory);
      // Slug conversion strips non-alphanumeric chars
      expect(p1.category_slug).toBe('-script-alert-xss-script-');
    });

    it('safely handles SQL injection strings in category', async () => {
      const sqlCategory = "Power Tools'; DROP TABLE categories; --";
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'category',
        payload: { category: sqlCategory },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.category).toBe(sqlCategory);
      expect(p1.category_slug).toBe('power-tools-drop-table-categories-');
    });

    it('assigns non-existent categories dynamically without error', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'category',
        payload: { category: 'Quantum Laser Surveying' },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.category).toBe('Quantum Laser Surveying');
      expect(p1.category_slug).toBe('quantum-laser-surveying');
    });
  });

  // =========================================================================
  // 7. Duplicate Product IDs / Repeated Compounding Updates
  // =========================================================================
  describe('7. Duplicate Product IDs / Repeated Compounding Updates', () => {
    it('HARDENED: Duplicate IDs in array are deduplicated to prevent repeated compounding percentage adjustments', async () => {
      // If someone sends the same product ID 3 times with +10% price adjust
      const req = makePostRequest({
        product_ids: ['prod-001', 'prod-001', 'prod-001'],
        action: 'price_adjust',
        payload: { price_percentage_change: 10 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      // Reports 1 update because product_ids was deduplicated
      expect(body.updated_count).toBe(1);

      const p1 = mockProductStore.get('prod-001')!;
      // 12.00 * 1.1 = 13.20 (only adjusted once)
      expect(p1.retail_price_inc_vat_gbp).toBe(13.2);
    });

    it('HARDENED: Duplicate IDs in array are deduplicated to prevent repeated stock delta deductions', async () => {
      // Initial stock: 40. Deduct 10 once => 30.
      const req = makePostRequest({
        product_ids: ['prod-001', 'prod-001', 'prod-001'],
        action: 'stock_adjust',
        payload: { stock_delta: -10 },
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.updated_count).toBe(1);

      const p1 = mockProductStore.get('prod-001')!;
      expect(p1.stock_quantity).toBe(30); // 40 - 10 = 30
    });
  });

  // =========================================================================
  // 8. General Schema & Route Integrity
  // =========================================================================
  describe('8. General Schema & Route Integrity', () => {
    it('rejects unrecognized action string with 400 Bad Request', async () => {
      const req = makePostRequest({
        product_ids: ['prod-001'],
        action: 'delete_all_products',
        payload: {},
      });

      const res = await bulkProductPost(req);
      expect(res.status).toBe(400);

      const body = await res.json();
      expect(body.error).toBe('Validation failed');
    });

    it('catches malformed JSON string and returns 500 without crashing node process', async () => {
      const req = makePostRequest('{ invalid json string ...');

      const res = await bulkProductPost(req);
      expect(res.status).toBe(500);

      const body = await res.json();
      expect(body.error).toBeDefined();
    });
  });
});
