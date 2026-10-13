import { describe, it, expect } from 'vitest';
import { getAllPublicProducts, getProductBySlug, searchProducts, _getServerWholesaleOffer } from '@/lib/catalog';
import { GET as getProductsApi } from '@/app/api/store/products/route';
import { NextRequest } from 'next/server';

describe('Wholesale Price Security & Isolation Suite', () => {
  it('loads all 115 quoted products into public DTOs', async () => {
    const products = await getAllPublicProducts();
    expect(products).toHaveLength(115);
  });

  it('guarantees public products never contain unit_cost_ex_vat_gbp or case_cost_ex_vat_gbp', async () => {
    const products = await getAllPublicProducts();

    for (const p of products) {
      // Direct object property checks
      expect((p as any).unit_cost_ex_vat_gbp).toBeUndefined();
      expect((p as any).case_cost_ex_vat_gbp).toBeUndefined();
      expect((p as any).quoted_cases).toBeUndefined();
      expect((p as any).quoted_units).toBeUndefined();

      // Serialized string scanning
      const json = JSON.stringify(p);
      expect(json).not.toContain('unit_cost_ex_vat_gbp');
      expect(json).not.toContain('case_cost_ex_vat_gbp');
      expect(json).not.toContain('unit_cost');
      expect(json).not.toContain('case_cost');
    }
  });

  it('maintains wholesale costs strictly on the server-only offers store', () => {
    const products = getAllPublicProducts();
    expect(products.length).toBeGreaterThan(0);

    const firstSku = products[0].supplier_sku;
    const serverOffer = _getServerWholesaleOffer(firstSku);

    expect(serverOffer).toBeDefined();
    expect(serverOffer?.unit_cost_ex_vat_gbp).toBeGreaterThan(0);
    expect(serverOffer?.case_cost_ex_vat_gbp).toBeGreaterThan(0);
  });

  it('ensures getProductBySlug never leaks wholesale costs', async () => {
    const products = await getAllPublicProducts();
    const slug = products[0].slug;

    const singleProduct = await getProductBySlug(slug);
    expect(singleProduct).not.toBeNull();

    expect((singleProduct as any).unit_cost_ex_vat_gbp).toBeUndefined();
    expect((singleProduct as any).case_cost_ex_vat_gbp).toBeUndefined();

    const json = JSON.stringify(singleProduct);
    expect(json).not.toContain('unit_cost_ex_vat_gbp');
    expect(json).not.toContain('case_cost_ex_vat_gbp');
  });

  it('ensures searchProducts never leaks wholesale costs in results or facets', async () => {
    const searchRes = await searchProducts('tape');
    expect(searchRes.products.length).toBeGreaterThan(0);

    const serialized = JSON.stringify(searchRes);
    expect(serialized).not.toContain('unit_cost_ex_vat_gbp');
    expect(serialized).not.toContain('case_cost_ex_vat_gbp');
    expect(serialized).not.toContain('unit_cost');
    expect(serialized).not.toContain('case_cost');
  });

  it('ensures /api/store/products route response never leaks wholesale costs', async () => {
    const req = new NextRequest('http://localhost:3000/api/store/products?q=pliers');
    const res = await getProductsApi(req);

    expect(res.status).toBe(200);
    const body = await res.json();

    expect(body.products).toBeDefined();
    expect(body.products.length).toBeGreaterThan(0);

    const bodyString = JSON.stringify(body);
    expect(bodyString).not.toContain('unit_cost_ex_vat_gbp');
    expect(bodyString).not.toContain('case_cost_ex_vat_gbp');
    expect(bodyString).not.toContain('unit_cost');
    expect(bodyString).not.toContain('case_cost');
  });
});
