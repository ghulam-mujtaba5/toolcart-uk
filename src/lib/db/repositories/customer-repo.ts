import { CustomerRepository, TradeCustomerRecord } from '../types';

export class InMemoryCustomerRepository implements CustomerRepository {
  constructor(private customersMap: Map<string, TradeCustomerRecord>) {}

  async getAll(): Promise<TradeCustomerRecord[]> {
    const list = Array.from(this.customersMap.values());
    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }

  async getById(id: string): Promise<TradeCustomerRecord | null> {
    return this.customersMap.get(id) || null;
  }

  async updateStatus(
    id: string,
    status: 'approved' | 'rejected' | 'pending',
    creditLimitGbp?: number
  ): Promise<TradeCustomerRecord | null> {
    const existing = this.customersMap.get(id);
    if (!existing) return null;

    const updated: TradeCustomerRecord = {
      ...existing,
      status,
      credit_limit_gbp: creditLimitGbp !== undefined ? creditLimitGbp : existing.credit_limit_gbp,
    };

    this.customersMap.set(id, updated);
    return updated;
  }
}
