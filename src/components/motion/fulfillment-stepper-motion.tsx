"use client";

import React from "react";

export type FulfillmentMotionStage = "packing" | "transit" | "delivered";

interface FulfillmentStepperMotionProps {
  stage: FulfillmentMotionStage;
  className?: string;
  size?: number;
}

export function FulfillmentStepperMotion({
  stage,
  className = "",
  size = 56,
}: FulfillmentStepperMotionProps) {
  if (stage === "packing") {
    return (
      <div
        role="status"
        aria-label="Order packing in workshop"
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background soft circle */}
          <circle cx="28" cy="28" r="26" fill="#EAF0FF" stroke="#C8D9F9" strokeWidth="1.5" />
          {/* Packaging Box */}
          <rect
            x="14"
            y="20"
            width="28"
            height="22"
            rx="2"
            fill="#FFFFFF"
            stroke="#182336"
            strokeWidth="2"
            className="tc-animate-snap"
          />
          {/* Box Sealing Tape in Action Lime */}
          <rect x="25" y="20" width="6" height="22" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
          {/* Packing straps / flaps */}
          <path d="M14 26H42" stroke="#596B70" strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Tool icon outline on box */}
          <path d="M20 32L24 36" stroke="#2450B8" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
    );
  }

  if (stage === "transit") {
    return (
      <div
        role="status"
        aria-label="Order in logistics transit"
        className={`relative inline-flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 56 56"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Background soft circle */}
          <circle cx="28" cy="28" r="26" fill="#EAF0FF" stroke="#C8D9F9" strokeWidth="1.5" />
          {/* Road dash line moving */}
          <line
            x1="8"
            y1="42"
            x2="48"
            y2="42"
            stroke="#182336"
            strokeWidth="2"
            strokeDasharray="4 4"
            className="tc-animate-road"
          />
          {/* Logistics Freight Van */}
          <g>
            {/* Cargo Box */}
            <rect x="12" y="18" width="22" height="18" rx="2" fill="#2450B8" stroke="#182336" strokeWidth="2" />
            {/* ToolCart V3 Side Decal */}
            <rect x="15" y="23" width="8" height="3" rx="1" fill="#DDF16A" />
            {/* Cab */}
            <path
              d="M34 23H41L45 28V36H34V23Z"
              fill="#182336"
              stroke="#182336"
              strokeWidth="2"
            />
            {/* Cab Window */}
            <path d="M37 25H40.5L43 28H37V25Z" fill="#EAF0FF" />
            {/* Front Bumper & Headlight */}
            <rect x="44" y="32" width="2" height="2" fill="#DDF16A" />
            {/* Front Wheel */}
            <circle cx="40" cy="37" r="4" fill="#182336" stroke="#DDF16A" strokeWidth="1.5" />
            <circle cx="40" cy="37" r="1.5" fill="#FFFFFF" />
            {/* Rear Wheel */}
            <circle cx="18" cy="37" r="4" fill="#182336" stroke="#DDF16A" strokeWidth="1.5" />
            <circle cx="18" cy="37" r="1.5" fill="#FFFFFF" />
          </g>
        </svg>
      </div>
    );
  }

  // Delivered stage
  return (
    <div
      role="status"
      aria-label="Order delivered"
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="tc-animate-stamp"
      >
        {/* Background circle */}
        <circle cx="28" cy="28" r="26" fill="#E8F5E9" stroke="#A3D9B5" strokeWidth="2" />
        {/* Verification Ring */}
        <circle cx="28" cy="28" r="20" stroke="#182336" strokeWidth="2" strokeDasharray="3 2" />
        {/* Tactile Delivery Stamp Checkmark */}
        <path
          d="M19 28L25 34L37 22"
          stroke="#182336"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Action Lime star badge in corner */}
        <circle cx="40" cy="16" r="4" fill="#DDF16A" stroke="#182336" strokeWidth="1.5" />
      </svg>
    </div>
  );
}
