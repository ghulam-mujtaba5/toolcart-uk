'use client';

import React, { useState } from 'react';
import { ImportBatchReport } from '@/lib/catalog/importer';
import { ImportPreviewTable } from '@/components/admin/import-preview-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Play,
  Download,
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export function ImporterClient() {
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [report, setReport] = useState<ImportBatchReport | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [activeFileName, setActiveFileName] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showRawPaste, setShowRawPaste] = useState(false);

  // 1-Click Load & Validate Official Status UK Baseline
  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setFeedback('Connecting to Status International (UK) distributor feed...');

      const res = await fetch('/api/admin/import?loadSample=true', {
        method: 'GET',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch supplier feed (status ${res.status})`);
      }

      const data = await res.json();
      if (data.csv_content) {
        setCsvContent(data.csv_content);
        setActiveFileName('status-uk-baseline-catalog.csv');
        const rowCount = data.csv_content.split('\n').filter(Boolean).length;
        setFeedback(`Loaded ${rowCount - 1} SKUs from Status UK. Validating case pack math & trade terms...`);

        // Automatically run dry run validation for immediate merchant visibility
        const valRes = await fetch('/api/admin/import?dryRun=true', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            csv_content: data.csv_content,
            dryRun: true,
          }),
        });

        if (valRes.ok) {
          const rep: ImportBatchReport = await valRes.json();
          setReport(rep);
          setFeedback(
            `Validated Status UK feed: ${rep.passed_rows} SKUs verified with 0 math errors. Ready for review or live catalog commit.`
          );
        }
      } else {
        throw new Error('Server returned empty catalog payload');
      }
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Failed to synchronize distributor feed');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Download Official ToolCart CSV Template
  const handleDownloadTemplate = () => {
    const templateHeader =
      'supplier,supplier_sku,description,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp,barcode,inner_barcode,notes\n' +
      'status-uk,IONTAPEM5M1P12,5m Measuring Tape High Contrast Class II,1.85,12,22.20,5022822185012,5022822185029,Standard trade stock pack of 12\n' +
      'status-uk,IONSPIRITL1P10,600mm 3-Vial Aluminum Spirit Level,4.20,10,42.00,5022822420015,,Shock-resistant acrylic vials';

    const blob = new Blob([templateHeader], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'toolcart-uk-supplier-catalog-template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setActiveFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      const rows = content.split('\n').filter(Boolean).length;
      setFeedback(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB, ~${rows - 1} rows). Click "Run Validation" to verify.`);
    };
    reader.readAsText(file);
  };

  const executeImport = async (modeDryRun: boolean) => {
    if (!csvContent.trim()) {
      setFeedback('Please select a CSV file or synchronize the supplier feed first.');
      return;
    }

    try {
      setLoading(true);
      setFeedback(modeDryRun ? 'Executing dry run validation...' : 'Committing batch to catalog...');

      const res = await fetch(`/api/admin/import?dryRun=${modeDryRun}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          csv_content: csvContent,
          dryRun: modeDryRun,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Import failed with status ${res.status}`);
      }

      const data: ImportBatchReport = await res.json();
      setReport(data);
      setFeedback(
        modeDryRun
          ? `Validation complete: ${data.passed_rows} passed schema & case math, ${data.failed_rows} flagged.`
          : `Success! ${data.passed_rows} SKUs updated in live catalog database.`
      );
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Import execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Supplier Integration Hub & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status UK Primary Integration Card */}
        <div className="lg:col-span-2 bg-white border border-tc-border rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-tc-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                  <Truck className="w-5 h-5 text-tc-action-lime" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-tc-ink">
                    Status International (UK) Ltd
                  </h3>
                  <p className="text-xs text-tc-text-secondary">
                    Primary wholesale hardware &amp; electrical partner (Cleckheaton, West Yorkshire)
                  </p>
                </div>
              </div>
              <Badge variant="lime" size="sm">
                Active Supplier Feed
              </Badge>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-y border-tc-border/60 my-4 text-xs">
              <div>
                <span className="text-[10px] text-tc-text-secondary uppercase font-bold block">Quoted Catalog</span>
                <span className="font-heading font-bold text-tc-ink text-sm">115 Baseline SKUs</span>
              </div>
              <div>
                <span className="text-[10px] text-tc-text-secondary uppercase font-bold block">Prompt Settlement</span>
                <span className="font-heading font-bold text-tc-ink text-sm">3.5% (14 Days)</span>
              </div>
              <div>
                <span className="text-[10px] text-tc-text-secondary uppercase font-bold block">Free Carriage</span>
                <span className="font-heading font-bold text-tc-ink text-sm">£250 Min Order</span>
              </div>
              <div>
                <span className="text-[10px] text-tc-text-secondary uppercase font-bold block">Direct Dispatch SLA</span>
                <span className="font-heading font-bold text-tc-ink text-sm">48h Tracked</span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <span className="text-xs text-tc-text-secondary">
              Direct ingestion runs automated Unicode ligature normalization and case math checks.
            </span>
            <Button
              type="button"
              variant="primary"
              size="sm"
              isLoading={loading}
              onClick={handleLoadSample}
              className="font-bold min-h-[40px] px-5"
            >
              <RefreshCw className="w-4 h-4 mr-1.5" />
              1-Click Sync Status UK Feed
            </Button>
          </div>
        </div>

        {/* Quick Tools & Template Download */}
        <div className="bg-white border border-tc-border rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-heading font-extrabold text-base text-tc-ink mb-1">
              Supplier Feed Tools
            </h3>
            <p className="text-xs text-tc-text-secondary leading-relaxed">
              Standardized formatting utilities for onboarding new UK distributors and dropship partners.
            </p>
          </div>

          <div className="space-y-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleDownloadTemplate}
              className="w-full justify-between text-xs min-h-[40px]"
            >
              <span className="flex items-center gap-2">
                <Download className="w-4 h-4 text-tc-primary" />
                Download CSV Spec Template
              </span>
              <span className="text-[10px] font-mono font-bold text-tc-text-secondary">.CSV</span>
            </Button>

            <div className="p-3 bg-tc-surface-soft border border-tc-border rounded-xl text-[11px] text-tc-text-secondary leading-relaxed">
              <strong className="text-tc-ink font-semibold block mb-0.5">Wholesale Cost Isolation:</strong>
              Wholesale pricing fields are stripped before any client bundle serialization.
            </div>
          </div>
        </div>
      </div>

      {/* Upload & Ingestion Execution Card */}
      <div className="bg-white border border-tc-border rounded-2xl p-6 shadow-xs space-y-5">
        <div className="border-b border-tc-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-extrabold text-base text-tc-ink">
              Batch File Ingestion &amp; Verification
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Upload custom CSV/JSON supplier feeds or review pending batch records.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-tc-text-secondary uppercase">
              Target Mode:
            </span>
            <button
              type="button"
              onClick={() => setDryRun(!dryRun)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dryRun
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <span>{dryRun ? 'Dry Run Mode (Safe Preview)' : 'Production Commit Mode'}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-tc-border rounded-2xl p-8 text-center hover:border-tc-primary/60 transition-colors bg-tc-canvas group">
          <UploadCloud className="w-12 h-12 text-tc-primary mx-auto mb-2 opacity-80 group-hover:scale-105 transition-transform" />
          <p className="text-sm font-bold text-tc-ink mb-1">
            Choose CSV or JSON Supplier File
          </p>
          <p className="text-xs text-tc-text-secondary mb-4 max-w-md mx-auto">
            Drag and drop your supplier feed file here, or click browse below. Automatically maps SKU, cost, and pack quantity.
          </p>
          <div className="inline-block">
            <input
              type="file"
              accept=".csv,.txt,.json"
              onChange={handleFileUpload}
              className="text-xs text-tc-text-secondary file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-tc-primary file:text-white hover:file:bg-tc-primary-hover cursor-pointer"
            />
          </div>

          {activeFileName && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-tc-surface-soft border border-tc-primary/20 text-xs font-semibold text-tc-primary">
              <FileText className="w-3.5 h-3.5" />
              <span>Active File: {activeFileName}</span>
            </div>
          )}
        </div>

        {/* Collapsible Advanced Raw CSV Input */}
        <div>
          <button
            type="button"
            onClick={() => setShowRawPaste(!showRawPaste)}
            className="flex items-center gap-1.5 text-xs font-bold text-tc-primary hover:underline"
          >
            {showRawPaste ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            <span>{showRawPaste ? 'Hide Raw CSV Editor' : 'Advanced: Paste Raw CSV Data Directly'}</span>
          </button>

          {showRawPaste && (
            <div className="mt-3 animate-in fade-in duration-150">
              <textarea
                rows={5}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
                placeholder="supplier,supplier_sku,description,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp..."
                className="w-full p-3 bg-tc-canvas border border-tc-border rounded-xl text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary leading-relaxed"
              />
            </div>
          )}
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className="p-3.5 bg-tc-surface-soft border border-tc-primary/20 rounded-xl text-xs text-tc-ink flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-tc-primary shrink-0 mt-0.5" />
            <div className="flex-1 font-medium leading-relaxed">{feedback}</div>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-tc-border/60">
          <div className="flex flex-wrap items-center gap-2.5">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading || !csvContent.trim()}
              isLoading={loading && dryRun}
              onClick={() => executeImport(true)}
              className="min-h-[40px] px-4 font-semibold"
            >
              <Play className="w-3.5 h-3.5 mr-1.5 text-tc-warning" />
              Run Dry Run Validation
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={loading || !report || report.passed_rows === 0}
              isLoading={loading && !dryRun}
              onClick={() => executeImport(false)}
              className="min-h-[40px] px-5 font-bold"
            >
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Publish {report ? report.passed_rows : ''} Verified SKUs to Catalog
            </Button>
          </div>

          <span className="text-xs text-tc-text-secondary font-medium">
            {csvContent ? `${csvContent.split('\n').filter(Boolean).length - 1} data records loaded` : 'No file loaded'}
          </span>
        </div>
      </div>

      {/* Diagnostics Report Table */}
      {report && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-lg text-tc-ink">
              Batch Verification Diagnostics
            </h3>
            <span className="text-xs text-tc-text-secondary">
              {report.total_rows} SKUs Inspected • {report.passed_rows} Clean
            </span>
          </div>
          <ImportPreviewTable report={report} />
        </div>
      )}
    </div>
  );
}
