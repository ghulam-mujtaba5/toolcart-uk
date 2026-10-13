import { PricingRepository, MarkupRule } from '../types';

export class InMemoryPricingRepository implements PricingRepository {
  constructor(private markupRulesMap: Map<string, MarkupRule>) {}

  async getMarkupRules(): Promise<MarkupRule[]> {
    return Array.from(this.markupRulesMap.values());
  }

  async updateMarkupRule(
    categoryId: string,
    updates: Partial<MarkupRule>
  ): Promise<MarkupRule | null> {
    const existing = this.markupRulesMap.get(categoryId);
    if (!existing) return null;

    const updated = { ...existing, ...updates };
    this.markupRulesMap.set(categoryId, updated);
    return updated;
  }

  async getMarginFloor(): Promise<number> {
    const rules = Array.from(this.markupRulesMap.values());
    if (rules.length === 0) return 30.0;
    return Math.min(...rules.map((r) => r.margin_floor_percent));
  }
}
