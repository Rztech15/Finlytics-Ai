import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Receipt,
  PieChart,
  Scale,
  Waves,
  LineChart,
  BrainCircuit,
  FileSpreadsheet,
  Database,
  Settings,
  ChevronDown,
  Sparkles,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';
import { NavigationTab } from '../types';
import { useFinancial } from '../context/FinancialContext';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'analytics', label: 'Financial Analytics', icon: TrendingUp },
  { id: 'transactions', label: 'Transactions', icon: Receipt },
  { id: 'income-expense', label: 'Income & Expenses', icon: PieChart },
  { id: 'budget', label: 'Budget Management', icon: Scale },
  { id: 'cash-flow', label: 'Cash Flow', icon: Waves },
  { id: 'forecasting', label: 'Forecasting', icon: LineChart, badge: 'AI' },
  { id: 'ai-analyst', label: 'AI Financial Analyst', icon: BrainCircuit, badge: 'Gemini' },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'data-management', label: 'Data Management', icon: Database },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<{ isOpen?: boolean; onClose?: () => void }> = ({
  isOpen = true,
  onClose,
}) => {
  const { activeTab, setActiveTab, datasets, activeDatasetId, setActiveDatasetId, activeDataset } =
    useFinancial();
  const { user, openAuthModal, logout } = useAuth();

  return (
    <aside
      className={`fixed lg:static top-0 left-0 z-40 h-screen w-64 flex flex-col bg-[#101D2B] border-r border-[#42D6C0]/15 transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Brand Header & Geometric Logo */}
      <div className="p-5 border-b border-[#42D6C0]/15 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Geometric Fintech Logo */}
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#153C43] to-[#101D2B] border border-[#42D6C0]/40 flex items-center justify-center shadow-lg shadow-[#42D6C0]/10 relative group">
            <svg
              className="w-6 h-6 text-[#42D6C0] transform group-hover:scale-110 transition-transform"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
              <polyline points="16 7 22 7 22 13" />
            </svg>
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#D4B36A] ring-2 ring-[#101D2B]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-wider text-lg text-white font-mono">
                FINLYTICS
              </span>
              <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-[#42D6C0]/20 text-[#42D6C0] border border-[#42D6C0]/30 uppercase tracking-wider">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-[#8B9AA8] font-medium tracking-tight">
              Financial Intelligence
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-[#8B9AA8] hover:text-white p-1"
            aria-label="Close menu"
          >
            ✕
          </button>
        )}
      </div>

      {/* Dataset Selector Quick Switcher */}
      <div className="px-4 py-3 bg-[#0B131C]/60 border-b border-[#42D6C0]/10">
        <label className="text-[10px] font-semibold text-[#8B9AA8] uppercase tracking-wider block mb-1.5">
          Active Financial Entity
        </label>
        <div className="relative">
          <select
            value={activeDatasetId}
            onChange={e => setActiveDatasetId(e.target.value)}
            className="w-full bg-[#132232] text-xs text-white rounded-lg px-2.5 py-2 pr-7 border border-[#42D6C0]/25 focus:outline-none focus:border-[#42D6C0] appearance-none cursor-pointer truncate font-medium"
            aria-label="Select active financial dataset"
          >
            {datasets.map(ds => (
              <option key={ds.id} value={ds.id} className="bg-[#101D2B] text-white">
                {ds.name} ({ds.transactions.length} rows)
              </option>
            ))}
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#8B9AA8] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar" aria-label="Main Navigation">
        {NAV_ITEMS.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (onClose) onClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all duration-150 ${
                isActive
                  ? 'bg-gradient-to-r from-[#153C43] to-[#101D2B] text-[#42D6C0] border-l-4 border-[#42D6C0] shadow-sm'
                  : 'text-[#8B9AA8] hover:text-white hover:bg-[#132232]/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-[#42D6C0]' : 'text-[#8B9AA8]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-bold rounded tracking-wide ${
                    item.badge === 'Gemini'
                      ? 'bg-[#42D6C0]/20 text-[#42D6C0] border border-[#42D6C0]/30'
                      : 'bg-[#D4B36A]/20 text-[#D4B36A] border border-[#D4B36A]/30'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* AI Assistant Quick Callout */}
      <div className="p-3 mx-3 mb-3 rounded-xl bg-gradient-to-b from-[#153C43]/60 to-[#101D2B] border border-[#42D6C0]/20">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#42D6C0]" />
          <span className="text-[11px] font-bold text-white tracking-wide">
            Ask Finlytics AI
          </span>
        </div>
        <p className="text-[10px] text-[#8B9AA8] line-clamp-2 leading-relaxed mb-2">
          "Why did our expenses surge in Q3?"
        </p>
        <button
          onClick={() => setActiveTab('ai-analyst')}
          className="w-full py-1.5 text-[10px] font-semibold bg-[#42D6C0] text-[#101D2B] rounded-md hover:bg-[#42D6C0]/90 transition-colors flex items-center justify-center gap-1.5"
        >
          <span>Open AI Assistant</span>
          <span>→</span>
        </button>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#42D6C0]/15 bg-[#0B131C]/60 flex items-center justify-between">
        {user ? (
          <div className="flex items-center gap-2.5 truncate flex-1 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#153C43] border border-[#42D6C0]/30 flex items-center justify-center text-xs font-bold text-[#42D6C0] shrink-0">
              {user.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1">
                {user.fullName}
                <ShieldCheck className="w-3 h-3 text-[#42D6C0]" />
              </div>
              <div className="text-[10px] text-[#8B9AA8] truncate">{user.company}</div>
            </div>
            <button
              onClick={logout}
              title="Sign Out"
              className="text-[#8B9AA8] hover:text-[#F43F5E] p-1 ml-auto shrink-0 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={openAuthModal}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-[#42D6C0] bg-[#153C43]/60 hover:bg-[#153C43] rounded-lg border border-[#42D6C0]/30 transition-colors"
          >
            <User className="w-3.5 h-3.5" />
            <span>Sign In / Enterprise Access</span>
          </button>
        )}
      </div>
    </aside>
  );
};
