import { SupplierRepository, SupplierRecord } from '../types';

export class InMemorySupplierRepository implements SupplierRepository {
  constructor(private suppliersMap: Map<string, SupplierRecord>) {}

  async getAll(): Promise<SupplierRecord[]> {
    return Array.from(this.suppliersMap.values());
  }

  async getById(id: string): Promise<SupplierRecord | null> {
    return this.suppliersMap.get(id) || null;
  }

  async update(id: string, updates: Partial<SupplierRecord>): Promise<SupplierRecord | null> {
    const existing = this.suppliersMap.get(id);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.suppliersMap.set(id, updated);
    return updated;
  }
}
