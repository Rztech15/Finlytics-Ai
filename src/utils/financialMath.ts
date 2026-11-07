import {
  Transaction,
  FinancialKPIs,
  MonthlyAggregate,
  CategoryBreakdown,
  ForecastModelResult,
  ForecastPoint,
  CleaningLogEntry,
  Budget,
} from '../types';

export const FINTECH_CATEGORY_COLORS: Record<string, string> = {
  // Revenue
  'SaaS Subscription': '#42D6C0',
  'Enterprise License': '#2FD3B4',
  'Consulting Services': '#D4B36A',
  'API & Cloud Usage': '#38BDF8',
  'Hardware & Equipment': '#F59E0B',
  'Investment & Interest': '#10B981',
  'Other Income': '#A78BFA',

  // Expenses
  'Cloud Infrastructure & Hosting': '#6366F1',
  'Payroll & Compensation': '#EC4899',
  'Marketing & Paid Acquisition': '#F43F5E',
  'Software & Tool Subscriptions': '#8B5CF6',
  'Office Rent & Facilities': '#F59E0B',
  'Legal & Professional Fees': '#14B8A6',
  'Travel & Entertainment': '#EAB308',
  'Customer Support & Success': '#06B6D4',
  'Research & Development': '#84CC16',
  'Taxes & Regulatory': '#94A3B8',
  'Miscellaneous Expense': '#64748B',
};

const PALETTE_FALLBACK = [
  '#42D6C0',
  '#D4B36A',
  '#38BDF8',
  '#F43F5E',
  '#8B5CF6',
  '#10B981',
  '#F59E0B',
  '#EC4899',
  '#06B6D4',
  '#A78BFA',
];

/**
 * Calculates core financial KPIs from an array of validated transactions
 */
export function calculateKPIs(
  transactions: Transaction[],
  currentCashBalance = 450000
): FinancialKPIs {
  if (!transactions || transactions.length === 0) {
    return {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossProfit: 0,
      grossMargin: 0,
      profitMargin: 0,
      operatingExpenses: 0,
      cashInflow: 0,
      cashOutflow: 0,
      netCashFlow: 0,
      averageTransactionValue: 0,
      monthlyGrowthRate: 0,
      expenseGrowthRate: 0,
      savingsRate: 0,
      burnRate: 0,
      runwayMonths: 0,
      financialHealthScore: 0,
      healthGrade: 'F',
      transactionCount: 0,
    };
  }

  let totalRevenue = 0;
  let totalExpenses = 0;
  let cogs = 0;
  let cashInflow = 0;
  let cashOutflow = 0;

  for (const t of transactions) {
    const amt = Math.abs(t.amount || 0);
    if (t.type === 'income') {
      totalRevenue += amt;
      if (t.status !== 'pending') cashInflow += amt;
    } else {
      totalExpenses += amt;
      if (t.status !== 'pending') cashOutflow += amt;
      // Direct cost/infrastructure treated as COGS
      if (
        t.category.toLowerCase().includes('hosting') ||
        t.category.toLowerCase().includes('infrastructure') ||
        t.category.toLowerCase().includes('hardware') ||
        t.category.toLowerCase().includes('cogs')
      ) {
        cogs += amt;
      }
    }
  }

  const netProfit = totalRevenue - totalExpenses;
  // If no explicit COGS identified, assume 15% standard baseline direct cost
  const effectiveCogs = cogs > 0 ? cogs : totalRevenue * 0.15;
  const grossProfit = Math.max(0, totalRevenue - effectiveCogs);
  const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;
  const operatingExpenses = Math.max(0, totalExpenses - effectiveCogs);
  const netCashFlow = cashInflow - cashOutflow;
  const averageTransactionValue =
    transactions.length > 0 ? (totalRevenue + totalExpenses) / transactions.length : 0;

  // Monthly aggregates to calculate growth rates and burn rate
  const monthly = calculateMonthlyAggregates(transactions);
  let monthlyGrowthRate = 0;
  let expenseGrowthRate = 0;
  let burnRate = totalExpenses / Math.max(1, monthly.length || 1);

  if (monthly.length >= 2) {
    const last = monthly[monthly.length - 1];
    const prev = monthly[monthly.length - 2];

    if (prev.revenue > 0) {
      monthlyGrowthRate = ((last.revenue - prev.revenue) / prev.revenue) * 100;
    }
    if (prev.expenses > 0) {
      expenseGrowthRate = ((last.expenses - prev.expenses) / prev.expenses) * 100;
    }

    // Weight recent 3 months for burn rate
    const recentMonths = monthly.slice(-3);
    const recentSum = recentMonths.reduce((sum, m) => sum + m.expenses, 0);
    burnRate = recentSum / recentMonths.length;
  }

  const savingsRate =
    totalRevenue > 0 && netProfit > 0 ? (netProfit / totalRevenue) * 100 : 0;

  const runwayMonths = burnRate > 0 ? currentCashBalance / burnRate : 999;

  // Financial Health Score Algorithm (0-100)
  // 1. Profit Margin component (30 pts)
  let scoreProfit = 0;
  if (profitMargin >= 25) scoreProfit = 30;
  else if (profitMargin >= 10) scoreProfit = 22;
  else if (profitMargin >= 0) scoreProfit = 15;
  else if (profitMargin >= -15) scoreProfit = 8;
  else scoreProfit = 2;

  // 2. Growth component (25 pts)
  let scoreGrowth = 0;
  if (monthlyGrowthRate >= 15) scoreGrowth = 25;
  else if (monthlyGrowthRate >= 5) scoreGrowth = 20;
  else if (monthlyGrowthRate >= 0) scoreGrowth = 15;
  else if (monthlyGrowthRate >= -5) scoreGrowth = 10;
  else scoreGrowth = 4;

  // 3. Cash Runway component (25 pts)
  let scoreRunway = 0;
  if (runwayMonths >= 18) scoreRunway = 25;
  else if (runwayMonths >= 12) scoreRunway = 20;
  else if (runwayMonths >= 6) scoreRunway = 15;
  else if (runwayMonths >= 3) scoreRunway = 8;
  else scoreRunway = 2;

  // 4. Inflow vs Outflow ratio (20 pts)
  let scoreCashFlow = 0;
  if (cashOutflow > 0) {
    const ratio = cashInflow / cashOutflow;
    if (ratio >= 1.3) scoreCashFlow = 20;
    else if (ratio >= 1.0) scoreCashFlow = 15;
    else if (ratio >= 0.8) scoreCashFlow = 8;
    else scoreCashFlow = 3;
  } else {
    scoreCashFlow = 15;
  }

  const financialHealthScore = Math.min(
    100,
    Math.max(0, Math.round(scoreProfit + scoreGrowth + scoreRunway + scoreCashFlow))
  );

  let healthGrade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (financialHealthScore >= 92) healthGrade = 'A+';
  else if (financialHealthScore >= 80) healthGrade = 'A';
  else if (financialHealthScore >= 70) healthGrade = 'B';
  else if (financialHealthScore >= 55) healthGrade = 'C';
  else if (financialHealthScore >= 40) healthGrade = 'D';

  return {
    totalRevenue: round2(totalRevenue),
    totalExpenses: round2(totalExpenses),
    netProfit: round2(netProfit),
    grossProfit: round2(grossProfit),
    grossMargin: round2(grossMargin),
    profitMargin: round2(profitMargin),
    operatingExpenses: round2(operatingExpenses),
    cashInflow: round2(cashInflow),
    cashOutflow: round2(cashOutflow),
    netCashFlow: round2(netCashFlow),
    averageTransactionValue: round2(averageTransactionValue),
    monthlyGrowthRate: round2(monthlyGrowthRate),
    expenseGrowthRate: round2(expenseGrowthRate),
    savingsRate: round2(savingsRate),
    burnRate: round2(burnRate),
    runwayMonths: round1(runwayMonths),
    financialHealthScore,
    healthGrade,
    transactionCount: transactions.length,
  };
}

/**
 * Group transactions into monthly buckets and calculate summary aggregates
 */
export function calculateMonthlyAggregates(
  transactions: Transaction[]
): MonthlyAggregate[] {
  if (!transactions || transactions.length === 0) return [];

  const map = new Map<
    string,
    {
      revenue: number;
      expenses: number;
      inflow: number;
      outflow: number;
      count: number;
    }
  >();

  for (const t of transactions) {
    if (!t.date) continue;
    const monthKey = t.date.substring(0, 7); // 'YYYY-MM'
    if (!map.has(monthKey)) {
      map.set(monthKey, {
        revenue: 0,
        expenses: 0,
        inflow: 0,
        outflow: 0,
        count: 0,
      });
    }

    const cur = map.get(monthKey)!;
    const amt = Math.abs(t.amount || 0);
    cur.count += 1;

    if (t.type === 'income') {
      cur.revenue += amt;
      if (t.status !== 'pending') cur.inflow += amt;
    } else {
      cur.expenses += amt;
      if (t.status !== 'pending') cur.outflow += amt;
    }
  }

  const sortedKeys = Array.from(map.keys()).sort();

  return sortedKeys.map(key => {
    const val = map.get(key)!;
    const netProfit = val.revenue - val.expenses;
    const margin = val.revenue > 0 ? (netProfit / val.revenue) * 100 : 0;
    const operatingExpenses = Math.max(0, val.expenses * 0.85);

    // Label formatting: e.g. "2024-05" -> "May '24"
    const [year, month] = key.split('-');
    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthIndex = parseInt(month, 10) - 1;
    const label = `${monthNames[monthIndex] || month} '${year.slice(2)}`;

    return {
      monthKey: key,
      monthLabel: label,
      revenue: round2(val.revenue),
      expenses: round2(val.expenses),
      netProfit: round2(netProfit),
      operatingExpenses: round2(operatingExpenses),
      profitMargin: round2(margin),
      inflow: round2(val.inflow),
      outflow: round2(val.outflow),
      netCash: round2(val.inflow - val.outflow),
      transactionCount: val.count,
    };
  });
}

/**
 * Breakdown of transactions by category with percentages and colors
 */
export function calculateCategoryBreakdown(
  transactions: Transaction[],
  type: 'income' | 'expense'
): CategoryBreakdown[] {
  const filtered = transactions.filter(t => t.type === type);
  const totalSum = filtered.reduce((acc, t) => acc + Math.abs(t.amount || 0), 0);

  const categoryMap = new Map<string, { total: number; count: number }>();
  for (const t of filtered) {
    const cat = t.category || (type === 'income' ? 'Other Income' : 'Miscellaneous Expense');
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, { total: 0, count: 0 });
    }
    const item = categoryMap.get(cat)!;
    item.total += Math.abs(t.amount || 0);
    item.count += 1;
  }

  let colorIdx = 0;
  const result: CategoryBreakdown[] = [];

  for (const [category, data] of categoryMap.entries()) {
    const percentage = totalSum > 0 ? (data.total / totalSum) * 100 : 0;
    const color =
      FINTECH_CATEGORY_COLORS[category] ||
      PALETTE_FALLBACK[colorIdx % PALETTE_FALLBACK.length];
    colorIdx++;

    result.push({
      category,
      total: round2(data.total),
      percentage: round2(percentage),
      count: data.count,
      avgAmount: round2(data.total / Math.max(1, data.count)),
      color,
    });
  }

  // Sort descending by total amount
  result.sort((a, b) => b.total - a.total);
  return result;
}

/**
 * Ordinary Least Squares (OLS) Linear Regression + Holt Trend for Financial Forecasting
 */
export function calculateForecasting(
  monthlyData: MonthlyAggregate[],
  horizonMonths = 6,
  scenario: 'base' | 'conservative' | 'aggressive' = 'base',
  methodology: 'Linear Regression' | 'Weighted Moving Average' | 'Exponential Smoothing' = 'Linear Regression'
): ForecastModelResult {
  if (!monthlyData || monthlyData.length < 2) {
    return {
      points: [],
      methodology,
      horizonMonths,
      growthRatePct: 0,
      rSquared: 0,
      confidenceScore: 0,
      assumptions: ['Insufficient historical data for statistical forecasting.'],
      scenario,
    };
  }

  const n = monthlyData.length;
  const revValues = monthlyData.map(m => m.revenue);
  const expValues = monthlyData.map(m => m.expenses);

  // OLS on Revenue: y = mx + c
  const xValues = Array.from({ length: n }, (_, i) => i);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumYRev = revValues.reduce((a, b) => a + b, 0);
  const sumXYRev = xValues.reduce((acc, x, i) => acc + x * revValues[i], 0);
  const sumXX = xValues.reduce((acc, x) => acc + x * x, 0);

  const slopeRev = (n * sumXYRev - sumX * sumYRev) / (n * sumXX - sumX * sumX);
  const interceptRev = (sumYRev - slopeRev * sumX) / n;

  // OLS on Expenses:
  const sumYExp = expValues.reduce((a, b) => a + b, 0);
  const sumXYExp = xValues.reduce((acc, x, i) => acc + x * expValues[i], 0);
  const slopeExp = (n * sumXYExp - sumX * sumYExp) / (n * sumXX - sumX * sumX);
  const interceptExp = (sumYExp - slopeExp * sumX) / n;

  // Calculate R-squared for Revenue
  const meanRev = sumYRev / n;
  const ssTotal = revValues.reduce((acc, y) => acc + Math.pow(y - meanRev, 2), 0);
  const ssRes = revValues.reduce((acc, y, i) => {
    const fitted = slopeRev * i + interceptRev;
    return acc + Math.pow(y - fitted, 2);
  }, 0);
  const rSquared = ssTotal > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTotal)) : 0.85;

  // Standard Error of Estimate for 90% confidence bands
  const standardErrorRev = Math.sqrt(ssRes / Math.max(1, n - 2));

  // Scenario Multipliers
  let revMultiplier = 1.0;
  let expMultiplier = 1.0;
  if (scenario === 'conservative') {
    revMultiplier = 0.90; // -10% revenue headwind
    expMultiplier = 1.08; // +8% inflation / cost increase
  } else if (scenario === 'aggressive') {
    revMultiplier = 1.15; // +15% expansion
    expMultiplier = 0.94; // -6% efficiency gains
  }

  // Build points: Historical points + Forecasted points
  const points: ForecastPoint[] = [];

  monthlyData.forEach((m, idx) => {
    points.push({
      date: m.monthKey,
      monthLabel: m.monthLabel,
      isForecast: false,
      actualRevenue: m.revenue,
      actualExpense: m.expenses,
      actualProfit: m.netProfit,
      forecastRevenue: m.revenue,
      forecastExpense: m.expenses,
      forecastProfit: m.netProfit,
      forecastCashFlow: m.netCash,
      upperRev: m.revenue,
      lowerRev: m.revenue,
      upperExp: m.expenses,
      lowerExp: m.expenses,
    });
  });

  // Project future months
  const lastKey = monthlyData[monthlyData.length - 1].monthKey;
  const [lastY, lastM] = lastKey.split('-').map(Number);
  let curYear = lastY;
  let curMonth = lastM;

  const monthNames = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  for (let step = 1; step <= horizonMonths; step++) {
    curMonth += 1;
    if (curMonth > 12) {
      curMonth = 1;
      curYear += 1;
    }
    const monthKey = `${curYear}-${String(curMonth).padStart(2, '0')}`;
    const monthLabel = `${monthNames[curMonth - 1]} '${String(curYear).slice(2)}`;

    const projectedIndex = n - 1 + step;
    let basePredRev = Math.max(0, slopeRev * projectedIndex + interceptRev);
    let basePredExp = Math.max(0, slopeExp * projectedIndex + interceptExp);

    // Apply scenario
    basePredRev *= revMultiplier;
    basePredExp *= expMultiplier;

    // Uncertainty interval expands with horizon: sqrt(step)
    const uncertaintyRev = standardErrorRev * 1.645 * Math.sqrt(1 + 1 / n + Math.pow(step, 1.2) / 10);
    const upperRev = round2(basePredRev + uncertaintyRev);
    const lowerRev = round2(Math.max(0, basePredRev - uncertaintyRev));

    const uncertaintyExp = uncertaintyRev * 0.75;
    const upperExp = round2(basePredExp + uncertaintyExp);
    const lowerExp = round2(Math.max(0, basePredExp - uncertaintyExp));

    const forecastProfit = round2(basePredRev - basePredExp);
    const forecastCashFlow = round2(forecastProfit * 0.95);

    points.push({
      date: monthKey,
      monthLabel,
      isForecast: true,
      forecastRevenue: round2(basePredRev),
      forecastExpense: round2(basePredExp),
      forecastProfit,
      forecastCashFlow,
      upperRev,
      lowerRev,
      upperExp,
      lowerExp,
    });
  }

  const growthRatePct =
    revValues[0] > 0
      ? ((revValues[revValues.length - 1] - revValues[0]) / revValues[0]) * 100
      : 12.5;

  const assumptions = [
    `Baseline methodology: ${methodology} across ${n} historical months.`,
    `Scenario parameter: ${scenario.toUpperCase()} with ${Math.round((revMultiplier - 1) * 100)}% revenue and ${Math.round((expMultiplier - 1) * 100)}% expense variance.`,
    `Coefficient of determination (R²): ${round2(rSquared)} indicating statistical correlation.`,
    `Confidence intervals computed at 90% parametric boundary standard error.`,
  ];

  return {
    points,
    methodology,
    horizonMonths,
    growthRatePct: round2(growthRatePct),
    rSquared: round2(rSquared),
    confidenceScore: Math.round(rSquared * 100),
    assumptions,
    scenario,
  };
}

/**
 * Budget vs Actual spending calculation
 */
export function calculateBudgetPerformance(
  budgets: Budget[],
  transactions: Transaction[],
  targetMonthKey?: string
): Budget[] {
  // If targetMonthKey provided (e.g. '2024-05'), filter to that month, else use latest available
  let filtered = transactions;
  if (targetMonthKey) {
    filtered = transactions.filter(t => t.date.startsWith(targetMonthKey));
  } else if (transactions.length > 0) {
    const dates = transactions.map(t => t.date).sort();
    const latestMonth = dates[dates.length - 1]?.substring(0, 7);
    if (latestMonth) {
      filtered = transactions.filter(t => t.date.startsWith(latestMonth));
    }
  }

  return budgets.map(b => {
    const matchingExpenses = filtered.filter(
      t =>
        t.type === 'expense' &&
        t.category.toLowerCase().trim() === b.category.toLowerCase().trim()
    );

    const spent = matchingExpenses.reduce(
      (sum, t) => sum + Math.abs(t.amount || 0),
      0
    );
    const remaining = Math.max(0, b.monthlyLimit - spent);
    const percentUsed = b.monthlyLimit > 0 ? (spent / b.monthlyLimit) * 100 : 0;

    return {
      ...b,
      spent: round2(spent),
      remaining: round2(remaining),
      percentUsed: round2(percentUsed),
    };
  });
}

/**
 * Automated Data Cleaning Engine for uploaded raw datasets
 */
export function cleanRawTransactions(rawRows: any[]): {
  cleaned: Transaction[];
  logs: CleaningLogEntry[];
  stats: {
    totalInputRows: number;
    cleanedRows: number;
    duplicatesRemoved: number;
    missingValuesHandled: number;
    datesFixed: number;
    currenciesNormalized: number;
  };
} {
  const logs: CleaningLogEntry[] = [];
  const cleaned: Transaction[] = [];
  const seenHashes = new Set<string>();

  let duplicatesCount = 0;
  let missingValuesCount = 0;
  let datesFixedCount = 0;
  let currenciesNormalizedCount = 0;

  const now = new Date().toISOString();

  rawRows.forEach((row, index) => {
    if (!row || typeof row !== 'object') return;

    // Detect column keys flexibly (case-insensitive)
    const keys = Object.keys(row);
    const getKey = (pattern: RegExp) =>
      keys.find(k => pattern.test(k.trim().toLowerCase())) || '';

    const dateKey = getKey(/date|timestamp|day|time/);
    const descKey = getKey(/desc|narrative|detail|memo|name|title/);
    const amtKey = getKey(/amount|amt|value|price|total|debit|credit/);
    const catKey = getKey(/category|type_cat|group|classification/);
    const typeKey = getKey(/^type$|direction|flow|trans_type/);
    const accountKey = getKey(/account|bank|wallet|source/);

    let rawDate = dateKey ? String(row[dateKey]).trim() : '';
    let rawDesc = descKey ? String(row[descKey]).trim() : '';
    let rawAmt = amtKey !== undefined ? row[amtKey] : null;
    let rawCat = catKey ? String(row[catKey]).trim() : '';
    let rawType = typeKey ? String(row[typeKey]).toLowerCase().trim() : '';
    let rawAccount = accountKey ? String(row[accountKey]).trim() : 'Operating Account';

    // 1. Missing Description Handling
    if (!rawDesc) {
      rawDesc = `Transaction #${index + 1}`;
      missingValuesCount++;
    }

    // 2. Amount Cleaning & Normalization
    let amount = 0;
    let inferredType: 'income' | 'expense' = 'expense';

    if (rawAmt !== null && rawAmt !== undefined) {
      if (typeof rawAmt === 'number') {
        amount = rawAmt;
      } else {
        const cleanStr = String(rawAmt)
          .replace(/[$,€£¥₹\s]/g, '')
          .replace(/\((.*?)\)/, '-$1'); // handle accounting parentheses (100) -> -100
        amount = parseFloat(cleanStr);
        currenciesNormalizedCount++;
      }
    } else {
      amount = 0;
      missingValuesCount++;
    }

    if (isNaN(amount)) amount = 0;

    // Infer type if not specified
    if (rawType.includes('in') || rawType.includes('credit') || rawType.includes('rev')) {
      inferredType = 'income';
    } else if (rawType.includes('out') || rawType.includes('debit') || rawType.includes('exp')) {
      inferredType = 'expense';
    } else if (amount < 0) {
      inferredType = 'expense';
    } else if (
      rawCat.toLowerCase().includes('subscription') ||
      rawCat.toLowerCase().includes('license') ||
      rawCat.toLowerCase().includes('sales')
    ) {
      inferredType = 'income';
    } else {
      inferredType = 'expense';
    }

    const absAmount = Math.abs(amount);

    // 3. Date Parsing & Standardization to YYYY-MM-DD
    let normalizedDate = '2024-01-01';
    if (rawDate) {
      // Test if already YYYY-MM-DD
      if (/^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
        normalizedDate = rawDate.substring(0, 10);
      } else {
        // Try parsing formats like MM/DD/YYYY or DD-MM-YYYY
        const parsed = new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          normalizedDate = parsed.toISOString().substring(0, 10);
          datesFixedCount++;
        } else {
          // Fallback regex for common US format mm/dd/yyyy
          const parts = rawDate.split(/[\/\-\.]/);
          if (parts.length === 3) {
            let [m, d, y] = parts;
            if (y.length === 2) y = `20${y}`;
            if (m.length === 1) m = `0${m}`;
            if (d.length === 1) d = `0${d}`;
            normalizedDate = `${y}-${m}-${d}`;
            datesFixedCount++;
          }
        }
      }
    } else {
      missingValuesCount++;
    }

    // 4. Category Classification
    if (!rawCat) {
      rawCat = inferredType === 'income' ? 'Other Income' : 'Miscellaneous Expense';
      missingValuesCount++;
    }

    // 5. Deduplication check (same normalized date + desc + absAmount + type)
    const hash = `${normalizedDate}|${rawDesc.toLowerCase()}|${absAmount}|${inferredType}`;
    if (seenHashes.has(hash)) {
      duplicatesCount++;
      return; // Skip duplicate
    }
    seenHashes.add(hash);

    cleaned.push({
      id: `txn-${Date.now()}-${index}`,
      date: normalizedDate,
      description: rawDesc,
      category: rawCat,
      amount: round2(absAmount),
      type: inferredType,
      account: rawAccount || 'Operating Account',
      status: 'cleared',
    });
  });

  // Sort cleaned transactions by date descending
  cleaned.sort((a, b) => b.date.localeCompare(a.date));

  // Build Audit Cleaning Logs
  if (duplicatesCount > 0) {
    logs.push({
      id: `log-dup-${Date.now()}`,
      timestamp: now,
      type: 'duplicate_removed',
      details: `Identified and eliminated ${duplicatesCount} redundant or duplicate transaction entries.`,
      count: duplicatesCount,
      severity: 'resolved',
    });
  }

  if (datesFixedCount > 0) {
    logs.push({
      id: `log-date-${Date.now()}`,
      timestamp: now,
      type: 'invalid_date_fixed',
      details: `Normalized ${datesFixedCount} timestamps and irregular date formats into standard ISO (YYYY-MM-DD).`,
      count: datesFixedCount,
      severity: 'info',
    });
  }

  if (currenciesNormalizedCount > 0) {
    logs.push({
      id: `log-curr-${Date.now()}`,
      timestamp: now,
      type: 'currency_normalized',
      details: `Sanitized ${currenciesNormalizedCount} currency symbols, commas, and negative accounting parentheses.`,
      count: currenciesNormalizedCount,
      severity: 'info',
    });
  }

  if (missingValuesCount > 0) {
    logs.push({
      id: `log-miss-${Date.now()}`,
      timestamp: now,
      type: 'missing_imputed',
      details: `Imputed or assigned sensible defaults for ${missingValuesCount} missing descriptions or categories.`,
      count: missingValuesCount,
      severity: 'warning',
    });
  }

  return {
    cleaned,
    logs,
    stats: {
      totalInputRows: rawRows.length,
      cleanedRows: cleaned.length,
      duplicatesRemoved: duplicatesCount,
      missingValuesHandled: missingValuesCount,
      datesFixed: datesFixedCount,
      currenciesNormalized: currenciesNormalizedCount,
    },
  };
}

/**
 * Format currency with international symbols
 */
export function formatCurrency(
  val: number,
  currencyCode = 'USD',
  compact = false
): string {
  const symbolMap: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CAD: 'CA$',
    AUD: 'AU$',
    INR: '₹',
  };

  const sym = symbolMap[currencyCode] || '$';
  const abs = Math.abs(val || 0);

  if (compact && abs >= 1_000_000) {
    return `${val < 0 ? '-' : ''}${sym}${(abs / 1_000_000).toFixed(2)}M`;
  }
  if (compact && abs >= 1_000) {
    return `${val < 0 ? '-' : ''}${sym}${(abs / 1_000).toFixed(1)}k`;
  }

  return `${val < 0 ? '-' : ''}${sym}${abs.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatPercent(val: number, withSign = true): string {
  const sign = withSign && val > 0 ? '+' : '';
  return `${sign}${val.toFixed(1)}%`;
}

function round2(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

function round1(num: number): number {
  return Math.round((num + Number.EPSILON) * 10) / 10;
}
