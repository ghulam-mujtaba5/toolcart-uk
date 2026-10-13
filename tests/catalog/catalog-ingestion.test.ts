import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseAndValidateCatalogCsv, validateCaseMath } from '@/lib/catalog/importer';
import { normalizeUnicode, generateProductSlug, extractCleanProductTitle } from '@/lib/catalog/unicode';
import { getAllPublicProducts, getBaselineCatalogCsvText } from '@/lib/catalog/products';
import { ProductContractSchema } from '@/lib/catalog/contract-schema';
import { getDb } from '@/lib/db';

describe('Catalog Ingestion & Contract Validation Suite', () => {
  const csvPath = path.join(process.cwd(), 'baseline', '10_SAMPLE_SUPPLIER_CATALOG.csv');
  const rawCsv = fs.readFileSync(csvPath, 'utf8');

  it('parses and validates all 115 quoted products from baseline CSV with 100% pass rate', () => {
    const report = parseAndValidateCatalogCsv(rawCsv, true);
    expect(report.total_rows).toBe(115);
    expect(report.passed_rows).toBe(115);
    expect(report.failed_rows).toBe(0);
    expect(report.imported_skus.length).toBe(115);
  });

  it('verifies strict case-vs-unit math calculation', () => {
    // Exact match
    const validMath = validateCaseMath(1.06, 6, 6.36);
    expect(validMath.valid).toBe(true);
    expect(validMath.expectedCaseCost).toBe(6.36);

    // Mismatched pricing
    const invalidMath = validateCaseMath(1.06, 6, 7.5);
    expect(invalidMath.valid).toBe(false);
    expect(invalidMath.expectedCaseCost).toBe(6.36);
  });

  it('flags case math errors in dry-run mode without crashing', () => {
    const corruptCsv = `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified
Status International (UK) Ltd,2026-10-09,NO,1,BADMATH01,Test Item Bad Math,5022822224834,05022822228559,2.00,10,25.00,1,10,UNVERIFIED,UNVERIFIED,UNVERIFIED,UNVERIFIED`;

    const report = parseAndValidateCatalogCsv(corruptCsv, true);
    expect(report.total_rows).toBe(1);
    expect(report.failed_rows).toBe(1);
    expect(report.results[0].errors[0]).toContain('Case math mismatch');
  });

  it('handles nullable carton barcode for single unit cartons (e.g. ION3SFLADDER1P1)', () => {
    const ladderRow = `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified
Status International (UK) Ltd,2026-10-09,NO,15,ION3SFLADDER1P1,IONOS - 3 step foldable ladder,5022822229709,,13.85,1,13.85,1,1,UNVERIFIED,UNVERIFIED,UNVERIFIED,UNVERIFIED`;

    const report = parseAndValidateCatalogCsv(ladderRow, true);
    expect(report.total_rows).toBe(1);
    expect(report.passed_rows).toBe(1);
    expect(report.failed_rows).toBe(0);
    expect(report.results[0].status).toBe('PASS');
  });

  it('normalizes Unicode ligatures fi (\\ufb01), fl (\\ufb02), and diameter Ø (\\u00d8)', () => {
    const raw = '4 pc Screwdriver set - \ufb02athead 6mm x 100mm, \ufb01lling blade, \u00d83x140mm';
    const normalized = normalizeUnicode(raw);
    expect(normalized).toBe('4 pc Screwdriver set - flathead 6mm x 100mm, filling blade, Ø3x140mm');
    expect(normalized).not.toContain('\ufb01');
    expect(normalized).not.toContain('\ufb02');
  });

  it('strictly validates records against ProductContractSchema and rejects invalid records', () => {
    const invalidRecord = {
      supplier_sku: '', // Min length 1 required
      title: 'Missing SKU Record',
      supplier: 'Status UK',
      unit_cost_ex_vat_gbp: -5, // Negative number
      units_per_case: 0, // Must be >= 1
      sellability_status: 'invalid_status', // Not in enum
    };

    const res = ProductContractSchema.safeParse(invalidRecord);
    expect(res.success).toBe(false);
  });

  it('extracts clean product titles from brand-prefixed and dimension-prefixed descriptions', () => {
    // Brand prefix at start
    expect(
      extractCleanProductTitle('IONOS - 3 step foldable ladder - steel + plastic - anti-slip')
    ).toBe('3 step foldable ladder');
    expect(
      extractCleanProductTitle('IONOS - foam sanding block set - 4 piece - 60, 100, 180, 220')
    ).toBe('foam sanding block set');

    // Dimension prefix at start followed by brand
    expect(
      extractCleanProductTitle('10 Mtr - Status - PVC Electrical Tape - Mixed Colours')
    ).toBe('PVC Electrical Tape');
    expect(
      extractCleanProductTitle('33 Mtr - Ionos - PVC Electrical Tape - Blue - 1 pk')
    ).toBe('PVC Electrical Tape');

    // Standard title without prefix
    expect(
      extractCleanProductTitle('Combination Pliers - 160mm - drop forged carbon steel')
    ).toBe('Combination Pliers');
  });

  it('generates high quality slugs avoiding repetitive ionos-ionos-<sku> patterns', () => {
    const products = getAllPublicProducts();
    const ladder = products.find((p) => p.supplier_sku === 'ION3SFLADDER1P1');
    expect(ladder).toBeDefined();
    expect(ladder?.slug).toBe('ionos-3-step-foldable-ladder-ion3sfladder1p1');
    expect(ladder?.slug).not.toContain('ionos-ionos');

    // Check across all 115 products: zero instances of repetitive brand duplication
    const repetitiveSlugs = products.filter((p) => p.slug.startsWith('ionos-ionos-'));
    expect(repetitiveSlugs.length).toBe(0);
  });

  it('handles empty titles in generateProductSlug without leading hyphen', () => {
    expect(generateProductSlug('', 'ION2')).toBe('ion2');
    expect(generateProductSlug('   ', 'SKU456')).toBe('sku456');
    expect(generateProductSlug('---', 'SKU789')).toBe('sku789');
  });

  it('preserves outer carton barcode when committing catalog rows', async () => {
    const csvWithCarton = `supplier,source_doc_date,source_quote_is_inventory,page,supplier_sku,description,barcode,carton_barcode,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,quoted_cases,quoted_units,supplier_stock_confirmed,dropship_eligible,photo_license_verified,compliance_verified
Status International (UK) Ltd,2026-10-09,NO,1,CARTONTEST01,Carton Barcode Test Item,5022822224834,05022822228559,2.00,10,20.00,1,10,UNVERIFIED,UNVERIFIED,UNVERIFIED,UNVERIFIED`;

    const report = parseAndValidateCatalogCsv(csvWithCarton, false);
    expect(report.passed_rows).toBe(1);
    expect(report.results[0].carton_barcode).toBe('05022822228559');

    const product = await getDb().products.getBySupplierSku('CARTONTEST01');
    expect(product).toBeDefined();
    expect(product?.carton_barcode).toBe('05022822228559');
  });

  it('loads baseline sample catalog CSV text via getBaselineCatalogCsvText', () => {
    const csvText = getBaselineCatalogCsvText();
    expect(csvText).toBeDefined();
    expect(csvText.length).toBeGreaterThan(1000);
    const lines = csvText.split('\n').filter(Boolean);
    expect(lines.length).toBe(116); // Header + 115 rows
  });

  it('serves sample catalog via GET and POST in /api/admin/import route', async () => {
    const { GET, POST } = await import('@/../app/api/admin/import/route');
    const { NextRequest } = await import('next/server');

    // GET with loadSample=true
    const getReq = new NextRequest('http://localhost:3000/api/admin/import?loadSample=true');
    const getRes = await GET(getReq);
    expect(getRes.status).toBe(200);
    const getData = await getRes.json();
    expect(getData.csv_content).toBeDefined();
    expect(getData.csv_content).toContain('ION3SFLADDER1P1');

    // POST with loadSample=true in query
    const postReqQuery = new NextRequest('http://localhost:3000/api/admin/import?loadSample=true', {
      method: 'POST',
    });
    const postResQuery = await POST(postReqQuery);
    expect(postResQuery.status).toBe(200);
    const postDataQuery = await postResQuery.json();
    expect(postDataQuery.csv_content).toBeDefined();

    // POST with load_sample: true in JSON body
    const postReqBody = new NextRequest('http://localhost:3000/api/admin/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ load_sample: true }),
    });
    const postResBody = await POST(postReqBody);
    expect(postResBody.status).toBe(200);
    const postDataBody = await postResBody.json();
    expect(postDataBody.csv_content).toBeDefined();
  });
});
