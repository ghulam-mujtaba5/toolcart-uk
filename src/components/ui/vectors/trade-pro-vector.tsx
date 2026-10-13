import React from 'react';

export interface TradeProHeroVectorProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function TradeProHeroVector({
  className = 'w-64 h-44 sm:w-80 sm:h-52 mx-auto',
  width,
  height,
}: TradeProHeroVectorProps) {
  return (
    <svg
      viewBox="0 0 340 220"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="tc-tradepro-cad" width="16" height="16" patternUnits="userSpaceOnUse">
          <line x1="0" y1="16" x2="16" y2="0" stroke="#2450B8" strokeWidth="0.5" strokeOpacity="0.08" />
        </pattern>
      </defs>

      {/* Engineering Drawing Frame */}
      <rect
        x="12"
        y="12"
        width="316"
        height="196"
        rx="8"
        fill="#F7F8F5"
        stroke="#7C8A94"
        strokeWidth="1"
        strokeDasharray="6 3"
      />
      <rect x="12" y="12" width="316" height="196" rx="8" fill="url(#tc-tradepro-cad)" />

      {/* Verification Shield (Centered, clamped by caliper) */}
      <g transform="translate(130, 60)">
        {/* Outer Shield Outline */}
        <path
          d="M40 0 L75 18 L75 65 C75 92 40 108 40 108 C40 108 5 92 5 65 L5 18 Z"
          fill="#182336"
          stroke="#2450B8"
          strokeWidth="2.5"
        />
        {/* Inner Lime Accent Inset */}
        <path
          d="M40 8 L68 22 L68 62 C68 84 40 98 40 98 C40 98 12 84 12 62 L12 22 Z"
          fill="#2450B8"
          stroke="#DDF16A"
          strokeWidth="1.5"
        />
        {/* Certified Trade Emblem: Gear + Tick */}
        <circle cx="40" cy="50" r="16" fill="#182336" stroke="#DDF16A" strokeWidth="1.5" />
        <path
          d="M33 50 L38 55 L48 44"
          stroke="#DDF16A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <text
          x="40"
          y="80"
          fill="#FFFFFF"
          fontSize="6.5"
          fontWeight="900"
          textAnchor="middle"
          letterSpacing="0.5"
          fontFamily="sans-serif"
        >
          VERIFIED
        </text>
      </g>

      {/* Vernier Caliper Assembly */}
      {/* 1. Main Caliper Beam */}
      <rect x="30" y="44" width="280" height="20" rx="2" fill="#EAF0FF" stroke="#182336" strokeWidth="2" />
      {/* Metric Scale Graduations */}
      {Array.from({ length: 26 }).map((_, i) => (
        <line
          key={i}
          x1={40 + i * 10}
          y1={44}
          x2={40 + i * 10}
          y2={i % 5 === 0 ? 56 : 50}
          stroke="#182336"
          strokeWidth={i % 5 === 0 ? 1.5 : 0.75}
        />
      ))}

      {/* 2. Fixed Jaw (Left side, touching shield at x=135) */}
      <path
        d="M30 44 L30 160 L45 160 L45 110 L135 70 L135 44 Z"
        fill="#182336"
        stroke="#2450B8"
        strokeWidth="2"
      />
      {/* Ground measuring surface contact line */}
      <line x1="135" y1="64" x2="135" y2="120" stroke="#DDF16A" strokeWidth="2" />

      {/* 3. Sliding Vernier Jaw (Right side, touching shield at x=205) */}
      <g transform="translate(195, 36)">
        {/* Vernier Frame */}
        <rect x="0" y="0" width="45" height="36" rx="3" fill="#FFFFFF" stroke="#182336" strokeWidth="2" />
        {/* Thumbscrew */}
        <rect x="18" y="-8" width="10" height="8" rx="1" fill="#7C8A94" stroke="#182336" strokeWidth="1" />
        {/* Vernier Subdivisions */}
        <line x1="5" y1="28" x2="5" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="15" y1="28" x2="15" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="25" y1="28" x2="25" y2="36" stroke="#182336" strokeWidth="1" />
        <line x1="35" y1="28" x2="35" y2="36" stroke="#182336" strokeWidth="1" />
        {/* Sliding Outside Jaw */}
        <path d="M10 36 L10 128 L22 128 L22 76 L10 36 Z" fill="#182336" stroke="#2450B8" strokeWidth="2" />
        {/* Measuring Contact Face */}
        <line x1="10" y1="42" x2="10" y2="128" stroke="#DDF16A" strokeWidth="2" />
      </g>

      {/* Engineering Callouts & Tolerances */}
      <g transform="translate(135, 175)">
        <line x1="0" y1="0" x2="70" y2="0" stroke="#2450B8" strokeWidth="1.5" />
        <path d="M0 -4 L0 4 M70 -4 L70 4" stroke="#2450B8" strokeWidth="1.5" />
        <text
          x="35"
          y="-6"
          fill="#182336"
          fontSize="9"
          fontWeight="800"
          textAnchor="middle"
          fontFamily="monospace"
        >
          30.00mm (NET 30)
        </text>
      </g>

      {/* High-Vis Trade Stamp (Action Lime fill with dark Ink text) */}
      <g transform="translate(250, 155)">
        <rect x="0" y="0" width="70" height="24" rx="4" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
        <text
          x="35"
          y="16"
          fill="#182336"
          fontSize="8.5"
          fontWeight="900"
          textAnchor="middle"
          fontFamily="sans-serif"
        >
          UK TRADE PRO
        </text>
      </g>
    </svg>
  );
}

export const TradeProVector = TradeProHeroVector;
