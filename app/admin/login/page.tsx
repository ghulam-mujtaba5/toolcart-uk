'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Wrench, Shield, Lock, Mail, Key, ArrowRight, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from') || '/admin';

  const [authMode, setAuthMode] = useState<'credentials' | 'token'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fillDemoCredentials = () => {
    setEmail('admin@toolcart.co.uk');
    setPassword('ToolCart2026!Admin');
    setErrorMessage(null);
  };

  const fillDemoToken = () => {
    setToken('toolcart_admin_token_2026_live');
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const payload =
        authMode === 'credentials'
          ? { email: email.trim(), password }
          : { token: token.trim() };

      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please verify credentials.');
      }

      // Successful login - redirect to intended admin path
      router.push(from);
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-tc-action-lime border-2 border-tc-ink shadow-sm mb-4">
          <Wrench className="w-6 h-6 text-tc-ink" />
        </div>
        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-tc-ink tracking-tight">
          TOOLCART ADMIN
        </h1>
        <p className="text-sm text-tc-text-secondary mt-1">
          Merchant operations, catalog governance & order management
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-tc-border rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* Environment Staging Badge */}
        <div className="flex items-center justify-between gap-2 pb-5 border-b border-tc-border mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-tc-primary" />
            <span className="text-xs font-bold text-tc-ink uppercase tracking-wider">
              Secure Gateway
            </span>
          </div>
          <Badge variant="lime" size="sm">
            STAGING ACTIVE
          </Badge>
        </div>

        {/* Demo Credentials Quick-Fill Banner */}
        <div className="mb-6 p-3.5 bg-tc-surface-soft border border-tc-primary/20 rounded-xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-tc-ink flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-tc-primary" />
              Staging Credentials
            </span>
            <button
              type="button"
              onClick={authMode === 'credentials' ? fillDemoCredentials : fillDemoToken}
              className="text-[11px] font-bold text-tc-primary hover:underline"
            >
              Autofill Form
            </button>
          </div>
          <p className="text-[11px] text-tc-text-secondary leading-snug">
            {authMode === 'credentials' ? (
              <>
                Default user:{' '}
                <code className="text-tc-ink font-semibold">admin@toolcart.co.uk</code> (PW:{' '}
                <code className="text-tc-ink font-semibold">ToolCart2026!Admin</code>)
              </>
            ) : (
              <>
                Default token:{' '}
                <code className="text-tc-ink font-semibold">toolcart_admin_token_2026_live</code>
              </>
            )}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-tc-surface-soft rounded-lg mb-6 border border-tc-border/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode('credentials');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition-all ${
              authMode === 'credentials'
                ? 'bg-white text-tc-ink shadow-xs'
                : 'text-tc-text-secondary hover:text-tc-ink'
            }`}
          >
            Email & Password
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode('token');
              setErrorMessage(null);
            }}
            className={`py-2 text-xs font-bold rounded-md transition-all ${
              authMode === 'token'
                ? 'bg-white text-tc-ink shadow-xs'
                : 'text-tc-text-secondary hover:text-tc-ink'
            }`}
          >
            API Token
          </button>
        </div>

        {/* Error Callout */}
        {errorMessage && (
          <div
            role="alert"
            className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{errorMessage}</div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authMode === 'credentials' ? (
            <>
              <div>
                <label
                  htmlFor="admin-email"
                  className="block text-xs font-bold text-tc-ink mb-1.5 uppercase tracking-wider"
                >
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-tc-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@toolcart.co.uk"
                    className="w-full pl-9 pr-3 py-2.5 text-sm bg-tc-surface-soft border border-tc-border rounded-lg text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:border-tc-primary"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="admin-password"
                  className="block text-xs font-bold text-tc-ink mb-1.5 uppercase tracking-wider"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-tc-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-10 py-2.5 text-sm bg-tc-surface-soft border border-tc-border rounded-lg text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:border-tc-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-tc-text-secondary hover:text-tc-ink"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div>
              <label
                htmlFor="admin-token"
                className="block text-xs font-bold text-tc-ink mb-1.5 uppercase tracking-wider"
              >
                Admin API Security Token
              </label>
              <div className="relative">
                <Key className="w-4 h-4 text-tc-text-secondary absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-token"
                  type="password"
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste ADMIN_API_TOKEN here"
                  className="w-full pl-9 pr-3 py-2.5 text-sm font-mono bg-tc-surface-soft border border-tc-border rounded-lg text-tc-ink placeholder:text-tc-text-secondary focus:outline-none focus:ring-2 focus:ring-tc-primary focus:border-tc-primary"
                />
              </div>
            </div>
          )}

          <Button
            type="submit"
            variant="primary"
            className="w-full justify-center min-h-[44px] mt-2 font-bold tracking-wide"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Authenticating...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Sign In to Admin Console
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </Button>
        </form>
      </div>

      {/* Footer Navigation */}
      <div className="text-center mt-6">
        <Link
          href="/"
          className="text-xs font-semibold text-tc-text-secondary hover:text-tc-primary transition-colors inline-flex items-center gap-1.5"
        >
          &larr; Return to ToolCart Storefront
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-tc-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Suspense fallback={<div className="text-center text-xs text-tc-text-secondary">Loading gateway...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
