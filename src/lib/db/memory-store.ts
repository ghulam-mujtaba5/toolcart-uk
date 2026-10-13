import { getAllPublicProducts, _getServerWholesaleOffer } from '@/lib/catalog/products';
import { PublicProductDTO, WholesaleSupplierOffer } from '@/types/product';
import { OrderRecord } from '@/types/order';
import {
  DatabaseStore,
  SupplierRecord,
  MarkupRule,
  TradeCustomerRecord,
  ProductRepository,
  OrderRepository,
  SupplierRepository,
  PricingRepository,
  CustomerRepository,
} from './types';
import {
  initialSuppliers,
  initialOrders,
  initialMarkupRules,
  initialTradeCustomers,
} from './seed-data';
import { InMemoryProductRepository } from './repositories/product-repo';
import { InMemoryOrderRepository } from './repositories/order-repo';
import { InMemorySupplierRepository } from './repositories/supplier-repo';
import { InMemoryPricingRepository } from './repositories/pricing-repo';
import { InMemoryCustomerRepository } from './repositories/customer-repo';

export class InMemoryStore implements DatabaseStore {
  private productsMap = new Map<string, PublicProductDTO>();
  private wholesaleMap = new Map<string, WholesaleSupplierOffer>();
  private ordersMap = new Map<string, OrderRecord>();
  private suppliersMap = new Map<string, SupplierRecord>();
  private markupRulesMap = new Map<string, MarkupRule>();
  private customersMap = new Map<string, TradeCustomerRecord>();
  private initialized = false;

  public products: ProductRepository;
  public orders: OrderRepository;
  public suppliers: SupplierRepository;
  public pricing: PricingRepository;
  public customers: CustomerRepository;

  constructor() {
    this.products = new InMemoryProductRepository(this.productsMap, this.wholesaleMap);
    this.orders = new InMemoryOrderRepository(this.ordersMap);
    this.suppliers = new InMemorySupplierRepository(this.suppliersMap);
    this.pricing = new InMemoryPricingRepository(this.markupRulesMap);
    this.customers = new InMemoryCustomerRepository(this.customersMap);
  }

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Auto-seed all 115 products from baseline CSV via catalog module
    const rawProducts = getAllPublicProducts();
    for (const p of rawProducts) {
      this.productsMap.set(p.id, { ...p });
      const offer = _getServerWholesaleOffer(p.supplier_sku);
      if (offer) {
        this.wholesaleMap.set(p.supplier_sku, { ...offer });
      }
    }

    // Seed suppliers
    for (const s of initialSuppliers) {
      this.suppliersMap.set(s.id, { ...s });
    }

    // Seed orders
    for (const o of initialOrders) {
      this.ordersMap.set(o.id, { ...o, audit_logs: [...o.audit_logs] });
    }

    // Seed markup rules
    for (const m of initialMarkupRules) {
      this.markupRulesMap.set(m.category_id, { ...m });
    }

    // Seed trade customers
    for (const c of initialTradeCustomers) {
      this.customersMap.set(c.id, { ...c });
    }

    this.initialized = true;
  }

  public async reset(): Promise<void> {
    this.productsMap.clear();
    this.wholesaleMap.clear();
    this.ordersMap.clear();
    this.suppliersMap.clear();
    this.markupRulesMap.clear();
    this.customersMap.clear();
    this.initialized = false;
    await this.init();
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __toolcart_db__: InMemoryStore | undefined;
}

export function getDb(): DatabaseStore {
  if (!globalThis.__toolcart_db__) {
    const store = new InMemoryStore();
    store.init();
    globalThis.__toolcart_db__ = store;
  }
  return globalThis.__toolcart_db__;
}
