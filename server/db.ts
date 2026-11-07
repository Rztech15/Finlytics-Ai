import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  ServerUser,
  StoredDataset,
  StoredTransaction,
  StoredBudget,
  StoredSavingsTarget,
  AIAnalysisRecord,
} from './types';
import { SEED_DATASETS, INITIAL_BUDGETS, INITIAL_SAVINGS_TARGETS } from '../src/data/seedDatasets';

interface FinlyticsSchema {
  users: ServerUser[];
  datasets: StoredDataset[];
  budgets: StoredBudget[];
  savingsTargets: StoredSavingsTarget[];
  aiRecords: AIAnalysisRecord[];
}

const DATA_DIR = path.resolve(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Default initial user for instant access or registration
const DEFAULT_ADMIN_USER: ServerUser = {
  id: 'usr-fin-admin',
  email: 'ramzanbalochmrbaloch@gmail.com',
  passwordHash: hashPassword('finlytics2025'),
  fullName: 'Ramzan Baloch',
  company: 'Apex Cloud Systems Inc.',
  role: 'admin',
  currency: 'USD',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password + '_finlytics_salt').digest('hex');
}

class FinlyticsDatabase {
  private data: FinlyticsSchema = {
    users: [],
    datasets: [],
    budgets: [],
    savingsTargets: [],
    aiRecords: [],
  };

  constructor() {
    this.init();
  }

  private init() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.datasets && Array.isArray(parsed.datasets) && parsed.datasets.length > 0) {
          this.data = {
            users: parsed.users || [],
            datasets: parsed.datasets,
            budgets: parsed.budgets || [],
            savingsTargets: parsed.savingsTargets || [],
            aiRecords: parsed.aiRecords || [],
          };
          this.ensureDefaultUser();
          return;
        }
      }
    } catch (e) {
      console.warn('Failed reading existing database file, re-seeding:', e);
    }

    // Seed default datasets
    this.seedDefaultData();
  }

  private seedDefaultData() {
    this.data.users = [DEFAULT_ADMIN_USER];

    this.data.datasets = SEED_DATASETS.map(ds => ({
      ...ds,
      userId: DEFAULT_ADMIN_USER.id,
      transactions: ds.transactions as StoredTransaction[],
    }));

    this.data.budgets = INITIAL_BUDGETS.map(b => ({
      id: b.id,
      userId: DEFAULT_ADMIN_USER.id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      alertThreshold: b.alertThreshold,
      notes: b.notes,
    }));

    this.data.savingsTargets = INITIAL_SAVINGS_TARGETS.map(st => ({
      ...st,
      userId: DEFAULT_ADMIN_USER.id,
    }));

    this.data.aiRecords = [];
    this.persist();
  }

  private ensureDefaultUser() {
    const exists = this.data.users.find(u => u.id === DEFAULT_ADMIN_USER.id || u.email === DEFAULT_ADMIN_USER.email);
    if (!exists) {
      this.data.users.push(DEFAULT_ADMIN_USER);
      this.persist();
    }
  }

  private persist() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed writing to database.json:', err);
    }
  }

  // --- Users & Auth ---
  findUserById(id: string): ServerUser | undefined {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email: string): ServerUser | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  createUser(
    email: string,
    passwordPlain: string,
    fullName: string,
    company: string = 'Enterprise Finance Inc.',
    role: ServerUser['role'] = 'finance_manager',
    currency = 'USD'
  ): ServerUser {
    const user: ServerUser = {
      id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      email: email.toLowerCase(),
      passwordHash: hashPassword(passwordPlain),
      fullName,
      company,
      role,
      currency,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.users.push(user);

    // Give new user default seeded dataset copy
    const userDatasets: StoredDataset[] = SEED_DATASETS.map((ds, idx) => ({
      ...ds,
      id: `ds-${user.id}-${idx}`,
      userId: user.id,
      transactions: ds.transactions as StoredTransaction[],
    }));
    this.data.datasets.push(...userDatasets);

    const userBudgets: StoredBudget[] = INITIAL_BUDGETS.map(b => ({
      id: `b-${user.id}-${b.id}`,
      userId: user.id,
      category: b.category,
      monthlyLimit: b.monthlyLimit,
      alertThreshold: b.alertThreshold,
      notes: b.notes,
    }));
    this.data.budgets.push(...userBudgets);

    this.persist();
    return user;
  }

  verifyPassword(user: ServerUser, passwordPlain: string): boolean {
    return user.passwordHash === hashPassword(passwordPlain);
  }

  updateUserProfile(userId: string, updates: Partial<ServerUser>): ServerUser | null {
    const user = this.findUserById(userId);
    if (!user) return null;
    if (updates.fullName) user.fullName = updates.fullName;
    if (updates.company) user.company = updates.company;
    if (updates.currency) user.currency = updates.currency;
    if (updates.passwordHash) user.passwordHash = hashPassword(updates.passwordHash);
    user.updatedAt = new Date().toISOString();
    this.persist();
    return user;
  }

  // --- Datasets ---
  getDatasets(userId: string): StoredDataset[] {
    // Return datasets for this user, or fallback to global seed if none
    const list = this.data.datasets.filter(d => d.userId === userId || d.userId === DEFAULT_ADMIN_USER.id);
    return list.length > 0 ? list : this.data.datasets;
  }

  getDatasetById(datasetId: string, userId: string): StoredDataset | undefined {
    return this.data.datasets.find(
      d => d.id === datasetId && (d.userId === userId || d.userId === DEFAULT_ADMIN_USER.id)
    );
  }

  saveDataset(dataset: StoredDataset): StoredDataset {
    const existingIndex = this.data.datasets.findIndex(d => d.id === dataset.id);
    if (existingIndex >= 0) {
      this.data.datasets[existingIndex] = dataset;
    } else {
      this.data.datasets.unshift(dataset);
    }
    this.persist();
    return dataset;
  }

  deleteDataset(datasetId: string, userId: string): boolean {
    const idx = this.data.datasets.findIndex(
      d => d.id === datasetId && (d.userId === userId || d.userId === DEFAULT_ADMIN_USER.id)
    );
    if (idx === -1) return false;
    this.data.datasets.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Transactions ---
  addTransaction(datasetId: string, transaction: StoredTransaction): StoredTransaction | null {
    const ds = this.data.datasets.find(d => d.id === datasetId);
    if (!ds) return null;
    ds.transactions.unshift(transaction);
    ds.rowCount = ds.transactions.length;
    ds.validRowCount = ds.transactions.length;
    this.persist();
    return transaction;
  }

  updateTransaction(
    datasetId: string,
    transactionId: string,
    updates: Partial<StoredTransaction>
  ): StoredTransaction | null {
    const ds = this.data.datasets.find(d => d.id === datasetId);
    if (!ds) return null;
    const txn = ds.transactions.find(t => t.id === transactionId);
    if (!txn) return null;
    Object.assign(txn, updates);
    this.persist();
    return txn;
  }

  deleteTransaction(datasetId: string, transactionId: string): boolean {
    const ds = this.data.datasets.find(d => d.id === datasetId);
    if (!ds) return false;
    const idx = ds.transactions.findIndex(t => t.id === transactionId);
    if (idx === -1) return false;
    ds.transactions.splice(idx, 1);
    ds.rowCount = ds.transactions.length;
    ds.validRowCount = ds.transactions.length;
    this.persist();
    return true;
  }

  // --- Budgets ---
  getBudgets(userId: string): StoredBudget[] {
    const b = this.data.budgets.filter(x => x.userId === userId || x.userId === DEFAULT_ADMIN_USER.id);
    return b.length > 0 ? b : this.data.budgets;
  }

  saveBudget(budget: StoredBudget): StoredBudget {
    const idx = this.data.budgets.findIndex(b => b.id === budget.id);
    if (idx >= 0) {
      this.data.budgets[idx] = budget;
    } else {
      this.data.budgets.push(budget);
    }
    this.persist();
    return budget;
  }

  deleteBudget(budgetId: string, userId: string): boolean {
    const idx = this.data.budgets.findIndex(b => b.id === budgetId && (b.userId === userId || b.userId === DEFAULT_ADMIN_USER.id));
    if (idx === -1) return false;
    this.data.budgets.splice(idx, 1);
    this.persist();
    return true;
  }

  // --- Savings Targets ---
  getSavingsTargets(userId: string): StoredSavingsTarget[] {
    return this.data.savingsTargets.filter(st => st.userId === userId || st.userId === DEFAULT_ADMIN_USER.id);
  }

  saveSavingsTarget(target: StoredSavingsTarget): StoredSavingsTarget {
    const idx = this.data.savingsTargets.findIndex(t => t.id === target.id);
    if (idx >= 0) {
      this.data.savingsTargets[idx] = target;
    } else {
      this.data.savingsTargets.push(target);
    }
    this.persist();
    return target;
  }

  // --- AI Queries Logging ---
  logAIQuery(record: Omit<AIAnalysisRecord, 'id' | 'timestamp'>): AIAnalysisRecord {
    const rec: AIAnalysisRecord = {
      ...record,
      id: `ai-rec-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    this.data.aiRecords.unshift(rec);
    if (this.data.aiRecords.length > 100) {
      this.data.aiRecords = this.data.aiRecords.slice(0, 100);
    }
    this.persist();
    return rec;
  }

  getAIQueries(userId: string): AIAnalysisRecord[] {
    return this.data.aiRecords.filter(r => r.userId === userId || r.userId === DEFAULT_ADMIN_USER.id);
  }

  getStats() {
    return {
      totalUsers: this.data.users.length,
      totalDatasets: this.data.datasets.length,
      totalTransactions: this.data.datasets.reduce((acc, d) => acc + d.transactions.length, 0),
      totalBudgets: this.data.budgets.length,
      totalAIAnalyses: this.data.aiRecords.length,
    };
  }
}

export const db = new FinlyticsDatabase();
