import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { db } from './db';
import { analyzeFinancialQuery } from './gemini';
import {
  calculateKPIs,
  calculateMonthlyAggregates,
  calculateCategoryBreakdown,
  calculateForecasting,
  calculateBudgetPerformance,
  cleanRawTransactions,
} from '../src/utils/financialMath';
import { Transaction, Budget } from '../src/types';

export const apiRouter = express.Router();

// File upload setup
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
});

function getUserIdFromRequest(req: Request): string {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    if (token && token.startsWith('usr-')) {
      return token;
    }
  }
  return 'usr-fin-admin';
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  const userId = getUserIdFromRequest(req);
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: valid user session required.' });
  }
  (req as any).user = user;
  next();
}

// ================= AUTH ROUTES ================= //

apiRouter.post('/auth/register', (req: Request, res: Response) => {
  const { email, password, fullName, company, currency } = req.body;
  if (!email || !password || !fullName) {
    return res.status(400).json({ error: 'Email, password, and full name are required.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const user = db.createUser(email, password, fullName, company, 'finance_manager', currency || 'USD');
  res.status(201).json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      company: user.company,
      role: user.role,
      currency: user.currency,
    },
    token: user.id,
  });
});

apiRouter.post('/auth/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user || !db.verifyPassword(user, password)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      company: user.company,
      role: user.role,
      currency: user.currency,
    },
    token: user.id,
  });
});

apiRouter.get('/auth/me', (req: Request, res: Response) => {
  const userId = getUserIdFromRequest(req);
  const user = db.findUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      company: user.company,
      role: user.role,
      currency: user.currency,
    },
    token: user.id,
  });
});

apiRouter.patch('/auth/profile', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { fullName, company, currency, password } = req.body;
  const updated = db.updateUserProfile(user.id, {
    fullName,
    company,
    currency,
    passwordHash: password,
  });
  res.json({ user: updated });
});

// ================= DATASET & UPLOAD ROUTES ================= //

apiRouter.get('/datasets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const datasets = db.getDatasets(user.id);
  res.json({ datasets });
});

apiRouter.get('/datasets/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const dataset = db.getDatasetById(req.params.id, user.id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }
  res.json({ dataset });
});

apiRouter.post('/datasets/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
  const user = (req as any).user;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ error: 'No financial file uploaded.' });
  }

  const { name, companyName, currency = 'USD' } = req.body;
  let rawRows: any[] = [];

  try {
    const ext = file.originalname.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    } else {
      // CSV or plain text
      const csvStr = file.buffer.toString('utf-8');
      const workbook = XLSX.read(csvStr, { type: 'string' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      rawRows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
    }
  } catch (err: any) {
    return res.status(400).json({
      error: `Failed to parse tabular financial file: ${err?.message || 'Unsupported encoding'}`,
    });
  }

  if (!rawRows || rawRows.length === 0) {
    return res.status(400).json({ error: 'The uploaded file does not contain readable data rows.' });
  }

  // Run automated cleaning engine
  const { cleaned, logs, stats } = cleanRawTransactions(rawRows);

  const dataset = db.saveDataset({
    id: `ds-${Date.now()}`,
    userId: user.id,
    name: name || file.originalname.replace(/\.[^/.]+$/, ''),
    companyName: companyName || user.company || 'Enterprise Entity',
    currency: currency || user.currency || 'USD',
    uploadedAt: new Date().toISOString(),
    rowCount: rawRows.length,
    validRowCount: cleaned.length,
    duplicatesRemoved: stats.duplicatesRemoved,
    missingValuesFixed: stats.missingValuesHandled,
    isCleaned: true,
    cleaningLogs: logs as any,
    transactions: cleaned as any,
    notes: `Imported from ${file.originalname} (${(file.size / 1024).toFixed(1)} KB). Sanitized and validated.`,
  });

  res.status(201).json({ dataset, stats });
});

apiRouter.post('/datasets/:id/clean', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const dataset = db.getDatasetById(req.params.id, user.id);
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }

  const { cleaned, logs, stats } = cleanRawTransactions(dataset.transactions);
  dataset.transactions = cleaned as any;
  dataset.validRowCount = cleaned.length;
  dataset.duplicatesRemoved += stats.duplicatesRemoved;
  dataset.missingValuesFixed += stats.missingValuesHandled;
  dataset.cleaningLogs = [...(dataset.cleaningLogs || []), ...(logs as any)];
  dataset.isCleaned = true;

  const saved = db.saveDataset(dataset);
  res.json({ dataset: saved, stats });
});

apiRouter.delete('/datasets/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const success = db.deleteDataset(req.params.id, user.id);
  if (!success) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }
  res.json({ success: true, message: 'Dataset deleted successfully.' });
});

// ================= TRANSACTION MANAGEMENT ================= //

apiRouter.post('/datasets/:id/transactions', requireAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { date, description, category, amount, type, account, status, notes, merchant } = req.body;

  if (!date || !description || amount === undefined || !category) {
    return res.status(400).json({ error: 'Date, description, category, and amount are required.' });
  }

  const newTxn = {
    id: `txn-user-${Date.now()}`,
    date,
    description,
    category,
    amount: Math.abs(parseFloat(amount) || 0),
    type: (type === 'income' ? 'income' : 'expense') as 'income' | 'expense',
    account: account || 'Operating Account',
    status: (status || 'cleared') as 'reconciled' | 'cleared' | 'pending',
    notes,
    merchant,
  };

  const added = db.addTransaction(id, newTxn);
  if (!added) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }
  res.status(201).json({ transaction: added });
});

apiRouter.patch('/datasets/:id/transactions/:txId', requireAuth, (req: Request, res: Response) => {
  const { id, txId } = req.params;
  const updates = req.body;
  if (updates.amount !== undefined) {
    updates.amount = Math.abs(parseFloat(updates.amount) || 0);
  }

  const updated = db.updateTransaction(id, txId, updates);
  if (!updated) {
    return res.status(404).json({ error: 'Transaction or dataset not found.' });
  }
  res.json({ transaction: updated });
});

apiRouter.delete('/datasets/:id/transactions/:txId', requireAuth, (req: Request, res: Response) => {
  const { id, txId } = req.params;
  const success = db.deleteTransaction(id, txId);
  if (!success) {
    return res.status(404).json({ error: 'Transaction or dataset not found.' });
  }
  res.json({ success: true });
});

// ================= BUDGETS & TARGETS ================= //

apiRouter.get('/budgets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const budgets = db.getBudgets(user.id);
  res.json({ budgets });
});

apiRouter.post('/budgets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id, category, monthlyLimit, alertThreshold, notes } = req.body;
  if (!category || !monthlyLimit) {
    return res.status(400).json({ error: 'Category and monthly limit are required.' });
  }

  const budget = db.saveBudget({
    id: id || `b-${Date.now()}`,
    userId: user.id,
    category,
    monthlyLimit: parseFloat(monthlyLimit),
    alertThreshold: parseFloat(alertThreshold) || 80,
    notes,
  });
  res.status(201).json({ budget });
});

apiRouter.delete('/budgets/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const success = db.deleteBudget(req.params.id, user.id);
  if (!success) {
    return res.status(404).json({ error: 'Budget not found.' });
  }
  res.json({ success: true });
});

apiRouter.get('/savings-targets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const targets = db.getSavingsTargets(user.id);
  res.json({ savingsTargets: targets });
});

apiRouter.post('/savings-targets', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id, name, targetAmount, currentAmount, targetDate, category } = req.body;
  if (!name || !targetAmount) {
    return res.status(400).json({ error: 'Name and target amount are required.' });
  }

  const saved = db.saveSavingsTarget({
    id: id || `st-${Date.now()}`,
    userId: user.id,
    name,
    targetAmount: parseFloat(targetAmount),
    currentAmount: parseFloat(currentAmount) || 0,
    targetDate: targetDate || '2025-12-31',
    category: category || 'General Reserve',
  });
  res.status(201).json({ savingsTarget: saved });
});

// ================= ANALYTICS & FORECASTING ================= //

apiRouter.get('/analytics/kpis', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { datasetId, cashBalance } = req.query;

  const dataset = db.getDatasetById(String(datasetId), user.id) || db.getDatasets(user.id)[0];
  if (!dataset) {
    return res.status(404).json({ error: 'No financial dataset available.' });
  }

  const balance = cashBalance ? parseFloat(String(cashBalance)) : 450000;
  const kpis = calculateKPIs(dataset.transactions as Transaction[], balance);
  const monthly = calculateMonthlyAggregates(dataset.transactions as Transaction[]);
  const expCategories = calculateCategoryBreakdown(dataset.transactions as Transaction[], 'expense');
  const revCategories = calculateCategoryBreakdown(dataset.transactions as Transaction[], 'income');

  res.json({
    datasetId: dataset.id,
    datasetName: dataset.name,
    currency: dataset.currency,
    kpis,
    monthly,
    expCategories,
    revCategories,
  });
});

apiRouter.get('/analytics/forecasting', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { datasetId, horizon = '6', scenario = 'base', methodology = 'Linear Regression' } = req.query;

  const dataset = db.getDatasetById(String(datasetId), user.id) || db.getDatasets(user.id)[0];
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }

  const monthly = calculateMonthlyAggregates(dataset.transactions as Transaction[]);
  const forecast = calculateForecasting(
    monthly,
    parseInt(String(horizon), 10) || 6,
    (scenario as any) || 'base',
    (methodology as any) || 'Linear Regression'
  );

  res.json({ forecast });
});

// ================= AI FINANCIAL ANALYST ================= //

apiRouter.post('/ai/analyze', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { datasetId, question, model } = req.body;

  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const dataset = db.getDatasetById(datasetId, user.id) || db.getDatasets(user.id)[0];
  if (!dataset) {
    return res.status(404).json({ error: 'Dataset not found.' });
  }

  const txns = dataset.transactions as Transaction[];
  const kpis = calculateKPIs(txns);
  const monthlyTrends = calculateMonthlyAggregates(txns);
  const topExpenses = calculateCategoryBreakdown(txns, 'expense');
  const topRevenue = calculateCategoryBreakdown(txns, 'income');

  try {
    const analysis = await analyzeFinancialQuery({
      datasetName: dataset.name,
      companyName: dataset.companyName,
      currency: dataset.currency,
      kpis,
      monthlyTrends,
      topExpenses,
      topRevenue,
      recentTransactions: txns.slice(0, 15),
      question,
      model,
    });

    db.logAIQuery({
      userId: user.id,
      datasetId: dataset.id,
      question,
      response: analysis,
    });

    res.json({ analysis });
  } catch (err: any) {
    console.error('Error in AI analysis route:', err);
    res.status(500).json({ error: err?.message || 'Failed to complete AI financial analysis.' });
  }
});

apiRouter.get('/ai/history', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const records = db.getAIQueries(user.id);
  res.json({ history: records });
});

// ================= SYSTEM STATS & HEALTH ================= //

apiRouter.get('/system/health', (req: Request, res: Response) => {
  const stats = db.getStats();
  const mem = process.memoryUsage();
  res.json({
    status: 'healthy',
    uptimeSeconds: Math.floor(process.uptime()),
    memoryUsageMb: Math.round(mem.heapUsed / 1024 / 1024),
    geminiApiConnected: Boolean(process.env.GEMINI_API_KEY),
    databaseType: 'PostgreSQL-compatible Schema',
    timestamp: new Date().toISOString(),
    stats,
  });
});
