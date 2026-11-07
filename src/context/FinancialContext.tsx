import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FinancialDataset,
  Transaction,
  Budget,
  SavingsTarget,
  FinancialKPIs,
  MonthlyAggregate,
  CategoryBreakdown,
  NavigationTab,
  AIAnalysisResponse,
} from '../types';
import {
  calculateKPIs,
  calculateMonthlyAggregates,
  calculateCategoryBreakdown,
  calculateBudgetPerformance,
} from '../utils/financialMath';
import { SEED_DATASETS, INITIAL_BUDGETS, INITIAL_SAVINGS_TARGETS } from '../data/seedDatasets';
import { useAuth } from './AuthContext';

interface FinancialContextType {
  // Navigation
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Currency & Filter Settings
  currency: string;
  setCurrency: (c: string) => void;
  dateFilter: 'all' | '1y' | '6m' | '3m' | 'month';
  setDateFilter: (f: 'all' | '1y' | '6m' | '3m' | 'month') => void;

  // Datasets
  datasets: FinancialDataset[];
  activeDataset: FinancialDataset;
  activeDatasetId: string;
  setActiveDatasetId: (id: string) => void;
  uploadDataset: (file: File, name: string, company: string) => Promise<boolean>;
  deleteDataset: (id: string) => Promise<boolean>;
  cleanActiveDataset: () => Promise<boolean>;

  // Transactions
  filteredTransactions: Transaction[];
  addTransaction: (tx: Omit<Transaction, 'id'>) => Promise<boolean>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<boolean>;
  deleteTransaction: (id: string) => Promise<boolean>;

  // Budgets & Savings
  budgets: Budget[];
  savingsTargets: SavingsTarget[];
  saveBudget: (budget: Partial<Budget> & { category: string; monthlyLimit: number }) => Promise<boolean>;
  deleteBudget: (id: string) => Promise<boolean>;
  saveSavingsTarget: (target: Partial<SavingsTarget> & { name: string; targetAmount: number }) => Promise<boolean>;

  // Calculated Metrics
  kpis: FinancialKPIs;
  monthlyAggregates: MonthlyAggregate[];
  expenseCategories: CategoryBreakdown[];
  revenueCategories: CategoryBreakdown[];
  budgetPerformance: Budget[];

  // AI Analyst state
  isAILoading: boolean;
  latestAIResponse: AIAnalysisResponse | null;
  askAIAnalyst: (question: string) => Promise<AIAnalysisResponse | null>;

  // Toast / notification
  toast: string | null;
  showToast: (msg: string) => void;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [currency, setCurrency] = useState('USD');
  const [dateFilter, setDateFilter] = useState<'all' | '1y' | '6m' | '3m' | 'month'>('all');

  const [datasets, setDatasets] = useState<FinancialDataset[]>(SEED_DATASETS);
  const [activeDatasetId, setActiveDatasetId] = useState<string>(SEED_DATASETS[0].id);

  const [budgets, setBudgets] = useState<Budget[]>(INITIAL_BUDGETS);
  const [savingsTargets, setSavingsTargets] = useState<SavingsTarget[]>(INITIAL_SAVINGS_TARGETS);

  const [isAILoading, setIsAILoading] = useState(false);
  const [latestAIResponse, setLatestAIResponse] = useState<AIAnalysisResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch datasets from backend on load
  useEffect(() => {
    fetch('/api/datasets', {
      headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.datasets && data.datasets.length > 0) {
          setDatasets(data.datasets);
          if (!data.datasets.some((d: any) => d.id === activeDatasetId)) {
            setActiveDatasetId(data.datasets[0].id);
          }
        }
      })
      .catch(() => {
        // Keeps seeded datasets
      });

    // Fetch budgets
    fetch('/api/budgets', {
      headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.budgets && data.budgets.length > 0) {
          setBudgets(data.budgets);
        }
      })
      .catch(() => {});

    // Fetch savings targets
    fetch('/api/savings-targets', {
      headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
    })
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.savingsTargets && data.savingsTargets.length > 0) {
          setSavingsTargets(data.savingsTargets);
        }
      })
      .catch(() => {});
  }, [token]);

  // Current active dataset object
  const activeDataset = useMemo(() => {
    return datasets.find(d => d.id === activeDatasetId) || datasets[0] || SEED_DATASETS[0];
  }, [datasets, activeDatasetId]);

  // Synchronize currency with active dataset if dataset has currency
  useEffect(() => {
    if (activeDataset?.currency) {
      setCurrency(activeDataset.currency);
    }
  }, [activeDataset]);

  // Filter transactions based on date filter
  const filteredTransactions = useMemo(() => {
    const all = activeDataset?.transactions || [];
    if (dateFilter === 'all') return all;

    const now = new Date();
    let cutoff = new Date();
    if (dateFilter === '1y') cutoff.setFullYear(now.getFullYear() - 1);
    if (dateFilter === '6m') cutoff.setMonth(now.getMonth() - 6);
    if (dateFilter === '3m') cutoff.setMonth(now.getMonth() - 3);
    if (dateFilter === 'month') cutoff.setMonth(now.getMonth() - 1);

    const cutoffStr = cutoff.toISOString().substring(0, 10);
    return all.filter(t => t.date >= cutoffStr);
  }, [activeDataset, dateFilter]);

  // Real-time calculations
  const kpis = useMemo(() => {
    return calculateKPIs(filteredTransactions, 450000);
  }, [filteredTransactions]);

  const monthlyAggregates = useMemo(() => {
    return calculateMonthlyAggregates(filteredTransactions);
  }, [filteredTransactions]);

  const expenseCategories = useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions, 'expense');
  }, [filteredTransactions]);

  const revenueCategories = useMemo(() => {
    return calculateCategoryBreakdown(filteredTransactions, 'income');
  }, [filteredTransactions]);

  const budgetPerformance = useMemo(() => {
    return calculateBudgetPerformance(budgets, filteredTransactions);
  }, [budgets, filteredTransactions]);

  // Actions
  const uploadDataset = async (file: File, name: string, company: string): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('companyName', company);
      formData.append('currency', currency);

      const res = await fetch('/api/datasets/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to upload dataset');
      }

      const data = await res.json();
      if (data.dataset) {
        setDatasets(prev => [data.dataset, ...prev]);
        setActiveDatasetId(data.dataset.id);
        showToast(`Dataset "${data.dataset.name}" successfully uploaded and cleaned!`);
        return true;
      }
      return false;
    } catch (e: any) {
      showToast(`Error: ${e.message}`);
      return false;
    }
  };

  const cleanActiveDataset = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}/clean`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
      });
      if (res.ok) {
        const data = await res.json();
        setDatasets(prev => prev.map(d => (d.id === activeDataset.id ? data.dataset : d)));
        showToast('Automated cleaning complete: Duplicates removed and values standardized.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteDataset = async (id: string): Promise<boolean> => {
    if (datasets.length <= 1) {
      showToast('Cannot delete the last remaining dataset.');
      return false;
    }
    try {
      await fetch(`/api/datasets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
      });
      const remaining = datasets.filter(d => d.id !== id);
      setDatasets(remaining);
      setActiveDatasetId(remaining[0].id);
      showToast('Dataset deleted.');
      return true;
    } catch {
      return false;
    }
  };

  const addTransaction = async (tx: Omit<Transaction, 'id'>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}/transactions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'usr-fin-admin'}`,
        },
        body: JSON.stringify(tx),
      });

      if (res.ok) {
        const data = await res.json();
        setDatasets(prev =>
          prev.map(d => {
            if (d.id === activeDataset.id) {
              return {
                ...d,
                transactions: [data.transaction, ...d.transactions],
                rowCount: d.rowCount + 1,
              };
            }
            return d;
          })
        );
        showToast('Transaction added successfully.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>): Promise<boolean> => {
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}/transactions/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'usr-fin-admin'}`,
        },
        body: JSON.stringify(updates),
      });

      if (res.ok) {
        const data = await res.json();
        setDatasets(prev =>
          prev.map(d => {
            if (d.id === activeDataset.id) {
              return {
                ...d,
                transactions: d.transactions.map(t => (t.id === id ? data.transaction : t)),
              };
            }
            return d;
          })
        );
        showToast('Transaction updated.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/datasets/${activeDataset.id}/transactions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
      });

      if (res.ok) {
        setDatasets(prev =>
          prev.map(d => {
            if (d.id === activeDataset.id) {
              return {
                ...d,
                transactions: d.transactions.filter(t => t.id !== id),
                rowCount: Math.max(0, d.rowCount - 1),
              };
            }
            return d;
          })
        );
        showToast('Transaction removed.');
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const saveBudget = async (budget: Partial<Budget> & { category: string; monthlyLimit: number }): Promise<boolean> => {
    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'usr-fin-admin'}`,
        },
        body: JSON.stringify(budget),
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(prev => {
          const idx = prev.findIndex(b => b.id === data.budget.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.budget;
            return next;
          }
          return [...prev, data.budget];
        });
        showToast(`Budget for ${budget.category} saved.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/budgets/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token || 'usr-fin-admin'}` },
      });
      setBudgets(prev => prev.filter(b => b.id !== id));
      showToast('Budget deleted.');
      return true;
    } catch {
      return false;
    }
  };

  const saveSavingsTarget = async (target: Partial<SavingsTarget> & { name: string; targetAmount: number }): Promise<boolean> => {
    try {
      const res = await fetch('/api/savings-targets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'usr-fin-admin'}`,
        },
        body: JSON.stringify(target),
      });
      if (res.ok) {
        const data = await res.json();
        setSavingsTargets(prev => {
          const idx = prev.findIndex(st => st.id === data.savingsTarget.id);
          if (idx >= 0) {
            const next = [...prev];
            next[idx] = data.savingsTarget;
            return next;
          }
          return [...prev, data.savingsTarget];
        });
        showToast(`Savings target "${target.name}" updated.`);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const askAIAnalyst = async (question: string): Promise<AIAnalysisResponse | null> => {
    setIsAILoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token || 'usr-fin-admin'}`,
        },
        body: JSON.stringify({
          datasetId: activeDataset.id,
          question,
          model: 'gemini-3.8-flash',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'AI analysis request failed');
      }

      const data = await res.json();
      setLatestAIResponse(data.analysis);
      return data.analysis;
    } catch (e: any) {
      showToast(`AI Analysis Error: ${e.message}`);
      return null;
    } finally {
      setIsAILoading(false);
    }
  };

  return (
    <FinancialContext.Provider
      value={{
        activeTab,
        setActiveTab,
        currency,
        setCurrency,
        dateFilter,
        setDateFilter,
        datasets,
        activeDataset,
        activeDatasetId,
        setActiveDatasetId,
        uploadDataset,
        deleteDataset,
        cleanActiveDataset,
        filteredTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        budgets,
        savingsTargets,
        saveBudget,
        deleteBudget,
        saveSavingsTarget,
        kpis,
        monthlyAggregates,
        expenseCategories,
        revenueCategories,
        budgetPerformance,
        isAILoading,
        latestAIResponse,
        askAIAnalyst,
        toast,
        showToast,
      }}
    >
      {children}
    </FinancialContext.Provider>
  );
};

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};
