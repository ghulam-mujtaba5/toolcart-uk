import React from 'react';
import { ImportBatchReport } from '@/lib/catalog/importer';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertOctagon, HelpCircle } from 'lucide-react';
import { formatGbp } from '@/lib/catalog/pricing';

export interface ImportPreviewTableProps {
  report: ImportBatchReport;
}

export function ImportPreviewTable({ report }: ImportPreviewTableProps) {
  return (
    <div className="space-y-4">
      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white border border-tc-border rounded-xl">
          <span className="text-[11px] font-bold uppercase text-tc-text-secondary">
            Total Ingestion Lines
          </span>
          <p className="font-heading font-extrabold text-2xl text-tc-ink mt-1">
            {report.total_rows}
          </p>
        </div>
        <div className="p-4 bg-white border border-tc-border rounded-xl">
          <span className="text-[11px] font-bold uppercase text-tc-text-secondary">
            Passed Schema & Math
          </span>
          <p className="font-heading font-extrabold text-2xl text-tc-success mt-1">
            {report.passed_rows}
          </p>
        </div>
        <div className="p-4 bg-white border border-tc-border rounded-xl">
          <span className="text-[11px] font-bold uppercase text-tc-text-secondary">
            Failed Validations
          </span>
          <p className="font-heading font-extrabold text-2xl text-tc-error mt-1">
            {report.failed_rows}
          </p>
        </div>
        <div className="p-4 bg-white border border-tc-border rounded-xl">
          <span className="text-[11px] font-bold uppercase text-tc-text-secondary">
            Execution Mode
          </span>
          <div className="mt-2">
            {report.dry_run ? (
              <Badge variant="warning">Dry Run (No Mutations)</Badge>
            ) : (
              <Badge variant="success">Committed to Database</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics Table */}
      <div className="bg-white border border-tc-border rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-tc-border flex items-center justify-between">
          <h3 className="font-heading font-bold text-sm text-tc-ink">
            Ingestion Row Diagnostics Report
          </h3>
          <span className="text-xs text-tc-text-secondary">
            Validating case math &amp; Draft 2020-12 product schema
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs divide-y divide-tc-border">
            <thead className="bg-[#182336] text-white sticky top-0 z-10">
              <tr>
                <th className="py-3 px-3 font-bold uppercase text-[11px] w-12 text-center">#</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Supplier SKU</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Title &amp; Ligatures</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Unit Cost</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Pack</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Case Math Check</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px] text-center">Status</th>
                <th className="py-3 px-3 font-bold uppercase text-[11px]">Diagnostic Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-tc-border/60 bg-white">
              {report.results.map((r) => {
                const isPass = r.status === 'PASS';

                return (
                  <tr
                    key={r.row_number}
                    className={isPass ? 'hover:bg-tc-surface-soft/60' : 'bg-red-50/50 hover:bg-red-50'}
                  >
                    <td className="py-2.5 px-3 text-center font-mono text-[11px] text-tc-text-secondary">
                      {r.row_number}
                    </td>
                    <td className="py-2.5 px-3 font-mono font-bold text-tc-primary whitespace-nowrap">
                      {r.supplier_sku}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-tc-ink max-w-xs truncate">
                      {r.title}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-tc-ink tabular-nums whitespace-nowrap">
                      {formatGbp(r.unit_cost_ex_vat_gbp)}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      {r.units_per_case} units
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="font-mono text-[11px]">
                        £{r.unit_cost_ex_vat_gbp.toFixed(2)} × {r.units_per_case} = £{r.expected_case_cost.toFixed(2)}
                      </span>
                      {Math.abs(r.expected_case_cost - r.actual_case_cost) > 0.01 && (
                        <span className="ml-1 text-tc-error font-bold">
                          (quoted £{r.actual_case_cost.toFixed(2)})
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center whitespace-nowrap">
                      {isPass ? (
                        <span className="inline-flex items-center gap-1 text-tc-success font-bold text-xs">
                          <CheckCircle2 className="w-4 h-4" />
                          PASS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-tc-error font-bold text-xs">
                          <AlertOctagon className="w-4 h-4" />
                          FAIL
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3">
                      {r.errors.length > 0 ? (
                        <ul className="list-disc list-inside text-tc-error text-[11px] space-y-0.5">
                          {r.errors.map((err, eIdx) => (
                            <li key={eIdx}>{err}</li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-tc-text-secondary text-[11px]">
                          Schema compliant, sellability_status default: draft
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
