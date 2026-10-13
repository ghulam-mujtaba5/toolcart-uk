import React from 'react';
import { OrderAuditLog } from '@/types/order';
import { Badge } from '@/components/ui/badge';
import { Clock, ArrowRight, UserCheck, Bot } from 'lucide-react';

export interface AuditTimelineProps {
  logs: OrderAuditLog[];
}

export function AuditTimeline({ logs }: AuditTimelineProps) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-tc-text-secondary bg-white border border-tc-border rounded-xl">
        No audit log entries recorded yet.
      </div>
    );
  }

  // Display logs in chronological order (or reverse chronological)
  const sortedLogs = [...logs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div className="bg-white border border-tc-border rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-tc-border pb-3">
        <div>
          <h3 className="font-heading font-bold text-sm text-tc-ink">
            Append-Only Audit Trail
          </h3>
          <p className="text-xs text-tc-text-secondary">
            Immutable log of state transitions, actor attributions, and side effects.
          </p>
        </div>
        <Badge variant="neutral" size="sm">
          {logs.length} Entries Recorded
        </Badge>
      </div>

      <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-tc-border">
        {sortedLogs.map((log) => {
          const date = new Date(log.created_at);
          const formattedDate = date.toLocaleString('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          const isSystem = log.actor.startsWith('system:') || log.actor.startsWith('stripe:') || log.trigger === 'webhook';

          return (
            <div key={log.id} className="relative group">
              {/* Dot Icon */}
              <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-tc-primary border-2 border-white flex items-center justify-center shadow-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-white" />
              </div>

              <div className="bg-tc-surface-soft border border-tc-border/80 rounded-lg p-3 text-xs space-y-2">
                {/* Header: Date + States */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-tc-ink">
                    <span className="px-1.5 py-0.5 rounded bg-white border border-tc-border text-tc-text-secondary">
                      {log.from_state}
                    </span>
                    <ArrowRight className="w-3 h-3 text-tc-text-secondary" />
                    <span className="px-1.5 py-0.5 rounded bg-tc-primary text-white">
                      {log.to_state}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-tc-text-secondary">
                    <Clock className="w-3 h-3" />
                    <span>{formattedDate}</span>
                  </div>
                </div>

                {/* Actor & Trigger */}
                <div className="flex items-center gap-2 text-[11px] text-tc-text-secondary border-t border-tc-border/60 pt-2">
                  {isSystem ? (
                    <Bot className="w-3.5 h-3.5 text-tc-primary" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-tc-ink" />
                  )}
                  <span>
                    Actor: <strong className="text-tc-ink">{log.actor}</strong>
                  </span>
                  <span>•</span>
                  <span>
                    Trigger: <span className="font-mono">{log.trigger}</span>
                  </span>
                </div>

                {/* Metadata Details */}
                {log.metadata && Object.keys(log.metadata).length > 0 && (
                  <div className="bg-white/80 p-2 rounded border border-tc-border/60 font-mono text-[10px] space-y-0.5 text-tc-ink">
                    {Boolean(log.metadata.reason) && (
                      <p>
                        <span className="text-tc-text-secondary font-sans font-bold">Reason:</span>{' '}
                        {String(log.metadata.reason)}
                      </p>
                    )}
                    {Array.isArray(log.metadata.side_effects) && log.metadata.side_effects.length > 0 && (
                      <p>
                        <span className="text-tc-text-secondary font-sans font-bold">Side Effects:</span>{' '}
                        {log.metadata.side_effects.join(', ')}
                      </p>
                    )}
                    {Boolean(log.metadata.idempotency_key) && (
                      <p className="text-tc-text-secondary truncate">
                        <span className="font-sans font-bold">Idempotency Key:</span>{' '}
                        {String(log.metadata.idempotency_key)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
