'use client';

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'info' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  id?: string;
  title: string;
  message?: string;
  type?: ToastType;
  duration?: number;
  action?: ToastAction;
}

interface ToastItem extends ToastOptions {
  id: string;
  type: ToastType;
  duration: number;
}

interface ToastContextType {
  toasts: ToastItem[];
  showToast: (options: ToastOptions) => string;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const toastTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const dismissToast = useCallback((id: string) => {
    const timeout = toastTimeouts.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      toastTimeouts.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    toastTimeouts.current.forEach((t) => clearTimeout(t));
    toastTimeouts.current.clear();
    setToasts([]);
  }, []);

  const showToast = useCallback(
    ({ id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`, title, message, type = 'success', duration = 3500, action }: ToastOptions) => {
      // Clear any existing timeout for this ID
      const existingTimeout = toastTimeouts.current.get(id);
      if (existingTimeout) clearTimeout(existingTimeout);

      const newItem: ToastItem = { id, title, message, type, duration, action };

      setToasts((prev) => {
        // Limit to max 3 simultaneous toasts on screen to prevent viewport occlusion
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered.slice(-2), newItem];
      });

      if (duration > 0) {
        const timeout = setTimeout(() => {
          dismissToast(id);
        }, duration);
        toastTimeouts.current.set(id, timeout);
      }

      return id;
    },
    [dismissToast]
  );

  return (
    <ToastContext.Provider value={{ toasts, showToast, dismissToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Resilient fallback for standalone renderers and isolated tests
    return {
      toasts: [],
      showToast: () => 'noop',
      dismissToast: () => {},
      clearAllToasts: () => {},
    };
  }
  return context;
}

function ToastContainer({ toasts, onDismiss }: { toasts: ToastItem[]; onDismiss: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <aside
      aria-label="Notifications"
      aria-live="polite"
      className="fixed z-50 pointer-events-none inset-x-0 top-3 sm:top-5 md:top-6 px-4 flex flex-col items-center gap-2 pt-[env(safe-area-inset-top,0px)]"
    >
      {toasts.map((toast) => {
        const Icon =
          toast.type === 'error'
            ? AlertCircle
            : toast.type === 'warning'
            ? AlertCircle
            : toast.type === 'info'
            ? Info
            : CheckCircle2;

        return (
          <div
            key={toast.id}
            role={toast.type === 'error' ? 'alert' : 'status'}
            className={cn(
              'pointer-events-auto w-full max-w-sm rounded-xl border-2 p-3 sm:p-3.5 shadow-2xl flex items-start gap-3 animate-in slide-in-from-top-3 fade-in duration-200 select-none',
              toast.type === 'success' && 'bg-tc-ink text-white border-tc-action-lime',
              toast.type === 'info' && 'bg-white text-tc-ink border-tc-primary',
              toast.type === 'warning' && 'bg-amber-50 text-amber-950 border-amber-500',
              toast.type === 'error' && 'bg-rose-50 text-rose-950 border-rose-500'
            )}
          >
            {/* Status Icon */}
            <div
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                toast.type === 'success' && 'bg-tc-action-lime text-tc-ink',
                toast.type === 'info' && 'bg-tc-surface-soft text-tc-primary border border-[#C8D9F9]',
                toast.type === 'warning' && 'bg-amber-200 text-amber-900',
                toast.type === 'error' && 'bg-rose-200 text-rose-900'
              )}
            >
              <Icon className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>

            {/* Message Body */}
            <div className="flex-1 min-w-0">
              <div className="font-heading font-bold text-xs sm:text-sm tracking-tight leading-snug">
                {toast.title}
              </div>
              {toast.message && (
                <p
                  className={cn(
                    'text-[11px] leading-relaxed mt-0.5',
                    toast.type === 'success' ? 'text-tc-canvas' : 'text-tc-text-secondary'
                  )}
                >
                  {toast.message}
                </p>
              )}

              {toast.action && (
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      toast.action?.onClick();
                      onDismiss(toast.id);
                    }}
                    className={cn(
                      'text-xs font-bold underline underline-offset-2 transition-opacity hover:opacity-80 min-h-[32px] flex items-center',
                      toast.type === 'success' ? 'text-tc-action-lime' : 'text-tc-primary'
                    )}
                  >
                    {toast.action.label}
                  </button>
                </div>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label="Dismiss notification"
              className={cn(
                'min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg transition-colors shrink-0 -mr-1 -mt-1',
                toast.type === 'success'
                  ? 'text-white/60 hover:text-white hover:bg-white/10'
                  : 'text-tc-text-secondary hover:text-tc-ink hover:bg-tc-canvas'
              )}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </aside>
  );
}
