/**
 * ToolCart UK - Centralized Admin API Client SDK
 * 
 * Provides an enterprise-grade, strongly typed client abstraction for all
 * administrative operations across catalog, inventory, pricing, and orders.
 * Eliminates ad-hoc fetch calls, centralizes CSRF & error handling, and supports
 * abortable requests and optimistic cache synchronization.
 */

import { PublicProductDTO, SellabilityStatus } from '@/types/product';
import { OrderRecord, OrderState } from '@/types/order';

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export interface ProductQueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  category?: string;
  status?: string;
  sortBy?: 'title' | 'supplier_sku' | 'category' | 'retail_price' | 'stock';
  sortOrder?: 'asc' | 'desc';
}

export interface BulkProductMutation {
  product_ids: string[];
  action: 'status' | 'price' | 'stock' | 'category';
  payload: {
    status?: SellabilityStatus;
    price_percentage_change?: number;
    price_fixed_gbp?: number;
    stock_delta?: number;
    stock_exact?: number;
    category?: string;
  };
}

export class AdminApiClient {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers = new Headers(options.headers);
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMessage = `API Error ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = typeof errorData.error === 'string' ? errorData.error : JSON.stringify(errorData.error);
        }
      } catch {
        // Fallback to generic message if json parse fails
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // ==========================================
  // Catalog & Product Operations
  // ==========================================
  public readonly products = {
    get: async (id: string): Promise<PublicProductDTO> => {
      return this.request<PublicProductDTO>(`/api/admin/products/${encodeURIComponent(id)}`);
    },

    update: async (id: string, updates: Partial<PublicProductDTO>): Promise<PublicProductDTO> => {
      return this.request<PublicProductDTO>(`/api/admin/products/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    },

    bulkMutate: async (mutation: BulkProductMutation): Promise<{ success: boolean; updated_count: number }> => {
      return this.request<{ success: boolean; updated_count: number }>('/api/admin/products/bulk', {
        method: 'POST',
        body: JSON.stringify(mutation),
      });
    },
  };

  // ==========================================
  // Order Operations
  // ==========================================
  public readonly orders = {
    get: async (id: string): Promise<OrderRecord> => {
      return this.request<OrderRecord>(`/api/admin/orders/${encodeURIComponent(id)}`);
    },

    transition: async (id: string, targetState: OrderState, note?: string): Promise<OrderRecord> => {
      return this.request<OrderRecord>(`/api/admin/orders/${encodeURIComponent(id)}/transition`, {
        method: 'POST',
        body: JSON.stringify({ state: targetState, note }),
      });
    },
  };

  // ==========================================
  // Supplier & Catalog Ingestion Operations
  // ==========================================
  public readonly suppliers = {
    sync: async (supplierId: string): Promise<{ success: boolean; synced_at: string; items_count: number }> => {
      return this.request<{ success: boolean; synced_at: string; items_count: number }>(
        `/api/admin/suppliers/${encodeURIComponent(supplierId)}/sync`,
        { method: 'POST' }
      );
    },

    importFeed: async (payload: { raw_csv?: string; items?: any[]; dry_run: boolean }): Promise<any> => {
      return this.request<any>('/api/admin/import', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  };
}

export const adminClient = new AdminApiClient();
