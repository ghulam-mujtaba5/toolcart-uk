import { ProductRepository } from '../types';
import { PublicProductDTO, WholesaleSupplierOffer, ProductFilters } from '@/types/product';

export class InMemoryProductRepository implements ProductRepository {
  constructor(
    private productsMap: Map<string, PublicProductDTO>,
    private wholesaleMap: Map<string, WholesaleSupplierOffer>
  ) {}

  async getAll(filters?: ProductFilters): Promise<PublicProductDTO[]> {
    let list = Array.from(this.productsMap.values());

    if (!filters) return list;

    if (filters.category) {
      const cat = filters.category.toLowerCase();
      list = list.filter(
        (p) =>
          p.category_slug.toLowerCase() === cat ||
          p.category.toLowerCase() === cat
      );
    }

    if (filters.brand) {
      const b = filters.brand.toLowerCase();
      list = list.filter((p) => p.brand.toLowerCase() === b);
    }

    if (filters.sellability_status) {
      list = list.filter((p) => (p.sellability_status || 'draft') === filters.sellability_status);
    }

    if (filters.availability) {
      list = list.filter((p) => p.availability_status === filters.availability);
    }

    if (filters.inStockOnly) {
      list = list.filter((p) => p.availability_status === 'in_stock');
    }

    if (filters.complianceOnly) {
      list = list.filter((p) => p.compliance_verified);
    }

    if (filters.minPrice !== undefined) {
      list = list.filter((p) => p.retail_price_inc_vat_gbp >= filters.minPrice!);
    }

    if (filters.maxPrice !== undefined) {
      list = list.filter((p) => p.retail_price_inc_vat_gbp <= filters.maxPrice!);
    }

    if (filters.query) {
      const q = filters.query.toLowerCase().trim();
      list = list.filter((p) => {
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.supplier_sku.toLowerCase().includes(q) ||
          p.gtin.toLowerCase().includes(q) ||
          (p.mpn && p.mpn.toLowerCase().includes(q))
        );
      });
    }

    if (filters.sort) {
      switch (filters.sort) {
        case 'price_asc':
          list.sort((a, b) => a.retail_price_inc_vat_gbp - b.retail_price_inc_vat_gbp);
          break;
        case 'price_desc':
          list.sort((a, b) => b.retail_price_inc_vat_gbp - a.retail_price_inc_vat_gbp);
          break;
        case 'title_asc':
          list.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case 'title_desc':
          list.sort((a, b) => b.title.localeCompare(a.title));
          break;
      }
    }

    return list;
  }

  async getById(id: string): Promise<PublicProductDTO | null> {
    return this.productsMap.get(id) || null;
  }

  async getBySlug(slug: string): Promise<PublicProductDTO | null> {
    for (const p of this.productsMap.values()) {
      if (p.slug === slug) return p;
    }
    return null;
  }

  async getBySupplierSku(sku: string): Promise<PublicProductDTO | null> {
    for (const p of this.productsMap.values()) {
      if (p.supplier_sku.toLowerCase() === sku.toLowerCase()) return p;
    }
    return null;
  }

  async create(product: PublicProductDTO, wholesaleOffer: WholesaleSupplierOffer): Promise<PublicProductDTO> {
    this.productsMap.set(product.id, { ...product });
    this.wholesaleMap.set(wholesaleOffer.supplier_sku, { ...wholesaleOffer });
    return product;
  }

  async update(id: string, updates: Partial<PublicProductDTO>): Promise<PublicProductDTO | null> {
    const existing = this.productsMap.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.productsMap.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    const existing = this.productsMap.get(id);
    if (!existing) return false;
    this.wholesaleMap.delete(existing.supplier_sku);
    return this.productsMap.delete(id);
  }

  async count(): Promise<{ total: number; approved: number; draft: number; needs_review: number; blocked: number }> {
    let approved = 0;
    let draft = 0;
    let needs_review = 0;
    let blocked = 0;

    for (const p of this.productsMap.values()) {
      const status = p.sellability_status || 'draft';
      if (status === 'approved') approved++;
      else if (status === 'needs_review') needs_review++;
      else if (status === 'blocked') blocked++;
      else draft++;
    }

    return {
      total: this.productsMap.size,
      approved,
      draft,
      needs_review,
      blocked,
    };
  }

  async getWholesaleOffer(supplierSku: string): Promise<WholesaleSupplierOffer | null> {
    return this.wholesaleMap.get(supplierSku) || null;
  }

  async updateWholesaleOffer(
    supplierSku: string,
    updates: Partial<WholesaleSupplierOffer>
  ): Promise<WholesaleSupplierOffer | null> {
    const existing = this.wholesaleMap.get(supplierSku);
    if (!existing) return null;
    const updated = { ...existing, ...updates };
    this.wholesaleMap.set(supplierSku, updated);
    return updated;
  }
}
