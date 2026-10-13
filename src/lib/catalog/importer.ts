import { parse } from 'csv-parse/sync';
import { normalizeUnicode, generateProductSlug, extractCleanProductTitle } from './unicode';
import { calculateRetailPrices } from './pricing';
import { ProductContractSchema, ProductContractRecord } from './contract-schema';
import { PublicProductDTO, WholesaleSupplierOffer } from '@/types/product';
import { getDb } from '@/lib/db';

export interface RawCsvImportRow {
  supplier?: string;
  supplier_sku?: string;
  merchant_sku?: string;
  barcode?: string;
  gtin?: string;
  carton_barcode?: string;
  mpn?: string;
  title?: string;
  description?: string;
  unit_cost_ex_vat_gbp?: string;
  units_per_case?: string;
  case_cost_ex_vat_gbp?: string;
  quoted_units?: string;
  [key: string]: string | undefined;
}

export interface RowValidationResult {
  row_number: number;
  supplier_sku: string;
  title: string;
  status: 'PASS' | 'FAIL';
  errors: string[];
  unit_cost_ex_vat_gbp: number;
  units_per_case: number;
  expected_case_cost: number;
  actual_case_cost: number;
  carton_barcode?: string;
  parsed_record?: ProductContractRecord;
}

export interface ImportBatchReport {
  total_rows: number;
  passed_rows: number;
  failed_rows: number;
  dry_run: boolean;
  results: RowValidationResult[];
  imported_skus: string[];
}

export function validateCaseMath(
  unitCost: number,
  unitsPerCase: number,
  actualCaseCost: number
): {
  valid: boolean;
  expectedCaseCost: number;
} {
  const expectedCaseCost = Math.round(unitCost * unitsPerCase * 100) / 100;
  const diff = Math.abs(expectedCaseCost - actualCaseCost);
  return {
    valid: diff <= 0.009,
    expectedCaseCost,
  };
}

export function parseAndValidateCatalogCsv(
  csvContent: string,
  dryRun: boolean = true
): ImportBatchReport {
  const normalizedCsv = normalizeUnicode(csvContent);

  const rows = parse(normalizedCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as RawCsvImportRow[];

  const results: RowValidationResult[] = [];
  const importedSkus: string[] = [];

  rows.forEach((r, idx: number) => {
    const rowNumber = idx + 1;
    const errors: string[] = [];
    const normalizedDesc = normalizeUnicode(r.description || r.title || '');
    const unitCost = parseFloat(r.unit_cost_ex_vat_gbp || '0');
    const unitsPerCase = parseInt(r.units_per_case || '1', 10);
    const actualCaseCost = parseFloat(r.case_cost_ex_vat_gbp || '0');

    // Case Math Check
    const mathCheck = validateCaseMath(unitCost, unitsPerCase, actualCaseCost);
    if (!mathCheck.valid) {
      errors.push(
        `Case math mismatch: Unit £${unitCost.toFixed(2)} * ${unitsPerCase} units = Expected £${mathCheck.expectedCaseCost.toFixed(2)}, but supplier quoted £${actualCaseCost.toFixed(2)}`
      );
    }

    // Single-unit carton barcode handling:
    // If units_per_case === 1 and carton_barcode is empty, treat as null (valid single-unit item)
    const cartonBarcode = r.carton_barcode && r.carton_barcode.trim().length > 0 ? r.carton_barcode.trim() : null;

    // GTIN/barcode numeric validation: if provided, must be numeric digits (GTIN-8, 12, 13, 14)
    const rawBarcode = (r.barcode || r.gtin || '').trim();
    let gtinVal: string | null = rawBarcode.length > 0 ? rawBarcode : null;
    if (gtinVal && !/^\d+$/.test(gtinVal)) {
      errors.push(`Invalid barcode format: '${gtinVal}' must contain numeric digits only`);
    }

    const candidateRecord = {
      supplier_sku: r.supplier_sku || '',
      merchant_sku: r.merchant_sku || null,
      gtin: gtinVal,
      mpn: r.mpn || r.supplier_sku || null,
      title: normalizedDesc,
      description: r.description ? `High-grade trade hardware: ${normalizedDesc}` : null,
      supplier: r.supplier || 'Status International (UK) Ltd',
      unit_cost_ex_vat_gbp: isNaN(unitCost) ? -1 : unitCost,
      units_per_case: isNaN(unitsPerCase) ? 0 : unitsPerCase,
      minimum_purchase_cases: 1,
      retail_price_inc_vat_gbp: null,
      supplier_stock_qty: parseInt(r.quoted_units || '0', 10),
      stock_snapshot_at: null,
      weight_grams: null,
      dimensions_mm: null,
      image_license_verified: false,
      compliance_verified: false,
      supplier_direct_dispatch_verified: false,
      sellability_status: 'draft',
    };

    const schemaResult = ProductContractSchema.safeParse(candidateRecord);
    if (!schemaResult.success) {
      schemaResult.error.errors.forEach((e) => {
        errors.push(`${e.path.join('.')}: ${e.message}`);
      });
    }

    const passed = errors.length === 0;
    if (passed) {
      importedSkus.push(candidateRecord.supplier_sku);
    }

    results.push({
      row_number: rowNumber,
      supplier_sku: candidateRecord.supplier_sku,
      title: candidateRecord.title,
      status: passed ? 'PASS' : 'FAIL',
      errors,
      unit_cost_ex_vat_gbp: unitCost,
      units_per_case: unitsPerCase,
      expected_case_cost: mathCheck.expectedCaseCost,
      actual_case_cost: actualCaseCost,
      carton_barcode: cartonBarcode || undefined,
      parsed_record: passed ? schemaResult.data : undefined,
    });
  });

  const report: ImportBatchReport = {
    total_rows: rows.length,
    passed_rows: results.filter((r) => r.status === 'PASS').length,
    failed_rows: results.filter((r) => r.status === 'FAIL').length,
    dry_run: dryRun,
    results,
    imported_skus: importedSkus,
  };

  // If commit requested (dryRun === false), persist into database store
  if (!dryRun) {
    const db = getDb();
    results
      .filter((r) => r.status === 'PASS' && r.parsed_record)
      .forEach((r) => {
        const item = r.parsed_record!;
        const retailPrices = calculateRetailPrices(item.unit_cost_ex_vat_gbp);
        const brand = item.title.includes('Status') ? 'Status' : 'Ionos';
        const cleanTitle = extractCleanProductTitle(item.title);
        const slug = generateProductSlug(`${brand} ${cleanTitle}`, item.supplier_sku);

        const dto: PublicProductDTO = {
          id: `prod_${item.supplier_sku.toLowerCase()}`,
          slug,
          title: item.title,
          description: item.description || `High-grade trade hardware: ${item.title}`,
          brand,
          gtin: item.gtin || '',
          carton_barcode: r.carton_barcode || undefined,
          mpn: item.mpn || item.supplier_sku,
          supplier_sku: item.supplier_sku,
          supplier_id: 'status-uk',
          supplier_name: item.supplier,
          category: 'Hand Tools',
          category_slug: 'hand-tools',
          images: [`/images/products/${slug}.svg`],
          retail_price_inc_vat_gbp: retailPrices.retail_price_inc_vat_gbp,
          retail_price_ex_vat_gbp: retailPrices.retail_price_ex_vat_gbp,
          units_per_pack: 1,
          units_per_case: item.units_per_case,
          case_pack_description:
            item.units_per_case === 1
              ? 'Single retail unit per outer carton'
              : `Case of ${item.units_per_case} units`,
          specifications: {},
          compliance_verified: item.compliance_verified,
          image_license_verified: item.image_license_verified,
          supplier_direct_dispatch_verified: item.supplier_direct_dispatch_verified,
          sellability_status: item.sellability_status,
          availability_status: 'in_stock',
          lead_time_days: '2-3 business days',
        };

        const wholesaleOffer: WholesaleSupplierOffer = {
          id: `offer_${item.supplier_sku.toLowerCase()}`,
          product_id: dto.id,
          supplier_id: 'status-uk',
          supplier_sku: item.supplier_sku,
          unit_cost_ex_vat_gbp: item.unit_cost_ex_vat_gbp,
          case_cost_ex_vat_gbp: r.actual_case_cost,
          units_per_case: item.units_per_case,
          minimum_purchase_cases: item.minimum_purchase_cases || 1,
          stock_quantity: item.supplier_stock_qty || 0,
          stock_freshness_timestamp: new Date().toISOString(),
        };

        db.products.create(dto, wholesaleOffer);
      });
  }

  return report;
}
