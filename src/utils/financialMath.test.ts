import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateKPIs,
  calculateMonthlyAggregates,
  calculateCategoryBreakdown,
  calculateForecasting,
  calculateBudgetPerformance,
  cleanRawTransactions,
  formatCurrency,
  formatPercent,
} from './financialMath';
import { Transaction, Budget } from '../types';

const SAMPLE_TXNS: Transaction[] = [
  {
    id: 't1',
    date: '2024-01-15',
    description: 'Enterprise Client ARR Payment',
    category: 'Enterprise License',
    amount: 50000,
    type: 'income',
    account: 'Operating',
    status: 'reconciled',
  },
  {
    id: 't2',
    date: '2024-01-20',
    description: 'AWS Cloud Hosting',
    category: 'Cloud Infrastructure & Hosting',
    amount: 8000,
    type: 'expense',
    account: 'Operating',
    status: 'reconciled',
  },
  {
    id: 't3',
    date: '2024-01-28',
    description: 'Engineering Payroll',
    category: 'Payroll & Compensation',
    amount: 22000,
    type: 'expense',
    account: 'Operating',
    status: 'reconciled',
  },
  {
    id: 't4',
    date: '2024-02-15',
    description: 'SaaS Subscriptions Monthly Batch',
    category: 'SaaS Subscription',
    amount: 65000,
    type: 'income',
    account: 'Stripe',
    status: 'reconciled',
  },
  {
    id: 't5',
    date: '2024-02-22',
    description: 'Paid Ads Performance Marketing',
    category: 'Marketing & Paid Acquisition',
    amount: 15000,
    type: 'expense',
    account: 'Operating',
    status: 'reconciled',
  },
];

test('calculateKPIs calculates correct totals, net profit and profit margin', () => {
  const kpis = calculateKPIs(SAMPLE_TXNS, 200000);
  assert.equal(kpis.totalRevenue, 115000);
  assert.equal(kpis.totalExpenses, 45000);
  assert.equal(kpis.netProfit, 70000);
  assert.ok(kpis.profitMargin > 50); // ~60.87%
  assert.equal(kpis.transactionCount, 5);
  assert.ok(kpis.financialHealthScore >= 70);
});

test('calculateMonthlyAggregates buckets chronologically', () => {
  const monthly = calculateMonthlyAggregates(SAMPLE_TXNS);
  assert.equal(monthly.length, 2);
  assert.equal(monthly[0].monthKey, '2024-01');
  assert.equal(monthly[0].revenue, 50000);
  assert.equal(monthly[0].expenses, 30000);
  assert.equal(monthly[0].netProfit, 20000);

  assert.equal(monthly[1].monthKey, '2024-02');
  assert.equal(monthly[1].revenue, 65000);
  assert.equal(monthly[1].expenses, 15000);
  assert.equal(monthly[1].netProfit, 50000);
});

test('calculateCategoryBreakdown groups and sorts descending', () => {
  const expBreakdown = calculateCategoryBreakdown(SAMPLE_TXNS, 'expense');
  assert.equal(expBreakdown.length, 3);
  // Payroll is 22k, Marketing 15k, Cloud 8k
  assert.equal(expBreakdown[0].category, 'Payroll & Compensation');
  assert.equal(expBreakdown[0].total, 22000);
  assert.equal(expBreakdown[1].category, 'Marketing & Paid Acquisition');
  assert.equal(expBreakdown[1].total, 15000);
});

test('calculateForecasting projects future periods with confidence bounds', () => {
  const monthly = calculateMonthlyAggregates(SAMPLE_TXNS);
  const forecast = calculateForecasting(monthly, 3, 'base');

  assert.equal(forecast.points.length, 2 + 3); // 2 historical + 3 forecast
  assert.equal(forecast.points[2].isForecast, true);
  assert.ok(forecast.points[2].forecastRevenue > 0);
  assert.ok(forecast.points[2].upperRev >= forecast.points[2].forecastRevenue);
  assert.ok(forecast.points[2].lowerRev <= forecast.points[2].forecastRevenue);
  assert.ok(forecast.assumptions.length > 0);
});

test('calculateBudgetPerformance tracks spent and alerts', () => {
  const budgets: Budget[] = [
    {
      id: 'b1',
      category: 'Payroll & Compensation',
      monthlyLimit: 25000,
      alertThreshold: 80,
      spent: 0,
      remaining: 0,
      percentUsed: 0,
    },
    {
      id: 'b2',
      category: 'Cloud Infrastructure & Hosting',
      monthlyLimit: 6000, // actual is 8000 -> overspent
      alertThreshold: 80,
      spent: 0,
      remaining: 0,
      percentUsed: 0,
    },
  ];

  const results = calculateBudgetPerformance(budgets, SAMPLE_TXNS, '2024-01');
  assert.equal(results[0].spent, 22000);
  assert.equal(results[0].percentUsed, 88);
  assert.equal(results[1].spent, 8000);
  assert.ok(results[1].percentUsed > 100);
  assert.equal(results[1].remaining, 0);
});

test('cleanRawTransactions handles dirty data, duplicates, and formats', () => {
  const dirtyRows = [
    {
      Date: '01/15/2024',
      Description: 'Stripe Payout',
      Amount: '$12,450.00',
      Category: 'SaaS Subscription',
    },
    {
      // Duplicate of above
      Date: '2024-01-15',
      Description: 'Stripe Payout',
      Amount: '12450',
      Category: 'SaaS Subscription',
    },
    {
      // Dirty expense with accounting parentheses
      Date: '2024-02-01',
      Description: 'Office Supplies',
      Amount: '(450.50)',
      Category: '',
    },
  ];

  const res = cleanRawTransactions(dirtyRows);
  assert.equal(res.stats.duplicatesRemoved, 1);
  assert.equal(res.cleaned.length, 2);
  assert.equal(res.cleaned[0].amount, 450.5); // latest sorted first
  assert.equal(res.cleaned[0].type, 'expense');
  assert.ok(res.logs.length >= 2);
});

test('formatCurrency and formatPercent produce clean strings', () => {
  assert.equal(formatCurrency(12500.5, 'USD'), '$12,500.50');
  assert.equal(formatCurrency(1500000, 'USD', true), '$1.50M');
  assert.equal(formatPercent(14.2), '+14.2%');
  assert.equal(formatPercent(-5.1), '-5.1%');
});
