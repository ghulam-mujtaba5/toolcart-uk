'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

export interface AdminErrorBoundaryProps {
  children: ReactNode;
  title?: string;
  fallbackMessage?: string;
  onReset?: () => void;
}

interface AdminErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class AdminErrorBoundary extends Component<
  AdminErrorBoundaryProps,
  AdminErrorBoundaryState
> {
  constructor(props: AdminErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): AdminErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AdminErrorBoundary caught exception]:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      const { title = 'Admin Module Encountered an Issue', fallbackMessage } = this.props;

      return (
        <div
          role="alert"
          aria-live="assertive"
          className="p-6 my-4 bg-white border border-red-200 rounded-xl shadow-xs space-y-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>

            <div className="space-y-1 flex-1">
              <h3 className="font-heading font-bold text-sm text-tc-ink">{title}</h3>
              <p className="text-xs text-tc-text-secondary leading-relaxed">
                {fallbackMessage ||
                  'An unexpected rendering error occurred inside this administrative module. The rest of the portal remains active and accessible.'}
              </p>

              {this.state.error?.message && (
                <div className="mt-2 p-2.5 bg-tc-canvas border border-tc-border rounded text-[11px] font-mono text-red-700 break-words">
                  {this.state.error.message}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2 border-t border-tc-border/60">
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={this.handleReset}
              className="text-xs font-bold"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Retry Module
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
      );
    }

    return this.props.children;
  }
}
