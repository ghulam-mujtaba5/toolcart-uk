/**
 * Unicode ligature normalization and text sanitation for UK hardware catalog feeds.
 * Normalizes common typography ligatures:
 * - \ufb01 (Latin Small Ligature fi) -> 'fi'
 * - \ufb02 (Latin Small Ligature fl) -> 'fl'
 * - \u00d8 (Latin Capital Letter O with Stroke / Diameter symbol) -> 'Ø'
 */

export function normalizeUnicode(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .replace(/\ufb01/g, 'fi')
    .replace(/\ufb02/g, 'fl')
    .replace(/\u00d8/g, 'Ø')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .trim();
}

/**
 * Creates a URL-friendly slug from title and SKU
 */
export function generateProductSlug(title: string, sku: string): string {
  const cleanTitle = normalizeUnicode(title)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const cleanSku = sku.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return cleanTitle ? `${cleanTitle}-${cleanSku}` : cleanSku;
}

/**
 * Extracts the core product title from supplier description strings,
 * stripping leading brand names (e.g. "IONOS - ") or dimension/measurement prefixes
 * (e.g. "10 Mtr - Status - ") so slugs reflect the actual product.
 */
export function extractCleanProductTitle(description: string): string {
  const normalized = normalizeUnicode(description);
  const parts = normalized.split(/\s+-\s+/);
  if (parts.length <= 1) return normalized;

  // Case 1: Brand prefix at start, e.g. "IONOS - 3 step foldable ladder..."
  if (/^(?:ionos|status)$/i.test(parts[0].trim())) {
    return parts[1] ? parts[1].trim() : parts[0].trim();
  }

  // Case 2: Dimension / length prefix followed by brand, e.g. "10 Mtr - Status - PVC Electrical Tape..."
  if (/^\d+\s*(?:mtr|m|mm|cm|ft|inch|mtrs)\b/i.test(parts[0].trim())) {
    if (parts.length >= 3 && /^(?:ionos|status)$/i.test(parts[1].trim())) {
      return parts[2] ? parts[2].trim() : parts[1].trim();
    }
    if (parts.length >= 2) {
      return parts[1].trim();
    }
  }

  // Default: first segment before hyphens
  return parts[0].trim();
}

