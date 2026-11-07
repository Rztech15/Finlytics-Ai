import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  PieChart as PieChartIcon,
  ShieldAlert,
  Layers,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/financialMath';

export const IncomeExpenseView: React.FC = () => {
  const {
    kpis,
    expenseCategories,
    revenueCategories,
    currency,
    filteredTransactions,
  } = useFinancial();

  // Fixed vs Variable Cost calculation
  const costStructure = useMemo(() => {
    let fixed = 0;
    let variable = 0;

    filteredTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        const cat = t.category.toLowerCase();
        if (
          cat.includes('payroll') ||
          cat.includes('rent') ||
          cat.includes('hosting') ||
          cat.includes('cloud') ||
          cat.includes('software') ||
          cat.includes('subscription')
        ) {
          fixed += t.amount;
        } else {
          variable += t.amount;
        }
      });

    const total = fixed + variable;
    const fixedPct = total > 0 ? (fixed / total) * 100 : 0;
    const variablePct = total > 0 ? (variable / total) * 100 : 0;

    return { fixed, variable, fixedPct, variablePct };
  }, [filteredTransactions]);

  // Income Stability Index (Recurring SaaS / License vs One-off)
  const incomeStability = useMemo(() => {
    let recurring = 0;
    let nonRecurring = 0;

    filteredTransactions
      .filter(t => t.type === 'income')
      .forEach(t => {
        const cat = t.category.toLowerCase();
        if (
          cat.includes('saas') ||
          cat.includes('subscription') ||
          cat.includes('recurring') ||
          cat.includes('license')
        ) {
          recurring += t.amount;
        } else {
          nonRecurring += t.amount;
        }
      });

    const total = recurring + nonRecurring;
    const score = total > 0 ? (recurring / total) * 100 : 0;
    return { recurring, nonRecurring, score };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6">
      {/* Top Level Structural KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>TOTAL VERIFIED INCOME</span>
            <TrendingUp className="w-4 h-4 text-[#42D6C0]" />
          </div>
          <div className="text-2xl font-extrabold text-[#42D6C0]">
            {formatCurrency(kpis.totalRevenue, currency)}
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            Across {revenueCategories.length} revenue streams
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>TOTAL VERIFIED EXPENSES</span>
            <TrendingDown className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F43F5E]">
            {formatCurrency(kpis.totalExpenses, currency)}
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            Across {expenseCategories.length} operating categories
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>FIXED OPEX RATIO</span>
            <Layers className="w-4 h-4 text-[#38BDF8]" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {costStructure.fixedPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            {formatCurrency(costStructure.fixed, currency, true)} Baseline Monthly
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>RECURRING INCOME INDEX</span>
            <PieChartIcon className="w-4 h-4 text-[#D4B36A]" />
          </div>
          <div className="text-2xl font-extrabold text-[#D4B36A]">
            {incomeStability.score.toFixed(0)} / 100
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            {incomeStability.score >= 70 ? 'High predictability' : 'Moderate volatility'}
          </div>
        </div>
      </div>

      {/* Side-by-side Donut Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Streams */}
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Revenue Stream Breakdown
            </h3>
            <span className="text-xs font-semibold text-[#42D6C0]">
              {formatCurrency(kpis.totalRevenue, currency)} Total
            </span>
          </div>
          <p className="text-xs text-[#8B9AA8] mb-4">
            Percentage share of each customer product line and billing method
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
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {revenueCategories.map((entry, index) => (
                    <Cell key={`cell-rev-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Total']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {revenueCategories.map(cat => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 rounded-lg bg-[#101D2B]/70 border border-[#42D6C0]/10 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div>
                    <div className="font-semibold text-white">{cat.category}</div>
                    <div className="text-[10px] text-[#8B9AA8]">
                      {cat.count} batches • Avg {formatCurrency(cat.avgAmount, currency)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#42D6C0]">
                    {formatCurrency(cat.total, currency)}
                  </div>
                  <div className="text-[10px] text-[#8B9AA8]">{cat.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Categories */}
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-white tracking-tight">
              Expense Cost Allocation
            </h3>
            <span className="text-xs font-semibold text-[#F43F5E]">
              {formatCurrency(kpis.totalExpenses, currency)} Total
            </span>
          </div>
          <p className="text-xs text-[#8B9AA8] mb-4">
            Direct operational and overhead allocations sorted by magnitude
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
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {expenseCategories.map((entry, index) => (
                    <Cell key={`cell-exp-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(val: any) => [`${currency} ${Number(val).toLocaleString()}`, 'Total Spent']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 mt-4 max-h-56 overflow-y-auto custom-scrollbar pr-2">
            {expenseCategories.map(cat => (
              <div
                key={cat.category}
                className="flex items-center justify-between p-2 rounded-lg bg-[#101D2B]/70 border border-[#42D6C0]/10 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                  <div>
                    <div className="font-semibold text-white">{cat.category}</div>
                    <div className="text-[10px] text-[#8B9AA8]">
                      {cat.count} line items • Avg {formatCurrency(cat.avgAmount, currency)}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-[#F43F5E]">
                    {formatCurrency(cat.total, currency)}
                  </div>
                  <div className="text-[10px] text-[#8B9AA8]">{cat.percentage.toFixed(1)}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
