# FINLYTICS — AI-Powered Financial Intelligence Platform

> **"Turn Financial Data Into Smarter Decisions."**

Finlytics is a commercial-grade financial intelligence SaaS platform that converts raw financial datasets into actionable business intelligence through automated data cleaning, predictive forecasting, real-time liquidity analytics, and context-aware AI analysis powered by Google Gemini.

---

## 🌟 Key Features

### 1. Executive Financial Overview
- **Core KPI Matrix**: Total Revenue, Total Operating Expenses, Net Profit, Gross Margin, Net Cash Flow, and Cash Runway.
- **Financial Health Score**: Deterministic 0–100 composite index evaluating profitability, burn rate, runway depth, and cash coverage with letter grades (A+ to F).
- **Visual Analytics**: Interactive Recharts bar and area visualizations depicting monthly trends and net cash flow trajectory.

### 2. Deep Financial Analytics
- **Ratio Matrix**: Gross vs. Net margins, operating expense structure, average transaction values, and month-over-month growth velocity.
- **Multi-Period Aggregation**: Compare quarterly performance (Q1–Q4) and track revenue streams against operating cost centers.

### 3. General Ledger & Transaction Management
- **Complete Transaction Engine**: Full-text search, multi-category filters, cash flow direction (Inflow/Outflow), and reconciliation statuses (`Reconciled`, `Cleared`, `Pending`).
- **Data Table Operations**: Multi-column sorting, customizable pagination (10, 15, 25, 50 rows), in-place editing, creation modal, and instant **CSV export**.

### 4. Income & Expense Decomposition
- **Cost Center Breakdown**: Interactive donut charts segmenting overhead, cloud compute, payroll, and marketing.
- **Fixed vs. Variable Cost Ratio**: Calculates baseline monthly fixed obligations vs. discretionary outlays.
- **Income Stability Index**: Measures recurring revenue share (e.g., subscriptions, annual contracts) vs. one-off receipts.

### 5. Budget & Variance Management
- **Departmental Caps**: Set monthly spending limits across operational categories with visual progress tracking.
- **Overspending Guardrails**: Real-time warning triggers at 80% threshold and critical alerts upon limit exceedance.
- **Capital Reserves & Savings Targets**: Track funding progress towards long-term liquidity and expansion goals.

### 6. Cash Flow & Liquidity
- **Inflow vs. Outflow Timeline**: Granular comparison of cash receipts versus cash disbursements.
- **Interactive Runway Stress Simulator**: Adjust liquid capital reserves slider ($50k–$1.5M) to calculate real-time runway under multiple burn scenarios.

### 7. Statistical Financial Forecasting Engine
- **Predictive Algorithms**: Ordinary Least Squares (OLS) Linear Regression, Weighted Moving Averages, and Holt-Winters Exponential Smoothing.
- **Uncertainty Bounds**: 90% confidence parametric envelopes showing upper and lower variance intervals.
- **Scenario Simulation**: Compare **Base**, **Conservative** (-10% Rev, +8% Exp), and **Aggressive** (+15% Rev, -6% Exp) macro environments.

### 8. Gemini-Powered AI Financial Analyst
- **Context-Aware Inquiries**: Ask natural language questions (*"Why did expenses increase?"*, *"Which category consumes the most capital?"*, *"What is our most profitable month?"*).
- **Grounded Verification Matrix**: Guaranteed mathematical source-of-truth grounding that distinguishes calculated facts from analyst interpretation and explains calculation formulas.
- **Regulatory Transparency**: Adheres to financial education vs. fiduciary advisory disclosures.

### 9. Multi-Format Report Generator
- **Audit-Ready Reports**: Executive Performance Reports, Monthly Statements, Profitability Audits, and Budget Variance Reviews.
- **Export Capabilities**: Multi-tab formatted **Excel (`.xlsx`)** workbooks, **CSV datasets**, and printable **PDF layouts** with executive signature lines.

### 10. Automated Data Ingestion & Sanitization Engine
- **Universal File Parser**: Drag-and-drop CSV and Excel (`.xlsx`, `.xls`) file parsing.
- **Automated Cleaning Pipeline**: Identifies duplicates, normalizes multi-format dates to ISO (YYYY-MM-DD), sanitizes currency symbols and accounting parentheses, and handles missing fields.
- **Forensic Audit Log**: Immutable record of all data transformations and deduplication actions.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Framer Motion.
- **Backend**: Node.js, Express REST API, Multer memory storage.
- **AI Engine**: `@google/genai` TypeScript SDK (Gemini 3.8 Flash) via server-side proxy routes.
- **Data & File Processing**: SheetJS (`xlsx`) for multi-sheet workbook generation and spreadsheet ingestion.
- **Testing**: Node.js built-in test runner (`node:test`, `node:assert/strict`) via `tsx`.

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or bun

### 1. Clone the repository
```bash
git clone https://github.com/<your-username>/finlytics.git
cd finlytics
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Copy the example environment file:
```bash
cp .env.example .env
```
Add your Google Gemini API key:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```

### 4. Run tests
```bash
npm run test # or: npx tsx --test src/utils/financialMath.test.ts
```

### 5. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

```bash
npm run build
npm start
```

---

## 🔒 Security & Data Privacy

- **Server-Side API Key Isolation**: Gemini API credentials remain strictly on the backend.
- **User-Isolated Storage**: Ledger datasets are isolated per organization session.
- **Deterministic Mathematical Grounding**: Eliminates AI hallucination of financial numbers by calculating ground truth programmatically before LLM synthesis.

---

## 📄 License
MIT License. Built for enterprise commercial financial operations.
