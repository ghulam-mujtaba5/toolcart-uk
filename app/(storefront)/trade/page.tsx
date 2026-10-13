'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TradeProHeroVector } from '@/components/ui/vectors';
import { TradeStampMotion } from '@/components/motion';
import {
  Building2,
  FileCheck2,
  CreditCard,
  Percent,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export default function TradePortalPage() {
  const [companyName, setCompanyName] = useState('');
  const [companiesHouseNumber, setCompaniesHouseNumber] = useState('');
  const [vatNumber, setVatNumber] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [tradeSector, setTradeSector] = useState('Electrical');
  const [monthlySpend, setMonthlySpend] = useState('£1,000 – £5,000');

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-tc-text-secondary">
        <Link href="/" className="hover:text-tc-ink">Home</Link>
        <span>/</span>
        <span className="text-tc-ink font-semibold">Trade Account Portal</span>
      </div>

      {/* Hero Banner */}
      <div className="bg-white rounded-card tc-card-machined p-8 sm:p-10 space-y-6 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-tc-surface-soft border border-tc-primary/20 text-xs font-bold text-tc-primary uppercase font-mono">
              <Building2 className="w-4 h-4" />
              <span>B2B TRADE &amp; CONTRACTOR ACCOUNTS</span>
            </div>

            <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-tc-ink tracking-tight">
              Apply for a ToolCart UK Trade Account
            </h1>

            <p className="text-sm sm:text-base text-tc-graphite max-w-2xl leading-relaxed">
              Designed for contractors, electrical installers, decorating firms, and site facility managers. Access 30-day net terms, ex-VAT pricing default, and direct pallet shipments.
            </p>
          </div>

          <div className="shrink-0 flex justify-center">
            <TradeProHeroVector className="w-64 h-44 sm:w-80 sm:h-52" />
          </div>
        </div>

        {/* Trade Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-tc-border/60">
          <div className="p-4 rounded-xl bg-tc-canvas border border-tc-border space-y-1.5">
            <Percent className="w-5 h-5 text-tc-primary" />
            <h3 className="font-heading font-bold text-sm text-tc-ink">Ex. VAT Invoicing</h3>
            <p className="text-xs text-tc-text-secondary">
              Direct B2B invoicing with consolidated monthly VAT statements for HMRC accounting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-tc-canvas border border-tc-border space-y-1.5">
            <CreditCard className="w-5 h-5 text-tc-primary" />
            <h3 className="font-heading font-bold text-sm text-tc-ink">30-Day Credit Limits</h3>
            <p className="text-xs text-tc-text-secondary">
              Subject to Companies House verification and trade credit underwriting.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-tc-canvas border border-tc-border space-y-1.5">
            <Truck className="w-5 h-5 text-tc-primary" />
            <h3 className="font-heading font-bold text-sm text-tc-ink">Bulk Carton Pricing</h3>
            <p className="text-xs text-tc-text-secondary">
              Dedicated volume tiering when ordering full cases directly from Status International.
            </p>
          </div>
        </div>
      </div>

      {/* Registration Form / Success Confirmation */}
      {submitted ? (
        <div className="bg-white rounded-card tc-card-machined p-10 text-center space-y-6 max-w-lg mx-auto shadow-sm">
          <TradeStampMotion size={80} className="mx-auto" />

          <div className="space-y-2">
            <h2 className="font-heading font-extrabold text-2xl text-tc-ink">
              Application Submitted
            </h2>
            <p className="text-xs text-tc-text-secondary leading-relaxed">
              Thank you, <strong className="text-tc-ink">{contactName}</strong>. Our trade underwriting team is reviewing <strong className="text-tc-ink">{companyName}</strong> ({companiesHouseNumber}).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-tc-surface-soft border border-tc-primary/20 text-left text-xs text-tc-ink space-y-2">
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">Companies House:</span>
              <span className="font-mono font-bold">{companiesHouseNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">UK VAT Reg:</span>
              <span className="font-mono font-bold">{vatNumber || 'Pending'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-tc-text-secondary">Sector:</span>
              <span className="font-semibold">{tradeSector}</span>
            </div>
          </div>

          <div className="pt-2">
            <Button variant="primary" asChild>
              <Link href="/">Return to Storefront</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-tc-border p-8 sm:p-10 shadow-xs space-y-8">
          <div className="border-b border-tc-border pb-4">
            <h2 className="font-heading font-extrabold text-xl text-tc-ink">
              B2B Account Application Form
            </h2>
            <p className="text-xs text-tc-text-secondary mt-1">
              Please enter your official UK registered company details for rapid automated verification.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">Registered Company Name *</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Apex Contracting Services Ltd"
                  className="w-full h-11 px-3 rounded-lg border border-tc-border-strong text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                />
              </div>

              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">Companies House Number *</label>
                <input
                  type="text"
                  required
                  value={companiesHouseNumber}
                  onChange={(e) => setCompaniesHouseNumber(e.target.value)}
                  placeholder="08765432"
                  className="w-full h-11 px-3 rounded-lg border border-tc-border-strong font-mono uppercase text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                />
              </div>

              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">UK VAT Number (Optional)</label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="GB 123 4567 89"
                  className="w-full h-11 px-3 rounded-lg border border-tc-border font-mono uppercase text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                />
              </div>

              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">Primary Trade Sector</label>
                <select
                  value={tradeSector}
                  onChange={(e) => setTradeSector(e.target.value)}
                  className="w-full h-11 px-3 rounded-lg border border-tc-border bg-white text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary font-semibold"
                >
                  <option value="Electrical">Electrical Installation &amp; Maintenance</option>
                  <option value="Plumbing">Plumbing &amp; Heating</option>
                  <option value="Painting">Painting &amp; Decorating</option>
                  <option value="Joinery">Carpentry &amp; Joinery</option>
                  <option value="General Building">General Building &amp; Construction</option>
                  <option value="Facilities">Facilities &amp; Property Maintenance</option>
                </select>
              </div>

              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">Primary Contact Name *</label>
                <input
                  type="text"
                  required
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="Alex Wright (Director)"
                  className="w-full h-11 px-3 rounded-lg border border-tc-border-strong text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                />
              </div>

              <div>
                <label className="block text-tc-ink font-semibold mb-1.5">Invoicing Email Address *</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="accounts@apexcontracting.co.uk"
                  className="w-full h-11 px-3 rounded-lg border border-tc-border-strong text-xs text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-tc-border flex items-center justify-between">
              <span className="text-xs text-tc-text-secondary">
                Applications reviewed within 1 business day.
              </span>

              <Button
                type="submit"
                variant="accent"
                size="lg"
                className="font-bold flex items-center gap-2 text-sm"
              >
                <span>Submit Trade Application</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
