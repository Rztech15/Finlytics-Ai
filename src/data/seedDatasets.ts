import { FinancialDataset, Budget, SavingsTarget, Transaction } from '../types';

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 'b-payroll',
    category: 'Payroll & Compensation',
    monthlyLimit: 38000,
    alertThreshold: 85,
    spent: 34500,
    remaining: 3500,
    percentUsed: 90.7,
    notes: 'Core engineering, sales, and executive salaries',
  },
  {
    id: 'b-cloud',
    category: 'Cloud Infrastructure & Hosting',
    monthlyLimit: 14000,
    alertThreshold: 80,
    spent: 12850,
    remaining: 1150,
    percentUsed: 91.8,
    notes: 'AWS Kubernetes cluster, Cloudflare CDN, and database nodes',
  },
  {
    id: 'b-mktg',
    category: 'Marketing & Paid Acquisition',
    monthlyLimit: 18000,
    alertThreshold: 75,
    spent: 14200,
    remaining: 3800,
    percentUsed: 78.9,
    notes: 'Google Ads search campaigns, LinkedIn B2B, and sponsoring events',
  },
  {
    id: 'b-saas',
    category: 'Software & Tool Subscriptions',
    monthlyLimit: 5500,
    alertThreshold: 90,
    spent: 4980,
    remaining: 520,
    percentUsed: 90.5,
    notes: 'Slack, Notion, GitHub Enterprise, Figma, Linear, HubSpot',
  },
  {
    id: 'b-legal',
    category: 'Legal & Professional Fees',
    monthlyLimit: 6000,
    alertThreshold: 80,
    spent: 2400,
    remaining: 3600,
    percentUsed: 40.0,
    notes: 'Quarterly tax audit and trademark review',
  },
  {
    id: 'b-travel',
    category: 'Travel & Entertainment',
    monthlyLimit: 4000,
    alertThreshold: 80,
    spent: 3850,
    remaining: 150,
    percentUsed: 96.2,
    notes: 'Q3 Enterprise customer summits and executive travel',
  },
];

export const INITIAL_SAVINGS_TARGETS: SavingsTarget[] = [
  {
    id: 'st-1',
    name: '12-Month Operating Cash Buffer',
    targetAmount: 500000,
    currentAmount: 435000,
    targetDate: '2025-12-31',
    category: 'Capital Reserve',
  },
  {
    id: 'st-2',
    name: 'Series A Expansion & R&D Fund',
    targetAmount: 300000,
    currentAmount: 180000,
    targetDate: '2026-06-30',
    category: 'Growth & Expansion',
  },
  {
    id: 'st-3',
    name: 'Corporate Tax Provision FY25',
    targetAmount: 75000,
    currentAmount: 62000,
    targetDate: '2025-04-15',
    category: 'Tax & Compliance',
  },
];

// Helper to generate realistic financial transactions across 12 months
function generateTechCoTransactions(): Transaction[] {
  const txns: Transaction[] = [];
  const months = [
    '2024-01',
    '2024-02',
    '2024-03',
    '2024-04',
    '2024-05',
    '2024-06',
    '2024-07',
    '2024-08',
    '2024-09',
    '2024-10',
    '2024-11',
    '2024-12',
  ];

  let idCounter = 100;

  months.forEach((m, idx) => {
    const growthFactor = 1 + idx * 0.06; // ~6% month-over-month expansion

    // Revenue items
    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-04`,
      description: 'Stripe SaaS Monthly Recurring Subscriptions',
      category: 'SaaS Subscription',
      amount: Math.round(52000 * growthFactor),
      type: 'income',
      account: 'Stripe Merchant Payout',
      status: 'reconciled',
      merchant: 'Stripe Inc.',
    });

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-12`,
      description: 'Enterprise Annual Cloud License — Tier 1 Client',
      category: 'Enterprise License',
      amount: Math.round(28000 * (1 + (idx % 3) * 0.15)),
      type: 'income',
      account: 'Silicon Valley Bank OpEx',
      status: 'reconciled',
      merchant: 'Global Financial Corp',
    });

    if (idx % 2 === 0) {
      txns.push({
        id: `txn-${idCounter++}`,
        date: `${m}-18`,
        description: 'Fintech Advisory & Implementation Consulting',
        category: 'Consulting Services',
        amount: Math.round(14500 * growthFactor),
        type: 'income',
        account: 'Silicon Valley Bank OpEx',
        status: 'reconciled',
        merchant: 'Metropolis Ventures',
      });
    }

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-26`,
      description: 'Usage-Based API & Webhook Invoicing',
      category: 'API & Cloud Usage',
      amount: Math.round(9200 * growthFactor),
      type: 'income',
      account: 'Stripe Merchant Payout',
      status: 'cleared',
      merchant: 'Stripe Billing',
    });

    // Expenses
    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-01`,
      description: 'Gusto Monthly Full-Time Engineering & Ops Payroll',
      category: 'Payroll & Compensation',
      amount: Math.round(32000 + idx * 600),
      type: 'expense',
      account: 'Silicon Valley Bank OpEx',
      status: 'reconciled',
      merchant: 'Gusto Payroll',
    });

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-03`,
      description: 'Amazon Web Services — Production Kubernetes & RDS',
      category: 'Cloud Infrastructure & Hosting',
      amount: Math.round(9400 + idx * 320),
      type: 'expense',
      account: 'Silicon Valley Bank OpEx',
      status: 'reconciled',
      merchant: 'Amazon Web Services',
    });

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-08`,
      description: 'Google Ads & LinkedIn B2B Paid Acquisition Campaigns',
      category: 'Marketing & Paid Acquisition',
      amount: Math.round(11200 + (idx % 4) * 1200),
      type: 'expense',
      account: 'Amex Business Platinum',
      status: 'reconciled',
      merchant: 'Alphabet & LinkedIn',
    });

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-14`,
      description: 'Core Engineering & Design Tools (Slack, GitHub, Figma)',
      category: 'Software & Tool Subscriptions',
      amount: Math.round(4100 + idx * 90),
      type: 'expense',
      account: 'Amex Business Platinum',
      status: 'reconciled',
      merchant: 'Vendors Consolidated',
    });

    txns.push({
      id: `txn-${idCounter++}`,
      date: `${m}-20`,
      description: 'WeWork Prime Dedicated Office Suite Lease',
      category: 'Office Rent & Facilities',
      amount: 6500,
      type: 'expense',
      account: 'Silicon Valley Bank OpEx',
      status: 'reconciled',
      merchant: 'WeWork Management',
    });

    if (idx % 3 === 0) {
      txns.push({
        id: `txn-${idCounter++}`,
        date: `${m}-24`,
        description: 'Cooley LLP — Tech Patent & Corporate Legal Retainer',
        category: 'Legal & Professional Fees',
        amount: 3500,
        type: 'expense',
        account: 'Silicon Valley Bank OpEx',
        status: 'reconciled',
        merchant: 'Cooley LLP',
      });
    }

    if (idx % 2 === 1) {
      txns.push({
        id: `txn-${idCounter++}`,
        date: `${m}-28`,
        description: 'Customer Onsite Workshops & Executive Travel Flights',
        category: 'Travel & Entertainment',
        amount: Math.round(2800 + (idx % 3) * 600),
        type: 'expense',
        account: 'Amex Business Platinum',
        status: 'cleared',
        merchant: 'Delta Airlines & Marriott',
      });
    }
  });

  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

// Generate an E-commerce retail dataset
function generateRetailTransactions(): Transaction[] {
  const txns: Transaction[] = [];
  const months = ['2024-06', '2024-07', '2024-08', '2024-09', '2024-10', '2024-11'];
  let idCounter = 500;

  months.forEach((m, idx) => {
    const isHoliday = m >= '2024-10';
    const mult = isHoliday ? 1.6 : 1.0;

    txns.push({
      id: `ret-${idCounter++}`,
      date: `${m}-05`,
      description: 'Shopify Store Direct-to-Consumer Sales Payout',
      category: 'SaaS Subscription',
      amount: Math.round(84000 * mult),
      type: 'income',
      account: 'Shopify Capital Account',
      status: 'reconciled',
    });

    txns.push({
      id: `ret-${idCounter++}`,
      date: `${m}-12`,
      description: 'Amazon Marketplace FBA Gross Revenue Settlement',
      category: 'Enterprise License',
      amount: Math.round(42000 * mult),
      type: 'income',
      account: 'Chase Merchant Checking',
      status: 'reconciled',
    });

    txns.push({
      id: `ret-${idCounter++}`,
      date: `${m}-02`,
      description: 'Wholesale Inventory Manufacturing & Freight Inbound',
      category: 'Hardware & Equipment',
      amount: Math.round(38000 * mult),
      type: 'expense',
      account: 'Chase Merchant Checking',
      status: 'reconciled',
    });

    txns.push({
      id: `ret-${idCounter++}`,
      date: `${m}-15`,
      description: 'Meta Ads & TikTok Influencer Performance Marketing',
      category: 'Marketing & Paid Acquisition',
      amount: Math.round(26000 * mult),
      type: 'expense',
      account: 'Chase Merchant Checking',
      status: 'reconciled',
    });

    txns.push({
      id: `ret-${idCounter++}`,
      date: `${m}-22`,
      description: 'Warehouse Fulfillment, 3PL Picking & Shipping',
      category: 'Miscellaneous Expense',
      amount: Math.round(12000 * mult),
      type: 'expense',
      account: 'Chase Merchant Checking',
      status: 'reconciled',
    });
  });

  return txns.sort((a, b) => b.date.localeCompare(a.date));
}

export const SEED_DATASETS: FinancialDataset[] = [
  {
    id: 'ds-apex-saas',
    name: 'Apex SaaS Technologies (FY2024)',
    companyName: 'Apex Cloud Systems Inc.',
    currency: 'USD',
    uploadedAt: '2024-11-01T09:30:00Z',
    rowCount: 108,
    validRowCount: 108,
    duplicatesRemoved: 4,
    missingValuesFixed: 7,
    isCleaned: true,
    notes: 'Official general ledger export covering full 12 months with validated revenue recognitions and vendor OpEx categorization.',
    cleaningLogs: [
      {
        id: 'cl-1',
        timestamp: '2024-11-01T09:30:15Z',
        type: 'duplicate_removed',
        details: 'Eliminated 4 duplicate Stripe batch webhook transactions.',
        count: 4,
        severity: 'resolved',
      },
      {
        id: 'cl-2',
        timestamp: '2024-11-01T09:30:16Z',
        type: 'currency_normalized',
        details: 'Normalized USD currency symbols and strip trailing whitespace from 108 rows.',
        count: 108,
        severity: 'info',
      },
      {
        id: 'cl-3',
        timestamp: '2024-11-01T09:30:17Z',
        type: 'missing_imputed',
        details: 'Assigned standard corporate department chart-of-accounts for 7 untagged credit card charges.',
        count: 7,
        severity: 'warning',
      },
    ],
    transactions: generateTechCoTransactions(),
  },
  {
    id: 'ds-nordic-retail',
    name: 'Nordic Retail & E-Commerce (H2 2024)',
    companyName: 'Nordic Lifestyle Brands Ltd.',
    currency: 'USD',
    uploadedAt: '2024-11-03T14:15:00Z',
    rowCount: 30,
    validRowCount: 30,
    duplicatesRemoved: 1,
    missingValuesFixed: 2,
    isCleaned: true,
    notes: 'High-volume consumer retail datasets tracking holiday ramp-up and multi-channel fulfillment.',
    cleaningLogs: [
      {
        id: 'cl-ret-1',
        timestamp: '2024-11-03T14:15:20Z',
        type: 'currency_normalized',
        details: 'Sanitized Shopify payout decimals and FX conversion formatting.',
        count: 30,
        severity: 'info',
      },
    ],
    transactions: generateRetailTransactions(),
  },
];
