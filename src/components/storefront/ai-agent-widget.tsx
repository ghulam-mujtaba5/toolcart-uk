'use client';

import React from 'react';
import { MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatbotRobot3DLazy } from '@/components/ui/3d';

interface AiAgentFloatingWidgetProps {
  onOpen: () => void;
  isOpen: boolean;
}

export function AiAgentFloatingWidget({ onOpen, isOpen }: AiAgentFloatingWidgetProps) {
  if (isOpen) return null;

  return (
    <aside
      aria-label="Hardware Advice assistant"
      className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom))] right-4 sm:bottom-6 sm:right-6 z-40 flex items-center select-none"
    >
      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open ToolCart Hardware Advice assistant"
        className={cn(
          'group relative flex items-center p-1 sm:p-1.5 sm:pr-4 rounded-full',
          'bg-tc-ink hover:bg-[#1E3A8A] text-white transition-all duration-300',
          'border-2 border-tc-action-lime hover:border-white shadow-xl',
          'hover:shadow-[0_10px_25px_-5px_rgba(36,80,184,0.45)] hover:-translate-y-0.5 active:translate-y-0',
          'focus:outline-hidden focus:ring-3 focus:ring-tc-action-lime focus:ring-offset-2 focus:ring-offset-tc-canvas'
        )}
      >
        {/* 3D Robot WebGL Canvas Container */}
        <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-tc-surface-soft/10 border border-white/20 p-0.5 flex items-center justify-center overflow-visible shrink-0 shadow-inner">
          <ChatbotRobot3DLazy
            size={46}
            className="w-full h-full drop-shadow-md group-hover:scale-110 transition-transform duration-300"
          />
          {/* Active Status Pulse Ring */}
          <span
            aria-hidden="true"
            className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 rounded-full bg-tc-action-lime border-2 border-tc-ink shadow-xs"
          >
            <span className="absolute inset-0 rounded-full bg-tc-action-lime animate-ping opacity-75" />
          </span>
        </div>

        {/* Text Label on button - desktop & tablet */}
        <div className="hidden sm:flex flex-col text-left pl-2.5 pr-1">
          <span className="text-[10px] font-mono font-bold text-tc-action-lime uppercase tracking-wider leading-tight flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-tc-action-lime" />
            Advice Online
          </span>
          <span className="font-heading font-bold text-xs text-white tracking-tight flex items-center gap-1.5">
            Hardware Advice
            <MessageSquare className="w-3.5 h-3.5 text-tc-action-lime opacity-80 group-hover:opacity-100" />
          </span>
        </div>
      </button>
    </aside>
  );
}
