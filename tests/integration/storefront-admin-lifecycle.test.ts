import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as handleTradeApplication } from '@/app/api/trade/route';
import { POST as handleOrderCreation, GET as handleGetOrders } from '@/app/api/admin/orders/route';
import { getDb } from '@/lib/db';

describe('Storefront to Admin Lifecycle Integration', () => {
  beforeEach(async () => {
    const db = getDb();
    await db.reset();
  });

  describe('Feature 28 & 29: Trade Pro Application to Admin Approval', () => {
    it('persists trade application to db.customers and makes it queryable for admin', async () => {
      const db = getDb();
      const initialCount = (await db.customers.getAll()).length;

      const payload = {
        business_name: 'Vanguard Electrical Contracting Ltd',
        contact_name: 'Marcus Vance',
        email: 'marcus@vanguardelec.co.uk',
        phone: '07700 900123',
        trade_type: 'Electrical',
        company_number: '12345678',
        vat_number: 'GB987654321',
      };

      const req = new NextRequest('http://localhost:3000/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const res = await handleTradeApplication(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.customer.company_name).toBe(payload.business_name);
      expect(json.customer.status).toBe('pending');

      // Verify db repository state
      const allCustomers = await db.customers.getAll();
      expect(allCustomers.length).toBe(initialCount + 1);

      const saved = allCustomers.find((c) => c.company_name === payload.business_name);
      expect(saved).toBeDefined();
      expect(saved?.email).toBe(payload.email);
    });

    it('rejects invalid trade application payload with validation errors', async () => {
      const invalidPayload = {
        business_name: '',
        contact_name: '',
        email: 'invalid-email',
      };

      const req = new NextRequest('http://localhost:3000/api/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidPayload),
      });

      const res = await handleTradeApplication(req);
      expect(res.status).toBe(400);

      const json = await res.json();
      expect(json.error).toBe('Validation failed');
      expect(json.issues.length).toBeGreaterThan(0);
    });
  });

  describe('Feature 30: Storefront Checkout Order Persistence to Admin Orders Queue', () => {
    it('creates a persistent order visible in admin orders management', async () => {
      const db = getDb();
      const initialOrders = await db.orders.getAll();

      const orderPayload = {
        order_number: 'TC-E2E-9901',
        customer_email: 'builder.john@apexcontracting.co.uk',
        shipping_address: {
          full_name: 'John Miller',
          address_line_1: '42 Builder Way',
          city: 'Leeds',
          postcode: 'LS1 4DY',
          country: 'United Kingdom',
        },
        items: [
          {
            supplier_sku: 'S10484',
            title: 'Contractor Magnetic Torpedo Level 230mm',
            quantity: 2,
            unit_price_ex_vat: 5.4,
            unit_price_inc_vat: 6.48,
            total_ex_vat: 10.8,
            total_inc_vat: 12.96,
            is_case: false,
          },
        ],
        subtotal_ex_vat_gbp: 10.8,
        subtotal_inc_vat_gbp: 12.96,
        shipping_ex_vat_gbp: 4.95,
        shipping_inc_vat_gbp: 5.94,
        vat_amount_gbp: 3.15,
        total_inc_vat_gbp: 18.9,
        supplier_id: 'status-uk',
        state: 'checkout_authorized',
      };

      const createReq = new NextRequest('http://localhost:3000/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const createRes = await handleOrderCreation(createReq);
      expect(createRes.status).toBe(201);

      const createdJson = await createRes.json();
      expect(createdJson.order_number).toBe('TC-E2E-9901');
      expect(createdJson.state).toBe('checkout_authorized');

      // Verify order appears in GET /api/admin/orders
      const getReq = new NextRequest('http://localhost:3000/api/admin/orders');
      const getRes = await handleGetOrders(getReq);
      const getJson = await getRes.json();

      expect(getJson.orders.some((o: { order_number: string }) => o.order_number === 'TC-E2E-9901')).toBe(true);
    });
  });
});
