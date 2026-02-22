# Smart Savings Planner: Local AI Integration

The intelligence layer of the Smart Savings Planner is designed to be entirely private, offline, and deterministic. It solves a major problem in modern FinTech applications: **How do we provide advanced, conversational AI advice without sending sensitive user financial data (income, debts, goals) to external third-party cloud servers (OpenAI, Anthropic)?**

Our solution is a **Local AI Integration** built on the intersection of WebGPU and Retrieval-Augmented Generation (RAG).

---

## 🧠 Core Technology: WebLLM

Instead of relying on a REST API (e.g., `fetch('https://api.openai.com/v1/chat/completions')`), we use `@mlc-ai/web-llm`. 
This library compiles Large Language Models (LLMs) down to a WebAssembly container that runs hardware-accelerated directly on the user's local Graphics Processing Unit (GPU) via Chrome/Edge WebGPU APIs.

### The Model: Phi-3-Mini
We selected `Phi-3-mini-4k-instruct-q4f16_1-MLC`. 
*   **Why Phi-3:** It is a Small Language Model (SLM) developed by Microsoft, famously trained on "textbook quality" data. It matches the reasoning capabilities of much larger models but is small enough (~1.8GB) to be downloaded and cached in a standard web browser without crashing the user's machine.
*   **Quantization (`q4f16`):** The model weights are compressed (quantized) to 4-bit integers to drastically reduce memory overhead while maintaining high fidelity in financial reasoning.

---

## 🛠️ The Financial-RAG Architecture

A major issue with LLMs in finance is "hallucination"—the AI confidently inventing incorrect mathematical formulas or interest rates.
We prevent hallucination entirely using a specialized **Retrieval-Augmented Generation (RAG)** pipeline. The AI is structurally prevented from doing any math.

### The Deterministic Math Engine
When a user sets a goal (e.g., $1,000,000 for retirement in 30 years), our `src/lib/calculations.ts` engine running standard deterministic TypeScript math calculates the *exact* required monthly savings, the projected compounding interest path, and the statistical Feasibility Score.

### Context Injection (The "RAG" Process)
Before the AI speaks to the user, we build a hidden "Dense Context" prompt string. We inject the exact mathematical outputs of 'calculations.ts' directly into the LLM's system prompt (e.g., `Feasibility Score: 45%`, `Shortfall: $4,500`).

### The Inference Engine (`src/lib/ai/local-llm-engine.ts`)
The LLM is prompted with strict constraints:
> **Excerpt from System Prompt:** "Do NOT hallucinate numbers. Use only the mathematical data provided in the context... Write an "Explanation" detailing their feasibility score and how to close any shortfall."

We also force the AI to return data in a strict `JSON` format (`temperature: 0.2` to minimize creativity and maximize precision). This allows our React frontend to easily parse the AI's response and render it cleanly into the `ResultsPanel.tsx` UI components.

---

## 💬 Natural Language AI Extraction (Smart Plan)

In our newest flagship feature (`SmartPlan.tsx`), we flip the paradigm. Instead of the user giving us numbers for the math engine to process, the user gives us an unstructured sentence:

> *"I'm 28, making $5000 a month with $2000 in expenses. I want to save for a $40,000 wedding in 3 years. I have aggressive risk tolerance."*

### Zero-Shot Entity Extraction
We pass this sentence to the local WebLLM engine with a specialized **Extraction Prompt**.
The AI is instructed to act purely as a JSON parser. It extracts the raw entities (`age: 28, income: 5000, goalAmount: 40000, time: 3, risk: high`) and returns them as a structured TypeScript object.

If the AI detects missing data (e.g., the user forgets to list their age), it returns a `null` value. Our UI (`SmartPlan.tsx`) intercepts this, pauses the calculation, and politely prompts the user to supply the missing information. 

Once the JSON extraction is complete, the structured numbers are piped directly back into the Deterministic Math Engine -> Financial-RAG Pipeline described above. 

---

## 🔒 Summary of Advantages for the Enterprise
1.  **Compliance:** 100% compliant with strict financial data residency laws (GDPR, CCPA, specific University policies). 
2.  **Zero Marginal Cost:** The AI inference runs on the end-user's electricity and hardware. Serving 10 users costs the same in AWS server fees as serving 10,000 users.
3.  **High Accuracy:** The strict separation of Logic (TypeScript Math) and Reasoning (LLM RAG) completely eliminates financial hallucination risk.
