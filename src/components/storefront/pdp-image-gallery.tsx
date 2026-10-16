'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Layers, ZoomIn, PackageCheck, Eye } from 'lucide-react';

interface PDPImageGalleryProps {
  images: string[];
  title: string;
  sku: string;
}

export function PDPImageGallery({ images, title, sku }: PDPImageGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const displayImages = images && images.length > 0 ? images : ['/images/products/placeholder.svg'];
  const currentImage = displayImages[selectedIdx] || displayImages[0];

  const getImageLabel = (idx: number, url: string) => {
    if (url.includes('-pack')) return 'Packaging & Carton';
    if (url.includes('-detail')) return 'Technical Spec & Detail';
    if (idx === 0) return 'Primary Studio View';
    if (idx === 1) return 'Alternate Angle';
    return `View ${idx + 1}`;
  };

  return (
    <div className="space-y-4">
      {/* Main Showcase Stage */}
      <div className="relative rounded-2xl bg-white border border-tc-border p-6 sm:p-8 flex items-center justify-center min-h-[320px] sm:min-h-[420px] overflow-hidden group shadow-2xs">
        
        {/* Floating View Badge */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tc-canvas/90 backdrop-blur-xs border border-tc-border text-[11px] font-bold text-tc-ink font-mono shadow-2xs">
          <Eye className="w-3.5 h-3.5 text-tc-primary" />
          <span>{getImageLabel(selectedIdx, currentImage)}</span>
        </div>

        {/* Counter Badge if multiple images */}
        {displayImages.length > 1 && (
          <div className="absolute bottom-4 right-4 z-10 px-2 py-0.5 rounded bg-tc-ink/80 text-white text-[11px] font-mono font-bold">
            {selectedIdx + 1} / {displayImages.length}
          </div>
        )}

        {/* Product Image */}
        <div 
          className={`relative w-full h-64 sm:h-80 flex items-center justify-center cursor-zoom-in transition-transform duration-300 ${
            isZoomed ? 'scale-125' : 'hover:scale-105'
          }`}
          onClick={() => setIsZoomed(!isZoomed)}
          title="Click to toggle zoom"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={currentImage}
            alt={`${title} - ${getImageLabel(selectedIdx, currentImage)}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-sm select-none"
          />
        </div>

        {/* Zoom Hint */}
        <button
          type="button"
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 left-4 z-10 inline-flex items-center gap-1 text-[11px] font-semibold text-tc-text-secondary hover:text-tc-primary transition-colors bg-white/80 px-2 py-1 rounded border border-tc-border"
          aria-label="Toggle zoom view"
        >
          <ZoomIn className="w-3 h-3 text-tc-primary" />
          <span>{isZoomed ? 'Reset zoom' : 'Click to zoom'}</span>
        </button>
      </div>

      {/* Multiple Thumbnail Selector */}
      {displayImages.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {displayImages.map((img, idx) => {
            const isSelected = selectedIdx === idx;
            const label = getImageLabel(idx, img);
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSelectedIdx(idx);
                  setIsZoomed(false);
                }}
                className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-white border-2 p-2 flex items-center justify-center transition-all shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tc-primary ${
                  isSelected
                    ? 'border-tc-primary ring-2 ring-tc-primary/20 shadow-xs'
                    : 'border-tc-border hover:border-tc-border-strong opacity-75 hover:opacity-100'
                }`}
                aria-label={`Select ${label}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img}
                  alt={`${title} thumbnail ${idx + 1}`}
                  className="max-h-full max-w-full object-contain"
                />
                <span className="absolute bottom-1 right-1 text-[9px] font-mono font-bold bg-tc-canvas border border-tc-border px-1 rounded text-tc-text-secondary">
                  {idx + 1}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
