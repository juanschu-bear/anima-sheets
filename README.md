# Anima Sheets

**The AI-native spreadsheet for financial management.** Track, analyze, and understand your business finances without knowing a single formula.

---

## Overview

Anima Sheets is a financial spreadsheet tool built for people who need powerful financial tracking without the complexity of traditional spreadsheets. Instead of writing formulas, you describe what you want in plain language. Instead of manual data entry, documents auto-populate from Anima Drive. Instead of static charts, AI-powered insights adapt to your data.

**Who it's for:**

- Small and medium business owners managing their own finances
- Freelancers and self-employed professionals
- Accountants and bookkeepers
- Finance teams that want AI-assisted financial management
- Anyone overwhelmed by traditional spreadsheets but needs the power of one

---

## Key Features

### 📊 Full Spreadsheet Interface

Powered by **FortuneSheet**, Anima Sheets provides a familiar spreadsheet experience with powerful financial features built in:

- **Inline editing** — click any cell to edit
- **Double-click to edit** — quick access to any value
- **Color-coded categories** — visual distinction between income and expenses
- **Summary bars** — real-time totals for income, expenses, and net
- **Sortable columns** — organize data by any field
- **Delete rows** — hover to reveal per-row delete

### 🏷️ 16 CFO Categories with Color Coding

Every transaction is automatically classified into one of **16 financial categories** with distinct color coding:

| Category | Type |
|----------|------|
| Revenue | Income |
| Cost of Sales | Expense |
| Marketing | Expense |
| Salary & Wages | Expense |
| Office Rent | Expense |
| Utilities | Expense |
| Insurance | Expense |
| Software & Subscriptions | Expense |
| Travel | Expense |
| Equipment | Expense |
| Professional Fees | Expense |
| Taxes | Expense |
| Depreciation | Expense |
| Interest | Expense |
| Other Income | Income |
| Other Expense | Expense |

### 💬 Natural Language Queries

Ask questions about your data in plain language instead of writing formulas:

- "How much did I spend on insurance this month?"
- "Show me all expenses over 500 Euro in March"
- "What was my largest revenue category last quarter?"
- "Compare my monthly income trends"

Qwen 3.5 processes natural language queries and returns structured financial insights.

### 📥 Automatic Import from Anima Drive

- Uploaded receipts and invoices **auto-populate transaction rows** in the spreadsheet
- Categories, amounts, and dates flow seamlessly between systems
- No manual data entry for document-sourced transactions
- One-click sync between Anima Drive and Anima Sheets

### 📤 CSV, JSON, and URL Import

For external data sources:

- **CSV import** — paste or upload CSV files with date, category, amount, description
- **JSON import** — upload JSON arrays of transaction objects
- **URL import** — fetch and parse data from remote CSV/JSON endpoints
- **File upload** — drag and drop `.csv` or `.json` files

### 📈 Dashboard with Charts

Built-in analytics at a glance:

- **Income vs Expenses bar chart** — last 6 months comparison
- **Category breakdown** — visual distribution across all categories
- **Monthly summary table** — detailed category-level breakdown with percentages
- **Month selector** — drill into any month
- **Summary cards** — total income, total expenses, net income

### ✏️ Transaction Form with Validation and Live Preview

Add new transactions with a guided form:

- **Date picker** — select the transaction date
- **Category dropdown** — choose from all 16 categories
- **Amount input** — positive for income, negative for expenses
- **Description field** — optional notes
- **Receipt URL** — link supporting documents
- **Live preview** — see how your entry will appear before saving
- **Form validation** — prevents invalid data entry

### 🧠 AI Avatar Coach Integration

- **Jordan Cash** can query and analyze your financial data during live calls
- AI coaches reference your spreadsheet data in real-time
- Personalized financial advice based on your transaction history
- Proactive insights and recommendations delivered during coaching sessions

### 🌙 Dark Mode Support

Full dark mode support throughout the application for comfortable viewing in any lighting condition.

### 🔒 Privacy-First

- **Self-hosted Supabase backend** — your financial data stays on your infrastructure
- No third-party analytics or tracking
- Full control over data retention and access

### 🌍 Multilingual

Full UI support in **German**, **English**, and **Spanish**.

---

## Why Not Google Sheets?

| Feature | Anima Sheets | Google Sheets |
|---------|------------|-----------|-|
| No formula knowledge needed | ✅ Natural language | ❌ Requires formulas |
| AI financial coach | ✅ Jordan Cash | ❌ Not available |
| Auto-import & categorize receipts | ✅ From Anima Drive | ❌ Manual entry |
| Understand financial context | ✅ Built-in | ❌ Generic spreadsheet |
| Your data stays private | ✅ Self-hosted | ❌ Google servers |
| CFO-specific workflows | ✅ Purpose-built | ❌ Generic tool |

Google Sheets is a generic spreadsheet. Anima Sheets is purpose-built for financial management with AI at its core.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Vite 8 + React 19 |
| **Language** | TypeScript (strict mode) |
| **Styling** | Tailwind CSS v4 |
| **Database** | Supabase (PostgreSQL) |
| **Spreadsheet Engine** | FortuneSheet |
| **AI Engine** | Qwen 3.5 (natural language queries) |
| **Authentication** | Supabase Auth |
| **State Management** | React hooks + Context API |

---

## Getting Started

### Prerequisites

- Node.js 22+
- npm 10+
- A Supabase project (optional — mock data works out of the box)

### Installation

```bash
git clone https://github.com/juanschu-bear/anima-sheets.git
cd anima-sheets
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Run Development Server

```bash
npm run dev
```

Available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
anima-sheets/
├── src/
│   ├── lib/
│   │   ├── supabase.ts          # Supabase client + CRUD operations
│   │   └── categories.ts        # 16 CFO categories + formatting helpers
│   ├── components/
│   │   ├── SpreadsheetView.tsx  # Spreadsheet interface with inline editing
│   │   ├── TransactionForm.tsx  # Transaction entry form with preview
│   │   └── ImportView.tsx       # CSV/JSON/URL import interface
│   ├── pages/
│   │   └── Dashboard.tsx        # Charts, category breakdown, summaries
│   ├── types/
│   │   └── index.ts             # Transaction, Category, SpreadsheetRow
│   ├── App.tsx                  # Root component + navigation
│   ├── main.tsx                 # Entry point
│   └── index.css                # Tailwind CSS v4 styles
├── public/
│   ├── favicon.svg              # App icon
│   └── icons.svg                # SVG icons
├── vite.config.ts               # Vite config with Tailwind
├── tsconfig.app.json            # Strict TypeScript config
├── .env.example                 # Environment template
└── package.json
```

---

## Database

### `cfo_transactions` Table Schema

| Column | Type | Description |
|--------|------|-------|
| `id` | `uuid` (PK) | Unique transaction identifier |
| `user_id` | `uuid` | Owner of the transaction |
| `category` | `text` | One of 16 financial categories |
| `amount` | `numeric` | Transaction amount (positive = income, negative = expense) |
| `description` | `text` | Free-text description |
| `date` | `date` | Transaction date |
| `receipt_url` | `text` (nullable) | Link to supporting receipt document |
| `created_at` | `timestamptz` | Record creation timestamp |

**Positive amounts** indicate income; **negative amounts** indicate expenses.

---

## Roadmap

### Completed

- Spreadsheet interface with inline editing
- 16 CFO categories with color coding
- Transaction form with validation and live preview
- CSV, JSON, and URL import
- Dashboard with charts and category breakdowns
- Dark mode support
- Multilingual support (DE, EN, ES)
- Anima Drive integration

### Planned

- **Tax preparation workflows** — automated tax-category tagging and report generation
- **Automatic monthly reports** — AI-generated monthly financial summaries
- **Bank API integration** — connect bank accounts for automatic transaction import
- **Multi-currency support** — track transactions in multiple currencies
- **Collaborative editing** — team access with role-based permissions
- **Mobile app** — native iOS/Android for on-the-go financial management
- **AI-powered insights** — anomaly detection, trend forecasting, cash flow predictions
- **Export to PDF/Excel** — professional financial reporting

---

## License

© 2026 ONIOKO / EXIDEUS LLC. All rights reserved. Proprietary software.

---

## Contributing

This is a proprietary project. For inquiries or partnership opportunities, contact the ONIOKO team.
