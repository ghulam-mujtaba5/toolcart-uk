import * as React from 'react';
import { cn } from '@/lib/utils';

export interface SpecItem {
  label: string;
  value: React.ReactNode;
  highlighted?: boolean;
}

export interface SpecTableProps {
  specs: SpecItem[] | Record<string, string | number | undefined | null>;
  caption?: string;
  compact?: boolean;
  striped?: boolean;
  className?: string;
}

export function SpecTable({
  specs,
  caption,
  compact = false,
  striped = true,
  className,
}: SpecTableProps) {
  const normalizedSpecs: SpecItem[] = React.useMemo(() => {
    if (Array.isArray(specs)) {
      return specs;
    }
    return Object.entries(specs)
      .filter(([_, val]) => val !== undefined && val !== null && val !== '')
      .map(([label, value]) => ({
        label,
        value,
      }));
  }, [specs]);

  if (!normalizedSpecs.length) {
    return null;
  }

  return (
    <div
      className={cn(
        'w-full overflow-hidden rounded-[var(--radius-card)] border border-tc-border font-body shadow-sm',
        className
      )}
    >
      <table className="w-full border-collapse text-left text-sm">
        {caption && (
          <caption className="bg-tc-canvas px-4 py-3 text-left font-heading text-xs font-semibold uppercase tracking-wider text-tc-text-secondary border-b border-tc-border">
            {caption}
          </caption>
        )}
        <tbody className="divide-y divide-tc-border/60">
          {normalizedSpecs.map((spec, index) => {
            const isEven = index % 2 === 1;
            return (
              <tr
                key={`${spec.label}-${index}`}
                className={cn(
                  'transition-colors',
                  striped && isEven ? 'bg-tc-canvas/60' : 'bg-white',
                  'hover:bg-tc-surface-soft/40',
                  spec.highlighted && 'bg-tc-surface-soft/60'
                )}
              >
                <th
                  scope="row"
                  className={cn(
                    'w-1/3 text-tc-ink font-medium align-top border-b border-tc-border/60',
                    compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                  )}
                >
                  {spec.label}
                </th>
                <td
                  className={cn(
                    'w-2/3 text-tc-graphite font-normal tabular-nums align-top border-b border-tc-border/60',
                    compact ? 'px-3 py-2 text-xs' : 'px-4 py-3 text-sm'
                  )}
                >
                  {spec.value}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
