/**
 * Server Type Definitions for Finlytics
 */

export type UserRole = 'admin' | 'finance_manager' | 'analyst' | 'viewer';

export interface ServerUser {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  company: string;
  role: UserRole;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface StoredCleaningLog {
  id: string;
  timestamp: string;
  type: string;
  details: string;
  count: number;
  severity: 'info' | 'warning' | 'resolved';
}

export interface StoredTransaction {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  account: string;
  status: 'reconciled' | 'cleared' | 'pending';
  merchant?: string;
  notes?: string;
}

export interface StoredDataset {
  id: string;
  userId: string;
  name: string;
  companyName: string;
  currency: string;
  uploadedAt: string;
  rowCount: number;
  validRowCount: number;
  duplicatesRemoved: number;
  missingValuesFixed: number;
  isCleaned: boolean;
  notes?: string;
  cleaningLogs: StoredCleaningLog[];
  transactions: StoredTransaction[];
}

export interface StoredBudget {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
  alertThreshold: number;
  notes?: string;
}

export interface StoredSavingsTarget {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
}

export interface AIAnalysisRecord {
  id: string;
  userId: string;
  datasetId: string;
  question: string;
  response: any;
  timestamp: string;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded';
  uptimeSeconds: number;
  memoryUsageMb: number;
  geminiApiConnected: boolean;
  databaseType: 'PostgreSQL-compatible File DB';
  timestamp: string;
}
