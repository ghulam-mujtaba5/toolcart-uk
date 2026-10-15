'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatbotRobot3DLazy } from '@/components/ui/3d';

interface AiAgentFloatingWidgetProps {
  onOpen: () => void;
  isOpen: boolean;
}

export function AiAgentFloatingWidget({ onOpen, isOpen }: AiAgentFloatingWidgetProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Show helpful hint pill after a slight delay if user hasn't opened it yet
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasInteracted && !isOpen) {
        setShowTooltip(true);
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [hasInteracted, isOpen]);

  // When drawer opens, hide the hint bubble
  useEffect(() => {
    if (isOpen) {
      setShowTooltip(false);
    }
  }, [isOpen]);

  if (isOpen) return null;

  return (
    <aside
      aria-label="AI Project Finder support agent"
      className="fixed bottom-[calc(5.25rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-3 select-none"
    >
      {/* Interactive Tooltip Callout */}
      {showTooltip && (
        <div
          role="status"
          className="relative hidden sm:flex items-center gap-2.5 bg-tc-ink text-white px-3.5 py-2 rounded-2xl shadow-xl border border-tc-action-lime/40 animate-in fade-in-50 slide-in-from-right-4 duration-300"
        >
          <div className="flex flex-col text-left">
            <span className="text-[10px] uppercase font-mono tracking-wider font-bold text-tc-action-lime flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" />
              AI Project Finder
            </span>
            <span className="text-xs font-semibold text-white/95">
              Need trade hardware advice?
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowTooltip(false);
              setHasInteracted(true);
            }}
            className="p-0.5 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors ml-1"
            aria-label="Dismiss AI assistance prompt"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {/* Pointer caret arrow */}
          <div
            aria-hidden="true"
            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-tc-ink rotate-45 border-t border-r border-tc-action-lime/40"
          />
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setHasInteracted(true);
          setShowTooltip(false);
          onOpen();
        }}
        aria-label="Open ToolCart AI Project Finder assistant"
        className={cn(
          'group relative flex items-center gap-2.5 p-1.5 pr-4 rounded-full',
          'bg-gradient-to-r from-tc-ink via-tc-primary to-tc-primary shadow-2xl',
          'border-2 border-tc-action-lime hover:border-white transition-all duration-300',
          'hover:shadow-[0_10px_25px_-5px_rgba(36,80,184,0.45)] hover:-translate-y-1 active:translate-y-0',
          'focus:outline-hidden focus:ring-3 focus:ring-tc-action-lime focus:ring-offset-2 focus:ring-offset-tc-canvas'
        )}
      >
        {/* 3D Futuristic Robot WebGL Canvas Container */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-tc-ink/80 border border-white/20 p-0.5 flex items-center justify-center overflow-visible shrink-0 shadow-inner">
          <ChatbotRobot3DLazy
            size={46}
            className="w-full h-full drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          />
          {/* Active Status Pulse Ring */}
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-tc-action-lime border-2 border-tc-ink shadow-xs"
          >
            <span className="absolute inset-0 rounded-full bg-tc-action-lime animate-ping opacity-75" />
          </span>
        </div>

        {/* Text Label on button */}
        <div className="flex flex-col text-left">
          <span className="text-[10px] font-mono font-black text-tc-action-lime uppercase tracking-wider leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tc-action-lime" />
            AI Online
          </span>
          <span className="font-heading font-extrabold text-xs sm:text-sm text-white tracking-tight flex items-center gap-1.5">
            Project Finder
            <MessageSquare className="w-3.5 h-3.5 text-tc-action-lime hidden sm:inline-block" />
          </span>
        </div>
      </button>
    </aside>
  );
}
