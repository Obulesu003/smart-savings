# Developer Guide: Smart Savings Planner

Welcome to the codebase for the Smart Savings Planner. This guide outlines the project structure, technology stack, and engineering conventions used throughout the application.

---

## 🛠️ Technology Stack

*   **Framework:** React 18, Vite (for blazing fast HMR and compilation)
*   **Language:** TypeScript (Strict Mode Enabled)
*   **Styling:** Tailwind CSS (utility-first styling), Shadcn UI (Radix accessible unstyled components)
*   **Routing:** React Router DOM (v6)
*   **Local Inference Engine:** `@mlc-ai/web-llm` (Running Llama/Phi models on WebGPU)
*   **Data Persistence:** `dexie` (IndexedDB Wrapper)
*   **Date Formatting:** `date-fns`
*   **Charting:** `recharts`
*   **Icons:** `lucide-react`

---

## 📁 Project Structure

The codebase is organized in `src/` by feature and architectural layer:

```bash
src/
├── components/          # Reusable UI elements
│   ├── dashboard/       # Dashboard specific widgets (Sparklines, Gamification)
│   ├── layout/          # AppSidebar, Header, Footer, MainLayout
│   ├── planner/         # Forms and Input visualizers for the New Plan features
│   └── ui/              # Shadcn primitive components (Buttons, Inputs, Dialogs)
├── hooks/               # Core business logic & State Management
│   ├── useAuth.tsx            # Multi-user demo account system and session state
│   ├── useBudgets.tsx         # Dexie CRUD operations for Budget limits
│   ├── useFinancialPlans.tsx  # Dexie CRUD operations for AI generated plans
│   ├── useGoals.tsx           # Dexie CRUD operations for Savings Goals
│   └── useTransactions.tsx    # Dexie CRUD operations for Income/Expenses
├── lib/                 # Core utilities
│   ├── ai/              # Local LLM Integration
│   │   ├── insight-engine.ts  # Generic rules-based tips
│   │   ├── knowledge-base.ts  # Context for the RAG architecture
│   │   └── local-llm-engine.ts# WebGPU Model initialization and prompt engineering
│   ├── calculations.ts  # Core deterministic math engine (Compound Interest, Feasibility)
│   ├── db.ts            # Dexie Database Initialization and Schema
│   ├── demo-users.ts    # Seed data generator for the 8 pre-built personas
│   ├── storage.ts       # LocalStorage fallback wrapper
│   └── utils.ts         # Tailwind `cn` class mergers
├── pages/               # Top-level Routing Views
│   ├── Auth.tsx             # Login / Demo Switcher
│   ├── Budgets.tsx          # Manage spending caps
│   ├── Dashboard.tsx        # Overview, Gamification, Recent Activity
│   ├── NewPlan.tsx          # Manual form-based AI generation
│   ├── SmartPlan.tsx        # Natural Language prompt-based AI generation
│   └── ...
└── types/               # TypeScript Definitions
    ├── financial.ts     # Core domain models (GoalType, FinancialInputs, etc.)
    └── database.types.ts# Supabase schema definitions (Deprecated/Unused)
```

---

## 🔧 Core Engineering Patterns

### 1. The Custom Hook Data Pattern
Instead of using Redux or Zustand, this app uses a lightweight Custom Hook + IndexedDB pattern. 
All data fetching and mutations happen inside hooks like `useTransactions`. 

*Example workflow for adding a transaction:*
1. `pages/Income.tsx` captures user data.
2. It calls `addTransaction()` from `useTransactions()`.
3. `useTransactions()` writes to the `Dexie` local database (`lib/db.ts`).
4. The hook triggers a local state re-render, updating the UI.

### 2. Demo User Architecture (`hooks/useAuth.tsx`)
Because there is no backend, we built a robust "Demo User" account switcher purely in `localStorage`. 

When the app boots, `useAuth` checks if the 8 rich personas (e.g., "Raj Sharma - High Income") exist in `localStorage`. If not, it runs `lib/demo-users.ts` to seed hundreds of realistic transactions, budgets, and goals into their respective user boundaries. 
When a user "Logs In", `useAuth` simply updates the `currentUser` ID in state. All data-fetching hooks (e.g., `db.transactions.where('userId').equals(user.id)`) strictly filter based on that ID.

### 3. Local WebLLM Lazy Loading
The `@mlc-ai/web-llm` module is exceptionally large (~6MB of WASM). If imported synchronously at the top of a file, it will cause the screen to go blank for 3-5 seconds while the browser parses the code.

**Rule:** Always use `import type` for WebLLM definitions at the top level. The actual module must be dynamically loaded inside an async function:
```typescript
const { CreateMLCEngine } = await import('@mlc-ai/web-llm');
```

### 4. Deterministic Math vs AI Guidance
The separation of concerns is critical. The AI does **NOT** do math. 
If you need to change how a projected savings value is calculated, you must edit `src/lib/calculations.ts`. The AI in `local-llm-engine.ts` only reads the output of those mathematical calculations to provide semantic advice.
