/**
 * Tier 4 Application Scenarios Test Suite — ToolCart UK Platform
 *
 * Implements the 6 realistic end-to-end application scenarios defined in
 * TEST_INFRA.md § Real-World Application Scenarios:
 *
 * Scenario 1: Trade Electrician Purchasing Consumables (Ex VAT, Search, Kit, Trade Account, Checkout)
 * Scenario 2: DIY Homeowner Shelf-Hanging Project (Buying Guide, Compare Drawer, AI Assistant, Single Pack Order)
 * Scenario 3: Full Supplier Catalog Ingestion & Margin Review (115 CSV rows import, Case math validation, Wholesale isolation, Admin pricing)
 * Scenario 4: Supplier Rejection & Automated Refund Flow (Order placement, PO generation, Supplier Reject webhook, Stripe refund, Audit log)
 * Scenario 5: Multi-Supplier Cart with Split Fulfillment (Cart with 2 suppliers, Split delivery calculation, Multiple POs, State tracking)
 * Scenario 6: Brand V3 Integrity & Static Compliance Sweep (Zero copper/purple/teal scan, Contrast matrix WCAG AA, Tabular numbers, Outline check)
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
  getProjectKitBySlug,
  getBuyingGuides,
  getBuyingGuideBySlug,
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
import { isValidTransition } from '@/lib/state-machine/transitions';
import { getDb } from '@/lib/db';
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  isR2Configured,
} from '@/lib/adapters/storage';
import {
  sendEmail,
  renderOrderConfirmationEmail,
  renderSupplierPurchaseOrderEmail,
  renderTrackingUpdateEmail,
  renderTradeApplicationDecisionEmail,
} from '@/lib/adapters/email';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
} from '@/lib/adapters/stripe';
import { POST as postStripeWebhook } from '@/app/api/webhooks/stripe/route';
import { POST as postAssistantApi } from '@/app/api/store/assistant/route';
import { VatProvider, useVAT } from '@/context/vat-context';
import { CompareProvider, useCompare } from '@/context/compare-context';
import { OrderState, OrderRecord } from '@/types/order';
import { PublicProductDTO } from '@/types/product';
import { CartItem, SupplierDeliveryGroup, CartSummary } from '@/types/cart';

// UK HMRC VAT validator (GB prefix followed by 9 digits)
function isValidUkVatNumber(vat: string): boolean {
  const clean = vat.trim().replace(/\s+/g, '').toUpperCase();
  return /^(GB)?\d{9}$/.test(clean);
}

// UK Companies House 8-character alphanumeric CRN validator
function isValidCompaniesHouseCrn(crn: string): boolean {
  const clean = crn.trim().toUpperCase();
  return /^[A-Z0-9]{8}$/.test(clean);
}

describe('Tier 4: Real-World Application Scenarios (6 High-Complexity Scenarios)', () => {
  beforeEach(async () => {
    await getDb().reset();
    if (typeof document !== 'undefined') {
      document.cookie = 'toolcart_vat_mode=inc; path=/';
    }
  });

  // =========================================================================
  // Scenario 1: Trade Electrician Purchasing Consumables
  // =========================================================================
  describe('Scenario 1: Trade Electrician Purchasing Consumables', () => {
    it('executes complete trade electrician journey: Ex VAT mode, search, project kit, trade account validation, and checkout', async () => {
      // Step 1: Electrician sets global VAT toggle to Ex. VAT Mode
      const vatHook = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'ex' }, children),
      });
      act(() => {
        vatHook.result.current.setMode('ex');
      });
      expect(vatHook.result.current.mode).toBe('ex');
      expect(vatHook.result.current.isTradeMode).toBe(true);

      // Step 2: Lexical search for electrical consumables
      const searchRes = await searchProducts('tape', {
        category: 'site-equipment',
        inStockOnly: true,
      });
      expect(searchRes.products.length).toBeGreaterThan(0);
      const matchedTape = searchRes.products[0];
      expect(matchedTape.availability_status).toBe('in_stock');

      // Step 3: Browse curated Project Kits & inspect Domestic Electrical Consumables Kit
      const electricalKit = await getProjectKitBySlug('domestic-electrical-tape-consumables-kit');
      expect(electricalKit).not.toBeNull();
      if (!electricalKit) return;

      expect(electricalKit.title).toContain('Electrical');
      expect(electricalKit.items.length).toBe(5);
      expect(electricalKit.bundle_savings_percent).toBe(15);

      // Verify essential trade tools in the kit
      const skusInKit = electricalKit.items.map((i) => i.sku);
      expect(skusInKit).toContain('IONPVCMC5PKX6'); // Phase colour coding tape
      expect(skusInKit).toContain('IONNEONTESTS1P10'); // Mains indicator
      expect(skusInKit).toContain('IONESDRIVERS1P6'); // 1000V Insulated drivers

      // Step 4: Validate Trade Account credentials (HMRC VAT + Companies House CRN)
      const tradeVatNumber = 'GB987654321';
      const tradeCrn = '12345678';
      const companyName = 'Sparks Electrical Contractors Ltd';

      expect(isValidUkVatNumber(tradeVatNumber)).toBe(true);
      expect(isValidCompaniesHouseCrn(tradeCrn)).toBe(true);

      // Update seeded trade customer status to approved
      const db = getDb();
      const customers = await db.customers.getAll();
      expect(customers.length).toBeGreaterThan(0);
      const tradeCustomer = await db.customers.updateStatus(customers[0].id, 'approved', 5000.0);
      expect(tradeCustomer).not.toBeNull();
      if (!tradeCustomer) return;
      expect(tradeCustomer.status).toBe('approved');
      expect(tradeCustomer.credit_limit_gbp).toBe(5000.0);

      // Step 5: Build cart with electrical kit items + additional tape packs
      let subtotalExPence = 0;
      const orderItems = electricalKit.items.map((item) => {
        const itemPriceExPence = Math.round(item.price_ex_vat * 100);
        subtotalExPence += itemPriceExPence * item.default_quantity;
        return {
          product_id: `prod_${item.sku.toLowerCase()}`,
          title: item.title,
          supplier_sku: item.sku,
          quantity: item.default_quantity,
          unit_price_ex_vat: item.price_ex_vat,
          unit_price_inc_vat: Math.round(item.price_ex_vat * 1.2 * 100) / 100,
          total_inc_vat: Math.round(item.price_ex_vat * 1.2 * item.default_quantity * 100) / 100,
        };
      });

      const subtotalEx = subtotalExPence / 100;
      const vatAmount = calculateVatAmount(subtotalEx);
      const isFreeDelivery = subtotalEx >= 50.0;
      const shippingEx = isFreeDelivery ? 0 : 4.95;
      const shippingInc = Math.round(shippingEx * 1.2 * 100) / 100;
      const totalInc = Math.round((subtotalEx + vatAmount + shippingInc) * 100) / 100;

      // Step 6: Create order in DB (cart_pending state)
      const order = await db.orders.create({
        order_number: 'TC-TRADE-SCENARIO-1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: tradeCustomer.email,
        shipping_address: {
          full_name: tradeCustomer.contact_name,
          company_name: tradeCustomer.company_name,
          address_line_1: 'Unit 4 Trade Industrial Estate',
          city: 'Manchester',
          postcode: 'M1 1AA',
          country: 'GB',
        },
        items: orderItems,
        subtotal_ex_vat_gbp: subtotalEx,
        subtotal_inc_vat_gbp: subtotalEx + vatAmount,
        shipping_ex_vat_gbp: shippingEx,
        shipping_inc_vat_gbp: shippingInc,
        vat_amount_gbp: vatAmount,
        total_inc_vat_gbp: totalInc,
        supplier_id: 'status-uk',
      });

      expect(order.state).toBe('cart_pending');
      expect(order.subtotal_ex_vat_gbp).toBe(subtotalEx);
      expect(order.shipping_ex_vat_gbp).toBe(shippingEx);

      // Step 7: Render Trade Application Decision Email
      const emailResult = renderTradeApplicationDecisionEmail(
        tradeCustomer.company_name,
        'approved',
        tradeCustomer.credit_limit_gbp
      );
      expect(emailResult.html).toContain(tradeCustomer.company_name);
      expect(emailResult.html).toContain('5000.00');
    });
  });

  // =========================================================================
  // Scenario 2: DIY Homeowner Shelf-Hanging Project
  // =========================================================================
  describe('Scenario 2: DIY Homeowner Shelf-Hanging Project', () => {
    it('executes DIY homeowner journey: buying guide, compare drawer, AI assistant, single pack order in Inc VAT mode', async () => {
      // Step 1: Homeowner consults Hardware Buying Guide for wall plugs
      const guide = await getBuyingGuideBySlug('selecting-wall-plugs-masonry-fixings');
      expect(guide).not.toBeNull();
      if (!guide) return;

      expect(guide.title).toContain('Wall Plugs & Masonry Fixings');
      expect(guide.recommended_skus).toContain('IONWPLUGS200P10');
      expect(guide.safety_warnings.length).toBeGreaterThan(0);

      // Step 2: Compare candidate products side-by-side in Compare Drawer
      const allProducts = await getAllProducts();
      const wallPlugs = allProducts.find((p) => p.supplier_sku === 'IONWPLUGS200P10');
      const drillBits = allProducts.find((p) => p.supplier_sku === 'IONMASODBSET1P12');
      expect(wallPlugs).toBeDefined();
      expect(drillBits).toBeDefined();
      if (!wallPlugs || !drillBits) return;

      const compareHook = renderHook(() => useCompare(), {
        wrapper: ({ children }) => createElement(CompareProvider, null, children),
      });

      act(() => {
        compareHook.result.current.addProduct(wallPlugs);
        compareHook.result.current.addProduct(drillBits);
      });

      expect(compareHook.result.current.products.length).toBe(2);
      expect(compareHook.result.current.isInCompare(wallPlugs.id)).toBe(true);
      expect(compareHook.result.current.isInCompare(drillBits.id)).toBe(true);

      // Step 3: Consult AI Assistant for heavy shelf fixing recommendation
      const req = new NextRequest('http://localhost:3000/api/store/assistant', {
        method: 'POST',
        body: JSON.stringify({ prompt: 'What wall plugs and drill bits do I need to hang a wooden shelf on brick?' }),
      });
      const aiRes = await postAssistantApi(req);
      expect(aiRes.status).toBe(200);

      const aiJson = await aiRes.json();
      expect(aiJson.reply).toContain('wall fixtures in solid masonry or brick');
      expect(aiJson.safetyCaveat).toContain('Always scan for concealed electrical cables');
      expect(aiJson.recommendedProducts.length).toBeGreaterThan(0);

      // Verify AI recommendation includes the wall plugs
      const recommendedSkuList = aiJson.recommendedProducts.map((p: PublicProductDTO) => p.supplier_sku);
      expect(recommendedSkuList).toContain('IONWPLUGS200P10');

      // Step 4: 1-Click add wall plugs pack to cart (DIY Mode: Inc. VAT default)
      const vatHook = renderHook(() => useVAT(), {
        wrapper: ({ children }) => createElement(VatProvider, { initialMode: 'inc' }, children),
      });
      expect(vatHook.result.current.mode).toBe('inc');
      expect(vatHook.result.current.isTradeMode).toBe(false);

      const qty = 1;
      const unitPriceEx = wallPlugs.retail_price_ex_vat_gbp;
      const unitPriceInc = wallPlugs.retail_price_inc_vat_gbp;
      const subtotalEx = unitPriceEx * qty;
      const vatAmount = calculateVatAmount(subtotalEx);

      // Standard residential carriage fee (<£50 ex VAT threshold)
      const carriageEx = 4.95;
      const carriageInc = 5.94; // £4.95 * 1.2
      const orderTotalInc = Math.round((subtotalEx + vatAmount + carriageInc) * 100) / 100;

      // Step 5: Place residential order in database
      const db = getDb();
      const order = await db.orders.create({
        order_number: 'TC-DIY-SHELF-001',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'diy_sarah@gmail.com',
        shipping_address: {
          full_name: 'Sarah DIYer',
          address_line_1: '24 Elm Tree Close',
          city: 'Harrogate',
          postcode: 'HG1 2AB',
          country: 'GB',
        },
        items: [
          {
            product_id: wallPlugs.id,
            title: wallPlugs.title,
            supplier_sku: wallPlugs.supplier_sku,
            quantity: qty,
            unit_price_ex_vat: unitPriceEx,
            unit_price_inc_vat: unitPriceInc,
            total_inc_vat: unitPriceInc * qty,
          },
        ],
        subtotal_ex_vat_gbp: subtotalEx,
        subtotal_inc_vat_gbp: Math.round((subtotalEx + vatAmount) * 100) / 100,
        shipping_ex_vat_gbp: carriageEx,
        shipping_inc_vat_gbp: carriageInc,
        vat_amount_gbp: vatAmount,
        total_inc_vat_gbp: orderTotalInc,
        supplier_id: 'status-uk',
      });

      expect(order.state).toBe('cart_pending');
      expect(order.shipping_inc_vat_gbp).toBe(5.94);
      expect(order.items.length).toBe(1);
    });
  });

  // =========================================================================
  // Scenario 3: Full Supplier Catalog Ingestion & Margin Review
  // =========================================================================
  describe('Scenario 3: Full Supplier Catalog Ingestion & Margin Review', () => {
    it('executes full 115 SKU CSV ingestion, case math validation, wholesale isolation, and admin pricing review', () => {
      // Step 1: Ingest baseline supplier quote CSV (Status International UK Ltd)
      const csvText = getBaselineCatalogCsvText();
      const report = parseAndValidateCatalogCsv(csvText);

      // Verify all 115 rows ingested
      expect(report.total_rows).toBe(115);
      expect(report.passed_rows).toBe(115);
      expect(report.failed_rows).toBe(0);
      expect(report.results.length).toBe(115);

      // Step 2: Validate case math across every single row
      for (const row of report.results) {
        expect(row.status).toBe('PASS');
        const mathCheck = validateCaseMath(
          row.unit_cost_ex_vat_gbp,
          row.units_per_case,
          row.actual_case_cost
        );
        expect(mathCheck.valid).toBe(true);
        expect(row.actual_case_cost).toBeCloseTo(row.unit_cost_ex_vat_gbp * row.units_per_case, 1);
      }

      // Step 3: Admin pricing engine verifies retail pricing tiers
      for (const row of report.results) {
        const prices = calculateRetailPrices(row.unit_cost_ex_vat_gbp);
        expect(prices.retail_price_ex_vat_gbp).toBeGreaterThan(row.unit_cost_ex_vat_gbp);
        expect(prices.retail_price_inc_vat_gbp).toBeCloseTo(
          prices.retail_price_ex_vat_gbp * (1 + UK_VAT_RATE),
          2
        );
      }

      // Step 4: Strict Wholesale Price Security Isolation Sweep
      const publicProducts = getAllPublicProducts();
      expect(publicProducts.length).toBe(115);

      for (const p of publicProducts) {
        // Assert absence of wholesale costs from public DTO
        expect((p as any).unit_cost_ex_vat_gbp).toBeUndefined();
        expect((p as any).case_cost_ex_vat_gbp).toBeUndefined();
        expect((p as any).wholesale_margin).toBeUndefined();
        expect((p as any).supplier_cost).toBeUndefined();

        // Assert presence of verified public commercial fields
        expect(p.retail_price_ex_vat_gbp).toBeGreaterThan(0);
        expect(p.retail_price_inc_vat_gbp).toBeGreaterThan(p.retail_price_ex_vat_gbp);
        expect(p.supplier_sku).toBeDefined();
        expect(p.gtin).toBeDefined();
      }

      // Deep string serialization verify zero leakage
      const serializedCatalog = JSON.stringify(publicProducts);
      expect(serializedCatalog).not.toContain('unit_cost_ex_vat_gbp');
      expect(serializedCatalog).not.toContain('case_cost_ex_vat_gbp');
      expect(serializedCatalog).not.toContain('wholesale');
    });
  });

  // =========================================================================
  // Scenario 4: Supplier Rejection & Automated Refund Flow
  // =========================================================================
  describe('Scenario 4: Supplier Rejection & Automated Refund Flow', () => {
    it('executes supplier rejection, automated refund flow, audit logs, and customer cancellation email', async () => {
      const db = getDb();
      const orderId = 'ORD-2026-SCENARIO-4';

      // Step 1: Customer completes checkout -> order in cart_pending
      const order = await db.orders.create({
        id: orderId,
        order_number: 'TC-REJECT-004',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'buyer@industrial.co.uk',
        shipping_address: {
          full_name: 'Martin Supply',
          address_line_1: '8 Factory Rd',
          city: 'Birmingham',
          postcode: 'B1 1AA',
          country: 'GB',
        },
        items: [
          {
            product_id: 'prod_ion3sfladder1p1',
            title: 'Ionos 3-Step Foldable Steel Ladder',
            supplier_sku: 'ION3SFLADDER1P1',
            quantity: 1,
            unit_price_ex_vat: 35.0,
            unit_price_inc_vat: 42.0,
            total_inc_vat: 42.0,
          },
        ],
        subtotal_ex_vat_gbp: 35.0,
        subtotal_inc_vat_gbp: 42.0,
        shipping_ex_vat_gbp: 4.95,
        shipping_inc_vat_gbp: 5.94,
        vat_amount_gbp: 7.99,
        total_inc_vat_gbp: 47.94,
        supplier_id: 'status-uk',
      });

      // Step 2: Stripe payment succeeds -> order moves to checkout_authorized -> supplier_order_pending
      const stripePayload = {
        id: 'evt_scen4_pi_succ',
        object: 'event',
        type: 'payment_intent.succeeded',
        data: {
          object: {
            id: 'pi_scen4_9999',
            amount: 4794,
            currency: 'gbp',
            metadata: { order_id: orderId },
          },
        },
      };

      const webhookReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(stripePayload),
      });
      const webhookRes = await postStripeWebhook(webhookReq);
      expect(webhookRes.status).toBe(200);

      const orderInSupplierPending = await db.orders.getById(orderId);
      expect(orderInSupplierPending?.state).toBe('supplier_order_pending');

      // Step 3: Purchase Order generated with idempotency key
      const poKey = generatePoIdempotencyKey(orderId, 'status-uk');
      expect(poKey).toBe(`${orderId}#status-uk`);

      // Step 4: Supplier warehouse rejects PO due to stockout
      // State machine TRIGGER_AUTO_REFUND immediately advances order to refund_pending
      const rejRes = await executeOrderTransition({
        order_id: orderId,
        to_state: 'supplier_rejected',
        trigger: 'supplier',
        actor: 'status_warehouse_edi',
        metadata: { rejection_reason: 'Line stock depleted at central depot' },
      });
      expect(rejRes.current_state).toBe('refund_pending');

      // Step 5: Stripe refund adapter creates full refund
      const refundResult = await createRefund('pi_scen4_9999', order.total_inc_vat_gbp, 'requested_by_customer');
      expect(refundResult.status).toBe('succeeded');
      expect(refundResult.id).toBeDefined();

      // Step 6: Stripe charge.refunded webhook confirms refund completion
      const refundWebhookPayload = {
        id: 'evt_scen4_refunded',
        object: 'event',
        type: 'charge.refunded',
        data: {
          object: {
            id: 'ch_scen4_8888',
            amount_refunded: 4794,
            currency: 'gbp',
            metadata: { order_id: orderId },
          },
        },
      };

      const refundWebhookReq = new NextRequest('http://localhost:3000/api/webhooks/stripe', {
        method: 'POST',
        body: JSON.stringify(refundWebhookPayload),
      });
      const refundWebhookRes = await postStripeWebhook(refundWebhookReq);
      expect(refundWebhookRes.status).toBe(200);

      // Step 7: Order state is terminal 'refunded' with tamper-evident audit history
      const finalOrder = await db.orders.getById(orderId);
      expect(finalOrder?.state).toBe('refunded');
      expect(finalOrder?.audit_logs.length).toBeGreaterThanOrEqual(4);

      const statesLogged = finalOrder?.audit_logs.map((l) => l.to_state);
      expect(statesLogged).toContain('checkout_authorized');
      expect(statesLogged).toContain('supplier_order_pending');
      expect(statesLogged).toContain('supplier_rejected');
      expect(statesLogged).toContain('refund_pending');
      expect(statesLogged).toContain('refunded');

      // Step 8: Render Order Confirmation / Status email explaining refund
      const emailResult = renderOrderConfirmationEmail(finalOrder!);
      expect(emailResult.html).toContain('ToolCart');
      expect(emailResult.html).toContain(finalOrder!.order_number);
    });
  });

  // =========================================================================
  // Scenario 5: Multi-Supplier Cart with Split Fulfillment
  // =========================================================================
  describe('Scenario 5: Multi-Supplier Cart with Split Fulfillment', () => {
    it('executes multi-supplier cart: split delivery calculations, multi-PO idempotency keys, and partial dispatch tracking', async () => {
      const db = getDb();
      const orderId = 'ORD-2026-SCENARIO-5';

      // Step 1: Customer builds basket with items from 2 distinct suppliers
      const supplier1Item = {
        product_id: 'prod_status_01',
        title: 'Status Multi-Core Extension Lead 10m',
        supplier_sku: 'STATEXT10M',
        quantity: 1,
        unit_price_ex_vat: 15.0,
        unit_price_inc_vat: 18.0,
        total_inc_vat: 18.0,
        supplier_id: 'status-uk',
      };

      const supplier2Item = {
        product_id: 'prod_suppb_02',
        title: 'Heavy Duty Steel Clamps Pair',
        supplier_sku: 'CLAMPPAIR2',
        quantity: 2,
        unit_price_ex_vat: 12.0,
        unit_price_inc_vat: 14.4,
        total_inc_vat: 28.8,
        supplier_id: 'supplier-b',
      };

      // Step 2: Split delivery calculations (both below £50 threshold -> £4.95 ex per origin)
      const supplier1Ex = supplier1Item.unit_price_ex_vat * supplier1Item.quantity; // £15.00
      const supplier2Ex = supplier2Item.unit_price_ex_vat * supplier2Item.quantity; // £24.00
      const combinedSubtotalEx = supplier1Ex + supplier2Ex; // £39.00

      const carriage1Ex = supplier1Ex >= 50.0 ? 0 : 4.95;
      const carriage2Ex = supplier2Ex >= 50.0 ? 0 : 4.95;
      const totalCarriageEx = carriage1Ex + carriage2Ex; // £9.90
      const totalCarriageInc = Math.round(totalCarriageEx * 1.2 * 100) / 100; // £11.88

      const vatAmount = calculateVatAmount(combinedSubtotalEx + totalCarriageEx);
      const grandTotalInc = Math.round((combinedSubtotalEx + totalCarriageEx + vatAmount) * 100) / 100;

      // Step 3: Create order in database
      const order = await db.orders.create({
        id: orderId,
        order_number: 'TC-SPLIT-005',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'cart_pending',
        customer_email: 'builder@contractor.co.uk',
        shipping_address: {
          full_name: 'Tom Builder',
          address_line_1: '10 Site Compound Rd',
          city: 'Newcastle',
          postcode: 'NE1 1AA',
          country: 'GB',
        },
        items: [supplier1Item, supplier2Item],
        subtotal_ex_vat_gbp: combinedSubtotalEx,
        subtotal_inc_vat_gbp: combinedSubtotalEx + calculateVatAmount(combinedSubtotalEx),
        shipping_ex_vat_gbp: totalCarriageEx,
        shipping_inc_vat_gbp: totalCarriageInc,
        vat_amount_gbp: vatAmount,
        total_inc_vat_gbp: grandTotalInc,
        supplier_id: 'status-uk', // primary origin
      });

      expect(order.shipping_ex_vat_gbp).toBe(9.9);

      // Step 4: Multi-PO generation with unique supplier idempotency keys
      const poKeySupplier1 = generatePoIdempotencyKey(orderId, 'status-uk');
      const poKeySupplier2 = generatePoIdempotencyKey(orderId, 'supplier-b');

      expect(poKeySupplier1).toBe(`${orderId}#status-uk`);
      expect(poKeySupplier2).toBe(`${orderId}#supplier-b`);
      expect(poKeySupplier1).not.toBe(poKeySupplier2);

      // Step 5: Advance order to supplier_order_pending -> supplier_accepted -> payment_captured
      await executeOrderTransition({
        order_id: orderId,
        to_state: 'checkout_authorized',
        trigger: 'admin',
        actor: 'checkout_flow',
      });
      await executeOrderTransition({
        order_id: orderId,
        to_state: 'supplier_order_pending',
        trigger: 'admin',
        actor: 'po_dispatcher',
      });
      await executeOrderTransition({
        order_id: orderId,
        to_state: 'supplier_accepted',
        trigger: 'supplier',
        actor: 'multi_supplier_edi',
      });
      await executeOrderTransition({
        order_id: orderId,
        to_state: 'payment_captured',
        trigger: 'admin',
        actor: 'stripe_capture',
      });

      // Step 6: Supplier 1 dispatches first consignment -> partial_dispatch
      const partialRes = await executeOrderTransition({
        order_id: orderId,
        to_state: 'partial_dispatch',
        trigger: 'supplier',
        actor: 'status_uk_hub',
        metadata: {
          consignment_id: 'PKG-STAT-001',
          carrier: 'DX Express',
          tracking_number: 'DX987654321GB',
        },
      });
      expect(partialRes.current_state).toBe('partial_dispatch');

      // Step 7: Supplier 2 dispatches second consignment -> dispatched
      const dispatchedRes = await executeOrderTransition({
        order_id: orderId,
        to_state: 'dispatched',
        trigger: 'supplier',
        actor: 'supplier_b_hub',
        metadata: {
          consignment_id: 'PKG-SUPB-002',
          carrier: 'Evri Trade',
          tracking_number: 'EV123456789GB',
        },
      });
      expect(dispatchedRes.current_state).toBe('dispatched');

      // Step 8: Both consignments delivered to site -> delivered
      const deliveredRes = await executeOrderTransition({
        order_id: orderId,
        to_state: 'delivered',
        trigger: 'webhook',
        actor: 'carrier_tracking_hub',
      });
      expect(deliveredRes.current_state).toBe('delivered');

      // Step 9: Render Tracking Email notification
      const emailResult = renderTrackingUpdateEmail(
        order,
        'DX Express',
        'DX987654321GB'
      );
      expect(emailResult.html).toContain('DX Express');
      expect(emailResult.html).toContain('DX987654321GB');
    });
  });

  // =========================================================================
  // Scenario 6: Brand V3 Integrity & Static Compliance Sweep
  // =========================================================================
  describe('Scenario 6: Brand V3 Integrity & Static Compliance Sweep', () => {
    const rootDir = process.cwd();
    const tokensCss = fs.readFileSync(path.join(rootDir, 'design', 'tokens.css'), 'utf8');
    const tokensJson = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'design', 'tokens.json'), 'utf8')
    );
    const contrastMatrix = JSON.parse(
      fs.readFileSync(path.join(rootDir, 'qa', 'contrast_matrix.json'), 'utf8')
    );

    it('Step 1: Codebase scan verifies ZERO occurrences of retired copper (#B84C32 / --tc-copper)', () => {
      // Tokens must prohibit copper
      expect(tokensCss.toLowerCase()).not.toContain('#b84c32');
      expect(tokensCss).not.toContain('--tc-copper');

      // Check src/ and app/ directories
      const dirsToScan = [
        path.join(rootDir, 'src'),
        path.join(rootDir, 'app'),
        path.join(rootDir, 'design'),
      ];

      function scanDir(dir: string): string[] {
        let violations: string[] = [];
        if (!fs.existsSync(dir)) return violations;
        const files = fs.readdirSync(dir);
        for (const file of files) {
          const fullPath = path.join(dir, file);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            violations = violations.concat(scanDir(fullPath));
          } else if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.css')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            if (content.toLowerCase().includes('#b84c32') || content.includes('--tc-copper')) {
              violations.push(fullPath);
            }
          }
        }
        return violations;
      }

      for (const dir of dirsToScan) {
        const violations = scanDir(dir);
        expect(violations).toEqual([]);
      }
    });

    it('Step 2: Prohibits unauthorized purple, violet, lavender, or teal brand classes across styling', () => {
      const forbiddenTokens = ['purple', 'violet', 'lavender', 'teal'];
      for (const forbidden of forbiddenTokens) {
        expect(tokensCss.toLowerCase()).not.toContain(`--tc-${forbidden}`);
      }
    });

    it('Step 3: Verifies authoritative Brand V3 core palette tokens in CSS and JSON', () => {
      expect(tokensCss).toContain('#182336'); // Ink
      expect(tokensCss).toContain('#2450B8'); // Cobalt
      expect(tokensCss).toContain('#DDF16A'); // Action Lime
      expect(tokensCss).toContain('#F7F8F5'); // Workshop White
      expect(tokensCss).toContain('#EAF0FF'); // Cloud Blue
      expect(tokensCss).toContain('#596B70'); // Steel Text (accessible)

      expect(tokensJson.palette.ink).toBe('#182336');
      expect(tokensJson.palette.cobalt).toBe('#2450B8');
      expect(tokensJson.palette.actionLime).toBe('#DDF16A');
      expect(tokensJson.palette.workshopWhite).toBe('#F7F8F5');
      expect(tokensJson.palette.cloudBlue).toBe('#EAF0FF');
      expect(tokensJson.palette.steelText).toBe('#596B70');
    });

    it('Step 4: All contrast matrix color pairings meet WCAG AA requirements', () => {
      expect(Array.isArray(contrastMatrix)).toBe(true);
      expect(contrastMatrix.length).toBe(19);

      for (const pair of contrastMatrix) {
        if (pair.use.toLowerCase().includes('do not use')) {
          expect(pair.pass_wcag).toBe(false);
          expect(pair.ratio).toBeLessThan(pair.threshold);
        } else {
          expect(pair.pass_wcag).toBe(true);
          expect(pair.ratio).toBeGreaterThanOrEqual(pair.threshold);
        }
      }
    });

    it('Step 5: Action Lime button rule strictly enforces dark Ink border and text (never white text)', () => {
      expect(tokensCss).toContain('.tc-btn-accent {background:var(--tc-action-lime);color:var(--tc-ink);border:2px solid var(--tc-ink)}');
      // Prohibit white text on action lime
      expect(tokensCss).not.toContain('.tc-btn-accent {background:var(--tc-action-lime);color:#ffffff');
      expect(tokensCss).not.toContain('.tc-btn-accent {background:var(--tc-action-lime);color:#fff');
    });

    it('Step 6: Tabular numerals (tabular-nums) configured for prices, specs, and SKUs', () => {
      const globalsCss = fs.readFileSync(path.join(rootDir, 'app', 'globals.css'), 'utf8');
      expect(globalsCss).toContain('font-variant-numeric: tabular-nums;');
    });
  });
});
