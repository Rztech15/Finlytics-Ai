import React, { useState, useMemo } from 'react';
import {
  LineChart as LineChartIcon,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useFinancial } from '../../context/FinancialContext';
import { calculateForecasting, formatCurrency } from '../../utils/financialMath';

export const ForecastingView: React.FC = () => {
  const { monthlyAggregates, currency, activeDataset } = useFinancial();

  const [horizon, setHorizon] = useState<number>(6);
  const [scenario, setScenario] = useState<'base' | 'conservative' | 'aggressive'>('base');
  const [methodology, setMethodology] = useState<
    'Linear Regression' | 'Weighted Moving Average' | 'Exponential Smoothing'
  >('Linear Regression');

  // Compute forecast
  const forecastResult = useMemo(() => {
    return calculateForecasting(monthlyAggregates, horizon, scenario, methodology);
  }, [monthlyAggregates, horizon, scenario, methodology]);

  return (
    <div className="space-y-6">
      {/* Forecasting Control Panel */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#42D6C0]/15">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
                <LineChartIcon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Statistical Financial Forecasting Engine
              </h2>
            </div>
            <p className="text-xs text-[#8B9AA8] mt-1">
              Ordinary Least Squares (OLS) regression with 90% confidence uncertainty envelopes and scenario modeling.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/30">
              R² Fit: {forecastResult.rSquared.toFixed(2)} ({forecastResult.confidenceScore}% Confidence)
            </span>
          </div>
        </div>

        {/* Controls Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5 text-xs">
          {/* Horizon */}
          <div className="bg-[#101D2B] p-3 rounded-xl border border-[#42D6C0]/20">
            <label className="text-[#8B9AA8] font-semibold block mb-1.5">
              Forecast Horizon (Months)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[3, 6, 12].map(h => (
                <button
                  key={h}
                  onClick={() => setHorizon(h)}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    horizon === h
                      ? 'bg-[#42D6C0] text-[#101D2B]'
                      : 'bg-[#132232] text-[#8B9AA8] hover:text-white'
                  }`}
                >
                  {h} Mos
                </button>
              ))}
            </div>
          </div>

          {/* Scenario */}
          <div className="bg-[#101D2B] p-3 rounded-xl border border-[#42D6C0]/20">
            <label className="text-[#8B9AA8] font-semibold block mb-1.5">
              Macro Scenario Assumption
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'conservative', label: 'Bearish' },
                { id: 'base', label: 'Base' },
                { id: 'aggressive', label: 'Bullish' },
              ].map(s => (
                <button
                  key={s.id}
                  onClick={() => setScenario(s.id as any)}
                  className={`py-1.5 rounded-lg font-bold transition-colors ${
                    scenario === s.id
                      ? 'bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/50'
                      : 'bg-[#132232] text-[#8B9AA8] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Methodology */}
          <div className="bg-[#101D2B] p-3 rounded-xl border border-[#42D6C0]/20">
            <label className="text-[#8B9AA8] font-semibold block mb-1.5">
              Statistical Model Algorithm
            </label>
            <select
              value={methodology}
              onChange={e => setMethodology(e.target.value as any)}
              className="w-full bg-[#132232] text-white p-2 rounded-lg border border-[#42D6C0]/20 focus:outline-none cursor-pointer"
            >
              <option value="Linear Regression">Ordinary Least Squares (OLS)</option>
              <option value="Weighted Moving Average">Weighted Moving Average (3M)</option>
              <option value="Exponential Smoothing">Holt-Winters Smoothing</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Forecast Visualization Chart with Shaded Uncertainty Bands */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Revenue & Expense Projection with 90% Confidence Envelopes
            </h3>
            <p className="text-xs text-[#8B9AA8]">
              Dashed indicators represent modeled projections; shaded green envelope shows parametric variance bounds
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-[#42D6C0]">
              <span className="w-3 h-0.5 bg-[#42D6C0]" />
              <span>Projected Revenue</span>
            </div>
            <div className="flex items-center gap-1.5 text-[#F43F5E]">
              <span className="w-3 h-0.5 bg-[#F43F5E]" />
              <span>Projected Expenses</span>
            </div>
          </div>
        </div>

        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={forecastResult.points} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="forecastBand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#42D6C0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#42D6C0" stopOpacity={0.05} />
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
                formatter={(val: any, name: any) => [
                  `${currency} ${Number(val).toLocaleString()}`,
                  name,
                ]}
              />
              <Legend />

              {/* Confidence Band */}
              <Area
                type="monotone"
                dataKey="upperRev"
                stroke="transparent"
                fill="url(#forecastBand)"
                name="Confidence Range (Upper)"
              />
              <Area
                type="monotone"
                dataKey="lowerRev"
                stroke="transparent"
                fill="transparent"
                name="Confidence Range (Lower)"
              />

              {/* Historical & Forecast Lines */}
              <Line
                type="monotone"
                dataKey="forecastRevenue"
                stroke="#42D6C0"
                strokeWidth={2.5}
                strokeDasharray="4 4"
                dot={{ fill: '#42D6C0', r: 3 }}
                name="Revenue Forecast"
              />
              <Line
                type="monotone"
                dataKey="forecastExpense"
                stroke="#F43F5E"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={{ fill: '#F43F5E', r: 3 }}
                name="Expense Forecast"
              />
              <Line
                type="monotone"
                dataKey="actualRevenue"
                stroke="#42D6C0"
                strokeWidth={3}
                name="Historical Revenue"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Assumptions & Methodology Notes Table */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <h3 className="text-base font-bold text-white tracking-tight mb-2 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-[#D4B36A]" />
          <span>Model Parameters, Assumptions & Disclaimers</span>
        </h3>
        <p className="text-xs text-[#8B9AA8] mb-4">
          Statistically justified modeling parameters adhering to corporate financial reporting guidelines
        </p>

        <div className="space-y-2.5 text-xs">
          {forecastResult.assumptions.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#101D2B] border border-[#42D6C0]/10 text-[#8B9AA8]"
            >
              <CheckCircle2 className="w-4 h-4 text-[#42D6C0] shrink-0 mt-0.5" />
              <span className="text-white font-medium">{item}</span>
            </div>
          ))}
          <div className="p-3 rounded-lg bg-[#153C43]/40 border border-[#D4B36A]/20 text-[11px] text-[#D4B36A] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> Projections represent statistical extrapolations derived from trailing ledger transactions and are not guarantees of future performance.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
