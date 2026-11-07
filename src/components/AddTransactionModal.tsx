import React, { useState } from 'react';
import { X, Plus, DollarSign, Calendar, Tag } from 'lucide-react';
import { useFinancial } from '../context/FinancialContext';

export const AddTransactionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
}> = ({ isOpen, onClose }) => {
  const { addTransaction, currency, expenseCategories, revenueCategories } = useFinancial();

  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('Cloud Infrastructure & Hosting');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [account, setAccount] = useState('Operating Account');
  const [status, setStatus] = useState<'reconciled' | 'cleared' | 'pending'>('cleared');
  const [merchant, setMerchant] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount) return;

    const success = await addTransaction({
      description,
      amount: parseFloat(amount) || 0,
      type,
      category,
      date,
      account,
      status,
      merchant: merchant || undefined,
    });

    if (success) {
      setDescription('');
      setAmount('');
      setMerchant('');
      onClose();
    }
  };

  const currentCategories = type === 'income' ? revenueCategories : expenseCategories;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#132232] border border-[#42D6C0]/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-[#8B9AA8] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 rounded-xl bg-[#153C43] text-[#42D6C0] border border-[#42D6C0]/30">
            <Plus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold tracking-tight">Record Financial Transaction</h3>
            <p className="text-xs text-[#8B9AA8]">
              Add a verified income or expense line item to your active ledger.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Type Selector Buttons */}
          <div className="grid grid-cols-2 gap-3 p-1 rounded-xl bg-[#101D2B] border border-[#42D6C0]/20">
            <button
              type="button"
              onClick={() => {
                setType('income');
                if (revenueCategories[0]) setCategory(revenueCategories[0].category);
              }}
              className={`py-2 rounded-lg font-bold transition-colors ${
                type === 'income'
                  ? 'bg-[#42D6C0] text-[#101D2B]'
                  : 'text-[#8B9AA8] hover:text-white'
              }`}
            >
              + Income / Receipt
            </button>
            <button
              type="button"
              onClick={() => {
                setType('expense');
                if (expenseCategories[0]) setCategory(expenseCategories[0].category);
              }}
              className={`py-2 rounded-lg font-bold transition-colors ${
                type === 'expense'
                  ? 'bg-[#F43F5E] text-white'
                  : 'text-[#8B9AA8] hover:text-white'
              }`}
            >
              - Expense / Outflow
            </button>
          </div>

          <div>
            <label className="block text-[#8B9AA8] font-semibold mb-1">
              Description / Memo *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AWS Cloud Infrastructure or Enterprise License"
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                placeholder="5400.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Date *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0] cursor-pointer"
              >
                {currentCategories.map(c => (
                  <option key={c.category} value={c.category}>
                    {c.category}
                  </option>
                ))}
                <option value="Miscellaneous">Other / Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Account
              </label>
              <input
                type="text"
                value={account}
                onChange={e => setAccount(e.target.value)}
                placeholder="Operating Account"
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Vendor / Merchant (Optional)
              </label>
              <input
                type="text"
                value={merchant}
                onChange={e => setMerchant(e.target.value)}
                placeholder="e.g. Amazon Web Services, Stripe"
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
              />
            </div>

            <div>
              <label className="block text-[#8B9AA8] font-semibold mb-1">
                Reconciliation Status
              </label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
              >
                <option value="cleared">Cleared</option>
                <option value="reconciled">Reconciled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#101D2B] text-[#8B9AA8] hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] font-bold shadow-md shadow-[#42D6C0]/20 hover:opacity-95 transition-all"
            >
              Commit Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
