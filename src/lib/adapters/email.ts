import { Resend } from 'resend';
import { OrderRecord } from '@/types/order';

const apiKey = process.env.RESEND_API_KEY || '';
const defaultSender = process.env.RESEND_FROM_EMAIL || 'ToolCart UK <onboarding@resend.dev>';
const adminRecipient = process.env.ADMIN_NOTIFICATION_EMAIL || 'toolcartuk@gmail.com';

export function isResendConfigured(): boolean {
  if (!apiKey || apiKey.startsWith('mock_') || apiKey.startsWith('re_mock')) {
    return false;
  }
  return apiKey.length > 10;
}

let resendClientInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!isResendConfigured()) return null;
  if (!resendClientInstance) {
    resendClientInstance = new Resend(apiKey);
  }
  return resendClientInstance;
}

export interface SendEmailResult {
  id: string;
  success: boolean;
  mock: boolean;
}

// ============================================================================
// Brand V3 Email Layout Helpers (Strict Palette Enforcement)
// Primary: Cobalt #2450B8 | Accent: Action Lime #DDF16A (Ink text #182336)
// Header/Text: Ink #182336 | Canvas: Workshop White #F7F8F5 | Card: #FFFFFF
// Prohibited: Retired copper, purple, violet, teal
// ============================================================================

function wrapEmailTemplate(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F7F8F5; font-family: 'IBM Plex Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #182336; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F7F8F5; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
          <!-- Header Bar: Ink #182336 with Cobalt #2450B8 bottom line -->
          <tr>
            <td style="background-color: #182336; padding: 24px 32px; border-bottom: 3px solid #2450B8;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td>
                    <span style="font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.5px;">
                      ToolCart<span style="color: #DDF16A;">.co.uk</span>
                    </span>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; padding: 4px 10px; background-color: #2450B8; color: #FFFFFF; font-size: 11px; font-weight: 700; border-radius: 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                      UK Trade &amp; DIY
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 32px;">
              ${bodyContent}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color: #F7F8F5; padding: 24px 32px; border-top: 1px solid #E2E8F0; text-align: center; font-size: 12px; color: #596B70; line-height: 1.5;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #182336;">ToolCart UK • Direct Supplier Network Fulfilment</p>
              <p style="margin: 0 0 8px 0;">Customer Support: <a href="mailto:orders@toolcart.co.uk" style="color: #2450B8; text-decoration: none;">orders@toolcart.co.uk</a></p>
              <p style="margin: 0; font-size: 11px; color: #596B70;">Prices displayed in GBP. Registered for UK VAT (20% standard rate).</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// 1. Order Confirmation Email
export function renderOrderConfirmationEmail(order: OrderRecord): { html: string; text: string } {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #182336;">
          <strong>${item.title}</strong><br>
          <span style="font-size: 11px; color: #596B70; font-family: monospace;">SKU: ${item.supplier_sku}</span>
        </td>
        <td align="center" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; color: #182336; font-family: monospace;">
          ${item.quantity}
        </td>
        <td align="right" style="padding: 12px 0; border-bottom: 1px solid #F1F5F9; font-size: 13px; font-weight: 600; color: #182336; font-family: monospace;">
          £${item.total_inc_vat.toFixed(2)}
        </td>
      </tr>`
    )
    .join('');

  const bodyContent = `
    <h1 style="margin: 0 0 8px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
      Order Confirmed: ${order.order_number}
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70;">
      Thank you for your order with ToolCart UK. Your order has been authorized and queued for supplier confirmation and direct dispatch.
    </p>

    <!-- Destination Card -->
    <div style="background-color: #EAF0FF; border: 1px solid #C8D9F9; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Delivery Address &amp; SLA</span>
      <p style="margin: 8px 0 0 0; font-size: 13px; color: #182336; line-height: 1.4;">
        <strong>${order.shipping_address.full_name}</strong><br>
        ${order.shipping_address.company_name ? `${order.shipping_address.company_name}<br>` : ''}
        ${order.shipping_address.address_line_1}<br>
        ${order.shipping_address.city}, ${order.shipping_address.postcode}<br>
        <span style="font-size: 12px; color: #596B70;">Standard UK Mainland Carriage (2–3 business days)</span>
      </p>
    </div>

    <!-- Items Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 24px;">
      <thead>
        <tr style="border-bottom: 2px solid #182336; text-align: left; font-size: 12px; text-transform: uppercase; color: #596B70;">
          <th style="padding-bottom: 8px;">Item Description</th>
          <th align="center" style="padding-bottom: 8px;">Qty</th>
          <th align="right" style="padding-bottom: 8px;">Total (inc. VAT)</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <!-- VAT Breakdown -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom: 32px; font-size: 13px; color: #182336;">
      <tr>
        <td style="padding: 4px 0; color: #596B70;">Subtotal (ex. VAT):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.subtotal_ex_vat_gbp.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #596B70;">UK VAT (20.0%):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.vat_amount_gbp.toFixed(2)}</td>
      </tr>
      <tr>
        <td style="padding: 4px 0; color: #596B70;">Carriage (inc. VAT):</td>
        <td align="right" style="padding: 4px 0; font-family: monospace;">£${order.shipping_inc_vat_gbp.toFixed(2)}</td>
      </tr>
      <tr style="border-top: 2px solid #182336; font-size: 16px; font-weight: 800;">
        <td style="padding-top: 12px;">Total Authorized:</td>
        <td align="right" style="padding-top: 12px; font-family: monospace;">£${order.total_inc_vat_gbp.toFixed(2)}</td>
      </tr>
    </table>

    <!-- CTA Button: Action Lime with Ink text and 2px border -->
    <div style="text-align: center; margin-bottom: 16px;">
      <a href="https://toolcart.co.uk/account/orders/${order.id}" style="display: inline-block; padding: 14px 28px; background-color: #DDF16A; color: #182336; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 8px; border: 2px solid #182336;">
        Track Order Status &rarr;
      </a>
    </div>
  `;

  const html = wrapEmailTemplate(`Order Confirmed: ${order.order_number}`, bodyContent);
  const text = `ToolCart UK - Order Confirmed: ${order.order_number}\n\nTotal: £${order.total_inc_vat_gbp.toFixed(2)} inc. VAT\nDelivery to: ${order.shipping_address.full_name}, ${order.shipping_address.postcode}\nTrack online: https://toolcart.co.uk/account/orders/${order.id}`;

  return { html, text };
}

// 2. Supplier Purchase Order Email
export function renderSupplierPurchaseOrderEmail(
  order: OrderRecord,
  poKey: string
): { html: string; text: string } {
  const lineItems = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 8px; border: 1px solid #CBD5E1; font-family: monospace; font-size: 12px;">${item.supplier_sku}</td>
        <td style="padding: 8px; border: 1px solid #CBD5E1; font-size: 12px;">${item.title}</td>
        <td align="center" style="padding: 8px; border: 1px solid #CBD5E1; font-weight: bold; font-family: monospace;">${item.quantity}</td>
      </tr>`
    )
    .join('');

  const bodyContent = `
    <div style="border-left: 4px solid #2450B8; padding-left: 16px; margin-bottom: 20px;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Direct Dispatch Purchase Order</span>
      <h1 style="margin: 4px 0 0 0; font-family: 'Manrope', sans-serif; font-size: 20px; font-weight: 800; color: #182336;">
        PO Reference: ${poKey}
      </h1>
    </div>

    <p style="font-size: 13px; color: #252D30; line-height: 1.5; margin-bottom: 20px;">
      Please fulfill the following items under our agreed direct customer dispatch terms. Plain packaging required with enclosed packing slip.
    </p>

    <!-- Delivery Destination -->
    <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 6px; padding: 14px; margin-bottom: 20px; font-size: 12px;">
      <strong style="color: #182336;">Dispatch Destination:</strong><br>
      ${order.shipping_address.full_name}<br>
      ${order.shipping_address.address_line_1}<br>
      ${order.shipping_address.city}, ${order.shipping_address.postcode}<br>
      Contact: ${order.shipping_address.phone || 'N/A'}
    </div>

    <!-- PO Table -->
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-collapse: collapse; margin-bottom: 24px;">
      <thead>
        <tr style="background-color: #182336; color: #FFFFFF; font-size: 11px; text-transform: uppercase;">
          <th style="padding: 8px; border: 1px solid #182336;">Supplier SKU</th>
          <th style="padding: 8px; border: 1px solid #182336; text-align: left;">Description</th>
          <th style="padding: 8px; border: 1px solid #182336;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${lineItems}
      </tbody>
    </table>

    <p style="font-size: 12px; color: #596B70; line-height: 1.4;">
      Please provide courier tracking reference upon dispatch to <a href="mailto:ops@toolcart.co.uk" style="color: #2450B8;">ops@toolcart.co.uk</a>.
    </p>
  `;

  const html = wrapEmailTemplate(`PO: ${poKey} - ToolCart UK`, bodyContent);
  const text = `PURCHASE ORDER: ${poKey}\n\nDestination: ${order.shipping_address.full_name}, ${order.shipping_address.postcode}\nItems: ${order.items.map((i) => `${i.supplier_sku} x ${i.quantity}`).join(', ')}`;
  return { html, text };
}

// 3. Tracking Update Email
export function renderTrackingUpdateEmail(
  order: OrderRecord,
  carrier: string,
  trackingNumber: string
): { html: string; text: string } {
  const bodyContent = `
    <h1 style="margin: 0 0 8px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
      Your Order Has Been Dispatched!
    </h1>
    <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70;">
      Order ${order.order_number} has departed the fulfilment warehouse and is in transit.
    </p>

    <!-- Tracking Card -->
    <div style="background-color: #EAF0FF; border: 1px solid #C8D9F9; border-radius: 8px; padding: 20px; margin-bottom: 28px; text-align: center;">
      <span style="font-size: 11px; font-weight: 700; color: #2450B8; text-transform: uppercase;">Carrier Consignment</span>
      <h2 style="margin: 6px 0; font-family: monospace; font-size: 20px; font-weight: 800; color: #182336;">
        ${trackingNumber}
      </h2>
      <p style="margin: 0 0 16px 0; font-size: 13px; color: #596B70;">Carrier: <strong>${carrier}</strong></p>

      <a href="https://toolcart.co.uk/account/orders/${order.id}" style="display: inline-block; padding: 12px 24px; background-color: #DDF16A; color: #182336; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 13px; text-decoration: none; border-radius: 6px; border: 2px solid #182336;">
        View Live Tracking Timeline &rarr;
      </a>
    </div>

    <p style="font-size: 12px; color: #596B70; line-height: 1.5;">
      Estimated delivery within 24–48 hours. If you have any questions, reach out to our team at <a href="mailto:orders@toolcart.co.uk" style="color: #2450B8;">orders@toolcart.co.uk</a>.
    </p>
  `;

  const html = wrapEmailTemplate(`Dispatched: ${order.order_number} (${carrier})`, bodyContent);
  const text = `Order ${order.order_number} Dispatched via ${carrier}\nTracking: ${trackingNumber}\nTrack: https://toolcart.co.uk/account/orders/${order.id}`;
  return { html, text };
}

// 4. Trade Application Decision Email
export function renderTradeApplicationDecisionEmail(
  companyName: string,
  decision: 'approved' | 'rejected',
  creditLimitGbp: number = 500,
  tier: string = 'tier_1_5pct'
): { html: string; text: string } {
  const isApproved = decision === 'approved';
  const discountPct = tier === 'tier_2_10pct' ? '10%' : '5%';

  const bodyContent = isApproved
    ? `
      <div style="display: inline-block; padding: 4px 10px; background-color: #DDF16A; color: #182336; font-size: 11px; font-weight: 800; border-radius: 4px; border: 1px solid #182336; margin-bottom: 12px;">
        APPLICATION APPROVED
      </div>
      <h1 style="margin: 0 0 12px 0; font-family: 'Manrope', sans-serif; font-size: 24px; font-weight: 800; color: #182336;">
        Welcome to ToolCart Trade, ${companyName}
      </h1>
      <p style="margin: 0 0 24px 0; font-size: 14px; color: #596B70; line-height: 1.5;">
        Your commercial trade account has been approved. You now have access to trade pricing, automated VAT invoices, and 30-day settlement terms.
      </p>

      <div style="background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 24px; font-size: 13px;">
        <div style="margin-bottom: 8px;"><strong>Approved Credit Limit:</strong> <span style="font-family: monospace; font-size: 15px; color: #2450B8;">£${creditLimitGbp.toFixed(2)}</span></div>
        <div><strong>Trade Discount Tier:</strong> <span style="font-weight: 700; color: #182336;">${discountPct} off trade lines</span></div>
      </div>

      <div style="text-align: center;">
        <a href="https://toolcart.co.uk/trade" style="display: inline-block; padding: 14px 28px; background-color: #2450B8; color: #FFFFFF; font-family: 'Manrope', sans-serif; font-weight: 800; font-size: 14px; text-decoration: none; border-radius: 8px;">
          Access Trade Portal &rarr;
        </a>
      </div>
    `
    : `
      <h1 style="margin: 0 0 12px 0; font-family: 'Manrope', sans-serif; font-size: 22px; font-weight: 800; color: #182336;">
        Trade Application Update: ${companyName}
      </h1>
      <p style="margin: 0 0 16px 0; font-size: 14px; color: #252D30; line-height: 1.5;">
        Thank you for applying for a ToolCart commercial credit account. Following initial review, we are unable to extend credit terms at this time.
      </p>
      <p style="margin: 0 0 24px 0; font-size: 13px; color: #596B70; line-height: 1.5;">
        You can still place orders via standard card payment with automated VAT invoices provided upon dispatch. If you have updated Companies House or trading accounts, please reply to this email.
      </p>
    `;

  const html = wrapEmailTemplate(`Trade Application: ${companyName}`, bodyContent);
  const text = isApproved
    ? `Welcome to ToolCart Trade, ${companyName}! Your trade credit limit is £${creditLimitGbp.toFixed(2)}.`
    : `ToolCart Trade update for ${companyName}: Application status not approved for credit terms.`;
  return { html, text };
}

// Delivery Function with Console/Mock Fallback
export async function sendEmail(
  to: string,
  subject: string,
  html: string,
  text: string
): Promise<SendEmailResult> {
  if (!isResendConfigured()) {
    console.log(`[Resend Mock Email] To: ${to} | Subject: "${subject}"`);
    return { id: `mock_email_${Date.now()}`, success: true, mock: true };
  }

  try {
    const client = getResend();
    if (!client) {
      return { id: `mock_email_${Date.now()}`, success: true, mock: true };
    }
    const data = await client.emails.send({
      from: defaultSender,
      to,
      subject,
      html,
      text,
    });
    return { id: data.data?.id || `msg_${Date.now()}`, success: true, mock: false };
  } catch (error) {
    console.error('[Resend Error]', error);
    return { id: `failed_${Date.now()}`, success: false, mock: false };
  }
}
