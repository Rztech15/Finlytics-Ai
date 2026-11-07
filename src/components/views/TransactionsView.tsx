import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Plus,
  Trash2,
  Edit2,
  FileDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
} from 'lucide-react';
import { useFinancial } from '../../context/FinancialContext';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/financialMath';

export const TransactionsView: React.FC<{
  onOpenAddModal: () => void;
}> = ({ onOpenAddModal }) => {
  const {
    filteredTransactions,
    currency,
    deleteTransaction,
    updateTransaction,
    showToast,
  } = useFinancial();

  // Search & Filtering State
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'reconciled' | 'cleared' | 'pending'>('all');

  // Sorting
  const [sortField, setSortField] = useState<'date' | 'amount' | 'description'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);

  // Edit State
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    filteredTransactions.forEach(t => {
      if (t.category) set.add(t.category);
    });
    return Array.from(set).sort();
  }, [filteredTransactions]);

  // Apply Search, Filters & Sorting
  const processedTransactions = useMemo(() => {
    let result = [...filteredTransactions];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        t =>
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          (t.merchant && t.merchant.toLowerCase().includes(q))
      );
    }

    if (categoryFilter !== 'all') {
      result = result.filter(t => t.category === categoryFilter);
    }

    if (typeFilter !== 'all') {
      result = result.filter(t => t.type === typeFilter);
    }

    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Sort
    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = a.date.localeCompare(b.date);
      if (sortField === 'amount') cmp = a.amount - b.amount;
      if (sortField === 'description') cmp = a.description.localeCompare(b.description);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [filteredTransactions, searchTerm, categoryFilter, typeFilter, statusFilter, sortField, sortOrder]);

  // Paginated slice
  const totalPages = Math.ceil(processedTransactions.length / pageSize) || 1;
  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedTransactions.slice(start, start + pageSize);
  }, [processedTransactions, currentPage, pageSize]);

  const handleSort = (field: 'date' | 'amount' | 'description') => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Date', 'Description', 'Category', 'Type', 'Amount', 'Account', 'Status', 'Merchant'];
    const rows = processedTransactions.map(t => [
      t.id,
      t.date,
      `"${t.description.replace(/"/g, '""')}"`,
      `"${t.category}"`,
      t.type,
      t.amount,
      `"${t.account}"`,
      t.status,
      `"${t.merchant || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finlytics-transactions-${new Date().toISOString().substring(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${processedTransactions.length} transactions to CSV.`);
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar & Filters */}
      <div className="bg-[#132232] rounded-2xl p-5 border border-[#42D6C0]/20 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8B9AA8] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search descriptions, merchants, categories..."
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#101D2B] text-white text-xs pl-9 pr-4 py-2.5 rounded-xl border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0] placeholder:text-[#8B9AA8]"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 rounded-xl bg-[#101D2B] text-[#42D6C0] hover:text-white border border-[#42D6C0]/30 hover:border-[#42D6C0] text-xs font-semibold transition-colors flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#42D6C0] to-[#2FD3B4] text-[#101D2B] text-xs font-bold shadow-md shadow-[#42D6C0]/20 hover:opacity-95 transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-[#42D6C0]/10 text-xs">
          {/* Category Dropdown */}
          <div className="flex items-center gap-1.5 bg-[#101D2B] px-3 py-1.5 rounded-lg border border-[#42D6C0]/20">
            <span className="text-[#8B9AA8]">Category:</span>
            <select
              value={categoryFilter}
              onChange={e => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[150px] truncate"
            >
              <option value="all" className="bg-[#101D2B]">All Categories</option>
              {categories.map(c => (
                <option key={c} value={c} className="bg-[#101D2B]">{c}</option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-[#101D2B] px-3 py-1.5 rounded-lg border border-[#42D6C0]/20">
            <span className="text-[#8B9AA8]">Flow:</span>
            <select
              value={typeFilter}
              onChange={e => {
                setTypeFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#101D2B]">All (In & Out)</option>
              <option value="income" className="bg-[#101D2B]">Income Only</option>
              <option value="expense" className="bg-[#101D2B]">Expense Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-[#101D2B] px-3 py-1.5 rounded-lg border border-[#42D6C0]/20">
            <span className="text-[#8B9AA8]">Status:</span>
            <select
              value={statusFilter}
              onChange={e => {
                setStatusFilter(e.target.value as any);
                setCurrentPage(1);
              }}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#101D2B]">All Statuses</option>
              <option value="reconciled" className="bg-[#101D2B]">Reconciled</option>
              <option value="cleared" className="bg-[#101D2B]">Cleared</option>
              <option value="pending" className="bg-[#101D2B]">Pending</option>
            </select>
          </div>

          <div className="ml-auto text-xs text-[#8B9AA8]">
            Showing <strong className="text-white">{processedTransactions.length}</strong> records
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-[#132232] rounded-2xl border border-[#42D6C0]/20 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-white">
            <thead className="bg-[#101D2B] text-[#8B9AA8] font-bold uppercase tracking-wider text-[10px] border-b border-[#42D6C0]/15">
              <tr>
                <th
                  onClick={() => handleSort('date')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Date</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => handleSort('description')}
                  className="py-3.5 px-4 cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Description & Merchant</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Account</th>
                <th
                  onClick={() => handleSort('amount')}
                  className="py-3.5 px-4 text-right cursor-pointer hover:text-white select-none"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#42D6C0]/10 font-normal">
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8B9AA8]">
                    No transactions match your search or filter criteria.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map(t => {
                  const isIncome = t.type === 'income';
                  return (
                    <tr key={t.id} className="hover:bg-[#153C43]/20 transition-colors">
                      <td className="py-3 px-4 font-mono text-[#8B9AA8] whitespace-nowrap">
                        {t.date}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{t.description}</div>
                        {t.merchant && (
                          <div className="text-[10px] text-[#8B9AA8] mt-0.5">{t.merchant}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-[#101D2B] text-[#D4B36A] border border-[#D4B36A]/20">
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#8B9AA8] whitespace-nowrap">
                        {t.account}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isIncome ? 'text-[#42D6C0]' : 'text-[#F43F5E]'}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(t.amount, currency)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                            t.status === 'reconciled'
                              ? 'bg-[#42D6C0]/15 text-[#42D6C0] border border-[#42D6C0]/30'
                              : t.status === 'cleared'
                              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                              : 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30'
                          }`}
                        >
                          {t.status === 'reconciled' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {t.status === 'cleared' && <CheckCircle2 className="w-2.5 h-2.5" />}
                          {t.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                          <span>{t.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => setEditingTx(t)}
                            title="Edit"
                            className="p-1 rounded text-[#8B9AA8] hover:text-[#42D6C0] hover:bg-[#101D2B] transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Delete transaction "${t.description}"?`)) {
                                deleteTransaction(t.id);
                              }
                            }}
                            title="Delete"
                            className="p-1 rounded text-[#8B9AA8] hover:text-[#F43F5E] hover:bg-[#101D2B] transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 bg-[#101D2B] border-t border-[#42D6C0]/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#8B9AA8]">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={e => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#132232] text-white px-2 py-1 rounded border border-[#42D6C0]/20 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={15}>15</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
            <span>
              Page <strong className="text-white">{currentPage}</strong> of <strong className="text-white">{totalPages}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="px-3 py-1 rounded bg-[#132232] disabled:opacity-40 text-white font-medium hover:bg-[#153C43] transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 rounded bg-[#132232] disabled:opacity-40 text-white font-medium hover:bg-[#153C43] transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Edit Transaction Modal */}
      {editingTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-[#132232] border border-[#42D6C0]/30 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative">
            <button
              onClick={() => setEditingTx(null)}
              className="absolute right-4 top-4 text-[#8B9AA8] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-4">Edit Transaction</h3>

            <form
              onSubmit={e => {
                e.preventDefault();
                updateTransaction(editingTx.id, {
                  description: editingTx.description,
                  category: editingTx.category,
                  amount: editingTx.amount,
                  type: editingTx.type,
                  status: editingTx.status,
                  date: editingTx.date,
                  merchant: editingTx.merchant,
                });
                setEditingTx(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={editingTx.description}
                  onChange={e => setEditingTx({ ...editingTx, description: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Amount ({currency})</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingTx.amount}
                    onChange={e => setEditingTx({ ...editingTx, amount: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  />
                </div>

                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Type</label>
                  <select
                    value={editingTx.type}
                    onChange={e => setEditingTx({ ...editingTx, type: e.target.value as any })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  >
                    <option value="income">Income (+)</option>
                    <option value="expense">Expense (-)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={editingTx.date}
                    onChange={e => setEditingTx({ ...editingTx, date: e.target.value })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  />
                </div>

                <div>
                  <label className="block text-[#8B9AA8] font-semibold mb-1">Status</label>
                  <select
                    value={editingTx.status}
                    onChange={e => setEditingTx({ ...editingTx, status: e.target.value as any })}
                    className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                  >
                    <option value="reconciled">Reconciled</option>
                    <option value="cleared">Cleared</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#8B9AA8] font-semibold mb-1">Category</label>
                <input
                  type="text"
                  required
                  value={editingTx.category}
                  onChange={e => setEditingTx({ ...editingTx, category: e.target.value })}
                  className="w-full bg-[#101D2B] text-white p-2.5 rounded-lg border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingTx(null)}
                  className="px-4 py-2 rounded-lg bg-[#101D2B] text-[#8B9AA8] hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#42D6C0] text-[#101D2B] font-bold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
