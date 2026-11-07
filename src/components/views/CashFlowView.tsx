import React, { useState } from 'react';
import {
  Waves,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sliders,
  DollarSign,
  AlertCircle,
  ShieldCheck,
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
  Legend,
} from 'recharts';
import { useFinancial } from '../../context/FinancialContext';
import { formatCurrency } from '../../utils/financialMath';

export const CashFlowView: React.FC = () => {
  const {
    kpis,
    monthlyAggregates,
    currency,
  } = useFinancial();

  const [simulatedCashBalance, setSimulatedCashBalance] = useState<number>(450000);

  // Dynamic runway calculation based on simulated reserve
  const simulatedRunway =
    kpis.burnRate > 0 ? (simulatedCashBalance / kpis.burnRate).toFixed(1) : '99.9';

  return (
    <div className="space-y-6">
      {/* Top Level Liquidity Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>NET CASH GENERATION</span>
            <Waves className="w-4 h-4 text-[#42D6C0]" />
          </div>
          <div
            className={`text-2xl font-extrabold ${
              kpis.netCashFlow >= 0 ? 'text-[#42D6C0]' : 'text-[#F43F5E]'
            }`}
          >
            {formatCurrency(kpis.netCashFlow, currency)}
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            Verified cash delta
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>MONTHLY BURN RATE</span>
            <ArrowDownRight className="w-4 h-4 text-[#F43F5E]" />
          </div>
          <div className="text-2xl font-extrabold text-[#F43F5E]">
            {formatCurrency(kpis.burnRate, currency)}
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            Trailing 3-month avg outflow
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>EFFECTIVE RUNWAY</span>
            <Clock className="w-4 h-4 text-[#D4B36A]" />
          </div>
          <div className="text-2xl font-extrabold text-[#D4B36A]">
            {simulatedRunway} Months
          </div>
          <div className="text-[11px] text-[#8B9AA8] mt-1 font-medium">
            At {formatCurrency(simulatedCashBalance, currency, true)} liquid capital
          </div>
        </div>

        <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-lg">
          <div className="flex items-center justify-between text-[#8B9AA8] text-xs font-semibold mb-2">
            <span>LIQUIDITY STATUS</span>
            <ShieldCheck className="w-4 h-4 text-[#42D6C0]" />
          </div>
          <div className="text-2xl font-extrabold text-white">
            {kpis.runwayMonths >= 12 ? 'Robust' : kpis.runwayMonths >= 6 ? 'Adequate' : 'Fragile'}
          </div>
          <div className="text-[11px] text-[#42D6C0] mt-1 font-medium">
            Operating surplus confirmed
          </div>
        </div>
      </div>

      {/* Cash Runway Interactive Simulator */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Sliders className="w-5 h-5 text-[#42D6C0]" />
              <span>Interactive Cash Runway & Capital Stress Simulator</span>
            </h3>
            <p className="text-xs text-[#8B9AA8]">
              Simulate cash buffer variations to project runway under different funding assumptions.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-[#8B9AA8]">Liquid Cash Reserves:</span>
            <div className="text-lg font-mono font-extrabold text-[#42D6C0]">
              {formatCurrency(simulatedCashBalance, currency)}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <input
            type="range"
            min="50000"
            max="1500000"
            step="25000"
            value={simulatedCashBalance}
            onChange={e => setSimulatedCashBalance(Number(e.target.value))}
            className="w-full h-2 bg-[#101D2B] rounded-lg appearance-none cursor-pointer accent-[#42D6C0]"
          />
          <div className="flex justify-between text-[11px] text-[#8B9AA8] font-mono">
            <span>$50,000 (Min)</span>
            <span>$500,000 (Target)</span>
            <span>$1,000,000</span>
            <span>$1,500,000 (Max)</span>
          </div>
        </div>
      </div>

      {/* Inflow vs Outflow Dual Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Monthly Cash Inflow vs Outflow
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Gross cash receipts against physical cash disbursements
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyAggregates} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#153C43" opacity={0.6} />
                <XAxis dataKey="monthLabel" stroke="#8B9AA8" fontSize={11} />
                <YAxis
                  stroke="#8B9AA8"
                  fontSize={11}
                  tickFormatter={val => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, '']}
                />
                <Legend />
                <Bar dataKey="inflow" fill="#42D6C0" name="Cash Inflow" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflow" fill="#F43F5E" name="Cash Outflow" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Net Cash Flow Area Chart */}
        <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Net Operating Cash Flow Timeline
              </h3>
              <p className="text-xs text-[#8B9AA8]">
                Net monthly cash generated or absorbed by operations
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyAggregates} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="netCashGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#42D6C0" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#42D6C0" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#153C43" opacity={0.6} />
                <XAxis dataKey="monthLabel" stroke="#8B9AA8" fontSize={11} />
                <YAxis
                  stroke="#8B9AA8"
                  fontSize={11}
                  tickFormatter={val => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#101D2B',
                    borderColor: 'rgba(66, 214, 192, 0.3)',
                    borderRadius: '8px',
                    color: '#fff',
                  }}
                  formatter={(value: any) => [`${currency} ${Number(value).toLocaleString()}`, 'Net Cash']}
                />
                <Area
                  type="monotone"
                  dataKey="netCash"
                  stroke="#42D6C0"
                  strokeWidth={2.5}
                  fill="url(#netCashGrad)"
                  name="Net Cash Flow"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
