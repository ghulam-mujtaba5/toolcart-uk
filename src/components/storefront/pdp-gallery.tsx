'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { StockRadarBadge } from '@/components/ui/stock-radar-badge';
import type { AvailabilityStatus } from '@/types/product';

interface PdpGalleryProps {
  title: string;
  images: string[];
  availabilityStatus: AvailabilityStatus;
  stockQuantity?: number | undefined | null;
  fallbackIcon?: React.ReactNode;
}

export function PdpGallery({
  title,
  images,
  availabilityStatus,
  stockQuantity,
  fallbackIcon,
}: PdpGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeImage = images[selectedIndex] || images[0];

  return (
    <div className="space-y-4">
      {/* Main Image Stage */}
      <div className="relative aspect-4/3 rounded-2xl bg-tc-surface-soft border border-[#C8D9F9] p-6 sm:p-8 flex flex-col items-center justify-center shadow-xs overflow-hidden group">
        {/* Live 24h Stock Freshness Telemetry Radar Badge */}
        <div className="absolute top-4 left-4 z-10">
          <StockRadarBadge
            status={availabilityStatus}
            stockQuantity={stockQuantity}
            size="md"
            showDetailsPopover={true}
          />
        </div>

        {/* Image Stage */}
        <div className="relative w-full h-56 sm:h-72 flex items-center justify-center p-2">
          {activeImage ? (
            <img
              src={activeImage}
              alt={`${title} - View ${selectedIndex + 1}`}
              className="max-h-full max-w-full object-contain filter drop-shadow-md transition-all duration-300 group-hover:scale-105"
            />
          ) : (
            fallbackIcon || (
              <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl bg-white border border-[#C8D9F9] shadow-sm flex items-center justify-center text-tc-primary" />
            )
          )}
        </div>

        {/* Image count pill */}
        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs border border-tc-border px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold text-tc-ink shadow-2xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Multiple Image Thumbnails (if > 1) */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-0.5">
          {images.map((img, idx) => {
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-white border-2 p-1.5 shrink-0 transition-all focus:outline-hidden ${
                  isSelected
                    ? 'border-tc-primary ring-2 ring-tc-primary/20 shadow-xs'
                    : 'border-tc-border hover:border-[#94A8C9] opacity-75 hover:opacity-100'
                }`}
                aria-label={`View image ${idx + 1} of ${images.length}`}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
