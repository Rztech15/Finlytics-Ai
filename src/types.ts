export type NavigationTab =
  | 'overview'
  | 'analytics'
  | 'transactions'
  | 'income-expense'
  | 'budget'
  | 'cash-flow'
  | 'forecasting'
  | 'ai-analyst'
  | 'reports'
  | 'data-management'
  | 'settings';

export type TransactionType = 'income' | 'expense';

export type TransactionStatus = 'reconciled' | 'cleared' | 'pending';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // positive number
  type: TransactionType;
  account: string;
  status: TransactionStatus;
  notes?: string;
  merchant?: string;
}

export interface CleaningLogEntry {
  id: string;
  timestamp: string;
  type:
    | 'duplicate_removed'
    | 'missing_imputed'
    | 'invalid_date_fixed'
    | 'currency_normalized'
    | 'category_standardized'
    | 'outlier_flagged';
  details: string;
  count: number;
  severity: 'info' | 'warning' | 'resolved';
}

export interface FinancialDataset {
  id: string;
  name: string;
  companyName: string;
  currency: string;
  uploadedAt: string;
  rowCount: number;
  validRowCount: number;
  duplicatesRemoved: number;
  missingValuesFixed: number;
  cleaningLogs: CleaningLogEntry[];
  transactions: Transaction[];
  isCleaned: boolean;
  notes?: string;
}

export interface Budget {
  id: string;
  category: string;
  monthlyLimit: number;
  alertThreshold: number; // e.g. 80 for 80%
  spent: number;
  remaining: number;
  percentUsed: number;
  notes?: string;
}

export interface SavingsTarget {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface FinancialKPIs {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  grossProfit: number;
  grossMargin: number; // percentage (0-100)
  profitMargin: number; // percentage (0-100)
  operatingExpenses: number;
  cashInflow: number;
  cashOutflow: number;
  netCashFlow: number;
  averageTransactionValue: number;
  monthlyGrowthRate: number; // %
  expenseGrowthRate: number; // %
  savingsRate: number; // %
  burnRate: number; // monthly avg outflow
  runwayMonths: number;
  financialHealthScore: number; // 0 - 100
  healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  transactionCount: number;
}

export interface MonthlyAggregate {
  monthKey: string; // 'YYYY-MM'
  monthLabel: string; // 'Jan 2024'
  revenue: number;
  expenses: number;
  netProfit: number;
  operatingExpenses: number;
  profitMargin: number;
  inflow: number;
  outflow: number;
  netCash: number;
  transactionCount: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;
  count: number;
  avgAmount: number;
  color: string;
}

export interface ForecastPoint {
  date: string;
  monthLabel: string;
  isForecast: boolean;
  actualRevenue?: number;
  actualExpense?: number;
  actualProfit?: number;
  forecastRevenue: number;
  forecastExpense: number;
  forecastProfit: number;
  forecastCashFlow: number;
  upperRev: number;
  lowerRev: number;
  upperExp: number;
  lowerExp: number;
}

export interface ForecastModelResult {
  points: ForecastPoint[];
  methodology: 'Linear Regression' | 'Weighted Moving Average' | 'Exponential Smoothing';
  horizonMonths: number;
  growthRatePct: number;
  rSquared: number;
  confidenceScore: number;
  assumptions: string[];
  scenario: 'base' | 'conservative' | 'aggressive';
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'finance_manager' | 'analyst' | 'viewer';
  company: string;
  currency: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface AIAnalysisRequest {
  query: string;
  datasetId: string;
  includeCalculations?: boolean;
}

export interface AIAnalysisResponse {
  answer: string;
  summary: string;
  groundedFacts: {
    kpi: string;
    calculatedValue: string;
    context: string;
  }[];
  keyInsights: string[];
  recommendations: string[];
  calculationMethodology: string;
  insufficientDataFlags?: string[];
  suggestedQuestions: string[];
  timestamp: string;
}
