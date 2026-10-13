import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

export interface KpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: LucideIcon;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    label: string;
  };
  className?: string;
}

export function KpiCard({
  title,
  value,
  subtitle,
  badge,
  icon: Icon,
  trend,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cn(
        'bg-white border border-tc-border rounded-xl p-5 shadow-xs flex flex-col justify-between transition-all hover:border-tc-border-strong',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-tc-text-secondary">
          {title}
        </span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-tc-surface-soft text-tc-primary flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div className="flex items-baseline gap-2">
          <span className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-tc-ink tabular-nums">
            {value}
          </span>
          {badge}
        </div>

        {subtitle && (
          <p className="mt-1 text-xs text-tc-text-secondary font-medium leading-relaxed">
            {subtitle}
          </p>
        )}

        {trend && (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium">
            <span
              className={cn(
                'font-bold',
                trend.direction === 'up' && 'text-tc-success',
                trend.direction === 'down' && 'text-tc-error',
                trend.direction === 'neutral' && 'text-tc-text-secondary'
              )}
            >
              {trend.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
