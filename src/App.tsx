import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { FinancialProvider, useFinancial } from './context/FinancialContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { AddTransactionModal } from './components/AddTransactionModal';
import { AuthModal } from './components/AuthModal';

// Views
import { OverviewView } from './components/views/OverviewView';
import { FinancialAnalyticsView } from './components/views/FinancialAnalyticsView';
import { TransactionsView } from './components/views/TransactionsView';
import { IncomeExpenseView } from './components/views/IncomeExpenseView';
import { BudgetManagementView } from './components/views/BudgetManagementView';
import { CashFlowView } from './components/views/CashFlowView';
import { ForecastingView } from './components/views/ForecastingView';
import { AIFinancialAnalystView } from './components/views/AIFinancialAnalystView';
import { ReportsView } from './components/views/ReportsView';
import { DataManagementView } from './components/views/DataManagementView';
import { SettingsView } from './components/views/SettingsView';

const MainLayout: React.FC = () => {
  const { activeTab, toast } = useFinancial();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddTxModalOpen, setIsAddTxModalOpen] = useState(false);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0B131C] text-white font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Header Bar */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddModal={() => setIsAddTxModalOpen(true)}
        />

        {/* Scrollable Viewport */}
        <main className="flex-1 overflow-y-auto px-4 lg:px-8 py-6 custom-scrollbar">
          <div className="max-w-7xl mx-auto pb-12">
            {activeTab === 'overview' && <OverviewView />}
            {activeTab === 'analytics' && <FinancialAnalyticsView />}
            {activeTab === 'transactions' && (
              <TransactionsView onOpenAddModal={() => setIsAddTxModalOpen(true)} />
            )}
            {activeTab === 'income-expense' && <IncomeExpenseView />}
            {activeTab === 'budget' && <BudgetManagementView />}
            {activeTab === 'cash-flow' && <CashFlowView />}
            {activeTab === 'forecasting' && <ForecastingView />}
            {activeTab === 'ai-analyst' && <AIFinancialAnalystView />}
            {activeTab === 'reports' && <ReportsView />}
            {activeTab === 'data-management' && <DataManagementView />}
            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddTransactionModal
        isOpen={isAddTxModalOpen}
        onClose={() => setIsAddTxModalOpen(false)}
      />
      <AuthModal />

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#132232] text-white px-4 py-3 rounded-xl border border-[#42D6C0]/40 shadow-2xl flex items-center gap-2 text-xs font-semibold animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#42D6C0]" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <FinancialProvider>
        <MainLayout />
      </FinancialProvider>
    </AuthProvider>
  );
}

export default App;
