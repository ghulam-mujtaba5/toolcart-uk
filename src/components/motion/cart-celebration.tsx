"use client";

import React from "react";

interface CartCelebrationProps {
  className?: string;
  size?: number;
}

export function CartCelebration({ className = "", size = 48 }: CartCelebrationProps) {
  return (
    <div
      role="status"
      aria-label="Item added to tool crate"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Bursting sparks in Action Lime and Cobalt */}
      <span
        aria-hidden="true"
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-tc-action-lime border border-tc-ink animate-ping"
      />
      <span
        aria-hidden="true"
        className="absolute -bottom-1 -left-1 w-1.5 h-1.5 rounded-full bg-tc-primary animate-ping"
        style={{ animationDelay: "150ms" }}
      />
      <span
        aria-hidden="true"
        className="absolute top-1/2 -right-2 w-1.5 h-1.5 rounded-full bg-tc-action-lime animate-pulse"
      />

      {/* Tactile Tool Chest snapping shut */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="tc-animate-snap"
      >
        {/* Tool chest base */}
        <rect
          x="6"
          y="18"
          width="36"
          height="22"
          rx="3"
          fill="#182336"
          stroke="#182336"
          strokeWidth="2"
        />
        {/* Tool chest lid / top handle */}
        <path
          d="M18 18V11C18 9.89543 18.8954 9 20 9H28C29.1046 9 30 9.89543 30 11V18"
          stroke="#182336"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Action Lime latch */}
        <rect
          x="21"
          y="18"
          width="6"
          height="8"
          rx="1.5"
          fill="#DDF16A"
          stroke="#182336"
          strokeWidth="1.5"
        />
        {/* Reinforced industrial side brackets */}
        <line x1="12" y1="24" x2="12" y2="34" stroke="#596B70" strokeWidth="2" strokeLinecap="round" />
        <line x1="36" y1="24" x2="36" y2="34" stroke="#596B70" strokeWidth="2" strokeLinecap="round" />
        {/* Center checkmark */}
        <path
          d="M17 28L22 33L31 23"
          stroke="#DDF16A"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
