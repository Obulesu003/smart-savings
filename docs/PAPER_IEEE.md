# Smart Savings Planner: A Browser-Native, Privacy-Preserving Personal Finance Intelligence System with On-Device LLM Inference

> **Submission Category:** IEEE Transactions on Consumer Electronics / IEEE Access / AAAI Symposium on AI in FinTech  
> **Format:** IEEE Conference Paper (Two-Column)  
> **Estimated Word Count:** ~5,500 words (body)

---

## Abstract

Personal finance management applications conventionally rely on centralised cloud infrastructure to deliver analytical capabilities such as forecasting, goal planning, and spending insight generation. This dependency introduces systemic risks including personal financial data exposure through server-side breaches, covert monetisation via third-party data sharing, and service unavailability in low-connectivity environments. This paper presents **Smart Savings Planner**, a browser-native financial intelligence system that performs all data storage, analytical computation, and NLP-driven insight generation entirely on the client device, without transmitting user financial data to any external server. The system employs Dexie.js—an IndexedDB abstraction layer—for structured persistence, ordinary least squares (OLS) linear regression for multi-horizon financial forecasting, and a client-side Large Language Model (Phi-3-mini via WebLLM) combined with a deterministic rule-based engine for personalised financial insight generation. A multi-user architecture with user-scoped data isolation enables deployment across shared browsing environments. We propose a comprehensive evaluation methodology designed to assess the system's forecasting accuracy, LLM extraction fidelity, and computational latency against synthetic test cases. This architecture demonstrates that complex financial analytics and natural language processing can be executed entirely on edge devices, ensuring absolute data privacy without compromising user experience.

**Keywords:** personal finance management, local-first computing, WebLLM, IndexedDB, financial forecasting, privacy-preserving systems, edge AI, client-side computation.

---

## I. Introduction

The proliferation of internet-connected smartphones has driven adoption of digital personal finance management (PFM) tools across emerging economies at an unprecedented rate. Existing PFM solutions overwhelmingly follow a server-centric architecture wherein user transaction data is transmitted to and persisted on remote infrastructure controlled by the application provider. While this enables cross-device synchronisation and computationally intensive analytics, it creates three unresolved structural tensions:

**Privacy exposure:** Personal financial data is particularly sensitive because it is immutable—a compromised transaction history cannot be changed or revoked. Server-side data breaches frequently expose transaction histories, income patterns, and behavioural profiles.

**Commercial misalignment:** The dominant business model for zero-cost PFM applications involves monetising user financial behaviour data through targeted advertising partnerships or direct data licensing. This creates an inherent conflict between user interest (financial privacy) and provider interest (data commercialisation).

**Connectivity dependency:** Cloud-first applications are functionally unavailable in offline or low-bandwidth conditions, disadvantaging users in semi-urban contexts where reliable internet connectivity cannot be guaranteed.

Furthermore, integrating advanced Artificial Intelligence (AI) into these applications typically requires sending highly sensitive user prompts containing exact income and debt figures to third-party APIs (e.g., OpenAI), exacerbating privacy concerns.

The local-first computing paradigm proposes an architectural alternative wherein the user's device serves as the primary and authoritative data store. This paper presents **Smart Savings Planner**, a system that fuses the local-first paradigm with Edge AI to provide personal financial intelligence. The principal contributions of this work are:

1. **A complete PFM architecture** that performs transaction management, budget enforcement, forecasting, and AI insight generation within the browser execution environment, with zero network dependency for core functionality.
2. **An On-Device Financial-RAG Pipeline:** A novel integration of WebGPU-accelerated LLMs (`@mlc-ai/web-llm`) with deterministic math engines to eliminate financial hallucination while preserving privacy.
3. **An on-device forecasting system** employing OLS linear regression with graceful degradation for sparse historical data.
4. **A Proposed Evaluation Framework** designed to formally benchmark the system against a spectrum of synthetic demographically distinct financial personas.

---

## II. Related Work

### A. Personal Finance Management Systems
The academic literature on PFM systems spans user behaviour, system architecture, and analytical capability. Ethnographic studies of personal financial management practices identify that users maintain multiple informal mental models of their finances simultaneously, and effective PFM tools must accommodate this plurality rather than imposing a single ledger metaphor. Furthermore, critical analysis of financial data aggregation argues that the granularity of transaction-level data enables inference of health conditions, relationship status, and behavioural vulnerabilities far exceeding implicit user consent.

### B. Local-First Software
The local-first computing paradigm was formally systematised in 2019, identifying key desiderata: fast response, multi-device accommodation, offline operation, longevity, privacy, and user control. Smart Savings Planner addresses these by utilising IndexedDB, which provides the optimal balance of storage capacity and query performance for persistent web application data.

### C. On-Device AI and Edge NLP
The deployment of machine learning models directly within browser execution environments has been revolutionised by WebAssembly and WebGPU libraries. Recent frameworks allow Small Language Models (SLMs) to run client-side. Applying these strictly to FinTech—where hallucination must be avoided—requires a specialised Retrieval-Augmented Generation (RAG) architecture.

---

## III. System Architecture

### A. Architectural Overview

Smart Savings Planner is implemented as a single-page application (SPA) following the React component model, executed entirely within the browser's JavaScript runtime. The system architecture comprises four logical layers:

**Presentation Layer:** React components providing user interaction surfaces for each functional domain. Components are purely presentational—they receive data and callbacks and render UI without embedding business logic.

**State and Reactivity Layer:** Custom React hooks encapsulating all data access patterns. Hooks subscribe to live database queries via Dexie React Hooks (`useLiveQuery`), ensuring automatic re-rendering on any underlying data mutation.

**Business Logic & AI Layer:** Pure TypeScript functions implementing financial formulas, forecasting algorithms, and the WebLLM engine configuration. These functions are stateless and side-effect-free, enabling deterministic testing.

**Persistence Layer:** Dexie.js ORM over IndexedDB, with a versioned schema migration system ensuring safe schema evolution across browser sessions.

The system requires no backend API or authentication server for core functionality. 

### B. Data Model

The core persistence schema defines entity types with distinct storage backends based on query characteristics:

**IndexedDB (structured, indexed, per-user):**
*   **Transaction:** `id, userId, type, amount, category, date, description` 
*   **Budget:** `id, userId, category, limit, period`
*   **Goal:** `id, userId, name, targetAmount, currentAmount, deadline`

**localStorage (simple, session-scoped):**
User registry and active session context (no plain-text credentials in production environments).

The dual-backend design reflects access pattern differences: IndexedDB is chosen for entities requiring range queries, aggregation, and large-volume storage.

---

## IV. Analytical and AI Methods

### A. The Financial-RAG Architecture

A primary issue with LLMs in finance is "hallucination"—the AI confidently inventing incorrect mathematical formulas or interest rates. Smart Savings Planner prevents hallucination using a specialised Retrieval-Augmented Generation (RAG) pipeline, separating logic from reasoning.

1. **Deterministic Math Engine:** Standard deterministic TypeScript math calculates the *exact* required monthly savings, projected compounding interest path, and statistical Feasibility Score.
2. **Context Injection:** The exact mathematical outputs are injected directly into the LLM's system prompt (e.g., `Feasibility Score: 45%`, `Shortfall: $4,500`).
3. **Inference Engine Constraints:** The LLM (Phi-3-mini-4k-instruct-q4f16_1-MLC) is prompted with strict instructions: "Do NOT hallucinate numbers. Use only the mathematical data provided in the context." It is forced to return specific JSON structures.

### B. Natural Language AI Extraction
The system flips the traditional input paradigm. Instead of forms, the user gives an unstructured sentence (e.g., *"I'm 28, making $5000 a month... I want to save for a $40,000 wedding"*). The AI extracts the raw entities using zero-shot prompting and returns a structured TypeScript object.

### C. Multi-Horizon Financial Forecasting

Raw transaction records are aggregated into monthly observations. For each financial metric $Y \in \{Income, Expense\}$, the system fits an ordinary least squares model:
$$\hat{Y}_t = \hat{\alpha} + \hat{\beta} \cdot t, \quad t = 0, 1, \ldots, n-1$$

Future-period predictions for months $t = n, n+1, \ldots, n+h-1$ are generated with a non-negativity constraint. Graceful degradation is applied for limited historical data: single-period data relies on a flat projection, communicating uncertainty appropriately.

### D. Financial Plan Optimisation

Given a target future value *FV*, planning horizon *n* months, and a monthly expected return rate *r* (derived from user risk tolerance), the required monthly investment is:
$$\text{PMT} = FV \cdot \frac{r}{(1+r)^n - 1}$$

A composite feasibility score $F \in [0, 100]$ is computed as a weighted combination of trajectory adequacy and cash-flow sustainability.

---

## V. Multi-User Data Isolation

Browser-based applications sharing a single origin share a single IndexedDB namespace. To prevent exposing all users' data, the system implements **userId-scoped record partitioning** at the database layer.

Every record in the tables carries a `userId`. The `userId` field is indexed in the Dexie schema, ensuring that the `WHERE userId = X` filter is resolved via an indexed B-tree lookup. An authenticated session with `userId = A` will only ever issue queries filtered to `userId = A`. While this does not prevent access via browser developer tools (a known local-first limitation), it securely partitions data against standard application workflows and shared-device environments.

---

## VI. Proposed Evaluation Framework

Given the privacy-preserving nature of the system, acquiring large, real-world financial datasets from users is intentionally precluded. Consequently, we propose a rigorous evaluation framework based on representative synthetic personas and benchmark tests.

### A. Evaluation Methodology

The system's analytical components will be evaluated against eight synthetic financial personas designed to represent the diversity of an urban middle-class financial landscape. Personas vary by monthly income, savings rate, and primary financial challenges (e.g., "Optimising high-income investment allocation," "Managing irregular freelance income," "Building emergency fund on entry-level salary").

### B. Forecasting Accuracy Assessment

Forecasting accuracy will be evaluated computationally using a synthetic transaction generator that simulates 12 months of historical data per persona. Accuracy will be quantified using Mean Absolute Percentage Error (MAPE). 

*Target Metric:* The system aims to achieve a mean MAPE of $<10\%$ for stable salaried personas and $<20\%$ for high-volatility freelance personas, comparable to cloud-based lightweight forecasting services.

### C. Insight Engine and Local LLM Validation

The functional correctness of the AI extraction pipeline will be assessed using a dataset of 500 varied natural language financial queries. 
*   **Extraction Recall & Precision:** Evaluating the system's ability to accurately map unstructured text to the `age, income, goalAmount, time, risk` JSON scheme.
*   **Insight Validity:** Generated insights will be evaluated against manually computed ground truth by domain experts (e.g., Certified Financial Planners) based on Accuracy, Relevance, and Actionability.

### D. Performance Benchmarks

Performance will be benchmarked on mid-range computing hardware to validate edge viability. Metrics to be evaluated include:
1. **Model Loading Time:** Time required to load the Phi-3-mini WebAssembly container into browser memory.
2. **Inference Latency:** Time-to-first-token (TTFT) and tokens-per-second (TPS) during natural language extraction.
3. **Database Performance:** IndexedDB query latency for >10,000 synthetic transaction records.

The core requirement is that all non-LLM interactive operations complete within the 100ms threshold for perceived instantaneousness, while LLM operations provide continuous streaming feedback to maintain user engagement.

---

## VII. Discussion and Conclusion

This paper presents the architectural design of **Smart Savings Planner**, a browser-native personal finance intelligence system that delivers comprehensive financial management capabilities—including forecasting, goal planning, and NLP-driven insight generation—entirely on the client device. By fusing IndexedDB-based local persistence with WebGPU-accelerated LLM inference (WebLLM), the system eliminates the two most significant risks of cloud-connected PFM applications: server-side data breaches and commercial monetisation of user financial behaviour.

The proposed architecture handles complex tasks typically reserved for the cloud by strictly separating deterministic mathematical logic from non-deterministic LLM reasoning, thereby preventing financial hallucinations via a client-side RAG pipeline.

The proposed evaluation framework dictates that such a system must be assessed via simulated representative personas and strict latency benchmarks, paving the way for further research into Edge AI for FinTech. Future implementations will explore extending the local-first model to include end-to-end encrypted synchronisation across devices, allowing multi-device use while strictly preserving the privacy guarantees outlined in this architecture.

---

## References

[1] M. Kleppmann, A. Wiggins, P. Van Hardenberg, and M. McGranaghan, "Local-first software: You own your data, in spite of the cloud," in *Proc. ACM SIGPLAN Symposium on New Ideas, New Paradigms, and Reflections on Programming and Software (Onward!)*, 2019, pp. 154–178.

[2] A. Almohamed and T. Tiropanis, "A comparative study of client-side storage technologies for web applications," in *Proc. IEEE International Conference on Web Intelligence*, Leipzig, Germany, 2017, pp. 285–292.

[3] D. Smilkov et al., "TensorFlow.js: Machine learning for the web and beyond," in *Proc. SysML Conference*, Palo Alto, CA, 2019.

[4] J. J. Kaye, J. McCuistion, R. Gulotta, and D. A. Shamma, "Money talks: Tracking personal finances," in *Proc. ACM CHI Conference on Human Factors in Computing Systems*, Paris, France, 2014, pp. 521–530.

[5] B. Helppie-McFall, J. Brown, and M. Sacks, "Automatic transaction categorisation and financial behaviour change: An experimental study," *Journal of Financial Planning*, vol. 31, no. 8, pp. 48–58, 2018.

[6] J. Braun and M. Sommer, "Deterministic inference systems for retail investment advisory: Accuracy and fairness," *Journal of Financial Services Research*, vol. 58, pp. 45–71, 2020.
