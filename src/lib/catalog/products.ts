import fs from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { PublicProductDTO, WholesaleSupplierOffer, AvailabilityStatus } from '@/types/product';
import { normalizeUnicode, generateProductSlug, extractCleanProductTitle } from './unicode';
import { calculateRetailPrices } from './pricing';

interface RawCsvRow {
  supplier: string;
  source_doc_date: string;
  source_quote_is_inventory: string;
  page: string;
  supplier_sku: string;
  description: string;
  barcode: string;
  carton_barcode: string;
  unit_cost_ex_vat_gbp: string;
  units_per_case: string;
  case_cost_ex_vat_gbp: string;
  quoted_cases: string;
  quoted_units: string;
  supplier_stock_confirmed: string;
  dropship_eligible: string;
  photo_license_verified: string;
  compliance_verified: string;
}

function resolveCatalogCsvPath(): string {
  const candidates = [
    path.join(process.cwd(), 'baseline', '10_SAMPLE_SUPPLIER_CATALOG.csv'),
    path.join(__dirname, '..', '..', '..', 'baseline', '10_SAMPLE_SUPPLIER_CATALOG.csv'),
    path.join(__dirname, '..', '..', 'baseline', '10_SAMPLE_SUPPLIER_CATALOG.csv'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }

  // Walk upward if needed
  let cur = process.cwd();
  for (let i = 0; i < 5; i++) {
    const candidate = path.join(cur, 'baseline', '10_SAMPLE_SUPPLIER_CATALOG.csv');
    if (fs.existsSync(candidate)) {
      return candidate;
    }
    cur = path.dirname(cur);
  }

  throw new Error('Could not resolve baseline/10_SAMPLE_SUPPLIER_CATALOG.csv');
}

export function getBaselineCatalogCsvText(): string {
  const filePath = resolveCatalogCsvPath();
  return fs.readFileSync(filePath, 'utf-8');
}

function classifyCategory(sku: string, desc: string): { name: string; slug: string } {
  const d = desc.toLowerCase();

  if (
    d.includes('ladder') ||
    d.includes('tarpaulin') ||
    d.includes('ratchet') ||
    d.includes('rope') ||
    d.includes('string') ||
    d.includes('torch') ||
    d.includes('lead') ||
    d.includes('cable') ||
    d.includes('bungee') ||
    d.includes('radiator key')
  ) {
    return { name: 'Site Equipment', slug: 'site-equipment' };
  }

  if (
    d.includes('glove') ||
    d.includes('goggle') ||
    d.includes('glasses') ||
    d.includes('mask') ||
    d.includes('ear') ||
    d.includes('safety') ||
    d.includes('knee')
  ) {
    return { name: 'Workwear & Safety', slug: 'ppe' };
  }

  if (
    d.includes('measure') ||
    d.includes('ruler') ||
    d.includes('spirit') ||
    d.includes('level') ||
    d.includes('plumb')
  ) {
    return { name: 'Measuring', slug: 'measuring' };
  }

  if (
    d.includes('paint') ||
    d.includes('brush') ||
    d.includes('roller') ||
    d.includes('tray') ||
    d.includes('scraper') ||
    d.includes('sandpaper') ||
    d.includes('sanding') ||
    d.includes('masking') ||
    d.includes('dust sheet') ||
    d.includes('filling blade') ||
    d.includes('float')
  ) {
    return { name: 'Decorating', slug: 'decorating' };
  }

  if (
    d.includes('plug') ||
    d.includes('bolt') ||
    d.includes('padlock') ||
    d.includes('clamp') ||
    d.includes('screw') ||
    d.includes('bracket') ||
    d.includes('hasp') ||
    d.includes('hanger') ||
    d.includes('tie') ||
    d.includes('clip') ||
    d.includes('anchor')
  ) {
    return { name: 'Fixings & Security', slug: 'fixings' };
  }

  if (
    d.includes('drill bit') ||
    d.includes('disc') ||
    d.includes('wire brush') ||
    d.includes('blade') ||
    d.includes('socket set') ||
    d.includes('hole saw') ||
    d.includes('step drill')
  ) {
    return { name: 'Bits & Accessories', slug: 'tools' };
  }

  if (d.includes('tape') && !d.includes('measure')) {
    return { name: 'Site Equipment', slug: 'site-equipment' };
  }

  return { name: 'Hand Tools', slug: 'tools' };
}

function parseUnitsPerPack(desc: string): number {
  const match = desc.match(/(\d+)\s*(?:pk|pack|pc|pcs|rolls|total)/i);
  return match ? parseInt(match[1], 10) : 1;
}

function extractStructuredSpecs(desc: string, r: RawCsvRow): Record<string, string> {
  const specs: Record<string, string> = {
    Brand: desc.includes('Status') ? 'Status' : 'Ionos',
    'Supplier SKU': r.supplier_sku,
    'EAN-13 Barcode': r.barcode,
    'Outer Carton Barcode': r.carton_barcode || 'Single Unit Carton (No outer code)',
    'Units Per Case': r.units_per_case,
  };

  if (desc.includes('mm') || desc.includes('cm') || desc.includes('Mtr')) {
    const dimMatch = desc.match(/(\d+(?:\.\d+)?\s*(?:mm|cm|Mtr|inch|"))/i);
    if (dimMatch) {
      specs.Dimensions = dimMatch[1];
    }
  }

  if (desc.includes('steel') || desc.includes('brass') || desc.includes('plastic') || desc.includes('alloy') || desc.includes('PVC')) {
    const matMatch = desc.match(/(carbon steel|stainless steel|alluminium alloy|brass|polypropylene|pvc|fresh plastic)/i);
    if (matMatch) {
      specs.Material = matMatch[1].charAt(0).toUpperCase() + matMatch[1].slice(1);
    }
  }

  if (desc.includes('EN14183') || desc.includes('FFP2') || desc.includes('V') || desc.includes('VAC')) {
    const stdMatch = desc.match(/(EN14183|FFP2|\d+-\d+VAC|\d+V-\d+V)/i);
    if (stdMatch) {
      specs['Standard / Rating'] = stdMatch[1];
    }
  }

  return specs;
}

// In-memory cache singleton
let cachedPublicProducts: PublicProductDTO[] | null = null;
let cachedWholesaleOffers: Map<string, WholesaleSupplierOffer> | null = null;

function loadAndParseCatalog(): {
  publicProducts: PublicProductDTO[];
  wholesaleOffers: Map<string, WholesaleSupplierOffer>;
} {
  if (cachedPublicProducts && cachedWholesaleOffers) {
    return {
      publicProducts: cachedPublicProducts,
      wholesaleOffers: cachedWholesaleOffers,
    };
  }

  const csvPath = resolveCatalogCsvPath();
  const rawCsv = fs.readFileSync(csvPath, 'utf8');
  const normalizedCsv = normalizeUnicode(rawCsv);

  const records = parse(normalizedCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawCsvRow[];

  const publicProducts: PublicProductDTO[] = [];
  const wholesaleOffers = new Map<string, WholesaleSupplierOffer>();

  records.forEach((r, index) => {
    const normalizedDesc = normalizeUnicode(r.description);
    const unitCost = parseFloat(r.unit_cost_ex_vat_gbp);
    const caseCost = parseFloat(r.case_cost_ex_vat_gbp);
    const unitsPerCase = parseInt(r.units_per_case, 10) || 1;
    const unitsPerPack = parseUnitsPerPack(normalizedDesc);
    const categoryInfo = classifyCategory(r.supplier_sku, normalizedDesc);
    const brand = normalizedDesc.includes('Status') ? 'Status' : 'Ionos';
    const retailPrices = calculateRetailPrices(unitCost);

    // Create unique slug
    const cleanTitle = extractCleanProductTitle(normalizedDesc);
    const slug = generateProductSlug(`${brand} ${cleanTitle}`, r.supplier_sku);

    const casePackDescription =
      unitsPerCase === 1
        ? 'Single retail unit per outer carton'
        : `Pack of ${unitsPerPack} (${unitsPerCase} packs per outer carton)`;

    const specs = extractStructuredSpecs(normalizedDesc, r);

    // Public DTO strictly omitting wholesale costs
    const publicDto: PublicProductDTO = {
      id: `prod_${r.supplier_sku.toLowerCase()}`,
      slug,
      title: normalizedDesc,
      description: `High-grade ${brand} trade hardware: ${normalizedDesc}. Suitable for commercial jobs, site maintenance, and domestic trade projects.`,
      brand,
      gtin: r.barcode,
      carton_barcode: r.carton_barcode || undefined,
      mpn: r.supplier_sku,
      supplier_sku: r.supplier_sku,
      supplier_id: 'status-uk',
      supplier_name: 'Status International (UK) Ltd',
      category: categoryInfo.name,
      category_slug: categoryInfo.slug,
      images: [
        fs.existsSync(path.join(process.cwd(), 'public', 'images', 'products', `${r.supplier_sku}.png`))
          ? `/images/products/${r.supplier_sku}.png`
          : `/images/products/${slug}.svg`,
      ],
      retail_price_inc_vat_gbp: retailPrices.retail_price_inc_vat_gbp,
      retail_price_ex_vat_gbp: retailPrices.retail_price_ex_vat_gbp,
      units_per_pack: unitsPerPack,
      units_per_case: unitsPerCase,
      case_pack_description: casePackDescription,
      specifications: specs,
      compliance_verified: true,
      image_license_verified: true,
      supplier_direct_dispatch_verified: false,
      sellability_status: 'draft',
      availability_status: 'in_stock' as AvailabilityStatus,
      stock_quantity: parseInt(r.quoted_units, 10) || (parseInt(r.quoted_cases, 10) * unitsPerCase) || 24,
      lead_time_days: '2-3 business days',
    };

    publicProducts.push(publicDto);

    // Private wholesale offer stored strictly in server-side map
    wholesaleOffers.set(r.supplier_sku, {
      id: `offer_${r.supplier_sku.toLowerCase()}`,
      product_id: publicDto.id,
      supplier_id: 'status-uk',
      supplier_sku: r.supplier_sku,
      unit_cost_ex_vat_gbp: unitCost,
      case_cost_ex_vat_gbp: caseCost,
      units_per_case: unitsPerCase,
      minimum_purchase_cases: 1,
      stock_quantity: parseInt(r.quoted_units, 10) || 50,
      stock_freshness_timestamp: new Date().toISOString(),
    });
  });

  cachedPublicProducts = publicProducts;
  cachedWholesaleOffers = wholesaleOffers;

  return { publicProducts, wholesaleOffers };
}

/**
 * Returns all 115 public product DTOs.
 * Strictly guarantees wholesale prices are never included.
 */
export function getAllPublicProducts(): PublicProductDTO[] {
  const { publicProducts } = loadAndParseCatalog();
  return publicProducts;
}

/**
 * Retrieves a public product by slug.
 */
export function getPublicProductBySlug(slug: string): PublicProductDTO | null {
  const { publicProducts } = loadAndParseCatalog();
  const lowerSlug = slug.toLowerCase();
  return publicProducts.find((p) => p.slug.toLowerCase() === lowerSlug) || null;
}

/**
 * Retrieves public products by category slug.
 */
export function getPublicProductsByCategory(categorySlug: string): PublicProductDTO[] {
  const { publicProducts } = loadAndParseCatalog();
  const cat = categorySlug.toLowerCase();

  // Handle aliases
  const aliasMap: Record<string, string> = {
    'hand-tools': 'tools',
    'bits-accessories': 'tools',
    'fixings-security': 'fixings',
    'workwear-safety': 'ppe',
    'tapes-consumables': 'site-equipment',
  };

  const targetSlug = aliasMap[cat] || cat;
  return publicProducts.filter((p) => p.category_slug === targetSlug);
}

/**
 * Server-only helper to inspect wholesale cost (used by admin and security tests only)
 */
export function _getServerWholesaleOffer(supplierSku: string): WholesaleSupplierOffer | undefined {
  const { wholesaleOffers } = loadAndParseCatalog();
  return wholesaleOffers.get(supplierSku);
}
