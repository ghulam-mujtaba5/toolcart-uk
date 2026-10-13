import { OrderState, OrderAuditLog } from '@/types/order';

export type StateTrigger =
  | 'customer'
  | 'admin'
  | 'supplier'
  | 'webhook'
  | 'cron_timeout'
  | 'test'
  | 'system'
  | 'cron'
  | 'c'
  | 's';

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
