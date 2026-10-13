# Milestone 3 Technical Blueprint: Commerce Engine, Catalog Seed & Admin Portal

## 1. Observation

### Codebase & Contract Inspection
- **Baseline Supplier Catalog (`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`)**:
  - Contains exactly 115 quoted product rows from "Status International (UK) Ltd", dated 2026-10-09.
  - Case-vs-unit math verification via Node script: `case_cost == Math.round(unit_cost * units_per_case * 100) / 100` matched across all 115 rows (0 math mismatches).
  - Nullable carton barcode finding: Row 115 (`supplier_sku: ION3SFLADDER1P1`, "IONOS - 3 step foldable ladder", `units_per_case: 1`, `case_cost: 13.85`) has `carton_barcode: ""` (empty string), demonstrating single-unit outer carton packaging where an outer carton barcode is not applicable.
  - Unicode ligatures and special characters present: `ﬁ` (`\ufb01`, 15 occurrences), `ﬂ` (`\ufb02`, 5 occurrences), `Ø` (`\u00d8`, 1 occurrence). Total 21 occurrences across product descriptions (e.g. `ﬂathead`, `Ø3x140mm`, `ﬁlling`).
- **Product Contract Schema (`schemas/product_contract.schema.json`)**:
  - JSON Schema Draft 2020-12 specification requiring: `["supplier_sku", "title", "supplier", "unit_cost_ex_vat_gbp", "units_per_case", "sellability_status"]`.
  - Enforces `additionalProperties: false`.
  - Properties: `supplier_sku` (string >= 1), `merchant_sku` (string | null), `gtin` (string | null), `mpn` (string | null), `title` (string >= 1), `description` (string | null), `supplier` (string), `unit_cost_ex_vat_gbp` (number >= 0), `units_per_case` (integer >= 1), `minimum_purchase_cases` (integer >= 1 | null), `retail_price_inc_vat_gbp` (number >= 0 | null), `supplier_stock_qty` (integer >= 0 | null), `stock_snapshot_at` (date-time | null), `weight_grams` (number >= 0 | null), `dimensions_mm` ({width, height, depth} | null), `image_license_verified` (boolean, default false), `compliance_verified` (boolean, default false), `supplier_direct_dispatch_verified` (boolean, default false), `sellability_status` (enum: `draft` | `needs_review` | `approved` | `blocked`, default `draft`).
- **Supplier Order State Machine (`architecture/SUPPLIER_ORDER_STATE_MACHINE.md` & `src/types/order.ts`)**:
  - Full state set consists of 15 states:
    - Happy path: `cart_pending` -> `checkout_authorized` -> `supplier_order_pending` -> `supplier_accepted` -> `payment_captured` -> `dispatched` -> `delivered`.
    - Exceptional & operational states: `supplier_rejected`, `supplier_timeout`, `payment_authorization_expired`, `partial_supplier_acceptance`, `partial_dispatch`, `refund_pending`, `refunded`, `manual_review`.
  - Required operational constraints:
    - Supplier Quote != Live Stock; purchasability gated by verified stock feed with TTL.
    - Idempotency key requirement: `order_id + supplier_id`.
    - Append-only audit log: `order_audit_logs`.
    - Automated compensation/refund on rejection or timeout.
- **Brand V3 Styling & Design Tokens (`design/tokens.css` & `src/components/ui/`)**:
  - Authoritative palette: Ink (`#182336`), Industrial Cobalt (`#2450B8`), Cobalt Deep (`#193F99`), Action Lime (`#DDF16A` with Ink text and 2px Ink outline), Workshop White (`#F7F8F5`), Cloud Blue (`#EAF0FF`), Graphite (`#252D30`), Steel Text (`#596B70`).
  - Zero tolerance on retired copper (`#B84C32`), purple, violet, lavender, or teal.
  - Zero tolerance on white text on Action Lime.
  - Typography: Manrope (`font-heading`) and IBM Plex Sans (`font-body`, `tabular-nums`).
- **Existing Test Suite Execution**:
  - `npm test` runs Vitest v2.1.9: 5 test files, 75 passing tests (including `tests/brand/brand-compliance.test.ts`, `tests/security/wholesale-isolation.test.ts`, and `tests/ui/primitives.test.tsx`).

---

## 2. Logic Chain

1. **State Machine Completeness**:
   - `architecture/SUPPLIER_ORDER_STATE_MACHINE.md` and `src/types/order.ts` define 15 distinct states.
   - For an industrial e-commerce workflow, state transitions must be strictly deterministic: a directed acyclic graph (DAG) for forward progress, with branches for rejections, timeouts, and operator manual reviews.
   - Every state transition must be authenticated, validated against the transition matrix, executed idempotently (deduplicating repeated webhook or button triggers via `order_id + supplier_id`), and recorded in an immutable append-only audit trail (`order_audit_logs`).
   - Side effects must be atomic: transitioning to `supplier_accepted` immediately triggers payment capture; transitioning to `supplier_rejected` or `supplier_timeout` immediately initiates a void/refund workflow (`refund_pending` -> `refunded`).

2. **Catalog Ingestion & Contract Compliance**:
   - The supplier catalog intake is the boundary where raw external vendor data enters the merchant domain.
   - External data often includes ligatures (such as `ﬁ`, `ﬂ`) and symbols (`Ø`) resulting from PDF scraping or vendor exports, which will break search tokenization unless normalized via `normalizeUnicode()`.
   - Vendor math must be verified before acceptance: `case_cost` must exactly equal `Math.round(unit_cost * units_per_case * 100) / 100`. Any discrepancy represents either a vendor billing bug or a broken pack tier and must fail dry-run validation.
   - Items with `units_per_case === 1` may omit `carton_barcode`; the importer must handle nullable values without failing schema validation.
   - Wholesale privacy: Wholesale costs (`unit_cost_ex_vat_gbp`, `case_cost_ex_vat_gbp`) must be separated into server-side `WholesaleSupplierOffer` records and never emitted into `PublicProductDTO` or public API responses.

3. **In-Memory & File-Backed Seed Repository**:
   - Next.js development and test environments require zero-config local operation without mandatory external Supabase credentials.
   - A unified repository pattern (`ProductRepository`, `OrderRepository`, `SupplierRepository`, `PricingRepository`, `CustomerRepository`) backed by a singleton in-memory database store (with file-backed write-through or lazy initialization from `baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`) provides high-fidelity state mutation during development, testing, and Admin UI operations.
   - Global singleton binding (`globalThis.__toolcart_db__`) prevents Next.js Fast Refresh from clearing mutated admin state during development.

4. **Admin Portal UI**:
   - The Admin Portal is the mission-critical operational cockpit for the merchant.
   - It must implement Brand V3 identity (Ink sidebar, Cobalt accents, high-contrast Lime badges with 2px borders, Steel Text metadata).
   - Ten dedicated views are required:
     - `/admin`: Dashboard with high-level KPIs, feed freshness, margin health, and Launch Gate checklist.
     - `/admin/products`: Searchable, filterable product table with sellability badges.
     - `/admin/products/[id]`: Detail editor with technical specs, licensing toggles, and margin calculator.
     - `/admin/orders`: Order operations list with color-coded state badges.
     - `/admin/orders/[id]`: Interactive fulfillment console, PO generator, tracking input, and audit timeline.
     - `/admin/suppliers`: Directory with lead times, carriage terms, and stock feed TTL timers.
     - `/admin/import`: Interactive drag-and-drop CSV/JSON validator with row-by-row dry-run diagnostics.
     - `/admin/pricing`: Category markups and low-margin alert indicators (< 30% margin floor).
     - `/admin/customers`: Trade customer approval queue and credit limit management.
     - `/admin/settings`: Launch gates governance (`STAGING_ONLY: ACTIVE`, cloud provider health).

---

## 3. Caveats

1. **Stripe & Supabase Live Connections**: Milestone 3 focuses on domain logic, state machine execution, catalog seeding, and the Admin UI. Real Stripe live mode charges and live Supabase PostgreSQL connections remain gated under `STAGING_ONLY=true` and Milestone 4 adapters.
2. **Supplier Direct Dispatch Status**: Status International (UK) Ltd's 115 quoted lines represent a price quotation, not an active API dropship contract. All imported products default to `sellability_status: 'draft'` per `docs/04_COMMERCE_SUPPLIER_SPEC.md` until explicit merchant approval.
3. **No Caveats Beyond Above**.

---

## 4. Conclusion & Technical Blueprint

The following technical blueprint specifies the exact file structures, interfaces, algorithms, and test suites to be implemented for Milestone 3.

```
e:\ToolCart\
├── src/
│   ├── lib/
│   │   ├── state-machine/
│   │   │   ├── types.ts                     # State machine types, triggers, and events
│   │   │   ├── transitions.ts               # Valid transition DAG & rule validator
│   │   │   ├── side-effects.ts              # Payment capture, auto-refund, and email triggers
│   │   │   ├── engine.ts                    # Idempotent state machine executor
│   │   │   └── index.ts                     # Module export
│   │   ├── catalog/
│   │   │   ├── contract-schema.ts           # Zod schema matching product_contract.schema.json
│   │   │   ├── importer.ts                  # Batch CSV/JSON parser with case math validation
│   │   │   ├── unicode.ts                   # Unicode ligature & slug normalizer
│   │   │   ├── pricing.ts                   # Retail calculation & margin engine
│   │   │   └── index.ts                     # Public/internal catalog API
│   │   └── db/
│   │       ├── types.ts                     # Unified repository interfaces
│   │       ├── seed-data.ts                 # Initial suppliers, trade customers, and sample orders
│   │       ├── memory-store.ts              # In-memory/file-backed persistent singleton store
│   │       ├── repositories/
│   │       │   ├── product-repo.ts          # ProductRepository implementation
│   │       │   ├── order-repo.ts            # OrderRepository implementation
│   │       │   ├── supplier-repo.ts         # SupplierRepository implementation
│   │       │   ├── pricing-repo.ts          # PricingRepository implementation
│   │       │   └── customer-repo.ts         # CustomerRepository implementation
│   │       └── index.ts                     # Unified db export
│   └── components/
│       └── admin/
│           ├── admin-layout.tsx             # Brand V3 sidebar, header, breadcrumbs, staging badge
│           ├── admin-sidebar.tsx            # Navigation links with Lucide icons
│           ├── kpi-card.tsx                 # Metric cards with trend indicators
│           ├── product-table.tsx            # Data table with filters and status pills
│           ├── order-action-bar.tsx         # Interactive transition buttons per state
│           ├── audit-timeline.tsx           # Append-only chronological audit log viewer
│           └── import-preview-table.tsx     # Dry-run validation diagnostics table
├── app/
│   ├── admin/
│   │   ├── layout.tsx                       # Admin root layout
│   │   ├── page.tsx                         # /admin (Dashboard)
│   │   ├── products/
│   │   │   ├── page.tsx                     # /admin/products (Product Manager)
│   │   │   └── [id]/page.tsx                # /admin/products/[id] (Product Editor)
│   │   ├── orders/
│   │   │   ├── page.tsx                     # /admin/orders (Order List)
│   │   │   └── [id]/page.tsx                # /admin/orders/[id] (Order Detail & Transitions)
│   │   ├── suppliers/page.tsx               # /admin/suppliers (Supplier Directory)
│   │   ├── import/page.tsx                  # /admin/import (CSV/JSON Importer UI)
│   │   ├── pricing/page.tsx                 # /admin/pricing (Margin Engine)
│   │   ├── customers/page.tsx               # /admin/customers (Trade Approvals)
│   │   └── settings/page.tsx                # /admin/settings (Governance & Gates)
│   └── api/
│       └── admin/
│           ├── import/route.ts              # POST /api/admin/import (?dryRun=true|false)
│           ├── orders/
│           │   ├── route.ts                 # GET /api/admin/orders
│           │   └── [id]/
│           │       ├── route.ts             # GET /api/admin/orders/[id]
│           │       └── transition/route.ts  # POST /api/admin/orders/[id]/transition
│           └── products/
│               ├── route.ts                 # GET / POST /api/admin/products
│               └── [id]/route.ts            # GET / PUT / DELETE /api/admin/products/[id]
└── tests/
    ├── state-machine/
    │   └── state-machine.test.ts            # 15 states, transitions, idempotency, auto-refund
    └── catalog/
        └── catalog-ingestion.test.ts        # 115 SKU CSV import, case math, ligatures, dry run
```

---

### Detailed Subsystem Specifications

#### Subsystem 1: Supplier Order State Machine (`src/lib/state-machine/`)

##### States & Transition Matrix
```typescript
// src/lib/state-machine/types.ts
import { OrderState, OrderAuditLog } from '@/types/order';

export type StateTrigger = 'customer' | 'admin' | 'supplier' | 'webhook' | 'cron_timeout';

export interface TransitionRequest {
  order_id: string;
  to_state: OrderState;
  trigger: StateTrigger;
  actor: string;
  metadata?: Record<string, unknown>;
  idempotency_key?: string;
}

export interface TransitionResult {
  success: boolean;
  order_id: string;
  previous_state: OrderState;
  current_state: OrderState;
  idempotent_replay: boolean;
  audit_log: OrderAuditLog;
  side_effects_executed: string[];
  error?: string;
}
```

##### Permitted State Transitions
```typescript
// src/lib/state-machine/transitions.ts
import { OrderState } from '@/types/order';

export const VALID_TRANSITIONS: Record<OrderState, OrderState[]> = {
  cart_pending: [
    'checkout_authorized',
    'manual_review'
  ],
  checkout_authorized: [
    'supplier_order_pending',
    'payment_authorization_expired',
    'refund_pending',
    'manual_review'
  ],
  supplier_order_pending: [
    'supplier_accepted',
    'supplier_rejected',
    'supplier_timeout',
    'partial_supplier_acceptance',
    'manual_review'
  ],
  supplier_accepted: [
    'payment_captured',
    'refund_pending',
    'manual_review'
  ],
  payment_captured: [
    'dispatched',
    'partial_dispatch',
    'refund_pending',
    'manual_review'
  ],
  partial_dispatch: [
    'dispatched',
    'delivered',
    'refund_pending',
    'manual_review'
  ],
  dispatched: [
    'delivered',
    'refund_pending',
    'manual_review'
  ],
  delivered: [
    'refund_pending',
    'manual_review'
  ],
  supplier_rejected: [
    'refund_pending',
    'manual_review'
  ],
  supplier_timeout: [
    'refund_pending',
    'manual_review'
  ],
  payment_authorization_expired: [
    'refund_pending',
    'manual_review'
  ],
  partial_supplier_acceptance: [
    'payment_captured',
    'refund_pending',
    'manual_review'
  ],
  refund_pending: [
    'refunded',
    'manual_review'
  ],
  refunded: [
    'manual_review'
  ],
  manual_review: [
    'supplier_order_pending',
    'supplier_accepted',
    'payment_captured',
    'dispatched',
    'refund_pending',
    'refunded'
  ]
};

export function isValidTransition(from: OrderState, to: OrderState): boolean {
  if (from === to) return true; // Handled as idempotent replay
  const allowed = VALID_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}
```

##### Side Effects & Auto-Refund Engine
```typescript
// src/lib/state-machine/side-effects.ts
import { OrderState, OrderRecord } from '@/types/order';

export interface SideEffectExecution {
  name: string;
  executed: boolean;
  details?: Record<string, unknown>;
}

export async function executeSideEffects(
  order: OrderRecord,
  fromState: OrderState,
  toState: OrderState
): Promise<SideEffectExecution[]> {
  const executions: SideEffectExecution[] = [];

  // Side Effect 1: Auto-capture payment on supplier acceptance
  if (toState === 'supplier_accepted') {
    executions.push({
      name: 'AUTO_CAPTURE_PAYMENT',
      executed: true,
      details: { amount_captured: order.total_inc_vat_gbp, provider: 'stripe_test' }
    });
  }

  // Side Effect 2: Auto-refund on supplier rejection or timeout
  if (toState === 'supplier_rejected' || toState === 'supplier_timeout' || toState === 'payment_authorization_expired') {
    executions.push({
      name: 'TRIGGER_AUTO_REFUND',
      executed: true,
      details: {
        reason: `Automated cancellation triggered by state: ${toState}`,
        amount_to_refund: order.total_inc_vat_gbp
      }
    });
  }

  // Side Effect 3: Dispatch customer notification on parcel dispatch
  if (toState === 'dispatched') {
    executions.push({
      name: 'NOTIFY_CUSTOMER_DISPATCH',
      executed: true,
      details: {
        carrier: order.carrier || 'Standard Courier',
        tracking_number: order.tracking_number || 'PENDING'
      }
    });
  }

  return executions;
}
```

##### Idempotent State Machine Engine
```typescript
// src/lib/state-machine/engine.ts
import { OrderRecord, OrderAuditLog } from '@/types/order';
import { TransitionRequest, TransitionResult } from './types';
import { isValidTransition } from './transitions';
import { executeSideEffects } from './side-effects';
import { getDb } from '@/lib/db';

export function generatePoIdempotencyKey(orderId: string, supplierId: string): string {
  return `${orderId}#${supplierId}`;
}

export async function executeOrderTransition(req: TransitionRequest): Promise<TransitionResult> {
  const db = getDb();
  const order = await db.orders.getById(req.order_id);

  if (!order) {
    throw new Error(`Order ${req.order_id} not found`);
  }

  const previousState = order.state;
  const targetState = req.to_state;

  // Idempotency check: repeated request with same target state
  if (previousState === targetState) {
    const existingLog = order.audit_logs.find(
      (log) => log.to_state === targetState && log.metadata?.idempotency_key === req.idempotency_key
    ) || order.audit_logs[order.audit_logs.length - 1];

    return {
      success: true,
      order_id: order.id,
      previous_state: previousState,
      current_state: previousState,
      idempotent_replay: true,
      audit_log: existingLog,
      side_effects_executed: ['IDEMPOTENT_NOOP'],
    };
  }

  // Validation
  if (!isValidTransition(previousState, targetState)) {
    throw new Error(
      `Illegal transition from '${previousState}' to '${targetState}' for order ${order.id}`
    );
  }

  // Side effects
  const sideEffects = await executeSideEffects(order, previousState, targetState);

  // Append-only audit log
  const auditLog: OrderAuditLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    order_id: order.id,
    from_state: previousState,
    to_state: targetState,
    trigger: req.trigger,
    actor: req.actor,
    metadata: {
      ...req.metadata,
      idempotency_key: req.idempotency_key,
      side_effects: sideEffects.map(s => s.name),
    },
    created_at: new Date().toISOString(),
  };

  // Update order in repository
  await db.orders.updateState(order.id, targetState, auditLog);

  // If auto-refund triggered, transition automatically to refund_pending
  if (sideEffects.some(s => s.name === 'TRIGGER_AUTO_REFUND') && targetState !== 'refund_pending') {
    const refundLog: OrderAuditLog = {
      id: `log_${Date.now()}_refund`,
      order_id: order.id,
      from_state: targetState,
      to_state: 'refund_pending',
      trigger: 'cron_timeout',
      actor: 'system:auto_refund',
      metadata: { reason: `Auto-refund after ${targetState}` },
      created_at: new Date().toISOString(),
    };
    await db.orders.updateState(order.id, 'refund_pending', refundLog);
  }

  return {
    success: true,
    order_id: order.id,
    previous_state: previousState,
    current_state: targetState,
    idempotent_replay: false,
    audit_log: auditLog,
    side_effects_executed: sideEffects.map(s => s.name),
  };
}
```

---

#### Subsystem 2: Catalog Ingestion & Contract Validation (`src/lib/catalog/`)

##### Contract Validation Schema
```typescript
// src/lib/catalog/contract-schema.ts
import { z } from 'zod';

export const ProductContractSchema = z.object({
  supplier_sku: z.string().min(1, 'supplier_sku is required'),
  merchant_sku: z.string().nullable().optional(),
  gtin: z.string().nullable().optional(),
  mpn: z.string().nullable().optional(),
  title: z.string().min(1, 'title is required'),
  description: z.string().nullable().optional(),
  supplier: z.string().min(1, 'supplier is required'),
  unit_cost_ex_vat_gbp: z.number().min(0, 'unit_cost_ex_vat_gbp must be >= 0'),
  units_per_case: z.number().int().min(1, 'units_per_case must be >= 1'),
  minimum_purchase_cases: z.number().int().min(1).nullable().optional(),
  retail_price_inc_vat_gbp: z.number().min(0).nullable().optional(),
  supplier_stock_qty: z.number().int().min(0).nullable().optional(),
  stock_snapshot_at: z.string().nullable().optional(),
  weight_grams: z.number().min(0).nullable().optional(),
  dimensions_mm: z.object({
    width: z.number().optional(),
    height: z.number().optional(),
    depth: z.number().optional(),
  }).nullable().optional(),
  image_license_verified: z.boolean().default(false),
  compliance_verified: z.boolean().default(false),
  supplier_direct_dispatch_verified: z.boolean().default(false),
  sellability_status: z.enum(['draft', 'needs_review', 'approved', 'blocked']).default('draft'),
}).strict();

export type ProductContractRecord = z.infer<typeof ProductContractSchema>;
```

##### Batch Importer Logic with Case Math & Ligature Normalization
```typescript
// src/lib/catalog/importer.ts
import { parse } from 'csv-parse/sync';
import { normalizeUnicode, generateProductSlug } from './unicode';
import { calculateRetailPrices } from './pricing';
import { ProductContractSchema, ProductContractRecord } from './contract-schema';
import { PublicProductDTO, WholesaleSupplierOffer } from '@/types/product';

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

export function validateCaseMath(unitCost: number, unitsPerCase: number, actualCaseCost: number): {
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

export function parseAndValidateCatalogCsv(csvContent: string, dryRun: boolean = true): ImportBatchReport {
  const normalizedCsv = normalizeUnicode(csvContent);
  const rows = parse(normalizedCsv, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  const results: RowValidationResult[] = [];
  const importedSkus: string[] = [];

  rows.forEach((r: any, idx: number) => {
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
    const cartonBarcode = r.carton_barcode ? r.carton_barcode.trim() : null;

    const candidateRecord = {
      supplier_sku: r.supplier_sku || '',
      merchant_sku: r.merchant_sku || null,
      gtin: r.barcode || r.gtin || null,
      mpn: r.mpn || r.supplier_sku || null,
      title: normalizedDesc,
      description: `High-grade trade hardware: ${normalizedDesc}`,
      supplier: r.supplier || 'Status International (UK) Ltd',
      unit_cost_ex_vat_gbp: unitCost,
      units_per_case: unitsPerCase,
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
      schemaResult.error.errors.forEach(e => {
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
      parsed_record: passed ? schemaResult.data : undefined,
    });
  });

  return {
    total_rows: rows.length,
    passed_rows: results.filter(r => r.status === 'PASS').length,
    failed_rows: results.filter(r => r.status === 'FAIL').length,
    dry_run: dryRun,
    results,
    imported_skus: importedSkus,
  };
}
```

---

#### Subsystem 3: In-Memory / File-Backed Database Seed Store (`src/lib/db/`)

##### Repository Interfaces
```typescript
// src/lib/db/types.ts
import { PublicProductDTO, WholesaleSupplierOffer, ProductFilters, SellabilityStatus } from '@/types/product';
import { OrderRecord, OrderState, OrderAuditLog } from '@/types/order';

export interface SupplierRecord {
  id: string;
  name: string;
  contact_email: string;
  quoted_sku_count: number;
  quote_doc_date: string;
  stock_feed_ttl_minutes: number;
  feed_last_synced_at: string;
  direct_dispatch_agreement_signed: boolean;
  lead_time_days: string;
  carriage_paid_threshold_gbp: number;
  standard_carriage_gbp: number;
}

export interface MarkupRule {
  category_id: string;
  category_name: string;
  multiplier_under_1_pound: number;
  multiplier_1_to_3_pounds: number;
  multiplier_over_3_pounds: number;
  margin_floor_percent: number;
}

export interface TradeCustomerRecord {
  id: string;
  company_name: string;
  companies_house_number?: string;
  vat_number?: string;
  contact_name: string;
  email: string;
  phone: string;
  status: 'pending' | 'approved' | 'rejected';
  trade_tier: 'tier_1_5pct' | 'tier_2_10pct';
  credit_limit_gbp: number;
  created_at: string;
}

export interface ProductRepository {
  getAll(filters?: ProductFilters): Promise<PublicProductDTO[]>;
  getById(id: string): Promise<PublicProductDTO | null>;
  getBySlug(slug: string): Promise<PublicProductDTO | null>;
  getBySupplierSku(sku: string): Promise<PublicProductDTO | null>;
  create(product: PublicProductDTO, wholesaleOffer: WholesaleSupplierOffer): Promise<PublicProductDTO>;
  update(id: string, updates: Partial<PublicProductDTO>): Promise<PublicProductDTO | null>;
  delete(id: string): Promise<boolean>;
  count(): Promise<{ total: number; approved: number; draft: number; needs_review: number; blocked: number }>;
  getWholesaleOffer(supplierSku: string): Promise<WholesaleSupplierOffer | null>;
  updateWholesaleOffer(supplierSku: string, updates: Partial<WholesaleSupplierOffer>): Promise<WholesaleSupplierOffer | null>;
}

export interface OrderRepository {
  getAll(filters?: { state?: OrderState; customer_email?: string }): Promise<OrderRecord[]>;
  getById(id: string): Promise<OrderRecord | null>;
  getByOrderNumber(orderNumber: string): Promise<OrderRecord | null>;
  create(order: Omit<OrderRecord, 'id' | 'audit_logs'>): Promise<OrderRecord>;
  updateState(orderId: string, newState: OrderState, auditLog: OrderAuditLog): Promise<OrderRecord | null>;
  updateTracking(orderId: string, carrier: string, trackingNumber: string): Promise<OrderRecord | null>;
}

export interface SupplierRepository {
  getAll(): Promise<SupplierRecord[]>;
  getById(id: string): Promise<SupplierRecord | null>;
  update(id: string, updates: Partial<SupplierRecord>): Promise<SupplierRecord | null>;
}

export interface PricingRepository {
  getMarkupRules(): Promise<MarkupRule[]>;
  updateMarkupRule(categoryId: string, updates: Partial<MarkupRule>): Promise<MarkupRule | null>;
  getMarginFloor(): Promise<number>;
}

export interface CustomerRepository {
  getAll(): Promise<TradeCustomerRecord[]>;
  getById(id: string): Promise<TradeCustomerRecord | null>;
  updateStatus(id: string, status: 'approved' | 'rejected' | 'pending', creditLimitGbp?: number): Promise<TradeCustomerRecord | null>;
}

export interface DatabaseStore {
  products: ProductRepository;
  orders: OrderRepository;
  suppliers: SupplierRepository;
  pricing: PricingRepository;
  customers: CustomerRepository;
  reset(): Promise<void>;
}
```

##### Singleton In-Memory Seed Store Implementation
```typescript
// src/lib/db/memory-store.ts
// Uses globalThis.__toolcart_db__ to preserve state across Next.js dev reloads
import { getAllPublicProducts, _getServerWholesaleOffer } from '@/lib/catalog/products';
import { PublicProductDTO, WholesaleSupplierOffer } from '@/types/product';
import { OrderRecord, OrderState, OrderAuditLog } from '@/types/order';
import { DatabaseStore, SupplierRecord, MarkupRule, TradeCustomerRecord } from './types';
import { initialSuppliers, initialOrders, initialMarkupRules, initialTradeCustomers } from './seed-data';

class InMemoryStore implements DatabaseStore {
  private productsMap = new Map<string, PublicProductDTO>();
  private wholesaleMap = new Map<string, WholesaleSupplierOffer>();
  private ordersMap = new Map<string, OrderRecord>();
  private suppliersMap = new Map<string, SupplierRecord>();
  private markupRulesMap = new Map<string, MarkupRule>();
  private customersMap = new Map<string, TradeCustomerRecord>();
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    // Auto-seed all 115 products from baseline CSV
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
      this.ordersMap.set(o.id, { ...o });
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

  // Repositories wired directly to memory maps
  public products = { ... /* Implementation of ProductRepository */ };
  public orders = { ... /* Implementation of OrderRepository */ };
  public suppliers = { ... /* Implementation of SupplierRepository */ };
  public pricing = { ... /* Implementation of PricingRepository */ };
  public customers = { ... /* Implementation of CustomerRepository */ };
}

declare global {
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
```

---

#### Subsystem 4: Admin Portal UI (`app/admin/` & `src/components/admin/`)

1. **Admin Layout (`app/admin/layout.tsx` & `src/components/admin/admin-layout.tsx`)**:
   - Layout with fixed Brand V3 sidebar:
     - Sidebar background: `bg-tc-ink` (`#182336`), high contrast white text.
     - Brand logo: "ToolCart Admin" with 16px Action Lime square icon.
     - Nav items: Dashboard, Products, Orders, Suppliers, Import, Pricing, Customers, Settings.
     - Active route styling: `bg-tc-primary` (`#2450B8`), border-l-4 border-tc-action-lime.
   - Top Header bar:
     - Breadcrumb navigation (`Admin > Products > IONPVCMC5PKX6`).
     - Persistent Launch Gate status pill:
       `<Badge variant="lime" size="md">STAGING_ONLY: ACTIVE</Badge>` (Lime background, dark Ink text, 2px outline).
     - User Profile chip: "ops@toolcart.co.uk (Admin)".

2. **Dashboard (`app/admin/page.tsx`)**:
   - 5 KPI Cards:
     - **Total SKUs**: 115 (100% of baseline supplier catalog).
     - **Approved vs Draft**: `0 Approved / 115 Draft` (Highlights governance gate: zero live selling until signed direct dispatch).
     - **Active Orders**: Count of orders in `supplier_order_pending` or `payment_captured`.
     - **Supplier Feed Freshness**: "Status International UK: Fresh (18m ago) [TTL: 120m]".
     - **Gross Margin Average**: "45.2% (Tiers 1.65x - 2.20x applied)".
   - Recent State Transitions Feed: Table showing latest 5 transitions from `order_audit_logs`.
   - Governance & Launch Gate Matrix Card summarizing 10 checklist gates from `docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`.

3. **Product Manager (`app/admin/products/page.tsx`)**:
   - Search input (Search SKU, Title, GTIN, Category).
   - Category filter pill selector.
   - Status Tabs: `All (115)`, `Draft (115)`, `Needs Review (0)`, `Approved (0)`, `Blocked (0)`.
   - Data Table:
     - Columns: Thumbnail, Title & SKU, GTIN, Case Pack, Retail Inc/Ex VAT, Wholesale Cost (Admin-only), Badges (`UKCA`, `Image Lic`), Sellability Status Badge, Actions.
     - Edit button navigating to `/admin/products/[id]`.

4. **Product Editor (`app/admin/products/[id]/page.tsx`)**:
   - Interactive Form:
     - Sellability status selector: dropdown between `draft`, `needs_review`, `approved`, `blocked`.
     - Core attributes: Title, Description, Category, Brand, MPN, Merchant SKU.
     - Barcode & Packaging: GTIN EAN-13, Outer Carton Barcode (optional), Units per pack, Units per case.
     - Pricing & Margin view: Wholesale Unit Cost (£), Markup multiplier, Retail Ex. VAT (£), Retail Inc. VAT (£), Calculated Gross Margin % badge.
     - Compliance toggles:
       - `image_license_verified` (Toggle: "Photo license confirmed by Status UK Ltd").
       - `compliance_verified` (Toggle: "UKCA / CE declaration confirmed").
       - `supplier_direct_dispatch_verified` (Toggle: "Supplier direct dispatch agreement signed").
     - Key-value Technical Specifications table.

5. **Order Operations (`app/admin/orders/page.tsx`)**:
   - Order List Data Table:
     - Columns: Order Number, Customer, Date, Status Badge (color-coded for all 15 states), Amount (£ Inc. VAT), Supplier ID, Actions.
     - Filters: All, Action Required, In Transit, Delivered, Cancelled/Refunded.

6. **Order Fulfillment & State Management (`app/admin/orders/[id]/page.tsx`)**:
   - Dynamic Order Header with state badge and customer summary.
   - **Interactive State Transition Action Bar**:
     - Render transition action buttons based on `VALID_TRANSITIONS[order.state]`:
       - If `checkout_authorized`: Button `<Button variant="primary">Send PO to Supplier</Button>` -> calls `/api/admin/orders/[id]/transition` with `supplier_order_pending` and idempotency key.
       - If `supplier_order_pending`:
         - `<Button variant="primary">Supplier Accepted (Capture Payment)</Button>` -> transitions to `supplier_accepted` -> `payment_captured`.
         - `<Button variant="danger">Supplier Rejected (Auto-Refund)</Button>` -> transitions to `supplier_rejected` -> `refund_pending`.
         - `<Button variant="secondary">Mark Supplier Timeout</Button>` -> transitions to `supplier_timeout`.
       - If `payment_captured`:
         - `<Button variant="primary">Mark Dispatched</Button>` -> opens tracking number input modal, transitions to `dispatched`.
       - If `dispatched`:
         - `<Button variant="primary">Mark Delivered</Button>` -> transitions to `delivered`.
       - Global actions: "Flag for Manual Review", "Issue Full Refund".
   - **PO Details Card**:
     - Generated PO Reference (`PO-status-uk-ORD-2026-1002`).
     - Idempotency key (`${order_id}#${supplier_id}`).
     - Line items table with quantities and supplier SKUs.
   - **Tracking & Dispatch Card**:
     - Carrier selection (DPD, Royal Mail, DHL).
     - Tracking number input with "Update Tracking" button.
   - **Append-Only Audit Log Timeline (`audit-timeline.tsx`)**:
     - Chronological vertical stepper displaying every historical transition:
       - Date/time (ISO & UK format).
       - State transition (`from_state` -> `to_state`).
       - Trigger type & Actor.
       - Metadata (reasons, tracking, refund ID).

7. **Supplier Directory (`app/admin/suppliers/page.tsx`)**:
   - Supplier cards displaying Status International (UK) Ltd contact info, 115 quoted SKUs, 120-minute stock feed TTL indicator, carriage-paid rules (£50 ex VAT threshold).

8. **Catalog Importer UI (`app/admin/import/page.tsx`)**:
   - Drag-and-drop file upload zone for `.csv` and `.json`.
   - "Load Sample Supplier Catalog (`baseline/10_SAMPLE_SUPPLIER_CATALOG.csv`)" one-click sample loader.
   - Toggle: "Dry Run Validation" vs "Commit to Catalog".
   - Diagnostic Validation Table (`import-preview-table.tsx`):
     - Displays row-by-row validation output.
     - Flags math discrepancies, missing required fields, and ligature sanitizations.
     - Green `PASS` badge / Red `FAIL` badge per row.
     - "Commit Import (115 SKUs)" button enabled when valid rows exist.

9. **Pricing & Margin Engine (`app/admin/pricing/page.tsx`)**:
   - Margin tier rules configuration:
     - < £1.00: 2.20x markup (54.5% margin).
     - £1.00 - £3.00: 1.85x markup (45.9% margin).
     - > £3.00: 1.65x markup (39.4% margin).
   - Margin Floor Alert configuration (30% threshold).
   - Table of category markups and simulated retail prices.

10. **Trade Customer Directory (`app/admin/customers/page.tsx`)**:
    - Trade Account approval queue:
      - Review applicant company name, Companies House number, VAT number, requested credit limit.
      - Action buttons: "Approve Trade Account", "Reject".
    - Approved trade accounts list with credit limits and tier badges.

11. **Settings & Governance (`app/admin/settings/page.tsx`)**:
    - Launch Gates Status Dashboard (`docs/07_LAUNCH_GATES_AND_GOVERNANCE.md`):
      - `STAGING_ONLY`: Active.
      - Trademark & Brand Search: Provisional.
      - Supplier Direct Dispatch Agreement: Pending.
      - Image Licensing: Unverified.
    - Cloud Infrastructure Health:
      - Supabase: Connected / Local fallback ready.
      - Cloudflare R2: Ready (`6c9035e2ddbac196ef20ce5bfd9469cd`).
      - Stripe: Test Mode (`pk_test_...`).
      - Resend: Sandbox Log Mode.

---

#### Subsystem 5: Admin API Endpoints (`app/api/admin/`)

1. **`POST /api/admin/import` (`app/api/admin/import/route.ts`)**:
   - Accepts multipart form data or JSON body:
     - Body: `{ csv_content?: string, items?: any[], dryRun?: boolean }`.
   - Executes `parseAndValidateCatalogCsv(csvContent, dryRun)`.
   - If `dryRun === false`: saves valid products and wholesale offers into `getDb().products`.
   - Returns 200 with JSON summary of passed rows, failed rows, error details, and imported SKUs.

2. **`POST /api/admin/orders/[id]/transition` (`app/api/admin/orders/[id]/transition/route.ts`)**:
   - Body:
     ```json
     {
       "to_state": "supplier_accepted",
       "trigger": "admin",
       "actor": "admin:ops@toolcart.co.uk",
       "metadata": { "reason": "Supplier confirmed via telephone" },
       "idempotency_key": "po_status-uk_ORD-2026-1002"
     }
     ```
   - Calls `executeOrderTransition()`.
   - Returns 200 with `TransitionResult`.
   - Handles errors with 400 Bad Request (illegal transition) or 404 Not Found.

3. **`GET / POST / PUT /api/admin/products` (`app/api/admin/products/route.ts` & `[id]/route.ts`)**:
   - `GET /api/admin/products`: Returns all products with admin-level metadata (wholesale costs, compliance flags, sellability status).
   - `POST /api/admin/products`: Creates new product + wholesale offer after schema validation.
   - `PUT /api/admin/products/[id]`: Updates product fields (sellability status, compliance flags, specifications).

---

#### Subsystem 6: Test Specifications

##### Test Suite 1: State Machine & Idempotency (`tests/state-machine/state-machine.test.ts`)
```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { executeOrderTransition, generatePoIdempotencyKey } from '@/lib/state-machine/engine';
import { isValidTransition, VALID_TRANSITIONS } from '@/lib/state-machine/transitions';
import { getDb } from '@/lib/db';
import { OrderState } from '@/types/order';

describe('Supplier Order State Machine Test Suite', () => {
  beforeEach(async () => {
    await getDb().reset();
  });

  it('validates all 15 states in the state machine transition graph', () => {
    const states: OrderState[] = [
      'cart_pending',
      'checkout_authorized',
      'supplier_order_pending',
      'supplier_accepted',
      'payment_captured',
      'dispatched',
      'delivered',
      'supplier_rejected',
      'supplier_timeout',
      'payment_authorization_expired',
      'partial_supplier_acceptance',
      'partial_dispatch',
      'refund_pending',
      'refunded',
      'manual_review',
    ];
    for (const state of states) {
      expect(VALID_TRANSITIONS[state]).toBeDefined();
    }
  });

  it('executes the full happy path: cart_pending -> delivered', async () => {
    const orderId = 'ORD-2026-HAPPY';
    // Create new order in cart_pending
    await getDb().orders.create({
      order_number: 'TC-HAPPY',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      state: 'cart_pending',
      customer_email: 'test@toolcart.co.uk',
      shipping_address: { full_name: 'John Doe', address_line_1: '1 High St', city: 'London', postcode: 'EC1A 1BB', country: 'GB' },
      items: [],
      subtotal_ex_vat_gbp: 10,
      subtotal_inc_vat_gbp: 12,
      shipping_ex_vat_gbp: 5,
      shipping_inc_vat_gbp: 6,
      vat_amount_gbp: 3,
      total_inc_vat_gbp: 18,
      supplier_id: 'status-uk',
    });

    const transitions: OrderState[] = [
      'checkout_authorized',
      'supplier_order_pending',
      'supplier_accepted',
      'payment_captured',
      'dispatched',
      'delivered',
    ];

    for (const targetState of transitions) {
      const res = await executeOrderTransition({
        order_id: orderId,
        to_state: targetState,
        trigger: 'admin',
        actor: 'test_runner',
      });
      expect(res.success).toBe(true);
      expect(res.current_state).toBe(targetState);
    }

    const finalOrder = await getDb().orders.getById(orderId);
    expect(finalOrder?.state).toBe('delivered');
    expect(finalOrder?.audit_logs.length).toBe(6);
  });

  it('prevents illegal transitions and throws informative error', async () => {
    expect(isValidTransition('cart_pending', 'delivered')).toBe(false);
    expect(isValidTransition('cart_pending', 'dispatched')).toBe(false);
    expect(isValidTransition('supplier_rejected', 'dispatched')).toBe(false);

    await expect(
      executeOrderTransition({
        order_id: 'ORD-2026-1002', // state is supplier_order_pending
        to_state: 'delivered',
        trigger: 'admin',
        actor: 'bad_actor',
      })
    ).rejects.toThrow(/Illegal transition/);
  });

  it('enforces idempotency using order_id + supplier_id PO key', async () => {
    const key = generatePoIdempotencyKey('ORD-2026-1002', 'status-uk');
    expect(key).toBe('ORD-2026-1002#status-uk');

    // First transition
    const res1 = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_accepted',
      trigger: 'supplier',
      actor: 'status-uk_portal',
      idempotency_key: key,
    });
    expect(res1.idempotent_replay).toBe(false);

    // Duplicate call with same state & idempotency key
    const res2 = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_accepted',
      trigger: 'supplier',
      actor: 'status-uk_portal',
      idempotency_key: key,
    });
    expect(res2.idempotent_replay).toBe(true);
    expect(res2.current_state).toBe('supplier_accepted');
  });

  it('triggers auto-refund side effect when supplier rejects order', async () => {
    const res = await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'supplier_rejected',
      trigger: 'supplier',
      actor: 'status_uk_api',
      metadata: { reason: 'Out of stock at supplier warehouse' },
    });
    expect(res.side_effects_executed).toContain('TRIGGER_AUTO_REFUND');

    const order = await getDb().orders.getById('ORD-2026-1002');
    expect(order?.state).toBe('refund_pending');
  });

  it('guarantees append-only audit trail logging', async () => {
    const orderBefore = await getDb().orders.getById('ORD-2026-1002');
    const logsCountBefore = orderBefore?.audit_logs.length || 0;

    await executeOrderTransition({
      order_id: 'ORD-2026-1002',
      to_state: 'manual_review',
      trigger: 'admin',
      actor: 'admin:ops',
      metadata: { reason: 'Investigating delivery address' },
    });

    const orderAfter = await getDb().orders.getById('ORD-2026-1002');
    expect(orderAfter?.audit_logs.length).toBe(logsCountBefore + 1);

    const latestLog = orderAfter?.audit_logs[orderAfter.audit_logs.length - 1];
    expect(latestLog?.from_state).toBe('supplier_order_pending');
    expect(latestLog?.to_state).toBe('manual_review');
    expect(latestLog?.trigger).toBe('admin');
    expect(latestLog?.actor).toBe('admin:ops');
    expect(latestLog?.created_at).toBeDefined();
  });
});
```

##### Test Suite 2: Catalog Ingestion & Math Validation (`tests/catalog/catalog-ingestion.test.ts`)
```typescript
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { parseAndValidateCatalogCsv, validateCaseMath } from '@/lib/catalog/importer';
import { normalizeUnicode } from '@/lib/catalog/unicode';
import { ProductContractSchema } from '@/lib/catalog/contract-schema';

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
    const invalidMath = validateCaseMath(1.06, 6, 7.50);
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
});
```

---

## 5. Verification Method

To independently verify this blueprint before implementation:
1. **Existing Test Suite Baseline Verification**:
   ```powershell
   npm test
   ```
   *Expected Result*: Vitest passes all 75 tests with code 0.
2. **Catalog Math & Unicode Inspection**:
   ```powershell
   node -e 'const fs = require("fs"); const { parse } = require("csv-parse/sync"); const rows = parse(fs.readFileSync("baseline/10_SAMPLE_SUPPLIER_CATALOG.csv", "utf8"), { columns: true, skip_empty_lines: true, trim: true }); console.log("Rows:", rows.length);'
   ```
   *Expected Result*: Output `Rows: 115`.
3. **Static Brand & Contrast Check**:
   ```powershell
   python qa/check_static.py
   ```
   *Expected Result*: 0 brand violations, 0 forbidden colors (`#B84C32`, copper, purple, teal).

### Invalidation Conditions
- If any state among the 15 defined in `src/types/order.ts` is omitted from the transition map.
- If repeated transition requests with identical `order_id + supplier_id` cause double payment captures or duplicate audit records.
- If wholesale costs (`unit_cost_ex_vat_gbp` or `case_cost_ex_vat_gbp`) are emitted in `PublicProductDTO` or public API routes.
- If single-unit carton records without outer carton barcodes are rejected by the catalog importer.
- If Action Lime `#DDF16A` in the Admin Portal is paired with white text instead of dark Ink `#182336`.
