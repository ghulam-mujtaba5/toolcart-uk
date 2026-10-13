import * as React from 'react';
import { cn } from '@/lib/utils';

export type TradeIconSize = 16 | 20 | 24 | 32;
export type TradeIconVariant = 'duotone' | 'outline' | 'solid';

export interface TradeIconProps extends React.SVGAttributes<SVGSVGElement> {
  size?: TradeIconSize;
  variant?: TradeIconVariant;
  primaryColor?: string;
  secondaryColor?: string;
  secondaryOpacity?: number;
  className?: string;
  title?: string;
  'aria-label'?: string;
}

interface InternalIconProps extends TradeIconProps {
  renderSecondary: (props: { size: TradeIconSize; fill: string; fillOpacity: number }) => React.ReactNode;
  renderPrimary: (props: { size: TradeIconSize; stroke: string; strokeWidth: number }) => React.ReactNode;
  defaultTitle: string;
}

function BaseTradeIcon({
  size = 24,
  variant = 'duotone',
  primaryColor = 'currentColor',
  secondaryColor = 'currentColor',
  secondaryOpacity = 0.22,
  className,
  title,
  'aria-label': ariaLabel,
  renderSecondary,
  renderPrimary,
  defaultTitle,
  ...rest
}: InternalIconProps) {
  const viewBox = `0 0 ${size} ${size}`;
  const effectiveSecondaryOpacity =
    variant === 'outline' ? 0 : variant === 'solid' ? 0.85 : secondaryOpacity;

  const strokeWidth = size === 16 ? 1.75 : size === 20 ? 1.5 : size === 24 ? 1.5 : 1.25;

  const hasAccessibleName = Boolean(ariaLabel || title);
  const accessibleTitle = title || (!ariaLabel ? defaultTitle : undefined);

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role={hasAccessibleName ? 'img' : rest.role || 'img'}
      aria-hidden={!hasAccessibleName && !rest['aria-hidden'] ? true : rest['aria-hidden']}
      aria-label={ariaLabel}
      className={cn('inline-block shrink-0 select-none align-middle', className)}
      {...rest}
    >
      {accessibleTitle && <title>{accessibleTitle}</title>}
      {/* Secondary Duotone Layer */}
      <g
        className="tc-duotone-secondary"
        fill={secondaryColor}
        fillOpacity={effectiveSecondaryOpacity}
      >
        {renderSecondary({ size, fill: secondaryColor, fillOpacity: effectiveSecondaryOpacity })}
      </g>
      {/* Primary Outline / Structure Layer */}
      <g
        className="tc-duotone-primary"
        stroke={primaryColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {renderPrimary({ size, stroke: primaryColor, strokeWidth })}
      </g>
    </svg>
  );
}

// 1. IconToolbox
export function IconToolbox(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Toolbox"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <rect x="1.5" y="5" width="13" height="9" rx="1.5" />;
        }
        if (size === 20) {
          return <rect x="2" y="6" width="16" height="11" rx="2" />;
        }
        if (size === 32) {
          return (
            <path d="M3.5 14h25v12a2.5 2.5 0 01-2.5 2.5h-20a2.5 2.5 0 01-2.5-2.5V14z" />
          );
        }
        return <path d="M2.5 11h19v8.5a2 2 0 01-2 2h-15a2 2 0 01-2-2V11z" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <path d="M5 5V3a1 1 0 011-1h4a1 1 0 011 1v2" />
              <rect x="1.5" y="5" width="13" height="9" rx="1.5" />
              <path d="M1.5 8.5h13" />
              <rect x="7" y="7.5" width="2" height="2" rx="0.5" fill="none" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <path d="M6.5 6V3.5a1.5 1.5 0 011.5-1.5h4a1.5 1.5 0 011.5 1.5V6" />
              <rect x="2" y="6" width="16" height="11" rx="2" />
              <path d="M2 10.5h16" />
              <rect x="4.5" y="9.5" width="2" height="2.5" rx="0.5" fill="none" />
              <rect x="13.5" y="9.5" width="2" height="2.5" rx="0.5" fill="none" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <path d="M9 8V4.5A2 2 0 0111 2.5h10a2 2 0 012 2V8" />
              <path d="M13 5.5h6" />
              <rect x="3" y="8" width="26" height="20" rx="3" />
              <path d="M3 14h26" />
              <rect x="7" y="13" width="3.5" height="4" rx="0.5" fill="none" />
              <rect x="21.5" y="13" width="3.5" height="4" rx="0.5" fill="none" />
              <circle cx="5.5" cy="11" r="0.75" />
              <circle cx="26.5" cy="11" r="0.75" />
              <circle cx="5.5" cy="25" r="0.75" />
              <circle cx="26.5" cy="25" r="0.75" />
              <path d="M6 28v2 M26 28v2" />
            </>
          );
        }
        return (
          <>
            <path d="M7 6V3.5a1.5 1.5 0 011.5-1.5h7a1.5 1.5 0 011.5 1.5V6" />
            <rect x="2" y="6" width="20" height="15" rx="2" />
            <path d="M2 11h20" />
            <rect x="5.5" y="10" width="2.5" height="3" rx="0.5" fill="none" />
            <rect x="16" y="10" width="2.5" height="3" rx="0.5" fill="none" />
            <path d="M5 21v1.5 M19 21v1.5" />
          </>
        );
      }}
    />
  );
}

// 2. IconCaliper
export function IconCaliper(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Vernier Caliper"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <rect x="2" y="6" width="6" height="3.5" rx="0.5" />;
        }
        if (size === 20) {
          return <rect x="2" y="7.5" width="7.5" height="4.5" rx="0.5" />;
        }
        if (size === 32) {
          return <rect x="3.5" y="11" width="12" height="7" rx="1" />;
        }
        return <rect x="2.5" y="8" width="9.5" height="5.5" rx="0.75" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <rect x="2" y="1.5" width="2.5" height="13" rx="0.5" />
              <path d="M4.5 2h5l-2 3h-3" />
              <path d="M4.5 6.5h3.5l-1.5 2h-2" />
              <path d="M3.25 14.5v1" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <rect x="2.5" y="1.5" width="2.5" height="17" rx="0.5" />
              <path d="M5 2.5h6l-3 4H5" />
              <path d="M2.5 2.5H1l1.5 2.5" />
              <path d="M5 8.5h4.5l-2.5 3H5" />
              <path d="M5 13h1.5 M5 15h1.5" />
              <path d="M3.75 18.5v1" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <rect x="4" y="2.5" width="3.5" height="25" rx="0.75" />
              <path d="M7.5 3.5h11l-5.5 7H7.5" />
              <path d="M4 3.5H1l3 4.5" />
              <path d="M7.5 12.5h8.5l-5 6H7.5" />
              <path d="M4 12.5H2l2 3" />
              <rect x="13" y="11" width="2.5" height="5" rx="0.5" fill="none" />
              <path d="M7.5 18h2.5 M7.5 20.5h2 M7.5 23h2.5 M7.5 25.5h2" />
              <path d="M5.75 27.5v3.5" />
            </>
          );
        }
        return (
          <>
            <rect x="3" y="2" width="3" height="19" rx="0.5" />
            <path d="M6 3h8l-4 5H6" />
            <path d="M3 3H1l2 3" />
            <path d="M6 9.5h6l-3.5 4H6" />
            <path d="M3 9.5H1.5l1.5 2" />
            <path d="M6 14h2 M6 16.5h2 M6 19h2" />
            <circle cx="10" cy="8.5" r="1" fill="none" />
            <path d="M4.5 21v2" />
          </>
        );
      }}
    />
  );
}

// 3. IconTradeVerified
export function IconTradeVerified(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Trade Verified"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return (
            <path d="M8 2.2L3 4.3v3.7c0 3.2 2.1 5.3 5 6 2.9-.7 5-2.8 5-6V4.3L8 2.2z" />
          );
        }
        if (size === 20) {
          return (
            <path d="M10 2.8l-5.5 2.4v4.8c0 4 2.5 6.4 5.5 7.2 3-.8 5.5-3.2 5.5-7.2V5.2L10 2.8z" />
          );
        }
        if (size === 32) {
          return (
            <path d="M16 4.5l-9 3.8v7.7c0 6.5 4.1 10.5 9 11.7 4.9-1.2 9-5.2 9-11.7V8.3L16 4.5z" />
          );
        }
        return (
          <path d="M12 3.5l-6.5 2.8v5.7c0 4.7 3 7.6 6.5 8.5 3.5-.9 6.5-3.8 6.5-8.5V6.3L12 3.5z" />
        );
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <path d="M8 1.5L2 4v4.5c0 3.8 2.6 6.2 6 7 3.4-.8 6-3.2 6-7V4l-6-2.5z" />
              <path d="M5 8.2l2 2 4-4" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <path d="M10 2l-7 3v6c0 4.8 3.2 7.8 7 8.8 3.8-1 7-4 7-8.8V5l-7-3z" />
              <path d="M10 2v17.8" opacity="0.3" />
              <path d="M6.5 10.5l2.5 2.5 5-5" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <path d="M16 2.5L4.5 7v10c0 7.8 5.2 12.5 11.5 14 6.3-1.5 11.5-6.2 11.5-14V7L16 2.5z" />
              <circle cx="16" cy="5" r="0.9" fill="none" />
              <circle cx="6.5" cy="8.5" r="0.9" fill="none" />
              <circle cx="25.5" cy="8.5" r="0.9" fill="none" />
              <circle cx="6.5" cy="16" r="0.9" fill="none" />
              <circle cx="25.5" cy="16" r="0.9" fill="none" />
              <circle cx="16" cy="28" r="0.9" fill="none" />
              <path d="M10.5 16.5l4 4 7.5-7.5" strokeWidth={2} />
            </>
          );
        }
        return (
          <>
            <path d="M12 2L3.5 5.5v7c0 5.8 3.8 9.3 8.5 10.5 4.7-1.2 8.5-4.7 8.5-10.5v-7L12 2z" />
            <path d="M12 4.5L5.5 7.2v5.3c0 4.3 2.8 7 6.5 7.9 3.7-.9 6.5-3.6 6.5-7.9V7.2L12 4.5z" opacity="0.4" />
            <path d="M8 12.5l3 3 5.5-5.5" strokeWidth={2} />
          </>
        );
      }}
    />
  );
}

// 4. IconTapeMeasure
export function IconTapeMeasure(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Tape Measure"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <circle cx="6.5" cy="8.5" r="4" />;
        }
        if (size === 20) {
          return <circle cx="8" cy="10.5" r="5" />;
        }
        if (size === 32) {
          return <circle cx="12" cy="16" r="8" />;
        }
        return <circle cx="9.5" cy="12.5" r="6" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <path d="M2.5 6a4.5 4.5 0 017-3l3 2.5v5.5a4 4 0 01-4 4h-2a4.5 4.5 0 01-4-4.5V6z" />
              <path d="M8 3v3" />
              <path d="M11.5 11h3.5" />
              <path d="M15 11v3" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <path d="M3.5 7a6 6 0 019-3.5l4 3.5v7a5 5 0 01-5 5h-2a6 6 0 01-6-6V7z" />
              <path d="M10 3.5v4" />
              <path d="M14.5 14h4.5" />
              <path d="M19 14v3.5h-1" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <path d="M5 10a9.5 9.5 0 0115-5.5l7 5.5v12a8 8 0 01-8 8h-4a9.5 9.5 0 01-10-10V10z" />
              <path d="M5 14a9.5 9.5 0 007 8.5" opacity="0.4" />
              <rect x="16" y="3.5" width="4" height="6.5" rx="1.5" fill="none" />
              <rect x="10" y="13" width="4" height="6" rx="2" fill="none" />
              <path d="M22 22h8.5" />
              <path d="M24 20v2 M26 20.5v1.5 M28 20v2" />
              <path d="M30.5 22v6h-2" />
            </>
          );
        }
        return (
          <>
            <path d="M4 8a7 7 0 0111-4l5 4v9a6 6 0 01-6 6h-3a7 7 0 01-7-7V8z" />
            <rect x="12" y="3" width="3" height="5" rx="1" fill="none" />
            <circle cx="9.5" cy="12.5" r="2.5" fill="none" />
            <path d="M17 17h5.5" />
            <path d="M18.5 15.5v1.5 M20.5 15.5v1.5" />
            <path d="M22.5 17v4.5h-1.5" />
          </>
        );
      }}
    />
  );
}

// 5. IconBolt
export function IconBolt(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="High-Tensile Hex Bolt"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <rect x="5.5" y="5" width="5" height="9" rx="0.5" />;
        }
        if (size === 20) {
          return <rect x="6.5" y="6" width="7" height="12" rx="0.5" />;
        }
        if (size === 32) {
          return <rect x="10.5" y="9" width="11" height="19" rx="0.75" />;
        }
        return <rect x="8" y="7" width="8" height="14" rx="0.5" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <path d="M4 2h8l2 3H2l2-3z" />
              <rect x="5.5" y="5" width="5" height="9" rx="0.5" />
              <path d="M5.5 7.5l5-1.5 M5.5 10l5-1.5 M5.5 12.5l5-1.5" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <path d="M5 2.5h10l2.5 3.5H2.5L5 2.5z" />
              <path d="M3 6h14" />
              <rect x="6.5" y="6" width="7" height="12" rx="0.5" />
              <path d="M6.5 9l7-2 M6.5 12l7-2 M6.5 15l7-2" />
              <path d="M8 18h4" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <path d="M8 4h16l4 5H4l4-5z" />
              <path d="M12 4v5 M20 4v5" opacity="0.4" />
              <path d="M4.5 9h23" />
              <rect x="10.5" y="9" width="11" height="19" rx="0.75" />
              <path d="M10.5 13.5l11-2.5 M10.5 17.5l11-2.5 M10.5 21.5l11-2.5 M10.5 25.5l11-2.5" />
              <path d="M12.5 28l3.5 2 3.5-2" />
            </>
          );
        }
        return (
          <>
            <path d="M6 3h12l3 4H3l3-4z" />
            <path d="M3.5 7h17" />
            <rect x="8" y="7" width="8" height="14" rx="0.5" />
            <path d="M8 10.5l8-2 M8 13.5l8-2 M8 16.5l8-2 M8 19.5l8-2" />
            <path d="M9.5 21l2.5 1.5 2.5-1.5" />
          </>
        );
      }}
    />
  );
}

// 6. IconSpiritLevel
export function IconSpiritLevel(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Spirit Level"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <rect x="5.5" y="6.5" width="5" height="3" rx="1" />;
        }
        if (size === 20) {
          return <rect x="6.5" y="8" width="7" height="4" rx="1.5" />;
        }
        if (size === 32) {
          return (
            <>
              <rect x="11" y="13" width="10" height="6" rx="2" />
              <rect x="24" y="11.5" width="3.5" height="7" rx="1.5" />
            </>
          );
        }
        return (
          <>
            <rect x="8" y="9.5" width="8" height="5" rx="1.5" />
            <rect x="18.5" y="8.5" width="2.5" height="5" rx="1" />
          </>
        );
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <rect x="1" y="5" width="14" height="6" rx="1" />
              <rect x="5.5" y="6.5" width="5" height="3" rx="1" fill="none" />
              <circle cx="8" cy="8" r="0.8" fill="none" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <rect x="1.5" y="6" width="17" height="8" rx="1.5" />
              <path d="M4 6v8 M16 6v8" />
              <rect x="6.5" y="8" width="7" height="4" rx="1.5" fill="none" />
              <path d="M8.5 8v4 M11.5 8v4" opacity="0.5" />
              <circle cx="10" cy="10" r="1" fill="none" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <rect x="2" y="9" width="28" height="14" rx="2.5" />
              <rect x="2" y="9" width="3" height="14" rx="1.5" />
              <rect x="27" y="9" width="3" height="14" rx="1.5" />
              <path d="M5 11h22 M5 21h22" opacity="0.3" />
              <rect x="11" y="13" width="10" height="6" rx="2" fill="none" />
              <path d="M14.5 13v6 M17.5 13v6" opacity="0.7" />
              <circle cx="16" cy="16" r="1.5" fill="none" />
              <rect x="24" y="11.5" width="3.5" height="7" rx="1.5" fill="none" />
            </>
          );
        }
        return (
          <>
            <rect x="1.5" y="7" width="21" height="10" rx="2" />
            <rect x="1.5" y="7" width="2" height="10" rx="1" />
            <rect x="20.5" y="7" width="2" height="10" rx="1" />
            <rect x="4.5" y="10" width="2.5" height="4" rx="1" fill="none" />
            <rect x="8" y="9.5" width="8" height="5" rx="1.5" fill="none" />
            <path d="M10.5 9.5v5 M13.5 9.5v5" opacity="0.6" />
            <circle cx="12" cy="12" r="1.2" fill="none" />
            <rect x="18.5" y="8.5" width="2.5" height="5" rx="1" fill="none" />
          </>
        );
      }}
    />
  );
}

// 7. IconStockRadar
export function IconStockRadar(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Stock Telemetry Radar"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <path d="M8 8L12.5 3.5A6.5 6.5 0 0114.5 8z" />;
        }
        if (size === 20) {
          return <path d="M10 10L16 3.5A8.5 8.5 0 0118.5 10z" />;
        }
        if (size === 32) {
          return <path d="M16 16L26.5 5.5A14.5 14.5 0 0130.5 16z" />;
        }
        return <path d="M12 12L19.5 4.5A10.5 10.5 0 0122.5 12z" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <circle cx="8" cy="8" r="6.5" />
              <path d="M8 8l4.5-4.5" />
              <circle cx="8" cy="8" r="1.5" fill="none" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <circle cx="10" cy="10" r="8.5" />
              <circle cx="10" cy="10" r="4.5" />
              <path d="M10 1.5v17 M1.5 10h17" opacity="0.4" />
              <path d="M10 10l6-6.5" />
              <circle cx="10" cy="10" r="1.5" fill="none" />
              <circle cx="14" cy="6" r="1.5" fill="none" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <circle cx="16" cy="16" r="14.5" />
              <circle cx="16" cy="16" r="9.5" />
              <circle cx="16" cy="16" r="4.5" />
              <path d="M16 1.5v2 M16 28.5v2 M1.5 16h2 M28.5 16h2" />
              <path d="M16 16l10.5-10.5" strokeWidth={1.5} />
              <circle cx="16" cy="16" r="2" fill="none" />
              <circle cx="22" cy="10" r="1.8" fill="none" />
              <circle cx="10" cy="22" r="1.5" fill="none" />
            </>
          );
        }
        return (
          <>
            <circle cx="12" cy="12" r="10.5" />
            <circle cx="12" cy="12" r="6.5" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M12 1.5v21 M1.5 12h21" opacity="0.4" />
            <path d="M12 12l7.5-7.5" />
            <circle cx="16.5" cy="7.5" r="1.5" fill="none" />
            <circle cx="7" cy="16" r="1" opacity="0.7" fill="none" />
          </>
        );
      }}
    />
  );
}

// 8. IconTruckFreight
export function IconTruckFreight(props: TradeIconProps) {
  return (
    <BaseTradeIcon
      {...props}
      defaultTitle="Freight Logistics Truck"
      renderSecondary={({ size }) => {
        if (size === 16) {
          return <rect x="6" y="3" width="9" height="8" rx="0.5" />;
        }
        if (size === 20) {
          return <rect x="7.5" y="3.5" width="11" height="10" rx="0.75" />;
        }
        if (size === 32) {
          return <rect x="11.5" y="5" width="18.5" height="16" rx="1.5" />;
        }
        return <rect x="8.5" y="4" width="13.5" height="12" rx="1" />;
      }}
      renderPrimary={({ size }) => {
        if (size === 16) {
          return (
            <>
              <path d="M1 11V6a1 1 0 011-1h4v6z" />
              <path d="M2.5 6.5h2v2h-2z" />
              <rect x="6" y="3" width="9" height="8" rx="0.5" />
              <circle cx="4" cy="12.5" r="1.5" fill="none" />
              <circle cx="12" cy="12.5" r="1.5" fill="none" />
            </>
          );
        }
        if (size === 20) {
          return (
            <>
              <path d="M1.5 13.5V8a1 1 0 011-1h5v6.5z" />
              <path d="M2 7l4-3.5v3.5" />
              <rect x="3" y="8" width="3" height="3" rx="0.5" fill="none" />
              <rect x="7.5" y="3.5" width="11" height="10" rx="0.75" />
              <path d="M1.5 13.5h17" />
              <circle cx="5" cy="15" r="2" fill="none" />
              <circle cx="14.5" cy="15" r="2" fill="none" />
            </>
          );
        }
        if (size === 32) {
          return (
            <>
              <path d="M2 21V12a2 2 0 012-2h7v11z" />
              <path d="M4 10l6-5v5" />
              <rect x="4.5" y="12" width="5" height="4.5" rx="0.5" fill="none" />
              <path d="M2 18h2.5 M2 20h2.5" />
              <rect x="11.5" y="5" width="18.5" height="16" rx="1.5" />
              <path d="M20.5 5v16" opacity="0.4" />
              <rect x="29" y="8" width="1" height="2" fill="none" />
              <rect x="29" y="16" width="1" height="2" fill="none" />
              <path d="M2 21h28v1.5H2z" />
              <circle cx="7" cy="24" r="2.8" fill="none" />
              <circle cx="21" cy="24" r="2.8" fill="none" />
              <circle cx="26.5" cy="24" r="2.8" fill="none" />
            </>
          );
        }
        return (
          <>
            <path d="M2 16V9.5a1.5 1.5 0 011.5-1.5H8v8z" />
            <path d="M3.5 8L7.5 4V8" />
            <rect x="3.5" y="9.5" width="3.5" height="3.5" rx="0.5" fill="none" />
            <path d="M1.5 10v2" />
            <rect x="8.5" y="4" width="13.5" height="12" rx="1" />
            <path d="M8.5 10h13.5" opacity="0.5" />
            <path d="M2 16h20" />
            <circle cx="5.5" cy="18" r="2.2" fill="none" />
            <circle cx="15.5" cy="18" r="2.2" fill="none" />
            <circle cx="19.5" cy="18" r="2.2" fill="none" />
          </>
        );
      }}
    />
  );
}

// Map of all trade icons by name
export const tradeIconMap = {
  toolbox: IconToolbox,
  caliper: IconCaliper,
  'trade-verified': IconTradeVerified,
  'tape-measure': IconTapeMeasure,
  bolt: IconBolt,
  'spirit-level': IconSpiritLevel,
  'stock-radar': IconStockRadar,
  'truck-freight': IconTruckFreight,
} as const;

export type TradeIconName = keyof typeof tradeIconMap;

export interface DynamicTradeIconProps extends TradeIconProps {
  name: TradeIconName;
}

export function TradeIcon({ name, ...rest }: DynamicTradeIconProps) {
  const Component = tradeIconMap[name];
  if (!Component) return null;
  return <Component {...rest} />;
}
