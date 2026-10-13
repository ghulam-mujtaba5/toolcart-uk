/**
 * UK VAT & Retail Margin Calculation Utilities
 * Enforces strict integer-pence rounding to avoid JavaScript floating point errors.
 */

export const UK_VAT_RATE = 0.20;

/**
 * Calculates retail price ex. VAT based on server-side wholesale cost tiers.
 * - Wholesale cost < £1.00: 2.20x markup (ensures healthy retail margin on low-cost consumables)
 * - Wholesale cost £1.00 - £3.00: 1.85x markup
 * - Wholesale cost > £3.00: 1.65x markup
 */
export function calculateRetailPrices(unitCostExVatGbp: number): {
  retail_price_ex_vat_gbp: number;
  retail_price_inc_vat_gbp: number;
} {
  const cost = Number(unitCostExVatGbp);
  let markupMultiplier: number;

  if (cost < 1.0) {
    markupMultiplier = 2.2;
  } else if (cost <= 3.0) {
    markupMultiplier = 1.85;
  } else {
    markupMultiplier = 1.65;
  }

  // Calculate ex VAT price rounded to 2 decimal places
  const retailExVatPence = Math.round(cost * markupMultiplier * 100);
  const retail_price_ex_vat_gbp = retailExVatPence / 100;

  // Calculate inc VAT price rounded to 2 decimal places
  const retailIncVatPence = Math.round(retail_price_ex_vat_gbp * (1 + UK_VAT_RATE) * 100);
  const retail_price_inc_vat_gbp = retailIncVatPence / 100;

  return {
    retail_price_ex_vat_gbp,
    retail_price_inc_vat_gbp,
  };
}

/**
 * Calculates UK VAT amount with integer-pence precision.
 */
export function calculateVatAmount(netAmountGbp: number): number {
  const netPence = Math.round(netAmountGbp * 100);
  const vatPence = Math.round(netPence * UK_VAT_RATE);
  return vatPence / 100;
}

/**
 * Formats GBP currency string with tabular numerals
 */
export function formatGbp(amount: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
