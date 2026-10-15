'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[Admin Route Error]:', error);
  }, [error]);

  return (
    <div className="min-h-[50vh] flex items-center justify-center p-6">
      <div
        role="alert"
        aria-live="assertive"
        className="max-w-md w-full bg-white border border-red-200 rounded-xl p-6 shadow-sm text-center space-y-4"
      >
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-600">
          <AlertOctagon className="w-6 h-6" />
        </div>

        <div className="space-y-1.5">
          <h2 className="font-heading font-extrabold text-lg text-tc-ink">
            Admin Portal Exception
          </h2>
          <p className="text-xs text-tc-text-secondary leading-relaxed">
            An unhandled runtime error occurred on this administrative screen. Data integrity was preserved and no state was corrupted.
          </p>
        </div>

        {error.message && (
          <div className="p-3 bg-tc-canvas border border-tc-border rounded text-[11px] font-mono text-red-800 text-left break-words">
            {error.message}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => reset()}
            className="text-xs font-bold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Try Again
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            asChild
            className="text-xs bg-white text-tc-ink border-tc-border"
          >
            <Link href="/admin">
              <Home className="w-3.5 h-3.5 mr-1.5" />
              Return to Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
