import React, { useState } from 'react';
import {
  Scale,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  Target,
  Sparkles,
  X,
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Budget, SavingsTarget } from '../../types';
import { formatCurrency } from '../../utils/financialMath';

export const BudgetManagementView: React.FC = () => {
  const {
    budgetPerformance,
    savingsTargets,
    currency,
    saveBudget,
    deleteBudget,
    saveSavingsTarget,
    expenseCategories,
  } = useFinancial();

  const [isAddBudgetOpen, setIsAddBudgetOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  const [isAddTargetOpen, setIsAddTargetOpen] = useState(false);
  const [targetForm, setTargetForm] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '2025-12-31',
    category: 'Capital Reserve',
  });

  const [budgetForm, setBudgetForm] = useState({
    category: expenseCategories[0]?.category || 'Cloud Infrastructure & Hosting',
    monthlyLimit: '',
    alertThreshold: '80',
    notes: '',
  });

  const handleSaveBudget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!budgetForm.category || !budgetForm.monthlyLimit) return;
    saveBudget({
      id: editingBudget ? editingBudget.id : undefined,
      category: budgetForm.category,
      monthlyLimit: parseFloat(budgetForm.monthlyLimit),
      alertThreshold: parseFloat(budgetForm.alertThreshold) || 80,
      notes: budgetForm.notes,
    });
    setIsAddBudgetOpen(false);
    setEditingBudget(null);
    setBudgetForm({
      category: expenseCategories[0]?.category || 'Software & Tool Subscriptions',
      monthlyLimit: '',
      alertThreshold: '80',
      notes: '',
    });
  };

  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetForm.name || !targetForm.targetAmount) return;
    saveSavingsTarget({
      name: targetForm.name,
      targetAmount: parseFloat(targetForm.targetAmount),
      currentAmount: parseFloat(targetForm.currentAmount) || 0,
      targetDate: targetForm.targetDate,
      category: targetForm.category,
    });
    setIsAddTargetOpen(false);
    setTargetForm({
      name: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '2025-12-31',
      category: 'Capital Reserve',
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#42D6C0]/15 text-[#42D6C0]">
              <Scale className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Monthly Departmental Budgets & Spending Caps
            </h2>
          </div>
          <p className="text-xs text-[#8B9AA8] mt-1">
            Enforce spending limits across operational categories and monitor overspending variances.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddTargetOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-[#101D2B] text-white border border-[#42D6C0]/30 hover:border-[#42D6C0] text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Target className="w-4 h-4 text-[#D4B36A]" />
            <span>New Savings Target</span>
          </button>

          <button
            onClick={() => {
              setEditingBudget(null);
              setIsAddBudgetOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] text-xs font-bold shadow-md shadow-[#42D6C0]/20 hover:opacity-95 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Add Category Budget</span>
          </button>
        </div>
      </div>

      {/* Budget Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgetPerformance.map(b => {
          const isOver = b.percentUsed >= 100;
          const isNear = b.percentUsed >= b.alertThreshold && !isOver;

          return (
            <div
              key={b.id}
              className={`bg-[#132232] rounded-2xl p-5 border shadow-lg transition-all ${
                isOver
                  ? 'border-[#F43F5E]/60 shadow-[#F43F5E]/10'
                  : isNear
                  ? 'border-[#F59E0B]/60 shadow-[#F59E0B]/10'
                  : 'border-[#42D6C0]/20'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">{b.category}</h4>
                  <p className="text-[10px] text-[#8B9AA8] mt-0.5 line-clamp-1">{b.notes || 'Monthly Cap'}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setEditingBudget(b);
                      setBudgetForm({
                        category: b.category,
                        monthlyLimit: String(b.monthlyLimit),
                        alertThreshold: String(b.alertThreshold),
                        notes: b.notes || '',
                      });
                      setIsAddBudgetOpen(true);
                    }}
                    className="p-1 text-[#8B9AA8] hover:text-[#42D6C0] transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete budget for ${b.category}?`)) {
                        deleteBudget(b.id);
                      }
                    }}
                    className="p-1 text-[#8B9AA8] hover:text-[#F43F5E] transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar & Percent */}
              <div className="space-y-1.5 my-3">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isOver ? 'text-[#F43F5E]' : isNear ? 'text-[#F59E0B]' : 'text-[#42D6C0]'}>
                    {b.percentUsed.toFixed(1)}% Utilized
                  </span>
                  <span className="text-[#8B9AA8]">
                    Limit: {formatCurrency(b.monthlyLimit, currency)}
                  </span>
                </div>
                <div className="w-full bg-[#101D2B] h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-[#F43F5E]' : isNear ? 'bg-[#F59E0B]' : 'bg-[#42D6C0]'
                    }`}
                    style={{ width: `${Math.min(100, b.percentUsed)}%` }}
                  />
                </div>
              </div>

              {/* Numbers */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#42D6C0]/10 text-xs">
                <div>
                  <span className="text-[#8B9AA8] block text-[10px]">Actual Spent</span>
                  <span className="font-mono font-bold text-white">
                    {formatCurrency(b.spent, currency)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#8B9AA8] block text-[10px]">
                    {isOver ? 'Over Budget' : 'Remaining'}
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      isOver ? 'text-[#F43F5E]' : 'text-[#42D6C0]'
                    }`}
                  >
                    {isOver
                      ? `-${formatCurrency(b.spent - b.monthlyLimit, currency)}`
                      : formatCurrency(b.remaining, currency)}
                  </span>
                </div>
              </div>

              {/* Alert Badge */}
              {isOver && (
                <div className="mt-3 py-1 px-2 rounded-lg bg-[#F43F5E]/15 border border-[#F43F5E]/30 text-[#F43F5E] text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Exceeded cap by {((b.percentUsed - 100)).toFixed(1)}%! Review line items.</span>
                </div>
              )}
              {isNear && (
                <div className="mt-3 py-1 px-2 rounded-lg bg-[#F59E0B]/15 border border-[#F59E0B]/30 text-[#F59E0B] text-[10px] font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  <span>Approaching threshold ({b.alertThreshold}% warning limit).</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Savings & Capital Allocation Targets Section */}
      <div className="bg-[#132232] rounded-2xl p-6 border border-[#42D6C0]/20 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <Target className="w-5 h-5 text-[#D4B36A]" />
              <span>Capital Reserve & Savings Targets</span>
            </h3>
            <p className="text-xs text-[#8B9AA8]">
              Long-term balance sheet reserve milestones and funding goals
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {savingsTargets.map(st => {
            const pct = st.targetAmount > 0 ? (st.currentAmount / st.targetAmount) * 100 : 0;
            return (
              <div key={st.id} className="p-4 rounded-xl bg-[#101D2B] border border-[#42D6C0]/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-white">{st.name}</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D4B36A]/20 text-[#D4B36A] text-[9px] font-bold">
                    {st.category}
                  </span>
                </div>
                <div className="text-[11px] text-[#8B9AA8] mb-3">
                  Target Date: <strong>{st.targetDate}</strong>
                </div>

                <div className="space-y-1 mb-3">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-[#42D6C0]">{pct.toFixed(0)}% Funded</span>
                    <span className="text-[#8B9AA8]">Goal: {formatCurrency(st.targetAmount, currency, true)}</span>
                  </div>
                  <div className="w-full bg-[#132232] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#42D6C0] to-[#D4B36A] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, pct)}%` }}
                    />
                  </div>
                </div>

                <div className="flex justify-between text-xs pt-2 border-t border-[#42D6C0]/10">
                  <span className="text-[#8B9AA8]">Current Reserve:</span>
                  <span className="font-mono font-bold text-white">{formatCurrency(st.currentAmount, currency)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add / Edit Budget Modal */}
      {isAddBudgetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#132232] border border-[#42D6C0]/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsAddBudgetOpen(false)}
              className="absolute right-4 top-4 text-[#8B9AA8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">
              {editingBudget ? 'Edit Budget Cap' : 'Create Category Budget'}
            </h3>

            <form onSubmit={handleSaveBudget} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Expense Category</label>
                <input
                  type="text"
                  required
                  value={budgetForm.category}
                  onChange={e => setBudgetForm({ ...budgetForm, category: e.target.value })}
                  placeholder="e.g. Cloud Infrastructure & Hosting"
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Monthly Spending Cap ({currency})</label>
                <input
                  type="number"
                  step="100"
                  required
                  placeholder="25000"
                  value={budgetForm.monthlyLimit}
                  onChange={e => setBudgetForm({ ...budgetForm, monthlyLimit: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Warning Alert Threshold (%)</label>
                <input
                  type="number"
                  min="50"
                  max="100"
                  value={budgetForm.alertThreshold}
                  onChange={e => setBudgetForm({ ...budgetForm, alertThreshold: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Notes & Scope</label>
                <input
                  type="text"
                  value={budgetForm.notes}
                  onChange={e => setBudgetForm({ ...budgetForm, notes: e.target.value })}
                  placeholder="e.g. Kubernetes, CDN, and DB cluster nodes"
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddBudgetOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#101D2B] text-[#8B9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#42D6C0] text-[#101D2B] font-bold"
                >
                  Save Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Target Modal */}
      {isAddTargetOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#132232] border border-[#42D6C0]/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button
              onClick={() => setIsAddTargetOpen(false)}
              className="absolute right-4 top-4 text-[#8B9AA8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-white mb-4">Add Savings & Reserve Target</h3>

            <form onSubmit={handleSaveTarget} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Target Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12-Month Operating Runway Buffer"
                  value={targetForm.name}
                  onChange={e => setTargetForm({ ...targetForm, name: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Target Amount ({currency})</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={targetForm.targetAmount}
                    onChange={e => setTargetForm({ ...targetForm, targetAmount: e.target.value })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  />
                </div>
                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Current Reserve ({currency})</label>
                  <input
                    type="number"
                    placeholder="250000"
                    value={targetForm.currentAmount}
                    onChange={e => setTargetForm({ ...targetForm, currentAmount: e.target.value })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Target Deadline</label>
                <input
                  type="date"
                  value={targetForm.targetDate}
                  onChange={e => setTargetForm({ ...targetForm, targetDate: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddTargetOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#101D2B] text-[#8B9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#42D6C0] text-[#101D2B] font-bold"
                >
                  Create Target
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
