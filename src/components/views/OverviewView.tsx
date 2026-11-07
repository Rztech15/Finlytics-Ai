import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Waves,
  Clock,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from 'recharts';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency, formatPercent } from '../../utils/financialMath';

export const OverviewView: React.FC = () => {
  const {
    kpis,
    monthlyAggregates,
    currency,
    activeDataset,
    filteredTransactions,
    setActiveTab,
  } = useFinancial();

  const recentTxns = filteredTransactions.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Executive Welcome & AI Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#101D2B] via-[#153C43]/70 to-[#101D2B] border border-[#42D6C0]/25 p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-[#42D6C0]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#42D6C0]/15 border border-[#42D6C0]/30 text-[#42D6C0] text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Powered Financial Intelligence</span>
            </div>
            <h2 className="text-xl md:text-2xl font-extrabold text-white tracking-tight">
              {activeDataset.companyName || 'Enterprise Financial Performance'}
            </h2>
            <p className="text-xs md:text-sm text-[#8B9AA8] mt-1 max-w-2xl">
              Turn Financial Data Into Smarter Decisions. Currently tracking {kpis.transactionCount} verified transactions with an overall health grade of{' '}
              <strong className="text-[#42D6C0]">{kpis.healthGrade}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab('ai-analyst')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] font-bold text-xs shadow-lg shadow-[#42D6C0]/20 hover:opacity-95 transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask AI Financial Analyst</span>
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="px-3.5 py-2.5 rounded-xl bg-[#132232] text-white border border-[#42D6C0]/30 hover:border-[#42D6C0]/60 font-semibold text-xs transition-colors flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D4B36A]" />
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>

      {/* Core KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Revenue */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg xl:text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(kpis.totalRevenue, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#42D6C0]">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>{formatPercent(kpis.monthlyGrowthRate)} MoM</span>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Expenses</span>
            <div className="p-1.5 rounded-lg bg-[#F43F5E]/15 text-[#F43F5E]">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg xl:text-xl font-extrabold text-white tracking-tight">
            {formatCurrency(kpis.totalExpenses, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#8B9AA8]">
            <span>Burn: {formatCurrency(kpis.burnRate, currency, true)}/mo</span>
          </div>
        </div>

        {/* Net Profit */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Profit</span>
            <div className="p-1.5 rounded-lg bg-[#D4B36A]/15 text-[#D4B36A]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg xl:text-xl font-extrabold tracking-tight ${kpis.netProfit >= 0 ? 'text-[#42D6C0]' : 'text-[#F43F5E]'}`}>
            {formatCurrency(kpis.netProfit, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#D4B36A]">
            <span>Net Margin: {kpis.profitMargin.toFixed(1)}%</span>
          </div>
        </div>

        {/* Profit Margin */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Gross Margin</span>
            <div className="p-1.5 rounded-lg bg-[#38BDF8]/15 text-[#38BDF8]">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg xl:text-xl font-extrabold text-white tracking-tight">
            {kpis.grossMargin.toFixed(1)}%
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#8B9AA8]">
            <span>Gross: {formatCurrency(kpis.grossProfit, currency, true)}</span>
          </div>
        </div>

        {/* Net Cash Flow */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Net Cash Flow</span>
            <div className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
              <Waves className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg xl:text-xl font-extrabold tracking-tight ${kpis.netCashFlow >= 0 ? 'text-[#42D6C0]' : 'text-[#F43F5E]'}`}>
            {formatCurrency(kpis.netCashFlow, currency, true)}
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#8B9AA8]">
            <span>Inflow: {formatCurrency(kpis.cashInflow, currency, true)}</span>
          </div>
        </div>

        {/* Cash Runway */}
        <div className="bg-[#132232] rounded-xl p-4 border border-[#42D6C0]/20 shadow-md relative overflow-hidden group hover:border-[#42D6C0]/50 transition-all">
          <div className="flex items-center justify-between text-[#8B9AA8] mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cash Runway</span>
            <div className="p-1.5 rounded-lg bg-[#D4B36A]/15 text-[#D4B36A]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg xl:text-xl font-extrabold text-white tracking-tight">
            {kpis.runwayMonths} mos
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#D4B36A]">
            <span>Reserve: $450k Base</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Financial Health Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue vs Expenses Monthly Trend (2 Columns) */}
        <div className="lg:col-span-2 bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <span>Revenue vs. Operating Expenses</span>
                <span className="text-xs font-normal text-[#8B9AA8]">(Monthly Aggregation)</span>
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Comparison of top-line cash generation versus operational cost expenditures
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[#42D6C0]">
                <span className="w-3 h-3 rounded-sm bg-[#42D6C0]" />
                <span className="font-semibold">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#F43F5E]">
                <span className="w-3 h-3 rounded-sm bg-[#F43F5E]" />
                <span className="font-semibold">Expenses</span>
              </div>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAggregates} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#153C43" opacity={0.6} />
                <XAxis dataKey="monthLabel" stroke="#8B9AA8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8B9AA8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, '']}
                />
                <Bar dataKey="revenue" fill="#42D6C0" radius={[4, 4, 0, 0]} name="Revenue" />
                <Bar dataKey="expenses" fill="#F43F5E" radius={[4, 4, 0, 0]} name="Expenses" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Financial Health Score & Diagnostic (1 Column) */}
        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#42D6C0]" />
                <span>Financial Health Score</span>
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-[#42D6C0]/20 text-[#42D6C0] border border-[#42D6C0]/30">
                Grade {kpis.healthGrade}
              </span>
            </div>

            {/* Score Big Display */}
            <div className="my-4 text-center">
              <div className="inline-flex items-baseline gap-1">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#42D6C0] via-[#D4B36A] to-[#42D6C0]">
                  {kpis.financialHealthScore}
                </span>
                <span className="text-sm text-[#8B9AA8] font-bold">/ 100</span>
              </div>
              <p className="text-xs text-[#8B9AA8] mt-1">
                {kpis.financialHealthScore >= 80
                  ? 'Excellent fiscal stability & high operating margin'
                  : kpis.financialHealthScore >= 60
                  ? 'Healthy operations with moderate burn risk'
                  : 'Action required: Review burn rate and cost limits'}
              </p>
            </div>

            {/* Sub-Score Bars */}
            <div className="space-y-3 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B9AA8]">Profit Margin Ratio</span>
                  <span className="text-white font-semibold">{kpis.profitMargin.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-[#101D2B] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#42D6C0] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, (kpis.profitMargin + 20) * 2))}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B9AA8]">Cash Runway Depth</span>
                  <span className="text-white font-semibold">{kpis.runwayMonths} Months</span>
                </div>
                <div className="w-full bg-[#101D2B] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#D4B36A] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (kpis.runwayMonths / 24) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8B9AA8]">Monthly Expansion Velocity</span>
                  <span className="text-white font-semibold">{formatPercent(kpis.monthlyGrowthRate)}</span>
                </div>
                <div className="w-full bg-[#101D2B] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#38BDF8] h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(10, kpis.monthlyGrowthRate * 4))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('analytics')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-[#153C43]/60 hover:bg-[#153C43] text-xs font-semibold text-[#42D6C0] border border-[#42D6C0]/30 transition-colors flex items-center justify-center gap-1.5"
          >
            <span>View Full Financial Diagnostics</span>
            <span>→</span>
          </button>
        </div>
      </div>

      {/* Net Profit Trend Area Chart & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Net Profit Trajectory */}
        <div className="lg:col-span-2 bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">
                Net Profit Trajectory & Cumulative Inflow
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Historical bottom-line progression across verified statement cycles
              </p>
            </div>
            <button
              onClick={() => setActiveTab('forecasting')}
              className="text-xs text-[#42D6C0] hover:underline font-semibold flex items-center gap-1"
            >
              <span>Forecast next 6 months</span>
              <span>→</span>
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAggregates} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42D6C0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#42D6C0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#153C43" opacity={0.5} />
                <XAxis dataKey="monthLabel" stroke="#8B9AA8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#8B9AA8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={val => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, 'Net Profit']}
                />
                <Area
                  type="monotone"
                  dataKey="netProfit"
                  stroke="#42D6C0"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#profitGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions List */}
        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                <Receipt className="w-4 h-4 text-[#D4B36A]" />
                <span>Recent Transactions</span>
              </h3>
              <button
                onClick={() => setActiveTab('transactions')}
                className="text-xs text-[#42D6C0] hover:underline font-semibold"
              >
                View all ({filteredTransactions.length})
              </button>
            </div>

            <div className="space-y-2.5">
              {recentTxns.map(t => {
                const isIncome = t.type === 'income';
                return (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[#101D2B]/80 border border-[#42D6C0]/10 hover:border-[#42D6C0]/30 transition-all text-xs"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="font-semibold text-white truncate max-w-[170px]">
                        {t.description}
                      </div>
                      <div className="text-[10px] text-[#8B9AA8] flex items-center gap-2 mt-0.5">
                        <span>{t.date}</span>
                        <span>•</span>
                        <span className="truncate max-w-[90px]">{t.category}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`font-bold font-mono ${
                          isIncome ? 'text-[#42D6C0]' : 'text-[#F43F5E]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatCurrency(t.amount, currency)}
                      </div>
                      <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#132232] text-[#8B9AA8]">
                        {t.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => setActiveTab('transactions')}
            className="w-full mt-4 py-2 px-3 rounded-xl bg-[#153C43]/60 hover:bg-[#153C43] text-xs font-semibold text-[#42D6C0] border border-[#42D6C0]/30 transition-colors text-center"
          >
            Manage All Transactions →
          </button>
        </div>
      </div>
    </div>
  );
};
