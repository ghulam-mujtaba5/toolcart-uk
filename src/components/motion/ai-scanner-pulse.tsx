"use client";

import React from "react";

interface AiScannerPulseProps {
  className?: string;
  size?: number;
}

export function AiScannerPulse({ className = "", size = 64 }: AiScannerPulseProps) {
  return (
    <div
      role="status"
      aria-label="ToolCart AI scanning technical specifications"
      className={`relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Blueprint grid background */}
      <div className="absolute inset-0 tc-bg-dots opacity-40 pointer-events-none" />

      {/* Radar Pulse Rings */}
      <span
        aria-hidden="true"
        className="absolute w-12 h-12 rounded-full border border-tc-primary/40 tc-animate-radar pointer-events-none"
      />
      <span
        aria-hidden="true"
        className="absolute w-8 h-8 rounded-full border border-tc-action-lime/60 tc-animate-radar pointer-events-none"
        style={{ animationDelay: "600ms" }}
      />

      {/* Laser Scanning Beam */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-tc-primary to-transparent tc-animate-scan pointer-events-none"
      />

      {/* Center Caliper / Spark Icon */}
      <svg
        width={Math.round(size * 0.44)}
        height={Math.round(size * 0.44)}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 text-tc-primary"
      >
        <path
          d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z"
          fill="#DDF16A"
          stroke="#182336"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2" fill="#2450B8" />
      </svg>
    </div>
  );
}
