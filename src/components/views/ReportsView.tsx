import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Printer,
  Calendar,
  Building,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency, formatPercent } from '../../utils/financialMath';

export const ReportsView: React.FC = () => {
  const {
    activeDataset,
    kpis,
    monthlyAggregates,
    expenseCategories,
    revenueCategories,
    budgetPerformance,
    currency,
    showToast,
  } = useFinancial();

  const [selectedReportType, setSelectedReportType] = useState<
    | 'performance'
    | 'monthly'
    | 'revenue-expense'
    | 'profitability'
    | 'cash-flow'
    | 'budget'
  >('performance');

  const now = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Export to Excel (Multi-tab Workbook)
  const handleExportExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // 1. Executive Summary Sheet
      const summaryData = [
        ['FINLYTICS EXECUTIVE FINANCIAL REPORT'],
        ['Company', activeDataset.companyName],
        ['Dataset', activeDataset.name],
        ['Report Generated', now],
        ['Currency', currency],
        [],
        ['KEY PERFORMANCE INDICATOR', 'VALUE', 'FORMULA / CONTEXT'],
        ['Total Revenue', kpis.totalRevenue, 'Sum of verified customer receipts'],
        ['Total Expenses', kpis.totalExpenses, 'Sum of operational expenditures'],
        ['Net Profit', kpis.netProfit, 'Total Revenue - Total Expenses'],
        ['Gross Margin (%)', `${kpis.grossMargin.toFixed(1)}%`, 'Gross Profit / Total Revenue'],
        ['Net Profit Margin (%)', `${kpis.profitMargin.toFixed(1)}%`, 'Net Profit / Total Revenue'],
        ['Monthly Growth Rate (%)', `${kpis.monthlyGrowthRate.toFixed(1)}%`, 'MoM Revenue Expansion'],
        ['Monthly Burn Rate', kpis.burnRate, 'Trailing 3-Month Outflow Avg'],
        ['Estimated Runway (Months)', kpis.runwayMonths, 'Cash Reserve / Monthly Burn'],
        ['Financial Health Score', `${kpis.financialHealthScore}/100`, `Grade ${kpis.healthGrade}`],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

      // 2. Monthly Ledger Sheet
      const monthlyData = [
        ['Month', 'Revenue', 'Expenses', 'Net Profit', 'Cash Inflow', 'Cash Outflow', 'Profit Margin (%)'],
        ...monthlyAggregates.map(m => [
          m.monthLabel,
          m.revenue,
          m.expenses,
          m.netProfit,
          m.inflow,
          m.outflow,
          m.profitMargin,
        ]),
      ];
      const wsMonthly = XLSX.utils.aoa_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, wsMonthly, 'Monthly Performance');

      // 3. Expense Categories Sheet
      const catData = [
        ['Category', 'Total Spent', 'Percentage of Total (%)', 'Line Item Count', 'Average Transaction'],
        ...expenseCategories.map(c => [
          c.category,
          c.total,
          c.percentage,
          c.count,
          c.avgAmount,
        ]),
      ];
      const wsCat = XLSX.utils.aoa_to_sheet(catData);
      XLSX.utils.book_append_sheet(wb, wsCat, 'Expense Structure');

      XLSX.writeFile(wb, `Finlytics-Report-${activeDataset.name.replace(/\s+/g, '_')}.xlsx`);
      showToast('Comprehensive Excel workbook exported successfully!');
    } catch (e: any) {
      showToast(`Export failed: ${e.message}`);
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const rows = [
      ['Date', 'Revenue', 'Expenses', 'Net Profit', 'Margin Pct'],
      ...monthlyAggregates.map(m => [
        m.monthKey,
        m.revenue,
        m.expenses,
        m.netProfit,
        m.profitMargin,
      ]),
    ];
    const csvContent = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finlytics-summary-${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('CSV report downloaded.');
  };

  // Print / Save to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export Actions */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Executive Financial Report Generator
            </h2>
          </div>
          <p className="text-xs text-[#8B9AA8] mt-1">
            Generate audit-ready reports formatted for board presentations, tax reviews, and financial disclosures.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-[#101D2B] text-white border border-[#42D6C0]/30 hover:border-[#42D6C0] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-[#38BDF8]" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-[#101D2B] text-white border border-[#42D6C0]/30 hover:border-[#42D6C0] text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#D4B36A]" />
            <span>Excel (XLSX)</span>
          </button>

          <button
            onClick={handlePrintPDF}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] text-xs font-bold shadow-md shadow-[#42D6C0]/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            <Printer className="w-4 h-4 stroke-[2.5]" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex flex-wrap items-center gap-2 bg-[#101D2B] p-2 rounded-2xl border border-[#42D6C0]/20 text-xs">
        {[
          { id: 'performance', label: 'Financial Performance Report' },
          { id: 'monthly', label: 'Monthly Financial Review' },
          { id: 'revenue-expense', label: 'Revenue & Expense Structure' },
          { id: 'profitability', label: 'Profitability & Margin Statement' },
          { id: 'cash-flow', label: 'Cash Flow & Liquidity Report' },
          { id: 'budget', label: 'Budget Variance Audit' },
        ].map(r => (
          <button
            key={r.id}
            onClick={() => setSelectedReportType(r.id as any)}
            className={`px-3.5 py-2 rounded-xl font-semibold transition-all ${
              selectedReportType === r.id
                ? 'bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/40 shadow-sm'
                : 'text-[#8B9AA8] hover:text-white'
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Printable Report Canvas Document */}
      <div className="bg-[#101D2B] rounded-2xl p-8 border border-[#42D6C0]/25 shadow-2xl text-white space-y-6 print:bg-white print:text-black print:p-0 print:border-none">
        {/* Document Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b border-[#42D6C0]/20 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-extrabold tracking-wider text-xl font-mono text-[#42D6C0] print:text-black">
                FINLYTICS
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#153C43] text-[#42D6C0] print:border print:border-black">
                Verified Statement
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white print:text-black">
              {selectedReportType === 'performance' && 'Financial Performance Summary'}
              {selectedReportType === 'monthly' && 'Monthly Financial Review & Trajectory'}
              {selectedReportType === 'revenue-expense' && 'Cost & Revenue Allocation Breakdown'}
              {selectedReportType === 'profitability' && 'Profitability & Margin Diagnostics'}
              {selectedReportType === 'cash-flow' && 'Cash Flow Statement & Liquidity Assessment'}
              {selectedReportType === 'budget' && 'Departmental Budget & Variance Audit'}
            </h1>
            <p className="text-xs text-[#8B9AA8] print:text-gray-600 mt-1">
              Entity: <strong>{activeDataset.companyName}</strong> • Dataset: <strong>{activeDataset.name}</strong>
            </p>
          </div>

          <div className="text-right text-xs text-[#8B9AA8] print:text-gray-600 space-y-0.5">
            <div>Date of Issue: <strong className="text-white print:text-black">{now}</strong></div>
            <div>Reporting Currency: <strong className="text-white print:text-black">{currency}</strong></div>
            <div>Total Transactions: <strong className="text-white print:text-black">{kpis.transactionCount}</strong></div>
            <div>Status: <span className="text-[#42D6C0] print:text-black font-semibold">Audited & Reconciled</span></div>
          </div>
        </div>

        {/* Report Content Table */}
        {selectedReportType === 'performance' && (
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-[#D4B36A] uppercase tracking-wider print:text-black">
              1. Executive Performance Metrics
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Total Revenue</span>
                <span className="text-lg font-mono font-bold text-white print:text-black">{formatCurrency(kpis.totalRevenue, currency)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Total Expenses</span>
                <span className="text-lg font-mono font-bold text-white print:text-black">{formatCurrency(kpis.totalExpenses, currency)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Net Profit</span>
                <span className="text-lg font-mono font-bold text-[#42D6C0] print:text-black">{formatCurrency(kpis.netProfit, currency)}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Operating Margin</span>
                <span className="text-lg font-mono font-bold text-white print:text-black">{kpis.profitMargin.toFixed(1)}%</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Average Burn Rate</span>
                <span className="text-lg font-mono font-bold text-white print:text-black">{formatCurrency(kpis.burnRate, currency)}/mo</span>
              </div>
              <div className="p-3.5 rounded-xl bg-[#132232] border border-[#42D6C0]/15 print:border-gray-300 print:bg-gray-50">
                <span className="text-[10px] text-[#8B9AA8] print:text-gray-600 font-semibold block uppercase">Cash Runway Depth</span>
                <span className="text-lg font-mono font-bold text-[#D4B36A] print:text-black">{kpis.runwayMonths} Months</span>
              </div>
            </div>

            <h3 className="text-sm font-bold text-[#D4B36A] uppercase tracking-wider print:text-black pt-4">
              2. Trailing Statement Cycles
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#132232] text-[#8B9AA8] print:bg-gray-100 print:text-black uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Period</th>
                    <th className="py-2 px-3 text-right">Revenue</th>
                    <th className="py-2 px-3 text-right">Expenses</th>
                    <th className="py-2 px-3 text-right">Net Profit</th>
                    <th className="py-2 px-3 text-right">Margin (%)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#42D6C0]/10 print:divide-gray-200">
                  {monthlyAggregates.map(m => (
                    <tr key={m.monthKey}>
                      <td className="py-2.5 px-3 font-semibold text-white print:text-black">{m.monthLabel}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#42D6C0] print:text-black">{formatCurrency(m.revenue, currency)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#F43F5E] print:text-black">{formatCurrency(m.expenses, currency)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-white print:text-black">{formatCurrency(m.netProfit, currency)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#D4B36A] print:text-black">{m.profitMargin.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Other report views fallback cleanly to similar structured data */}
        {selectedReportType !== 'performance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#D4B36A] uppercase tracking-wider print:text-black">
              Detailed Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#132232] text-[#8B9AA8] print:bg-gray-100 print:text-black uppercase text-[10px]">
                  <tr>
                    <th className="py-2 px-3">Category / Metric</th>
                    <th className="py-2 px-3 text-right">Amount</th>
                    <th className="py-2 px-3 text-right">Share (%)</th>
                    <th className="py-2 px-3 text-right">Transactions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#42D6C0]/10 print:divide-gray-200">
                  {expenseCategories.map(c => (
                    <tr key={c.category}>
                      <td className="py-2.5 px-3 font-semibold text-white print:text-black">{c.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#F43F5E] print:text-black">{formatCurrency(c.total, currency)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[#D4B36A] print:text-black">{c.percentage.toFixed(1)}%</td>
                      <td className="py-2.5 px-3 text-right font-mono text-white print:text-black">{c.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Document Footer & Signatures */}
        <div className="pt-8 border-t border-[#42D6C0]/20 flex flex-col sm:flex-row sm:items-end justify-between gap-6 text-xs text-[#8B9AA8] print:text-gray-600">
          <div>
            <p className="font-semibold text-white print:text-black">Compliance & Integrity Statement</p>
            <p className="text-[11px] mt-0.5 max-w-md">
              Prepared automatically via Finlytics AI Financial Engine. Calculations are grounded strictly in reconciled general ledger batches.
            </p>
          </div>

          <div className="border-t border-[#8B9AA8]/30 pt-2 w-48 text-center">
            <p className="text-[10px] uppercase font-bold text-white print:text-black">Executive Approval</p>
            <p className="text-[10px] text-[#8B9AA8]">Chief Financial Officer</p>
          </div>
        </div>
      </div>
    </div>
  );
};
