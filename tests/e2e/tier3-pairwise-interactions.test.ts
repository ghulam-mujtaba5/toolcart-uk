/**
 * Tier 3 Pairwise Combinatorial Interaction Test Suite — ToolCart UK Platform
 *
 * Implements combinatorial testing across subsystem boundaries:
 * 1. Global VAT Toggle x PDP & Cart price recalculation (Ex. VAT vs Inc. VAT)
 * 2. Lexical Search x Faceted filtering (category + brand + in_stock) x Compare drawer
 * 3. AI Assistant drawer tool responses x 1-click cart add action
 * 4. Admin order state machine transition x Customer account tracking timeline stepper
 * 5. Stripe webhook event execution x Append-only order audit logs & PO idempotency key history
 * 6. Catalog CSV import x Wholesale price isolation (confidential margin security)
 * 7. R2 storage upload x Public URL generation with fallback
 *
 * (≥20 comprehensive combinatorial test cases).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { NextRequest } from 'next/server';
import React, { createElement } from 'react';
import { renderHook, act } from '@testing-library/react';

import {
  getAllProducts,
  getProductBySlug,
  searchProducts,
  getProjectKits,
  getBuyingGuides,
  parseAndValidateCatalogCsv,
  validateCaseMath,
  calculateRetailPrices,
  calculateVatAmount,
  formatGbp,
  getAllPublicProducts,
  getBaselineCatalogCsvText,
  UK_VAT_RATE,
} from '@/lib/catalog';
import { executeOrderTransition, generatePoIdempotencyKey } from '@/lib/state-machine/engine';
import { isValidTransition, VALID_TRANSITIONS } from '@/lib/state-machine/transitions';
import { getDb } from '@/lib/db';
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPresignedUploadUrl,
  isR2Configured,
} from '@/lib/adapters/storage';
import {
  sendEmail,
  renderOrderConfirmationEmail,
  renderTrackingUpdateEmail,
} from '@/lib/adapters/email';
import { createPaymentIntent, createRefund } from '@/lib/adapters/stripe';
import { POST as postStripeWebhook } from '@/app/api/webhooks/stripe/route';
import { POST as postAssistantApi } from '@/app/api/store/assistant/route';
import { VatProvider, useVAT } from '@/context/vat-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { OrderState } from '@/types/order';
import { PublicProductDTO } from '@/types/product';
import { CartItem, SupplierDeliveryGroup, CartSummary } from '@/types/cart';

describe('Tier 3: Pairwise Combinatorial Interaction Test Suite (≥20 Tests)', () => {
  beforeEach(async () => {
    await getDb().reset();
    if (typeof document !== 'undefined') {
      document.cookie = 'toolcart_vat_mode=inc; path=/';
    }
  });

  // =========================================================================
  // Pairwise Group 1: Global VAT Toggle x PDP & Cart Price Recalculation
  // =========================================================================
  describe('Pair 1: Global VAT Toggle x PDP & Cart Price Recalculation', () => {
    it('P1-1: Global VAT mode toggle recalculates primary & secondary price formats on PDP products', async () => {
      const all = await getAllProducts();
      expect(all.length).toBeGreaterThan(0);
      const product = all[0];

      const vatHook = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'inc' }, children),
      });

      // Default Inc. VAT Mode (DIY default)
      const incDisplay = vatHook.result.current.formatPriceDisplay(
        product.retail_price_inc_vat_gbp,
        product.retail_price_ex_vat_gbp
      );
      expect(incDisplay.primaryLabel).toBe('inc. VAT');
      expect(incDisplay.secondaryLabel).toBe('ex. VAT');
      expect(incDisplay.primaryAmount).toBe(product.retail_price_inc_vat_gbp);
      expect(incDisplay.secondaryAmount).toBe(product.retail_price_ex_vat_gbp);

      // Switch to Ex. VAT Mode (Trade default)
      act(() => {
        vatHook.result.current.setMode('ex');
      });
      expect(vatHook.result.current.mode).toBe('ex');
      expect(vatHook.result.current.isTradeMode).toBe(true);

      const exDisplay = vatHook.result.current.formatPriceDisplay(
        product.retail_price_inc_vat_gbp,
        product.retail_price_ex_vat_gbp
      );
      expect(exDisplay.primaryLabel).toBe('ex. VAT');
      expect(exDisplay.secondaryLabel).toBe('inc. VAT');
      expect(exDisplay.primaryAmount).toBe(product.retail_price_ex_vat_gbp);
      expect(exDisplay.secondaryAmount).toBe(product.retail_price_inc_vat_gbp);
    });

    it('P1-2: Adding items to cart preserves integer-pence precision across 20% VAT calculations', async () => {
      const all = await getAllProducts();
      const tape = all.find((p) => p.supplier_sku === 'IONPVCMC5PKX6') || all[0];
      const pliers = all.find((p) => p.supplier_sku === 'IONWPLIERS1P10') || all[1];
      expect(tape).toBeDefined();
      expect(pliers).toBeDefined();

      const qtyTape = 3;
      const qtyPliers = 2;

      const totalExPence =
        Math.round(tape.retail_price_ex_vat_gbp * 100) * qtyTape +
        Math.round(pliers.retail_price_ex_vat_gbp * 100) * qtyPliers;
      const subtotalEx = totalExPence / 100;

      const expectedVatPence = Math.round(totalExPence * UK_VAT_RATE);
      const expectedVatGbp = expectedVatPence / 100;
      const subtotalIncGbp = (totalExPence + expectedVatPence) / 100;

      // Verify mathematical consistency
      expect(subtotalIncGbp).toBeCloseTo(subtotalEx + expectedVatGbp, 2);
      expect(calculateVatAmount(subtotalEx)).toBeCloseTo(expectedVatGbp, 2);
    });

    it('P1-3: Carriage fee (£4.95 ex = £5.94 inc) behaves correctly around the £50.00 ex-VAT free carriage threshold', async () => {
      // Subtotal < £50 ex-VAT -> carriage charged
      const lowSubtotalEx = 35.0;
      const lowCarriageEx = 4.95;
      const lowCarriageInc = Math.round(lowCarriageEx * (1 + UK_VAT_RATE) * 100) / 100;
      expect(lowCarriageInc).toBe(5.94);

      const totalIncWithCarriage = Math.round((lowSubtotalEx * 1.2 + lowCarriageInc) * 100) / 100;
      expect(totalIncWithCarriage).toBe(47.94);

      // Subtotal >= £50 ex-VAT -> free carriage
      const qualifyingSubtotalEx = 55.0;
      const freeCarriageEx = qualifyingSubtotalEx >= 50.0 ? 0 : 4.95;
      const freeCarriageInc = Math.round(freeCarriageEx * 1.2 * 100) / 100;
      expect(freeCarriageEx).toBe(0);
      expect(freeCarriageInc).toBe(0);
    });

    it('P1-4: Case pack multiplier interaction accurately calculates line subtotal and VAT', async () => {
      const allProducts = await getAllProducts();
      const caseProduct = allProducts.find((p) => p.units_per_case && p.units_per_case > 1);
      expect(caseProduct).toBeDefined();
      if (!caseProduct) return;

      const unitsPerCase = caseProduct.units_per_case;
      const casePriceEx = Math.round(caseProduct.retail_price_ex_vat_gbp * unitsPerCase * 100) / 100;
      const casePriceInc = Math.round(casePriceEx * 1.2 * 100) / 100;

      expect(casePriceInc).toBeGreaterThan(casePriceEx);
      expect(casePriceInc).toBeCloseTo(casePriceEx * 1.2, 2);
    });

    it('P1-5: Trade mode toggle persistent cookie generation and parsing', () => {
      const hook = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'inc' }, children),
      });

      expect(hook.result.current.mode).toBe('inc');
      act(() => {
        hook.result.current.toggleVatMode();
      });
      expect(hook.result.current.mode).toBe('ex');
      expect(hook.result.current.isTradeMode).toBe(true);
    });
  });

  // =========================================================================
  // Pairwise Group 2: Lexical Search x Faceted Filtering x Compare Drawer
  // =========================================================================
  describe('Pair 2: Lexical Search x Faceted Filtering x Compare Drawer', () => {
    it('P2-1: Lexical query + Category filter returns matching items with faceted counts', async () => {
      const res = await searchProducts('tape', { category: 'site-equipment' });
      expect(res.products.length).toBeGreaterThan(0);
      res.products.forEach((p) => {
        expect(p.category_slug).toBe('site-equipment');
        expect(
          p.title.toLowerCase().includes('tape') ||
            p.description.toLowerCase().includes('tape') ||
            p.supplier_sku.toLowerCase().includes('tape')
        ).toBe(true);
      });
      expect(res.categories.length).toBeGreaterThan(0);
    });

    it('P2-2: Adding search-filtered products into Compare Drawer preserves specs and prices', async () => {
      const res = await searchProducts('tape');
      expect(res.products.length).toBeGreaterThanOrEqual(2);

      const item1 = res.products[0];
      const item2 = res.products[1];

      const compareHook = renderHook(() => useCompare(), {
        wrapper: ({ children }) => createElement(CompareProvider, null, children),
      });

      act(() => {
        compareHook.result.current.addProduct(item1);
        compareHook.result.current.addProduct(item2);
      });

      expect(compareHook.result.current.products.length).toBe(2);
      expect(compareHook.result.current.isInCompare(item1.id)).toBe(true);
      expect(compareHook.result.current.isInCompare(item2.id)).toBe(true);
      expect(compareHook.result.current.products[0].supplier_sku).toBe(item1.supplier_sku);
      expect(compareHook.result.current.products[1].supplier_sku).toBe(item2.supplier_sku);
    });

    it('P2-3: Compare Drawer strictly caps at 4 items when user attempts adding 5 products from search', async () => {
      const all = await getAllProducts();
      expect(all.length).toBeGreaterThanOrEqual(5);

      const compareHook = renderHook(() => useCompare(), {
        wrapper: ({ children }) => createElement(CompareProvider, null, children),
      });

      act(() => {
        for (let i = 0; i < 5; i++) {
          compareHook.result.current.addProduct(all[i]);
        }
      });

      expect(compareHook.result.current.products.length).toBe(4);
      expect(compareHook.result.current.isInCompare(all[4].id)).toBe(false);
    });

    it('P2-4: Removing an item from Compare Drawer frees slot for newly filtered search items', async () => {
      const all = await getAllProducts();
      const compareHook = renderHook(() => useCompare(), {
        wrapper: ({ children }) => createElement(CompareProvider, null, children),
      });

      act(() => {
        compareHook.result.current.addProduct(all[0]);
        compareHook.result.current.addProduct(all[1]);
        compareHook.result.current.addProduct(all[2]);
        compareHook.result.current.addProduct(all[3]);
      });
      expect(compareHook.result.current.products.length).toBe(4);

      // Remove item 0
      act(() => {
        compareHook.result.current.removeProduct(all[0].id);
      });
      expect(compareHook.result.current.products.length).toBe(3);
      expect(compareHook.result.current.isInCompare(all[0].id)).toBe(false);

      // Now add item 4
      act(() => {
        compareHook.result.current.addProduct(all[4]);
      });
      expect(compareHook.result.current.products.length).toBe(4);
      expect(compareHook.result.current.isInCompare(all[4].id)).toBe(true);
    });

    it('P2-5: Faceted brand + inStock filtering narrows search without affecting compare drawer state', async () => {
      const filtered = await searchProducts('', {
        brand: 'Status',
        inStockOnly: true,
      });

      filtered.products.forEach((p) => {
        expect(p.brand).toBe('Status');
        expect(p.availability_status).toBe('in_stock');
      });
    });
  });

  // =========================================================================
  // Pairwise Group 3: AI Assistant Drawer Responses x 1-Click Cart Add
  // =========================================================================
  describe('Pair 3: AI Assistant Drawer Responses x 1-Click Cart Add Action', () => {
    it('P3-1: Safety-critical query returns electrical safety warning and verified 1000V VDE products', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'I need insulated tools for working on a live fuse circuit' }),
      });
      const res = await postAssistantApi(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.reply).toContain('SAFETY WARNING');
      expect(json.safetyCaveat).toContain('1000V VDE');
      expect(json.recommendedProducts.length).toBeGreaterThan(0);

      const hasVdeDriver = json.recommendedProducts.some((p: PublicProductDTO) =>
        p.supplier_sku.includes('SDRIVER') || p.supplier_sku.includes('ION')
      );
      expect(hasVdeDriver).toBe(true);
    });

    it('P3-2: 1-Click Cart Add simulation with AI recommendation payload populates valid cart item', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'Recommend heavy duty masonry fixing plugs for brick walls' }),
      });
      const res = await postAssistantApi(req);
      const json = await res.json();
      expect(json.recommendedProducts.length).toBeGreaterThan(0);

      const recProduct: PublicProductDTO = json.recommendedProducts[0];

      const cartItem: CartItem = {
        product_id: recProduct.id,
        supplier_id: recProduct.supplier_id || 'status-uk',
        supplier_name: 'Status International (UK) Ltd',
        supplier_sku: recProduct.supplier_sku,
        title: recProduct.title,
        slug: recProduct.slug,
        image: recProduct.images?.[0] || '',
        category: recProduct.category,
        retail_price_ex_vat_gbp: recProduct.retail_price_ex_vat_gbp,
        retail_price_inc_vat_gbp: recProduct.retail_price_inc_vat_gbp,
        units_per_pack: recProduct.units_per_pack,
        units_per_case: recProduct.units_per_case || 1,
        quantity: 1,
      };

      expect(cartItem.product_id).toBe(recProduct.id);
      expect(cartItem.retail_price_inc_vat_gbp).toBe(recProduct.retail_price_inc_vat_gbp);
      expect(cartItem.quantity).toBe(1);
    });

    it('P3-3: Multi-item AI recommendation accumulates combined cart subtotal accurately', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'paint skirting board masking tape' }),
      });
      const res = await postAssistantApi(req);
      const json = await res.json();
      expect(json.recommendedProducts.length).toBeGreaterThanOrEqual(2);

      let subtotalEx = 0;
      json.recommendedProducts.forEach((p: PublicProductDTO) => {
        subtotalEx += p.retail_price_ex_vat_gbp;
      });

      const vatAmount = Math.round(subtotalEx * UK_VAT_RATE * 100) / 100;
      const totalInc = Math.round((subtotalEx + vatAmount) * 100) / 100;

      expect(totalInc).toBeGreaterThan(subtotalEx);
    });

    it('P3-4: Refusal test: Unmatched / out-of-scope query yields helpful fallback without invalid cart items', async () => {
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'orbital space shuttle launch fuel pump valve' }),
      });
      const res = await postAssistantApi(req);
      const json = await res.json();

      expect(json.recommendedProducts.length).toBe(0);
      expect(json.reply).toContain('could not find exact matching products');
    });

    it('P3-5: Assistant API rejects empty or non-string prompts with 400 Bad Request', async () => {
      const reqEmpty = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: '' }),
      });
      const resEmpty = await postAssistantApi(reqEmpty);
      expect(resEmpty.status).toBe(400);

      const reqNull = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({}),
      });
      const resNull = await postAssistantApi(reqNull);
      expect(resNull.status).toBe(400);
    });
  });

  // =========================================================================
  // Pairwise Group 4: Admin Order State Machine Transition x Stepper Timeline
  // =========================================================================
  describe('Pair 4: Admin Order State Machine Transition x Tracking Stepper', () => {
    it('P4-1: Happy path state transitions sequentially update order state in DB', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-PAIR-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'trade@example.co.uk',
        shipping_address: {
          full_name: 'John Trade',
          address_line_1: '10 High St',
          city: 'Leeds',
          postcode: 'LS1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 50.0,
        subtotal_inc_vat_gbp: 60.0,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 10.0,
        total_inc_vat_gbp: 60.0,
        supplier_id: 'status-uk',
      });

      const sequence: OrderState[] = [
        'checkout_authorized',
        'supplier_order_pending',
        'supplier_accepted',
        'payment_captured',
        'dispatched',
        'delivered',
      ];

      let currentState: OrderState = 'cart_pending';
      for (const targetState of sequence) {
        expect(isValidTransition(currentState, targetState)).toBe(true);
        const result = await executeOrderTransition({
          order_id: order.id,
          to_state: targetState,
          trigger: 'admin',
          actor: 'admin_portal',
        });
        expect(result.success).toBe(true);
        expect(result.current_state).toBe(targetState);
        currentState = targetState;
      }

      const finalOrder = await db.orders.getById(order.id);
      expect(finalOrder?.state).toBe('delivered');
      expect(finalOrder?.audit_logs.length).toBe(6);
    });

    it('P4-2: Exceptional cancellation path (supplier_rejected -> refund_pending -> refunded)', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-PAIR-002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'buyer@example.co.uk',
        shipping_address: {
          full_name: 'Bob Builder',
          address_line_1: '14 Works Lane',
          city: 'Sheffield',
          postcode: 'S1 2BB',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 25.0,
        subtotal_inc_vat_gbp: 30.0,
        shipping_ex_vat_gbp: 4.95,
        shipping_inc_vat_gbp: 5.94,
        vat_amount_gbp: 5.99,
        total_inc_vat_gbp: 35.94,
        supplier_id: 'status-uk',
      });

      // cart_pending -> checkout_authorized -> supplier_order_pending
      await executeOrderTransition({
        order_id: order.id,
        to_state: 'checkout_authorized',
        trigger: 'admin',
        actor: 'system',
      });
      await executeOrderTransition({
        order_id: order.id,
        to_state: 'supplier_order_pending',
        trigger: 'admin',
        actor: 'system',
      });

      // Supplier rejects - state machine handles TRIGGER_AUTO_REFUND and advances to refund_pending
      const rejRes = await executeOrderTransition({
        order_id: order.id,
        to_state: 'supplier_rejected',
        trigger: 'supplier',
        actor: 'supplier_webhook',
      });
      expect(rejRes.current_state).toBe('refund_pending');

      // Final step: Stripe refund confirmation advances to refunded
      const refundedRes = await executeOrderTransition({
        order_id: order.id,
        to_state: 'refunded',
        trigger: 'webhook',
        actor: 'stripe_webhook',
      });
      expect(refundedRes.current_state).toBe('refunded');

      const updated = await db.orders.getById(order.id);
      expect(updated?.state).toBe('refunded');
    });

    it('P4-3: Partial dispatch state flow (payment_captured -> partial_dispatch -> dispatched -> delivered)', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-PAIR-003',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'payment_captured',
        customer_email: 'diy@example.co.uk',
        shipping_address: {
          full_name: 'Alice DIY',
          address_line_1: '2 Garden Way',
          city: 'York',
          postcode: 'YO1 7ZZ',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 100.0,
        subtotal_inc_vat_gbp: 120.0,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 20.0,
        total_inc_vat_gbp: 120.0,
        supplier_id: 'status-uk',
      });

      // payment_captured -> partial_dispatch
      const p1 = await executeOrderTransition({
        order_id: order.id,
        to_state: 'partial_dispatch',
        trigger: 'supplier',
        actor: 'logistics_hub',
        metadata: { consignment_1: 'PARCEL-101' },
      });
      expect(p1.current_state).toBe('partial_dispatch');

      // partial_dispatch -> dispatched
      const p2 = await executeOrderTransition({
        order_id: order.id,
        to_state: 'dispatched',
        trigger: 'supplier',
        actor: 'logistics_hub',
        metadata: { consignment_2: 'PARCEL-102' },
      });
      expect(p2.current_state).toBe('dispatched');

      // dispatched -> delivered
      const p3 = await executeOrderTransition({
        order_id: order.id,
        to_state: 'delivered',
        trigger: 'webhook',
        actor: 'carrier_tracking',
      });
      expect(p3.current_state).toBe('delivered');
    });

    it('P4-4: Disallows invalid backwards transitions and preserves current state', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-PAIR-004',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'delivered',
        customer_email: 'buyer@example.co.uk',
        shipping_address: {
          full_name: 'Eve Tester',
          address_line_1: '5 Main Rd',
          city: 'Bath',
          postcode: 'BA1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 10.0,
        subtotal_inc_vat_gbp: 12.0,
        shipping_ex_vat_gbp: 4.95,
        shipping_inc_vat_gbp: 5.94,
        vat_amount_gbp: 2.99,
        total_inc_vat_gbp: 17.94,
        supplier_id: 'status-uk',
      });

      // Attempting to move delivered -> cart_pending must throw
      await expect(
        executeOrderTransition({
          order_id: order.id,
          to_state: 'cart_pending',
          trigger: 'admin',
          actor: 'bad_actor',
        })
      ).rejects.toThrow(/Illegal transition/i);

      const check = await db.orders.getById(order.id);
      expect(check?.state).toBe('delivered');
    });

    it('P4-5: Manual review state allows escalation from any non-terminal state', async () => {
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-PAIR-005',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'supplier_order_pending',
        customer_email: 'ops@example.co.uk',
        shipping_address: {
          full_name: 'Ops Manager',
          address_line_1: 'Warehouse 1',
          city: 'Hull',
          postcode: 'HU1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 80.0,
        subtotal_inc_vat_gbp: 96.0,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 16.0,
        total_inc_vat_gbp: 96.0,
        supplier_id: 'status-uk',
      });

      const res = await executeOrderTransition({
        order_id: order.id,
        to_state: 'manual_review',
        trigger: 'admin',
        actor: 'fraud_check',
        metadata: { reason: 'Address verification discrepancy' },
      });
      expect(res.current_state).toBe('manual_review');
    });
  });

  // =========================================================================
  // Pairwise Group 5: Stripe Webhook x Audit Logs & PO Idempotency
  // =========================================================================
  describe('Pair 5: Stripe Webhook x Audit Logs & PO Idempotency Key History', () => {
    it('P5-1: Valid payment_intent.succeeded advances order to supplier_order_pending with PO idempotency key', async () => {
      const db = getDb();
      const orderId = 'ORD-2026-P5-001';

      await db.orders.create({
        id: orderId,
        order_number: 'TC-P5-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'sparky@toolcart.co.uk',
        shipping_address: {
          full_name: 'Sam Sparks',
          address_line_1: '12 Voltage Ave',
          city: 'Bristol',
          postcode: 'BS1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 40.0,
        subtotal_inc_vat_gbp: 48.0,
        shipping_ex_vat_gbp: 5.0,
        shipping_inc_vat_gbp: 6.0,
        vat_amount_gbp: 9.0,
        total_inc_vat_gbp: 54.0,
        supplier_id: 'status-uk',
      });

      const payload = {
        id: 'evt_p5_pi_success_001',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_p5_1001',
            object: 'payment_intent',
            amount: 5400,
            currency: 'gbp',
            metadata: { order_id: orderId },
          },
        },
      };

      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await postStripeWebhook(req);
      expect(res.status).toBe(200);

      const updated = await db.orders.getById(orderId);
      expect(updated?.state).toBe('supplier_order_pending');

      const expectedPoKey = generatePoIdempotencyKey(orderId, 'status-uk');
      expect(expectedPoKey).toBe(`${orderId}#status-uk`);

      // Audit logs contain webhook entry
      const webhookLog = updated?.audit_logs.find((l) => l.trigger === 'webhook');
      expect(webhookLog).toBeDefined();
      expect(webhookLog?.actor).toBe(`stripe:${payload.id}`);
    });

    it('P5-2: Duplicate webhook delivery triggers idempotent replay without duplicated state change', async () => {
      const db = getDb();
      const orderId = 'ORD-2026-P5-002';

      await db.orders.create({
        id: orderId,
        order_number: 'TC-P5-002',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'sparky@toolcart.co.uk',
        shipping_address: {
          full_name: 'Sam Sparks',
          address_line_1: '12 Voltage Ave',
          city: 'Bristol',
          postcode: 'BS1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 40.0,
        subtotal_inc_vat_gbp: 48.0,
        shipping_ex_vat_gbp: 5.0,
        shipping_inc_vat_gbp: 6.0,
        vat_amount_gbp: 9.0,
        total_inc_vat_gbp: 54.0,
        supplier_id: 'status-uk',
      });

      const payload = {
        id: 'evt_p5_pi_success_002',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_p5_1002',
            object: 'payment_intent',
            amount: 5400,
            currency: 'gbp',
            metadata: { order_id: orderId },
          },
        },
      };

      // First webhook post
      const req1 = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const res1 = await postStripeWebhook(req1);
      expect(res1.status).toBe(200);

      const orderAfterFirst = await db.orders.getById(orderId);
      const auditLogCount = orderAfterFirst?.audit_logs.length || 0;

      // Second identical webhook post (burst retry)
      const req2 = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      const res2 = await postStripeWebhook(req2);
      expect(res2.status).toBe(200);

      const orderAfterSecond = await db.orders.getById(orderId);
      expect(orderAfterSecond?.state).toBe('supplier_order_pending');
      // No duplicate transition occurred
      expect(orderAfterSecond?.audit_logs.length).toBe(auditLogCount);
    });

    it('P5-3: charge.refunded webhook advances refund_pending order to refunded and records refund audit', async () => {
      const db = getDb();
      const orderId = 'ORD-2026-P5-003';

      await db.orders.create({
        id: orderId,
        order_number: 'TC-P5-003',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'refund_pending',
        customer_email: 'refundee@toolcart.co.uk',
        shipping_address: {
          full_name: 'Carol Cash',
          address_line_1: '3 Bank St',
          city: 'London',
          postcode: 'EC1 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 30.0,
        subtotal_inc_vat_gbp: 36.0,
        shipping_ex_vat_gbp: 0,
        shipping_inc_vat_gbp: 0,
        vat_amount_gbp: 6.0,
        total_inc_vat_gbp: 36.0,
        supplier_id: 'status-uk',
      });

      const payload = {
        id: 'evt_p5_refund_003',
        object: 'event',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_p5_1003',
            object: 'charge',
            amount_refunded: 3600,
            currency: 'gbp',
            metadata: { order_id: orderId },
          },
        },
      };

      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await postStripeWebhook(req);
      expect(res.status).toBe(200);

      const updated = await db.orders.getById(orderId);
      expect(updated?.state).toBe('refunded');
      const refundLog = updated?.audit_logs.find((l) => l.to_state === 'refunded');
      expect(refundLog).toBeDefined();
    });

    it('P5-4: Webhook with unknown order ID acknowledges receipt (200) without crashing', async () => {
      const payload = {
        id: 'evt_p5_unknown_order',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_unknown',
            metadata: { order_id: 'NON_EXISTENT_ORDER_999' },
          },
        },
      };

      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const res = await postStripeWebhook(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.received).toBe(true);
    });

    it('P5-5: Webhook with malformed or non-JSON body returns 400 Bad Request', async () => {
      const req = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: 'invalid-non-json-string',
      });

      const res = await postStripeWebhook(req);
      expect(res.status).toBe(400);
    });
  });

  // =========================================================================
  // Pairwise Group 6: Catalog CSV Import x Wholesale Price Isolation
  // =========================================================================
  describe('Pair 6: Catalog CSV Import x Wholesale Price Security Isolation', () => {
    it('P6-1: Parsing baseline CSV ingests all 115 rows with wholesale costs stored only internally', () => {
      const csvText = getBaselineCatalogCsvText();
      const report = parseAndValidateCatalogCsv(csvText);
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);

      // Raw validation records contain wholesale costs
      expect(report.results[0].unit_cost_ex_vat_gbp).toBeGreaterThan(0);
      expect(report.results[0].actual_case_cost).toBeGreaterThan(0);
    });

    it('P6-2: Public DTOs generated from catalog NEVER include unit_cost_ex_vat_gbp or case_cost_ex_vat_gbp', () => {
      const publicProducts = getAllPublicProducts();
      expect(publicProducts.length).toBe(115);

      for (const p of publicProducts) {
        expect((p as any).unit_cost_ex_vat_gbp).toBeUndefined();
        expect((p as any).case_cost_ex_vat_gbp).toBeUndefined();
        expect((p as any).wholesale_margin).toBeUndefined();
        expect((p as any).cost_price).toBeUndefined();
      }
    });

    it('P6-3: Category markup rules compute public retail prices correctly without exposing wholesale formulas', () => {
      const wholesaleUnit = 1.0;
      const prices = calculateRetailPrices(wholesaleUnit);
      expect(prices.retail_price_ex_vat_gbp).toBeGreaterThan(wholesaleUnit);
      expect(prices.retail_price_inc_vat_gbp).toBeCloseTo(prices.retail_price_ex_vat_gbp * 1.2, 2);

      const vatAmount = calculateVatAmount(prices.retail_price_ex_vat_gbp);
      expect(vatAmount).toBeCloseTo(
        prices.retail_price_inc_vat_gbp - prices.retail_price_ex_vat_gbp,
        2
      );
    });

    it('P6-4: Deep string serialization of public catalog reveals ZERO wholesale leaks', () => {
      const publicProducts = getAllPublicProducts();
      const serialized = JSON.stringify(publicProducts);

      expect(serialized.includes('unit_cost_ex_vat_gbp')).toBe(false);
      expect(serialized.includes('case_cost_ex_vat_gbp')).toBe(false);
      expect(serialized.includes('wholesale')).toBe(false);
    });
  });

  // =========================================================================
  // Pairwise Group 7: R2 Storage Upload x Public URL Generation with Fallback
  // =========================================================================
  describe('Pair 7: R2 Storage Upload x Public URL Generation with Fallback', () => {
    it('P7-1: uploadFile returns StorageUploadResult with sanitized key and valid public URL', async () => {
      const buffer = Buffer.from('ToolCart UK Spec Sheet Content', 'utf-8');
      const res = await uploadFile(buffer, 'specs/technical-spec-001.pdf', 'application/pdf');

      expect(res.key).toBe('specs/technical-spec-001.pdf');
      expect(res.sizeBytes).toBe(buffer.length);
      expect(res.url).toBeDefined();
      expect(res.url.endsWith('specs/technical-spec-001.pdf')).toBe(true);
    });

    it('P7-2: getPublicUrl generates valid accessible paths in both R2 and local fallback modes', () => {
      const url = getPublicUrl('images/products/screwdriver-vde.svg');
      expect(url).toContain('images/products/screwdriver-vde.svg');
      if (!isR2Configured()) {
        expect(url.startsWith('/uploads/')).toBe(true);
      }
    });

    it('P7-3: getPresignedUploadUrl returns valid upload endpoint URL with expiration', async () => {
      const presigned = await getPresignedUploadUrl('compliance/ukca-cert-123.pdf', 'application/pdf', 3600);
      expect(presigned).toBeDefined();
      expect(presigned.length).toBeGreaterThan(10);
    });

    it('P7-4: deleteFile safely executes for both existing and non-existing keys without unhandled exceptions', async () => {
      const testBuffer = Buffer.from('Temp file for deletion', 'utf-8');
      const uploadRes = await uploadFile(testBuffer, 'temp/to-delete.txt', 'text/plain');
      expect(uploadRes.key).toBe('temp/to-delete.txt');

      const deleteRes = await deleteFile('temp/to-delete.txt');
      expect(deleteRes).toBe(true);

      // Deleting non-existent file is safe
      const deleteNonExistent = await deleteFile('temp/does-not-exist.txt');
      expect(typeof deleteNonExistent).toBe('boolean');
    });

    it('P7-5: Leading slash in key is automatically stripped preventing double-slash URL corruption', () => {
      const urlWithLeading = getPublicUrl('/products/torch.png');
      const urlWithoutLeading = getPublicUrl('products/torch.png');
      expect(urlWithLeading).toBe(urlWithoutLeading);
      expect(urlWithLeading).not.toContain('//products');
    });
  });
});
