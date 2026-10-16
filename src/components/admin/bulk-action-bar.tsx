'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  PackageCheck,
  Layers,
  X,
  CheckCircle2,
  FileEdit,
  AlertCircle,
  FolderPlus,
  Ban,
} from 'lucide-react';
import { SellabilityStatus } from '@/types/product';

export interface BulkActionBarProps {
  selectedCount: number;
  isExecuting?: boolean;
  onStatusChange: (status: SellabilityStatus) => void;
  onPriceAdjust: (params: { price_percentage_change?: number; price_fixed_change_gbp?: number }) => void;
  onCategoryAssign?: (category: string) => void;
  onStockAdjust: (params: { stock_exact?: number; stock_delta?: number }) => void;
  onClearSelection: () => void;
  categories?: string[];
  className?: string;
}

export function BulkActionBar({
  selectedCount,
  isExecuting = false,
  onStatusChange,
  onPriceAdjust,
  onCategoryAssign,
  onStockAdjust,
  onClearSelection,
  categories = [],
  className = '',
}: BulkActionBarProps) {
  const [showPriceAdjust, setShowPriceAdjust] = useState(false);
  const [showStockAdjust, setShowStockAdjust] = useState(false);
  const [showCategoryAssign, setShowCategoryAssign] = useState(false);

  const [priceType, setPriceType] = useState<'percent' | 'fixed'>('percent');
  const [priceValue, setPriceValue] = useState<number | ''>('');
  const [stockType, setStockType] = useState<'exact' | 'delta'>('exact');
  const [stockValue, setStockValue] = useState<number | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0] || '');

  if (selectedCount === 0) return null;

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (priceValue === '' || isNaN(Number(priceValue))) return;
    const num = Number(priceValue);
    if (priceType === 'percent') {
      onPriceAdjust({ price_percentage_change: num });
    } else {
      onPriceAdjust({ price_fixed_change_gbp: num });
    }
    setShowPriceAdjust(false);
    setPriceValue('');
  };

  const handleStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (stockValue === '' || isNaN(Number(stockValue))) return;
    const num = Math.floor(Number(stockValue));
    if (stockType === 'exact') {
      onStockAdjust({ stock_exact: Math.max(0, num) });
    } else {
      onStockAdjust({ stock_delta: num });
    }
    setShowStockAdjust(false);
    setStockValue('');
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !onCategoryAssign) return;
    onCategoryAssign(selectedCategory);
    setShowCategoryAssign(false);
  };

  return (
    <div
      role="region"
      aria-label="Bulk actions bar"
      className={`sticky top-4 z-30 p-3.5 bg-tc-ink text-white border-2 border-tc-action-lime rounded-xl shadow-lg flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="bg-tc-action-lime text-tc-ink font-bold text-xs px-2.5 py-1 rounded-md">
            {selectedCount} selected
          </span>
          <span className="text-xs text-tc-canvas/80 hidden sm:inline">
            Choose a bulk operation across selected products:
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Status Buttons */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => onStatusChange('approved')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-h-[36px] h-9 text-xs font-bold"
          >
            <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-tc-action-lime" aria-hidden="true" />
            Approve
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => onStatusChange('draft')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-h-[36px] h-9 text-xs font-bold"
          >
            <FileEdit className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Mark Draft
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => onStatusChange('needs_review')}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 min-h-[36px] h-9 text-xs font-bold"
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1 text-yellow-300" aria-hidden="true" />
            Needs Review
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => onStatusChange('blocked')}
            className="bg-red-950/40 hover:bg-red-900/60 text-red-200 border-red-500/30 min-h-[36px] h-9 text-xs font-bold"
          >
            <Ban className="w-3.5 h-3.5 mr-1 text-red-400" aria-hidden="true" />
            Block
          </Button>

          {/* Adjust Price Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => {
              setShowPriceAdjust(!showPriceAdjust);
              setShowStockAdjust(false);
              setShowCategoryAssign(false);
            }}
            className={`min-h-[36px] h-9 text-xs font-bold border-white/20 ${
              showPriceAdjust ? 'bg-tc-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 mr-1 text-tc-action-lime" aria-hidden="true" />
            Adjust Price
          </Button>

          {/* Adjust Stock Toggle */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isExecuting}
            onClick={() => {
              setShowStockAdjust(!showStockAdjust);
              setShowPriceAdjust(false);
              setShowCategoryAssign(false);
            }}
            className={`min-h-[36px] h-9 text-xs font-bold border-white/20 ${
              showStockAdjust ? 'bg-tc-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            <PackageCheck className="w-3.5 h-3.5 mr-1 text-tc-action-lime" aria-hidden="true" />
            Adjust Stock
          </Button>

          {/* Assign Category Toggle */}
          {categories.length > 0 && onCategoryAssign && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isExecuting}
              onClick={() => {
                setShowCategoryAssign(!showCategoryAssign);
                setShowPriceAdjust(false);
                setShowStockAdjust(false);
              }}
              className={`min-h-[36px] h-9 text-xs font-bold border-white/20 ${
                showCategoryAssign ? 'bg-tc-primary text-white' : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              <FolderPlus className="w-3.5 h-3.5 mr-1 text-tc-action-lime" aria-hidden="true" />
              Assign Category
            </Button>
          )}

          {/* Clear Selection */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            className="bg-transparent hover:bg-white/10 text-tc-canvas border-transparent min-h-[36px] h-9 text-xs"
            aria-label="Clear selection"
          >
            <X className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
            Cancel
          </Button>
        </div>
      </div>

      {/* Sub-Panel: Price Adjust */}
      {showPriceAdjust && (
        <form
          onSubmit={handlePriceSubmit}
          className="bg-white/5 border border-white/15 p-3 rounded-lg flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-tc-canvas">Adjust Retail Price (Inc. VAT):</span>
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded">
            <button
              type="button"
              onClick={() => setPriceType('percent')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                priceType === 'percent'
                  ? 'bg-tc-action-lime text-tc-ink'
                  : 'text-tc-canvas'
              }`}
            >
              Percentage (%)
            </button>
            <button
              type="button"
              onClick={() => setPriceType('fixed')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                priceType === 'fixed'
                  ? 'bg-tc-action-lime text-tc-ink'
                  : 'text-tc-canvas'
              }`}
            >
              Fixed GBP (£)
            </button>
          </div>
          <input
            type="number"
            step={priceType === 'percent' ? '1' : '0.01'}
            value={priceValue}
            onChange={(e) => setPriceValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={priceType === 'percent' ? 'e.g. 5 for +5% or -10 for -10%' : 'e.g. 1.50 or -0.50'}
            className="h-8 px-2.5 rounded bg-white text-tc-ink font-semibold w-56 text-xs focus:outline-none focus:ring-2 focus:ring-tc-action-lime"
            required
            aria-label="Price adjustment value"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isExecuting || priceValue === ''}
            className="tc-btn-accent h-8 px-3 text-xs font-bold"
          >
            Apply Price Update
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowPriceAdjust(false)}
            className="h-8 text-xs text-white border-white/20 bg-transparent hover:bg-white/10"
          >
            Close
          </Button>
        </form>
      )}

      {/* Sub-Panel: Stock Adjust */}
      {showStockAdjust && (
        <form
          onSubmit={handleStockSubmit}
          className="bg-white/5 border border-white/15 p-3 rounded-lg flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-tc-canvas">Adjust Inventory Stock:</span>
          <div className="flex items-center gap-1 bg-white/10 p-0.5 rounded">
            <button
              type="button"
              onClick={() => setStockType('exact')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                stockType === 'exact'
                  ? 'bg-tc-action-lime text-tc-ink'
                  : 'text-tc-canvas'
              }`}
            >
              Exact Quantity
            </button>
            <button
              type="button"
              onClick={() => setStockType('delta')}
              className={`px-2 py-1 rounded text-[11px] font-bold ${
                stockType === 'delta'
                  ? 'bg-tc-action-lime text-tc-ink'
                  : 'text-tc-canvas'
              }`}
            >
              Add / Subtract (Delta)
            </button>
          </div>
          <input
            type="number"
            step="1"
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={stockType === 'exact' ? 'e.g. 50' : 'e.g. +10 or -5'}
            className="h-8 px-2.5 rounded bg-white text-tc-ink font-semibold w-40 text-xs focus:outline-none focus:ring-2 focus:ring-tc-action-lime"
            required
            aria-label="Stock adjustment value"
          />
          <Button
            type="submit"
            size="sm"
            disabled={isExecuting || stockValue === ''}
            className="tc-btn-accent h-8 px-3 text-xs font-bold"
          >
            Apply Stock Update
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowStockAdjust(false)}
            className="h-8 text-xs text-white border-white/20 bg-transparent hover:bg-white/10"
          >
            Close
          </Button>
        </form>
      )}

      {/* Sub-Panel: Category Assign */}
      {showCategoryAssign && categories.length > 0 && onCategoryAssign && (
        <form
          onSubmit={handleCategorySubmit}
          className="bg-white/5 border border-white/15 p-3 rounded-lg flex flex-wrap items-center gap-3 text-xs"
        >
          <span className="font-bold text-tc-canvas">Reassign Selected Products to Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-2.5 rounded bg-white text-tc-ink font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-tc-action-lime"
            aria-label="Select category to assign"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <Button
            type="submit"
            size="sm"
            disabled={isExecuting || !selectedCategory}
            className="tc-btn-accent h-8 px-3 text-xs font-bold"
          >
            Apply Category
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setShowCategoryAssign(false)}
            className="h-8 text-xs text-white border-white/20 bg-transparent hover:bg-white/10"
          >
            Close
          </Button>
        </form>
      )}
    </div>
  );
}
