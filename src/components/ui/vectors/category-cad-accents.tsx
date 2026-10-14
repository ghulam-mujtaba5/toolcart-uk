import React from 'react';

export interface CategoryCadAccentProps {
  categorySlug: string;
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function CategoryCadAccent({
  categorySlug,
  className = 'w-48 h-24 opacity-60',
  width,
  height,
}: CategoryCadAccentProps) {
  const normSlug = (categorySlug || '').toLowerCase().trim();

  switch (normSlug) {
    case 'tools':
    case 'hand-tools':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Spanner CAD wireframe */}
          <path d="M30 60 L160 60" stroke="#2450B8" strokeWidth="1" strokeDasharray="6 3" />
          <path d="M35 48 H150 V72 H35 Z" stroke="#7C8A94" strokeWidth="1.5" />
          <path d="M35 48 C20 48 10 52 10 60 C10 68 20 72 35 72 L45 66 L45 54 Z" stroke="#2450B8" strokeWidth="2" />
          {/* Screwdriver CAD wireframe */}
          <line x1="80" y1="20" x2="220" y2="20" stroke="#7C8A94" strokeWidth="1.5" />
          <rect x="80" y="14" width="50" height="12" rx="2" stroke="#2450B8" strokeWidth="1.5" />
          <polygon points="220,17 230,20 220,23" fill="#2450B8" />
          {/* Dimension Arc */}
          <path d="M25 40 A15 15 0 0 1 45 40" stroke="#2450B8" strokeWidth="1" strokeDasharray="2 2" />
          <text x="35" y="36" fill="#2450B8" fontSize="7" fontFamily="monospace">15°</text>
        </svg>
      );

    case 'fixings':
    case 'fixings-security':
    case 'fixings-hardware':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Hex Bolt M10 Wireframe */}
          <polygon points="40,30 60,30 70,47 60,65 40,65 30,47" stroke="#2450B8" strokeWidth="2" fill="none" />
          <rect x="70" y="38" width="90" height="18" stroke="#7C8A94" strokeWidth="1.5" />
          {/* Thread pitch ridges */}
          {Array.from({ length: 9 }).map((_, i) => (
            <line key={i} x1={80 + i * 9} y1={38} x2={85 + i * 9} y2={56} stroke="#2450B8" strokeWidth="1.5" />
          ))}
          {/* Heavy Padlock Wireframe */}
          <rect x="175" y="45" width="50" height="42" rx="4" stroke="#182336" strokeWidth="2" fill="none" />
          <path d="M185 45 V30 C185 20 215 20 215 30 V45" stroke="#2450B8" strokeWidth="2" fill="none" />
          <circle cx="200" cy="62" r="4" fill="#2450B8" />
          <line x1="200" y1="66" x2="200" y2="74" stroke="#2450B8" strokeWidth="2" />
        </svg>
      );

    case 'decorating':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Paint Roller Wireframe */}
          <rect x="30" y="20" width="80" height="30" rx="3" stroke="#2450B8" strokeWidth="2" fill="none" />
          <line x1="110" y1="35" x2="135" y2="35" stroke="#7C8A94" strokeWidth="2" />
          <path d="M135 35 V75 H120 V105" stroke="#7C8A94" strokeWidth="2" fill="none" />
          <rect x="114" y="85" width="12" height="25" rx="2" stroke="#182336" strokeWidth="1.5" />
          {/* Sash Brush Ferrule */}
          <rect x="160" y="40" width="45" height="20" stroke="#2450B8" strokeWidth="1.5" />
          <path d="M160 60 C160 85 205 85 205 60 Z" stroke="#7C8A94" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Tape Core Callout */}
          <circle cx="182" cy="20" r="14" stroke="#2450B8" strokeWidth="1.5" strokeDasharray="3 2" />
          <text x="182" y="23" fill="#2450B8" fontSize="7" textAnchor="middle" fontFamily="monospace">Ø76</text>
        </svg>
      );

    case 'measuring':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Spirit Level Box Beam */}
          <rect x="20" y="40" width="200" height="36" rx="4" stroke="#182336" strokeWidth="2" fill="none" />
          {/* Horizontal Level Vial */}
          <rect x="100" y="48" width="40" height="20" rx="4" stroke="#2450B8" strokeWidth="1.5" fill="#EAF0FF" />
          <circle cx="120" cy="58" r="4" fill="#DDF16A" stroke="#182336" strokeWidth="1" />
          <line x1="114" y1="48" x2="114" y2="68" stroke="#182336" strokeWidth="1" />
          <line x1="126" y1="48" x2="126" y2="68" stroke="#182336" strokeWidth="1" />
          {/* 45° Vial */}
          <g transform="translate(50, 48) rotate(45 10 10)">
            <rect x="0" y="5" width="20" height="10" rx="2" stroke="#2450B8" strokeWidth="1" />
          </g>
          {/* Millimeter Scale */}
          {Array.from({ length: 21 }).map((_, i) => (
            <line
              key={i}
              x1={25 + i * 9.5}
              y1={40}
              x2={25 + i * 9.5}
              y2={i % 5 === 0 ? 47 : 44}
              stroke="#7C8A94"
              strokeWidth={1}
            />
          ))}
        </svg>
      );

    case 'ppe':
    case 'workwear-safety':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Safety Goggles Contour */}
          <path
            d="M30 45 C40 30 90 30 100 45 C110 55 110 75 90 75 C70 75 40 75 30 45 Z"
            stroke="#2450B8"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M130 45 C140 30 190 30 200 45 C210 55 210 75 190 75 C170 75 140 75 130 45 Z"
            stroke="#2450B8"
            strokeWidth="2"
            fill="none"
          />
          <path d="M100 45 C115 42 115 42 130 45" stroke="#182336" strokeWidth="2" />
          {/* EN166 Marking */}
          <text
            x="115"
            y="88"
            fill="#2450B8"
            fontSize="8"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            EN166 • 1F CE
          </text>
        </svg>
      );

    case 'electrical':
    case 'electrical-tapes':
    case 'electrical-lighting':
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Cable Reel / Tape Coil Wireframe */}
          <circle cx="50" cy="60" r="35" stroke="#182336" strokeWidth="2" fill="none" />
          <circle cx="50" cy="60" r="22" stroke="#2450B8" strokeWidth="1.5" strokeDasharray="4 2" />
          <circle cx="50" cy="60" r="10" stroke="#7C8A94" strokeWidth="1.5" fill="#EAF0FF" />
          {/* Voltage Waveform / Pulse */}
          <path
            d="M95 60 L115 60 L125 35 L140 85 L150 50 L160 65 L170 60 L205 60"
            stroke="#2450B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* BS EN 60454 Rating Badge */}
          <rect x="145" y="20" width="56" height="16" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
          <text
            x="173"
            y="31"
            fill="#182336"
            fontSize="7.5"
            fontWeight="bold"
            textAnchor="middle"
            fontFamily="monospace"
          >
            BS EN 60454
          </text>
          {/* Dimension Callout */}
          <line x1="15" y1="102" x2="85" y2="102" stroke="#7C8A94" strokeWidth="1" strokeDasharray="2 2" />
          <text x="50" y="112" fill="#2450B8" fontSize="7" textAnchor="middle" fontFamily="monospace">Ø70mm • 230V</text>
        </svg>
      );

    case 'site-equipment':
    default:
      return (
        <svg
          viewBox="0 0 240 120"
          width={width}
          height={height}
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={className}
          aria-hidden="true"
        >
          {/* Stepladder A-Frame Truss */}
          <line x1="40" y1="105" x2="85" y2="20" stroke="#182336" strokeWidth="2.5" />
          <line x1="130" y1="105" x2="85" y2="20" stroke="#182336" strokeWidth="2.5" />
          {/* Platform Top (Action Lime with Ink outline) */}
          <rect x="75" y="16" width="20" height="8" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
          {/* Ladder Rungs */}
          <line x1="53" y1="80" x2="117" y2="80" stroke="#2450B8" strokeWidth="2" />
          <line x1="64" y1="58" x2="106" y2="58" stroke="#2450B8" strokeWidth="2" />
          <line x1="74" y1="38" x2="96" y2="38" stroke="#2450B8" strokeWidth="2" />
          {/* Spreader Bar */}
          <line x1="58" y1="70" x2="112" y2="70" stroke="#7C8A94" strokeWidth="1" strokeDasharray="3 2" />
          {/* Ratchet Cam Motif */}
          <circle cx="180" cy="55" r="18" stroke="#2450B8" strokeWidth="2" fill="none" />
          <circle cx="180" cy="55" r="8" fill="#182336" />
          <rect x="176" y="25" width="8" height="15" rx="2" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
        </svg>
      );
  }
}

export const CategoryCadAccents = CategoryCadAccent;
