'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ContextualSaveBarProps {
  isDirty: boolean;
  onSave: () => void | Promise<void>;
  onDiscard: () => void;
  isLoading?: boolean;
  message?: string;
  className?: string;
}

export function ContextualSaveBar({
  isDirty,
  onSave,
  onDiscard,
  isLoading = false,
  message = 'Unsaved changes on this record',
  className,
}: ContextualSaveBarProps) {
  // Prevent accidental page close or reload when dirty
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Support Ctrl+S / Cmd+S shortcut to save
  useEffect(() => {
    if (!isDirty) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault();
        if (!isLoading) {
          onSave();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, isLoading, onSave]);

  if (!isDirty) return null;

  return (
    <div
      role="region"
      aria-label="Unsaved Changes Notification"
      className={cn(
        'fixed bottom-6 inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 z-40 max-w-2xl w-full animate-in slide-in-from-bottom-5 duration-200',
        className
      )}
    >
      <div className="bg-tc-ink text-white rounded-2xl p-4 sm:px-6 sm:py-3.5 shadow-2xl border-2 border-tc-action-lime/60 flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left message & indicator */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-tc-action-lime/20 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4 text-tc-action-lime" />
          </div>
          <div>
            <p className="text-xs sm:text-sm font-bold text-white leading-tight">
              {message}
            </p>
            <p className="text-[11px] text-white/70">
              Press <kbd className="font-mono font-bold text-tc-action-lime">⌘S</kbd> or click save to apply updates
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isLoading}
            onClick={onDiscard}
            className="text-white hover:text-white hover:bg-white/10 text-xs min-h-[38px] px-3.5"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Discard
          </Button>

          <Button
            type="button"
            variant="accent"
            size="sm"
            isLoading={isLoading}
            onClick={onSave}
            className="bg-tc-action-lime text-tc-ink hover:bg-tc-lime-hover font-bold text-xs min-h-[38px] px-5 shadow-xs"
          >
            <Check className="w-3.5 h-3.5 mr-1.5 stroke-[2.5]" />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
