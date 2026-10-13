import React from 'react';

export interface EmptyToolChestVectorProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function EmptyToolChestVector({
  className = 'w-56 h-40 sm:w-64 sm:h-44 mx-auto',
  width,
  height,
}: EmptyToolChestVectorProps) {
  return (
    <svg
      viewBox="0 0 320 220"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="tc-chest-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="0.8" fill="#2450B8" fillOpacity="0.15" />
        </pattern>
      </defs>

      {/* Background blueprint alignment frame */}
      <rect
        x="20"
        y="20"
        width="280"
        height="180"
        rx="8"
        fill="url(#tc-chest-grid)"
        stroke="#EAF0FF"
        strokeWidth="1"
      />

      {/* Tool chest ground contact shadow */}
      <ellipse cx="160" cy="195" rx="110" ry="12" fill="#182336" fillOpacity="0.06" />

      {/* Main Chest Body Base */}
      <rect x="50" y="90" width="220" height="95" rx="6" fill="#182336" stroke="#2450B8" strokeWidth="2" />
      {/* Lower Drawers (Tier 1 & Tier 2) */}
      <rect x="54" y="94" width="212" height="40" rx="4" fill="#252D30" stroke="#7C8A94" strokeWidth="1" />
      <rect x="54" y="138" width="212" height="42" rx="4" fill="#252D30" stroke="#7C8A94" strokeWidth="1" />

      {/* Drawer Pull Handles */}
      <rect x="110" y="108" width="100" height="8" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="1.5" />
      <rect x="110" y="152" width="100" height="8" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="1.5" />

      {/* Drawer Slide Rail Accents */}
      <line x1="58" y1="112" x2="100" y2="112" stroke="#2450B8" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="220" y1="112" x2="262" y2="112" stroke="#2450B8" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="58" y1="156" x2="100" y2="156" stroke="#2450B8" strokeWidth="1.5" strokeOpacity="0.6" />
      <line x1="220" y1="156" x2="262" y2="156" stroke="#2450B8" strokeWidth="1.5" strokeOpacity="0.6" />

      {/* Open Lid (Isometric top tier cantilever angle) */}
      <path d="M50 90 L80 32 L240 32 L270 90 Z" fill="#2450B8" stroke="#182336" strokeWidth="2" />
      <path d="M58 88 L85 38 L235 38 L262 88 Z" fill="#193F99" />

      {/* Lid Gas Struts */}
      <line x1="68" y1="90" x2="88" y2="44" stroke="#DDF16A" strokeWidth="2" strokeLinecap="round" />
      <line x1="252" y1="90" x2="232" y2="44" stroke="#DDF16A" strokeWidth="2" strokeLinecap="round" />

      {/* CNC High-Density Foam Inlay Tray */}
      <rect x="64" y="52" width="192" height="34" rx="3" fill="#EAF0FF" stroke="#7C8A94" strokeWidth="1" />

      {/* Dashed Tool Cutout Silhouettes (Empty Tray State) */}
      {/* 1. Spanner silhouette */}
      <path
        d="M80 69 H140 M80 65 L72 69 L80 73 M140 65 L148 69 L140 73"
        stroke="#7C8A94"
        strokeWidth="1.75"
        strokeDasharray="4 3"
        strokeLinecap="round"
      />
      {/* 2. Screwdriver silhouette */}
      <rect
        x="156"
        y="65"
        width="46"
        height="8"
        rx="2"
        stroke="#7C8A94"
        strokeWidth="1.5"
        strokeDasharray="3 3"
        fill="none"
      />
      <line x1="202" y1="69" x2="222" y2="69" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="3 2" />

      {/* 3. Empty Socket Cutouts */}
      <circle cx="232" cy="69" r="4.5" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />
      <circle cx="244" cy="69" r="4.5" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="2 2" fill="none" />

      {/* High-Vis Action Lime Mechanical Toggle Latch */}
      <rect x="150" y="86" width="20" height="12" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
      <circle cx="160" cy="92" r="2" fill="#182336" />
    </svg>
  );
}
