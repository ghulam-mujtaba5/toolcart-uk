'use client';
import React, { useState } from 'react';

export interface CategoryCardProps {
  title: string;
  description: string;
  itemCount: number;
  slug: string;
  imageSrc: string;
  iconSvg?: React.ReactNode;
}

/**
 * ToolCart UK — 3D Perspective Tilt Category Card
 * Supports both transparent 3D studio PNGs (mix-blend-mode: multiply) and animated SVGs
 */
export function CategoryCard3DTilt({
  title,
  description,
  itemCount,
  slug,
  imageSrc,
  iconSvg,
}: CategoryCardProps) {
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  const handleMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ rx: -py * 8, ry: px * 10 });
  };

  return (
    <a
      href={slug}
      onMouseMove={handleMove}
      onMouseLeave={() => setTilt({ rx: 0, ry: 0 })}
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
      }}
      className="group block rounded-2xl bg-white border border-slate-200 hover:border-blue-500/60 shadow-sm hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      <div className="relative w-full aspect-[16/9] bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute top-3.5 left-3.5 z-10 w-10 h-10 rounded-xl bg-white shadow-sm border border-slate-200/80 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
          {iconSvg}
        </div>
        <img
          src={imageSrc}
          alt={title}
          className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{description}</p>
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-600">{itemCount} items</span>
          <span className="text-blue-600 group-hover:translate-x-1 transition-transform">
            Explore category →
          </span>
        </div>
      </div>
    </a>
  );
}
