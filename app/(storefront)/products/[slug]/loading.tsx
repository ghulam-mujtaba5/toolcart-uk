import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-28 lg:pb-8 space-y-12">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-tc-border">/</span>
        <Skeleton className="h-4 w-20" />
        <span className="text-tc-border">/</span>
        <Skeleton className="h-4 w-48" />
      </div>

      {/* Main 2-Column PDP Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left: Product Image Gallery Skeleton */}
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="w-full aspect-square rounded-2xl bg-white border border-tc-border" />
          <div className="grid grid-cols-2 gap-3">
            <Skeleton className="h-16 rounded-xl" />
            <Skeleton className="h-16 rounded-xl" />
          </div>
        </div>

        {/* Right: Product Buy Actions Skeleton */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
            <Skeleton className="h-9 w-full max-w-lg" />
            <Skeleton className="h-9 w-3/4" />
          </div>

          {/* Pricing Box Skeleton */}
          <div className="p-5 rounded-xl bg-tc-canvas border border-tc-border space-y-2">
            <Skeleton className="h-10 w-36" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Actions & Buttons Skeleton */}
          <div className="space-y-4">
            <Skeleton className="h-14 w-full rounded-xl" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-32 rounded-lg" />
              <Skeleton className="h-11 flex-1 rounded-button" />
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Skeleton */}
      <div className="space-y-4 pt-6 border-t border-tc-border">
        <Skeleton className="h-7 w-48" />
        <div className="border border-tc-border rounded-xl p-4 space-y-3 bg-white">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </div>
    </div>
  );
}
