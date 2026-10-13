"use client";

import React from "react";

interface TradeStampMotionProps {
  className?: string;
  size?: number;
  label?: string;
}

export function TradeStampMotion({
  className = "",
  size = 72,
  label = "TRADE PRO VERIFIED",
}: TradeStampMotionProps) {
  return (
    <div
      role="status"
      aria-label="Trade pro application approved"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 72 72"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="tc-animate-stamp"
      >
        {/* Outer Hexagon / Industrial Nut Gear */}
        <path
          d="M36 4L64 20V52L36 68L8 52V20L36 4Z"
          fill="#EAF0FF"
          stroke="#182336"
          strokeWidth="3"
        />
        {/* Action Lime Inner Border Ring */}
        <circle cx="36" cy="36" r="22" stroke="#DDF16A" strokeWidth="3" strokeDasharray="4 2" />
        {/* Center Shield */}
        <path
          d="M36 20L48 26V36C48 43 43 49 36 51C29 49 24 43 24 36V26L36 20Z"
          fill="#2450B8"
          stroke="#182336"
          strokeWidth="2"
        />
        {/* Checkmark in Action Lime */}
        <path
          d="M31 36L34.5 39.5L41.5 32.5"
          stroke="#DDF16A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {label && (
        <span className="sr-only">{label}</span>
      )}
    </div>
  );
}
