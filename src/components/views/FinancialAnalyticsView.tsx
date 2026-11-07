import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieChartIcon,
  Percent,
  Layers,
  Sparkles,
  ArrowUpRight,
  Info,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency, formatPercent } from '../../utils/financialMath';

export const FinancialAnalyticsView: React.FC = () => {
  const {
    kpis,
    monthlyAggregates,
    expenseCategories,
    revenueCategories,
    currency,
    activeDataset,
    setActiveTab,
  } = useFinancial();

  const [activeAnalysisTab, setActiveAnalysisTab] = useState<'trends' | 'categories' | 'quarterly'>('trends');

  // Compute Quarterly Aggregates
  const quarterlyData = React.useMemo(() => {
    const quarters: Record<string, { label: string; revenue: number; expenses: number; netProfit: number }> = {};
    monthlyAggregates.forEach(m => {
      const [year, month] = m.monthKey.split('-');
      const mNum = parseInt(month, 10);
      const qNum = Math.ceil(mNum / 3);
      const qKey = `${year}-Q${qNum}`;
      if (!quarters[qKey]) {
        quarters[qKey] = { label: `${year} Q${qNum}`, revenue: 0, expenses: 0, netProfit: 0 };
      }
      quarters[qKey].revenue += m.revenue;
      quarters[qKey].expenses += m.expenses;
      quarters[qKey].netProfit += m.netProfit;
    });
    return Object.values(quarters);
  }, [monthlyAggregates]);

  return (
    <div className="space-y-6">
      {/* Header Summary & KPI Matrix */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#42D6C0]/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Deep Financial Analytics & Ratio Matrix
              </h2>
            </div>
            <p className="text-xs text-[#8B9AA8] mt-1">
              Deterministic calculations based on {kpis.transactionCount} verified ledger entries for {activeDataset.name}.
            </p>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center bg-[#101D2B] p-1 rounded-xl border border-[#42D6C0]/20 text-xs">
            <button
              onClick={() => setActiveAnalysisTab('trends')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeAnalysisTab === 'trends'
                  ? 'bg-[#153C43] text-[#42D6C0]'
                  : 'text-[#8B9AA8] hover:text-white'
              }`}
            >
              Monthly Dynamics
            </button>
            <button
              onClick={() => setActiveAnalysisTab('categories')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeAnalysisTab === 'categories'
                  ? 'bg-[#153C43] text-[#42D6C0]'
                  : 'text-[#8B9AA8] hover:text-white'
              }`}
            >
              Cost & Revenue Structure
            </button>
            <button
              onClick={() => setActiveAnalysisTab('quarterly')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                activeAnalysisTab === 'quarterly'
                  ? 'bg-[#153C43] text-[#42D6C0]'
                  : 'text-[#8B9AA8] hover:text-white'
              }`}
            >
              Quarterly Comparisons
            </button>
          </div>
        </div>

        {/* 8-Card Detailed Financial Ratios Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Gross Profit</span>
            <div className="text-base font-extrabold text-white mt-1">
              {formatCurrency(kpis.grossProfit, currency, true)}
            </div>
            <div className="text-[10px] text-[#42D6C0] font-semibold mt-1">
              {kpis.grossMargin.toFixed(1)}% Gross Margin
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Operating OpEx</span>
            <div className="text-base font-extrabold text-white mt-1">
              {formatCurrency(kpis.operatingExpenses, currency, true)}
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              Excluding direct COGS
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Net Profit Margin</span>
            <div className="text-base font-extrabold text-[#42D6C0] mt-1">
              {kpis.profitMargin.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              {kpis.netProfit >= 0 ? 'Operating in the black' : 'Negative operating cash'}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Avg Transaction Value</span>
            <div className="text-base font-extrabold text-white mt-1">
              {formatCurrency(kpis.averageTransactionValue, currency)}
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              Across all recorded batches
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Monthly Revenue Growth</span>
            <div className="text-base font-extrabold text-white mt-1 flex items-center gap-1">
              <span>{formatPercent(kpis.monthlyGrowthRate)}</span>
              <ArrowUpRight className="w-4 h-4 text-[#42D6C0]" />
            </div>
            <div className="text-[10px] text-[#42D6C0] font-semibold mt-1">
              Month-over-month trajectory
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Expense Growth Velocity</span>
            <div className="text-base font-extrabold text-white mt-1">
              {formatPercent(kpis.expenseGrowthRate)}
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              Trailing cost variance
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Operating Savings Rate</span>
            <div className="text-base font-extrabold text-[#D4B36A] mt-1">
              {kpis.savingsRate.toFixed(1)}%
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              Retained capital efficiency
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101D2B]/90 border border-[#42D6C0]/15">
            <span className="text-[11px] font-semibold text-[#8B9AA8] block uppercase">Cash Inflow vs Outflow</span>
            <div className="text-base font-extrabold text-[#42D6C0] mt-1">
              {(kpis.cashOutflow > 0 ? kpis.cashInflow / kpis.cashOutflow : 1).toFixed(2)}x
            </div>
            <div className="text-[10px] text-[#8B9AA8] font-semibold mt-1">
              Coverage multiplier
            </div>
          </div>
        </div>
      </div>

      {/* Main Tabbed Views */}
      {activeAnalysisTab === 'trends' && (
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Monthly Performance & Margin Progression
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Dual-axis view comparing absolute revenue and expenditures against profit margin percentage
              </p>
            </div>
          </div>

          <div className="h-80 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyAggregates} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#153C43" opacity={0.6} />
                <XAxis dataKey="monthLabel" stroke="#8B9AA8" fontSize={11} />
                <YAxis
                  yAxisId="left"
                  stroke="#8B9AA8"
                  fontSize={11}
                  tickFormatter={val => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  stroke="#D4B36A"
                  fontSize={11}
                  tickFormatter={val => `${val}%`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any, name: any) => [
                    name === 'Profit Margin'
                      ? `${Number(value).toFixed(1)}%`
                      : `${currency} ${Number(value).toLocaleString()}`,
                    name,
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="revenue" fill="#42D6C0" name="Revenue" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="left" dataKey="expenses" fill="#F43F5E" name="Expenses" radius={[4, 4, 0, 0]} />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="profitMargin"
                  stroke="#D4B36A"
                  strokeWidth={2.5}
                  name="Profit Margin"
                  dot={{ fill: '#D4B36A', r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeAnalysisTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Categories Breakdown */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Expense Cost Center Distribution
            </h3>
            <p className="text-xs text-[#8B9AA8] mb-4">
              Breakdown of total operational outflows by verified category
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {expenseCategories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D2B',
                      borderColor: 'rgba(66, 214, 192, 0.3)',
                      borderRadius: '8px',
                    }}
                    formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Total Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {expenseCategories.map(cat => (
                <div key={cat.category} className="flex items-center justify-between text-xs py-1 border-b border-[#42D6C0]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-white font-medium">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B9AA8]">{cat.percentage.toFixed(1)}%</span>
                    <span className="font-mono font-bold text-white">{formatCurrency(cat.total, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Categories Breakdown */}
          <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
            <h3 className="text-base font-bold text-white tracking-tight mb-1">
              Revenue Stream Diversification
            </h3>
            <p className="text-xs text-[#8B9AA8] mb-4">
              Breakdown of total verified income by customer or product segment
            </p>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={revenueCategories}
                    dataKey="total"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                  >
                    {revenueCategories.map((entry, index) => (
                      <Cell key={`rev-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#101D2B',
                      borderColor: 'rgba(66, 214, 192, 0.3)',
                      borderRadius: '8px',
                    }}
                    formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Total Revenue']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 mt-4 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {revenueCategories.map(cat => (
                <div key={cat.category} className="flex items-center justify-between text-xs py-1 border-b border-[#42D6C0]/10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="text-white font-medium">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[#8B9AA8]">{cat.percentage.toFixed(1)}%</span>
                    <span className="font-mono font-bold text-[#42D6C0]">{formatCurrency(cat.total, currency)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeAnalysisTab === 'quarterly' && (
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
          <h3 className="text-base font-bold text-white tracking-tight mb-1">
            Quarterly Aggregate Performance
          </h3>
          <p className="text-xs text-[#8B9AA8] mb-6">
            Multi-quarter revenue, expenditure, and operating profit roll-up
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {quarterlyData.map(q => {
              const margin = q.revenue > 0 ? (q.netProfit / q.revenue) * 100 : 0;
              return (
                <div key={q.label} className="p-4 rounded-xl bg-[#101D2B] border border-[#42D6C0]/20">
                  <div className="text-sm font-bold text-[#D4B36A] mb-3">{q.label}</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-[#8B9AA8]">Revenue:</span>
                      <span className="font-mono font-bold text-[#42D6C0]">{formatCurrency(q.revenue, currency, true)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#8B9AA8]">Expenses:</span>
                      <span className="font-mono font-bold text-[#F43F5E]">{formatCurrency(q.expenses, currency, true)}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-[#42D6C0]/10">
                      <span className="text-white font-semibold">Net Profit:</span>
                      <span className={`font-mono font-bold ${q.netProfit >= 0 ? 'text-[#42D6C0]' : 'text-[#F43F5E]'}`}>
                        {formatCurrency(q.netProfit, currency, true)}
                      </span>
                    </div>
                    <div className="flex justify-between text-[11px]">
                      <span className="text-[#8B9AA8]">Net Margin:</span>
                      <span className="font-bold text-white">{margin.toFixed(1)}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
