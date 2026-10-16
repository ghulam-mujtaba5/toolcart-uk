import { OrderRepository } from '../types';
import { OrderRecord, OrderState, OrderAuditLog } from '@/types/order';

export class InMemoryOrderRepository implements OrderRepository {
  constructor(private ordersMap: Map<string, OrderRecord>) {}

  async getAll(filters?: { state?: OrderState; customer_email?: string }): Promise<OrderRecord[]> {
    let list = Array.from(this.ordersMap.values());

    if (!filters) return list;

    if (filters.state) {
      list = list.filter((o) => o.state === filters.state);
    }

    if (filters.customer_email) {
      const email = filters.customer_email.toLowerCase();
      list = list.filter((o) => (o.customer_email || '').toLowerCase() === email);
    }

    // Sort descending by created_at
    list.sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());

    return list;
  }

  async getById(id: string): Promise<OrderRecord | null> {
    const direct = this.ordersMap.get(id);
    if (direct) return direct;

    // Fallback search across records
    for (const o of this.ordersMap.values()) {
      if (o.id === id || (o.order_number && o.order_number === id)) {
        return o;
      }
    }

    return null;
  }

  async getByOrderNumber(orderNumber: string): Promise<OrderRecord | null> {
    const target = (orderNumber || '').toLowerCase();
    for (const o of this.ordersMap.values()) {
      if ((o.order_number || '').toLowerCase() === target) {
        return o;
      }
    }
    return null;
  }

  async create(
    order: Omit<OrderRecord, 'id' | 'audit_logs'> & { id?: string; audit_logs?: OrderAuditLog[] }
  ): Promise<OrderRecord> {
    const id = order.id || `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const newOrder: OrderRecord = {
      ...order,
      id,
      audit_logs: order.audit_logs ? [...order.audit_logs] : [],
    };

    this.ordersMap.set(id, newOrder);
    return newOrder;
  }

  async updateState(
    orderId: string,
    newState: OrderState,
    auditLog: OrderAuditLog
  ): Promise<OrderRecord | null> {
    const order = await this.getById(orderId);
    if (!order) return null;

    order.state = newState;
    order.updated_at = new Date().toISOString();
    if (!order.audit_logs) {
      order.audit_logs = [];
    }
    order.audit_logs.push(auditLog);

    this.ordersMap.set(order.id, order);
    return order;
  }

  async updateTracking(
    orderId: string,
    carrier: string,
    trackingNumber: string
  ): Promise<OrderRecord | null> {
    const order = await this.getById(orderId);
    if (!order) return null;

    order.carrier = carrier;
    order.tracking_number = trackingNumber;
    order.updated_at = new Date().toISOString();

    this.ordersMap.set(order.id, order);
    return order;
  }
}
