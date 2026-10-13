'use client';

import React, { useState } from 'react';
import { ImportBatchReport } from '@/lib/catalog/importer';
import { ImportPreviewTable } from '@/components/admin/import-preview-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Play } from 'lucide-react';

export function ImporterClient() {
  const [loading, setLoading] = useState(false);
  const [dryRun, setDryRun] = useState(true);
  const [report, setReport] = useState<ImportBatchReport | null>(null);
  const [csvContent, setCsvContent] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  // Load sample baseline catalog
  const handleLoadSample = async () => {
    try {
      setLoading(true);
      setFeedback('Fetching baseline sample catalog from server...');

      const res = await fetch('/api/admin/import?loadSample=true', {
        method: 'GET',
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Failed to fetch sample catalog (status ${res.status})`);
      }

      const data = await res.json();
      if (data.csv_content) {
        setCsvContent(data.csv_content);
        const rowCount = data.csv_content.split('\n').filter(Boolean).length;
        setFeedback(`Loaded baseline sample catalog (${rowCount - 1} SKUs from Status UK). Ready for validation.`);
      } else {
        throw new Error('Server returned empty sample catalog payload');
      }
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Failed to load sample catalog');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvContent(content);
      setFeedback(`Loaded ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    };
    reader.readAsText(file);
  };

  const executeImport = async (modeDryRun: boolean) => {
    if (!csvContent.trim()) {
      setFeedback('Please select a CSV file or paste content first.');
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
          ? `Dry run finished: ${data.passed_rows} passed, ${data.failed_rows} failed.`
          : `Commit finished: ${data.passed_rows} SKUs successfully written to database store!`
      );
    } catch (err: unknown) {
      setFeedback(err instanceof Error ? err.message : 'Import execution failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload & Options Card */}
      <div className="bg-white border border-tc-border rounded-xl p-6 shadow-xs space-y-5">
        <div className="border-b border-tc-border pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-bold text-base text-tc-ink">
              Upload Supplier CSV or JSON
            </h3>
            <p className="text-xs text-tc-text-secondary mt-0.5">
              Strict case-vs-unit math verification &amp; Draft 2020-12 product schema enforcement.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-tc-text-secondary uppercase">
              Mode:
            </span>
            <button
              type="button"
              onClick={() => setDryRun(!dryRun)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                dryRun
                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                  : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
              }`}
            >
              <span>{dryRun ? 'Dry Run Mode (Safe)' : 'Commit Mode (Mutates Database)'}</span>
            </button>
          </div>
        </div>

        {/* Drag & Drop Area */}
        <div className="border-2 border-dashed border-tc-border rounded-xl p-6 text-center hover:border-tc-primary/50 transition-colors bg-tc-canvas">
          <UploadCloud className="w-10 h-10 text-tc-primary mx-auto mb-2 opacity-80" />
          <p className="text-xs font-semibold text-tc-ink mb-1">
            Choose CSV / JSON file or drag here
          </p>
          <p className="text-[11px] text-tc-text-secondary mb-3">
            Supports Status UK catalog headers: supplier_sku, unit_cost_ex_vat_gbp, units_per_case, case_cost_ex_vat_gbp
          </p>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="text-xs text-tc-text-secondary file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-tc-primary file:text-white hover:file:bg-tc-primary-hover cursor-pointer"
          />
        </div>

        {/* Textarea Paste */}
        <div>
          <label className="block text-xs font-bold text-tc-text-secondary uppercase mb-1.5">
            Or Paste Raw CSV Data Directly:
          </label>
          <textarea
            rows={5}
            value={csvContent}
            onChange={(e) => setCsvContent(e.target.value)}
            placeholder="supplier,supplier_sku,description,unit_cost_ex_vat_gbp,units_per_case,case_cost_ex_vat_gbp..."
            className="w-full p-3 bg-tc-canvas border border-tc-border rounded-lg text-xs font-mono text-tc-ink focus:outline-none focus:ring-2 focus:ring-tc-primary leading-relaxed"
          />
        </div>

        {feedback && (
          <div className="p-3 bg-tc-surface-soft border border-tc-border rounded-lg text-xs text-tc-ink flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-tc-primary shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        {/* Actions Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={loading}
              onClick={handleLoadSample}
            >
              <FileText className="w-3.5 h-3.5 mr-1" />
              Load Baseline Sample
            </Button>

            <Button
              type="button"
              variant="secondary"
              size="sm"
              isLoading={loading}
              onClick={() => executeImport(true)}
            >
              <Play className="w-3.5 h-3.5 mr-1 text-tc-warning" />
              Validate in Dry Run
            </Button>

            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={!report || report.passed_rows === 0}
              isLoading={loading}
              onClick={() => executeImport(false)}
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Commit Valid Rows to Catalog
            </Button>
          </div>

          <span className="text-[11px] text-tc-text-secondary">
            {csvContent ? `${csvContent.split('\n').filter(Boolean).length} rows loaded` : 'No data loaded'}
          </span>
        </div>
      </div>

      {/* Diagnostics Report Table */}
      {report && <ImportPreviewTable report={report} />}
    </div>
  );
}
