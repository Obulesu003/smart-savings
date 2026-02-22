# Smart Savings Planner: System Architecture

The Smart Savings Planner is a modern, privacy-first, purely client-side web application built for personal and professional financial planning. It uniquely combines deterministic financial mathematics with local Large Language Model (LLM) inference inside the browser.

---

## 🏗️ High-Level Component Architecture

The system operates entirely within the user's web browser. There is **no backend server**, no database server, and **no API calls to external cloud intelligence providers** (e.g., OpenAI, Google Cloud).

The architecture is divided into three primary layers:

### 1. Presentation Layer (React + Vite + Tailwind CSS)
*   **Routing:** Handled via `react-router-dom` for client-side navigation between the Dashboard, Smart Plan, Goals, Budgets, etc.
*   **UI Components:** Built using specialized Shadcn UI components (Radix UI primitives) and animated with Framer Motion.
*   **State Management:** Local React state, React Context (for authentication/user sessions), and custom hooks (`useTransactions`, `useBudgets`, `useGoals`).

### 2. Data Persistence Layer (IndexedDB via Dexie.js)
*   **Local Storage:** Since privacy is paramount (as per University restrictions), all financial data—income, expenses, goals, generated plans—is stored securely in the browser's IndexedDB.
*   **Dexie Wrapper:** We use `Dexie.js` (`src/lib/db.ts`) to provide a robust, asynchronous, SQL-like interface on top of IndexedDB.
*   **Multi-tenant Logic:** The database schema includes a `userId` field to support local demo account switching (`src/hooks/useAuth.tsx`), ensuring users only see their own data.

### 3. Intelligence Layer (WebLLM + Deterministic Math)
This is the core differentiator of the platform. We employ a hybrid intelligence model:

*   **Deterministic Math Engine (`src/lib/calculations.ts`):** 
    Handles exact, precise financial algorithms. It calculates savings rates, compounding interest projections, goal feasibility percentages, and statistical shortfalls. This ensures the app's fundamental numbers are never "hallucinated."
*   **Local LLM Engine (`src/lib/ai/local-llm-engine.ts`):** 
    Powered by `@mlc-ai/web-llm` targeting WebGPU technology. It runs a quantized Phi-3 model (or Llama-3) entirely in the browser memory.

---

## 🔄 Data Flow: The Financial-RAG Pipeline

When a user creates a new plan (either manually in `NewPlan.tsx` or via natural language in `SmartPlan.tsx`), the data flows through a strict **Retrieval-Augmented Generation (RAG)** pipeline:

1.  **Input Collection:** The user submits their financial state (Age, Income, Expenses, Goal, Target, Risk).
2.  **Deterministic Calculation:** The input is passed to `calculateGoalFeasibility()`. Exact math yields a "Feasibility Score" (0-100%) and a "Projected Shortfall."
3.  **Context Construction (The "R" in RAG):** A dense prompt is built programmatically. We inject the exact mathematical outputs into the prompt (e.g., *"The user has a 45% feasibility score and a $10,000 shortfall"*).
4.  **Prompt Engineering (The "G" in RAG):** The LLM is instructed via a strict `systemPrompt` to **never hallucinate numbers**, and to only read the numbers provided in the Context Construction. It is tasked with providing professional advice on *how* to close the mathematically calculated shortfall.
5.  **JSON Enforcement:** The LLM is forced via exact prompting and temperature control (`temp: 0.2`) to output a strict JSON format containing `riskAssessment`, `recommendations`, and `explanation`.
6.  **Presentation:** The JSON is parsed and displayed alongside the deterministic charts (Recharts) on the Results Panel.

---

## 🔒 Security & Privacy Model

*   **Data Residency:** 100% on-device. If the user clears their browser cache, the data is destroyed. No data is ever transmitted across the network, making it inherently compliant with strict financial data privacy regulations.
*   **Offline Capability:** Aside from the initial download of the WebLLM model weights and static assets, the entire application (including the Artificial Intelligence engine) functions completely offline.
*   **API Independence:** The architecture explicitly avoids dependency on third-party SaaS APIs, eliminating recurring API costs, API key exposure risks, and vendor lock-in.
