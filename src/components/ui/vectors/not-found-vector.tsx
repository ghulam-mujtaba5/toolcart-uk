import React from 'react';

export interface NotFoundVectorProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export function NotFoundVector({
  className = 'w-64 h-40 sm:w-80 sm:h-48 mx-auto',
  width,
  height,
}: NotFoundVectorProps) {
  return (
    <svg
      viewBox="0 0 360 220"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <pattern id="tc-notfound-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#2450B8" strokeWidth="0.5" strokeOpacity="0.12" />
        </pattern>
      </defs>

      {/* Blueprint Grid Canvas */}
      <rect x="10" y="10" width="340" height="200" rx="10" fill="#F7F8F5" stroke="#D8E0E5" strokeWidth="1" />
      <rect x="10" y="10" width="340" height="200" rx="10" fill="url(#tc-notfound-grid)" />

      {/* Soft Contact Shadows */}
      <ellipse cx="140" cy="180" rx="90" ry="10" fill="#182336" fillOpacity="0.07" />
      <ellipse cx="270" cy="180" rx="50" ry="6" fill="#182336" fillOpacity="0.05" />

      {/* Tape Measure Housing */}
      <rect x="40" y="70" width="105" height="100" rx="18" fill="#182336" stroke="#2450B8" strokeWidth="2.5" />
      <path d="M45 78 C45 74 135 74 135 78 L140 162 C140 166 45 166 45 162 Z" fill="#2450B8" fillOpacity="0.25" />

      {/* Tape Overmold Grip Ribs */}
      <rect x="36" y="92" width="8" height="14" rx="2" fill="#2450B8" />
      <rect x="36" y="112" width="8" height="14" rx="2" fill="#2450B8" />
      <rect x="36" y="132" width="8" height="14" rx="2" fill="#2450B8" />

      {/* Action Lime Thumb Lock Switch */}
      <rect x="75" y="52" width="32" height="20" rx="4" fill="#DDF16A" stroke="#182336" strokeWidth="2" />
      <line x1="83" y1="58" x2="83" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="91" y1="58" x2="91" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="99" y1="58" x2="99" y2="66" stroke="#182336" strokeWidth="1.5" strokeLinecap="round" />

      {/* Center Metallic Badge */}
      <circle cx="92" cy="120" r="24" fill="#252D30" stroke="#7C8A94" strokeWidth="2" />
      <text x="92" y="123" fill="#FFFFFF" fontSize="9" fontWeight="800" textAnchor="middle" fontFamily="sans-serif">
        TC-5M
      </text>
      <text x="92" y="133" fill="#DDF16A" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
        CLASS II
      </text>

      {/* Extended Tape Blade (Attached Section) */}
      <path
        d="M145 136 L232 136 L230 144 L233 148 L228 154 L145 154 Z"
        fill="#DDF16A"
        stroke="#182336"
        strokeWidth="1.5"
      />
      {/* Millimeter Graduations on Blade */}
      <line x1="155" y1="136" x2="155" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="165" y1="136" x2="165" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="175" y1="136" x2="175" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="185" y1="136" x2="185" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="195" y1="136" x2="195" y2="142" stroke="#182336" strokeWidth="1" />
      <line x1="205" y1="136" x2="205" y2="145" stroke="#182336" strokeWidth="1.25" />
      <line x1="215" y1="136" x2="215" y2="142" stroke="#182336" strokeWidth="1" />

      {/* Centimeter Markings (Dark Ink text on Action Lime blade) */}
      <text x="165" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">380</text>
      <text x="185" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">390</text>
      <text x="205" y="152" fill="#182336" fontSize="7" fontWeight="bold" textAnchor="middle">400</text>

      {/* Fractured Snapped Tape Tip (Detached Section) */}
      <g transform="translate(242, 138) rotate(12)">
        <path
          d="M0 0 L60 0 L60 18 L0 18 L4 12 L0 6 Z"
          fill="#DDF16A"
          stroke="#182336"
          strokeWidth="1.5"
        />
        {/* Fractured 404 label */}
        <text x="22" y="13" fill="#182336" fontSize="10" fontWeight="900" fontFamily="monospace">
          404!
        </text>
        {/* Riveted End Hook */}
        <path d="M60 0 L64 0 L64 24 L58 24 L58 18 Z" fill="#182336" />
        <circle cx="56" cy="6" r="1.5" fill="#FFFFFF" />
        <circle cx="56" cy="12" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Snapped Coil Spring Ejected */}
      <path
        d="M142 142 Q150 120 162 126 T176 112"
        fill="none"
        stroke="#7C8A94"
        strokeWidth="1.5"
        strokeDasharray="3 2"
      />

      {/* Dimension Line Error Callout */}
      <g transform="translate(145, 172)">
        <line x1="0" y1="0" x2="160" y2="0" stroke="#2450B8" strokeWidth="1" strokeDasharray="3 3" />
        <path d="M0 -3 L0 3 M160 -3 L160 3" stroke="#2450B8" strokeWidth="1.5" />
        <text x="80" y="-4" fill="#2450B8" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
          ERR: CUT AT 404mm
        </text>
      </g>
    </svg>
  );
}
