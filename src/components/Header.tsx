import React from 'react';
import {
  Menu,
  Sparkles,
  Plus,
  Calendar,
  DollarSign,
  CheckCircle2,
  FileDown,
} from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

const TAB_TITLES: Record<string, { title: string; subtitle: string }> = {
  overview: {
    title: 'Financial Overview',
    subtitle: 'Real-time performance indicators, cash metrics, and financial health score.',
  },
  analytics: {
    title: 'Financial Analytics',
    subtitle: 'Comprehensive margin analysis, revenue patterns, and quarterly performance.',
  },
  transactions: {
    title: 'Transaction Management',
    subtitle: 'Detailed general ledger transactions with search, sorting, and reconciliation.',
  },
  'income-expense': {
    title: 'Income & Expense Breakdown',
    subtitle: 'Detailed analysis of revenue streams, operating cost centers, and cost structures.',
  },
  budget: {
    title: 'Budget & Variance Management',
    subtitle: 'Category-level spending limits, utilization tracking, and overspending alerts.',
  },
  'cash-flow': {
    title: 'Cash Flow & Liquidity',
    subtitle: 'Cash inflow vs outflow tracking, operating burn rate, and runway calculation.',
  },
  forecasting: {
    title: 'Financial Forecasting & Scenarios',
    subtitle: 'Statistical projections using OLS regression and confidence interval envelopes.',
  },
  'ai-analyst': {
    title: 'AI Financial Analyst',
    subtitle: 'Context-aware financial intelligence powered by Google Gemini API.',
  },
  reports: {
    title: 'Financial Reports & Exports',
    subtitle: 'Downloadable executive reports in PDF, Excel (XLSX), and CSV formats.',
  },
  'data-management': {
    title: 'Data Ingestion & Cleaning Engine',
    subtitle: 'Upload CSV/XLSX datasets, automated duplicate removal, and audit logs.',
  },
  settings: {
    title: 'Platform Settings & Governance',
    subtitle: 'Configure currency, fiscal year defaults, and API integrations.',
  },
};

export const Header: React.FC<{
  onOpenMobileMenu: () => void;
  onOpenAddModal: () => void;
}> = ({ onOpenMobileMenu, onOpenAddModal }) => {
  const {
    activeTab,
    setActiveTab,
    currency,
    setCurrency,
    dateFilter,
    setDateFilter,
    activeDataset,
  } = useFinancial();

  const currentTabInfo = TAB_TITLES[activeTab] || {
    title: 'Financial Intelligence',
    subtitle: 'Turn financial data into smarter decisions.',
  };

  return (
    <header className="bg-[#101D2B]/90 backdrop-blur-md border-b border-[#42D6C0]/15 sticky top-0 z-30 px-4 lg:px-8 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title and Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenMobileMenu}
            className="lg:hidden p-2 text-[#8B9AA8] hover:text-white rounded-lg bg-[#132232] border border-[#42D6C0]/20"
            aria-label="Open mobile navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg lg:text-xl font-bold text-white tracking-tight">
                {currentTabInfo.title}
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#42D6C0]/10 text-[#42D6C0] border border-[#42D6C0]/25">
                <CheckCircle2 className="w-3 h-3" />
                {activeDataset?.name || 'Active Ledger'}
              </span>
            </div>
            <p className="text-xs text-[#8B9AA8] hidden sm:block">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Global Controls & Actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Date Filter */}
          <div className="flex items-center bg-[#132232] rounded-lg border border-[#42D6C0]/20 p-0.5 text-xs">
            <span className="px-2 text-[#8B9AA8] hidden md:flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#42D6C0]" />
            </span>
            {(['all', '1y', '6m', '3m'] as const).map(f => (
              <button
                key={f}
                onClick={() => setDateFilter(f)}
                className={`px-2.5 py-1 rounded-md font-medium text-xs transition-colors ${
                  dateFilter === f
                    ? 'bg-[#153C43] text-[#42D6C0] shadow-sm font-semibold'
                    : 'text-[#8B9AA8] hover:text-white'
                }`}
              >
                {f === 'all' ? 'All Time' : f.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Currency Selector */}
          <div className="flex items-center bg-[#132232] rounded-lg border border-[#42D6C0]/20 px-2 py-1 text-xs">
            <DollarSign className="w-3 h-3 text-[#D4B36A] mr-1" />
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer text-xs"
              aria-label="Currency"
            >
              <option value="USD" className="bg-[#101D2B]">USD ($)</option>
              <option value="EUR" className="bg-[#101D2B]">EUR (€)</option>
              <option value="GBP" className="bg-[#101D2B]">GBP (£)</option>
              <option value="JPY" className="bg-[#101D2B]">JPY (¥)</option>
              <option value="CAD" className="bg-[#101D2B]">CAD (CA$)</option>
              <option value="INR" className="bg-[#101D2B]">INR (₹)</option>
            </select>
          </div>

          {/* Quick AI Ask Button */}
          {activeTab !== 'ai-analyst' && (
            <button
              onClick={() => setActiveTab('ai-analyst')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#153C43]/70 hover:bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/30 transition-all hover:border-[#42D6C0]/60 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ask AI</span>
            </button>
          )}

          {/* Add Transaction Button */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] hover:opacity-95 shadow-md shadow-[#42D6C0]/20 transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Transaction</span>
          </button>
        </div>
      </div>
    </header>
  );
};
