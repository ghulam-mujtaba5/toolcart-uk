import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12" />
        <span className="text-tc-border">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header Skeleton */}
      <div className="border-b border-tc-border pb-5 space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Left: Filter Sidebar Skeleton */}
        <div className="hidden lg:block lg:col-span-1 space-y-4 p-5 bg-white rounded-card border border-tc-border">
          <Skeleton className="h-5 w-24 mb-4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <div className="pt-4 border-t border-tc-border space-y-3">
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>

        {/* Right: Product Cards Grid Skeleton */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-card border border-tc-border p-4 space-y-4"
              >
                <Skeleton className="w-full h-48 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-5 w-4/5" />
                </div>
                <div className="pt-2 flex items-baseline justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-11 w-full rounded-button" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
