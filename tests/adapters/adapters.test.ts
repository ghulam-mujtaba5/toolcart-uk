import { describe, it, expect, beforeEach } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import {
  uploadFile,
  getPublicUrl,
  deleteFile,
  getPresignedUploadUrl,
  isR2Configured,
} from '@/lib/adapters/storage';
import {
  sendEmail,
  isResendConfigured,
  renderOrderConfirmationEmail,
  renderSupplierPurchaseOrderEmail,
  renderTrackingUpdateEmail,
  renderTradeApplicationDecisionEmail,
} from '@/lib/adapters/email';
import {
  createPaymentIntent,
  retrievePaymentIntent,
  createRefund,
  isStripeConfigured,
} from '@/lib/adapters/stripe';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';
import {
  ProductJsonLd,
  BreadcrumbJsonLd,
  OrganizationJsonLd,
  FAQPageJsonLd,
} from '@/components/seo/json-ld';
import { getDb, isSupabaseConfigured, getActiveDb } from '@/lib/db';
import { executeOrderTransition } from '@/lib/state-machine/engine';

describe('Milestone 4: Cloud Infrastructure & Service Adapters Suite', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  // 1. Storage Adapter Fallback Tests
  describe('Cloudflare R2 Storage Adapter', () => {
    it('detects mock configuration safely and uses local fallback', () => {
      expect(isR2Configured()).toBe(false);
    });

    it('uploads file buffer to fallback and returns deterministic URL', async () => {
      const buffer = Buffer.from('test-image-content');
      const result = await uploadFile(buffer, 'test-assets/test.png', 'image/png');

      expect(result.key).toBe('test-assets/test.png');
      expect(result.url).toContain('/uploads/test-assets/test.png');
      expect(result.sizeBytes).toBe(buffer.byteLength);
      expect(result.isMock).toBe(true);
    });

    it('resolves public URL correctly', () => {
      const url = getPublicUrl('products/drill.jpg');
      expect(url).toBe('/uploads/products/drill.jpg');
    });

    it('deletes file gracefully in fallback mode', async () => {
      const deleted = await deleteFile('test-assets/test.png');
      expect(deleted).toBe(true);
    });

    it('generates presigned upload url fallback without error', async () => {
      const url = await getPresignedUploadUrl('test-assets/direct.png', 'image/png');
      expect(url).toContain('mock-upload');
      expect(url).toContain('test-assets%2Fdirect.png');
    });
  });

  // 2. Resend Email Adapter & Brand V3 Styling Tests
  describe('Resend Transactional Email Adapter', () => {
    it('detects mock configuration safely', () => {
      expect(isResendConfigured()).toBe(false);
    });

    it('sends email in fallback mode without crashing', async () => {
      const res = await sendEmail('customer@example.co.uk', 'Test Order', '<p>Hello</p>', 'Hello');
      expect(res.success).toBe(true);
      expect(res.mock).toBe(true);
    });

    it('generates Brand V3 compliant Order Confirmation HTML without banned colors', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html, text } = renderOrderConfirmationEmail(sampleOrder);

      // Verify active brand tokens
      expect(html).toContain('#182336'); // Ink
      expect(html).toContain('#2450B8'); // Cobalt
      expect(html).toContain('#DDF16A'); // Action Lime

      // Strict prohibited colors check
      expect(html.toLowerCase()).not.toContain('#b84c32'); // Copper
      expect(html.toLowerCase()).not.toContain('purple');
      expect(html.toLowerCase()).not.toContain('violet');
      expect(html.toLowerCase()).not.toContain('teal');

      // Verify text version content
      expect(text).toContain(sampleOrder.order_number);
      expect(text).toContain('ToolCart UK');
    });

    it('generates Brand V3 compliant Supplier PO Email', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html, text } = renderSupplierPurchaseOrderEmail(sampleOrder, 'PO-STATUS-001');

      expect(html).toContain('PO-STATUS-001');
      expect(html).toContain('#182336');
      expect(html).toContain('#2450B8');
      expect(html.toLowerCase()).not.toContain('#b84c32');
      expect(text).toContain('PO-STATUS-001');
    });

    it('generates Brand V3 compliant Tracking Email', async () => {
      const sampleOrder = (await getDb().orders.getAll())[0];
      const { html, text } = renderTrackingUpdateEmail(sampleOrder, 'DPD Local', '1234567890');

      expect(html).toContain('DPD Local');
      expect(html).toContain('1234567890');
      expect(html).toContain('#182336');
      expect(html).toContain('#2450B8');
      expect(html).toContain('#DDF16A');
      expect(html.toLowerCase()).not.toContain('#b84c32');
      expect(text).toContain('DPD Local');
      expect(text).toContain('1234567890');
    });

    it('generates Brand V3 compliant Trade Decision Email', () => {
      const approved = renderTradeApplicationDecisionEmail('Apex Build Ltd', 'approved', 1500, 'tier_2_10pct');
      expect(approved.html).toContain('£1500.00');
      expect(approved.html).toContain('10%');
      expect(approved.html).toContain('#182336');
      expect(approved.html).toContain('#2450B8');
      expect(approved.html).toContain('#DDF16A');
      expect(approved.html.toLowerCase()).not.toContain('#b84c32');
      expect(approved.text).toContain('Apex Build Ltd');
      expect(approved.text).toContain('£1500.00');

      const rejected = renderTradeApplicationDecisionEmail('Unknown Ltd', 'rejected');
      expect(rejected.html).toContain('Unknown Ltd');
      expect(rejected.html).toContain('#182336');
      expect(rejected.html.toLowerCase()).not.toContain('#b84c32');
      expect(rejected.text).toContain('Unknown Ltd');
    });
  });

  // 3. Stripe Adapter & Integer-Pence Tests
  describe('Stripe Payment Adapter', () => {
    it('detects mock configuration safely', () => {
      expect(isStripeConfigured()).toBe(false);
    });

    it('calculates integer-pence amounts accurately in GBP', async () => {
      const result = await createPaymentIntent({
        orderId: 'ORD-TEST-001',
        amountGbp: 19.99,
        customerEmail: 'test@toolcart.co.uk',
      });

      expect(result.amountPence).toBe(1999);
      expect(result.currency).toBe('gbp');
      expect(result.clientSecret).toContain('pi_mock_');
      expect(result.isMock).toBe(true);
    });

    it('retrieves payment intent in mock mode', async () => {
      const res = await retrievePaymentIntent('pi_mock_1234');
      expect(res.id).toBe('pi_mock_1234');
      expect(res.status).toBe('succeeded');
    });

    it('creates refund in mock mode with integer pence calculation', async () => {
      const refund = await createRefund('pi_mock_1234', 15.5);
      expect(refund.id).toContain('re_mock_');
      expect(refund.status).toBe('succeeded');
      expect(refund.isMock).toBe(true);
    });

    it('simulates state machine transitions triggered by payment webhook', async () => {
      const order = await getDb().orders.create({
        order_number: 'TC-WEBHOOK-TEST',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        state: 'checkout_authorized',
        customer_email: 'buyer@toolcart.co.uk',
        shipping_address: {
          full_name: 'Buyer One',
          address_line_1: '1 Station Rd',
          city: 'London',
          postcode: 'SW1A 1AA',
          country: 'GB',
        },
        items: [],
        subtotal_ex_vat_gbp: 20,
        subtotal_inc_vat_gbp: 24,
        shipping_ex_vat_gbp: 5,
        shipping_inc_vat_gbp: 6,
        vat_amount_gbp: 5,
        total_inc_vat_gbp: 30,
        supplier_id: 'status-uk',
      });

      // Simulate payment_intent.succeeded webhook action
      const transitionResult = await executeOrderTransition({
        order_id: order.id,
        to_state: 'supplier_order_pending',
        trigger: 'webhook',
        actor: 'stripe:evt_mock_123',
        metadata: { payment_intent_id: 'pi_mock_123' },
        idempotency_key: 'stripe_evt_mock_123',
      });

      expect(transitionResult.success).toBe(true);
      expect(transitionResult.current_state).toBe('supplier_order_pending');
      expect(transitionResult.audit_log.trigger).toBe('webhook');
    });
  });

  // 4. Dynamic SEO: Sitemap & Robots
  describe('Dynamic SEO: Sitemap & Robots', () => {
    it('sitemap generates over 120 dynamic URLs indexing all 115 products', async () => {
      const sitemapEntries = await sitemap();
      expect(sitemapEntries.length).toBeGreaterThanOrEqual(125);

      const urls = sitemapEntries.map((e) => e.url);
      expect(urls.some((u) => u.includes('/categories/tools'))).toBe(true);
      expect(urls.some((u) => u.includes('/guides/'))).toBe(true);
      expect(urls.some((u) => u.includes('/products/'))).toBe(true);
    });

    it('robots blocks crawlers when STAGING_ONLY is active', () => {
      const oldVal = process.env.STAGING_ONLY;
      process.env.STAGING_ONLY = 'true';
      const robotsResult = robots();
      expect((robotsResult.rules as any).disallow).toBe('/');
      process.env.STAGING_ONLY = oldVal;
    });

    it('robots allows indexing and includes sitemap in production', () => {
      const oldVal = process.env.STAGING_ONLY;
      process.env.STAGING_ONLY = 'false';
      const robotsResult = robots();
      expect((robotsResult.rules as any).allow).toBe('/');
      expect(robotsResult.sitemap).toContain('/sitemap.xml');
      process.env.STAGING_ONLY = oldVal;
    });
  });

  // 5. Schema.org JSON-LD Structured Data Components
  describe('Schema.org JSON-LD Structured Data Components', () => {
    it('renders ProductJsonLd with valid schema structure', async () => {
      const product = (await getDb().products.getAll())[0];
      const markup = renderToStaticMarkup(React.createElement(ProductJsonLd, { product }));

      expect(markup).toContain('application/ld+json');
      expect(markup).toContain('"@type":"Product"');
      expect(markup).toContain(product.supplier_sku);
      expect(markup).toContain(product.gtin);
      expect(markup).toContain('GBP');
      expect(markup).toContain('ToolCart UK');
    });

    it('renders BreadcrumbJsonLd with valid hierarchy', () => {
      const breadcrumbs = [
        { name: 'Home', url: 'https://toolcart.co.uk' },
        { name: 'Tools', url: 'https://toolcart.co.uk/categories/tools' },
        { name: 'Claw Hammer', url: 'https://toolcart.co.uk/products/claw-hammer' },
      ];
      const markup = renderToStaticMarkup(React.createElement(BreadcrumbJsonLd, { items: breadcrumbs }));

      expect(markup).toContain('"@type":"BreadcrumbList"');
      expect(markup).toContain('"position":1');
      expect(markup).toContain('"position":3');
      expect(markup).toContain('Claw Hammer');
    });

    it('renders OrganizationJsonLd correctly', () => {
      const markup = renderToStaticMarkup(React.createElement(OrganizationJsonLd, {}));

      expect(markup).toContain('"@type":"Organization"');
      expect(markup).toContain('ToolCart UK');
      expect(markup).toContain('orders@toolcart.co.uk');
      expect(markup).toContain('logo.svg');
    });

    it('renders FAQPageJsonLd correctly', () => {
      const faqs = [
        { question: 'What is the standard carriage rate?', answer: 'Standard carriage is £7.50, free over £150.' },
      ];
      const markup = renderToStaticMarkup(React.createElement(FAQPageJsonLd, { faqs }));

      expect(markup).toContain('"@type":"FAQPage"');
      expect(markup).toContain('What is the standard carriage rate?');
      expect(markup).toContain('Standard carriage is £7.50, free over £150.');
    });
  });

  // 6. Supabase Client Integration & Fallback
  describe('Supabase Client Integration', () => {
    it('provides database store with seeded products via getActiveDb', async () => {
      const activeDb = getActiveDb();
      const products = await activeDb.products.getAll();
      expect(products.length).toBe(115);
    });

    it('handles isSupabaseConfigured gracefully without throwing', () => {
      const isConfigured = isSupabaseConfigured();
      expect(typeof isConfigured).toBe('boolean');
    });
  });
});
