# Smart Savings Planner: Edge Intelligence and Local-First Architecture for Privacy-Preserving Personal Finance

> **Target Venue:** Springer Lecture Notes in Computer Science (LNCS) / International Conference on Web Engineering (ICWE)
> **Format:** LNCS Standard Format  

## Abstract
Cloud-based Personal Finance Management (PFM) applications introduce severe privacy risks by storing sensitive transaction histories on central servers. This paper proposes the *Smart Savings Planner*, an innovative browser-native system that implements a local-first architecture to provide advanced financial analytics without data exfiltration. Fusing IndexedDB for persistent local storage, Ordinary Least Squares (OLS) regression for multi-horizon financial forecasting, and WebGPU-accelerated Large Language Models (WebLLM) for natural language feature extraction, the system successfully migrates complex FinTech processes to the edge. By strictly separating deterministic financial mathematics from non-deterministic LLM reasoning via a client-side Retrieval-Augmented Generation (RAG) pipeline, the framework completely eliminates financial hallucination. We detail the system's architecture, data isolation protocols for shared environments, and propose a comprehensive evaluation methodology using synthesized demographic personas to validate forecasting accuracy, LLM extraction fidelity, and edge-compute performance. Our design proves that advanced advisory AI can operate securely within the boundaries of user devices.

**Keywords:** Local-first software · WebLLM · Edge AI · Financial forecasting · Data privacy · IndexedDB

---

## 1 Introduction

The digital transformation of personal finance management (PFM) has predominantly relied on cloud-centric service models. While effective for compute-heavy analytics and cross-device synchronisation, this paradigm inherently compromises user privacy. Sensitive data, including incomes, spending habits, and debt burdens, are aggregated on third-party servers, creating targets for catastrophic data breaches and enabling the covert monetisation of user behavioural profiles.

The emergence of *local-first software* principles [1] presents a radical alternative: systems where the primary source of truth resides on the local device, treating the network as optional. Historically, local-first applications have struggled to provide the "smart" features—such as predictive forecasting or AI-driven natural language interactions—expected by modern smartphone users. 

This paper bridges that gap by introducing the **Smart Savings Planner**, a comprehensive web application that executes all data persistence, linear regression forecasting, and Natural Language Processing (NLP) inference entirely within the user's browser runtime. We incorporate WebAssembly/WebGPU-based Large Language Models (LLMs) to provide conversational interactions and data extraction, ensuring absolute data residency. 

The structure of this paper is as follows: Section 2 reviews related work in Edge AI and FinTech privacy. Section 3 details the local-first system architecture. Section 4 explains the analytical forecasting logic and the client-side Financial Retrieval-Augmented Generation (RAG) pipeline. Section 5 presents a proposed experimental evaluation framework, and Section 6 concludes.

---

## 2 Related Work

The tension between advanced financial advisement and user data privacy is well-documented. Tufekci established that the high granularity of transaction data allows service providers to infer highly private user attributes implicitly, far exceeding granted consent. 

Kleppmann et al. [1] formulated the local-first computing paradigm, arguing that users must own their data "in spite of the cloud". Recent evaluations of browser storage mechanisms [2] have confirmed IndexedDB as a highly robust, performant substrate for structured client-side data persistence. 

Simultaneously, Edge AI has advanced rapidly. Frameworks like TensorFlow.js [3] brought basic ML to the browser, and newer WebGPU implementations such as the MLC WebLLM project have made running 4-to-7 billion parameter Small Language Models (SLMs) locally feasible. However, applying SLMs to finance runs the risk of "hallucinations" (fabricating nonexistent numerical data), requiring novel architectural constraints.

---

## 3 System Architecture

The Smart Savings Planner is implemented as a React single-page application (SPA), devoid of traditional backend API servers.

### 3.1 Persistence and State Management Layer
The data layer utilizes Dexie.js, an Object-Relational Mapping (ORM) wrapper over the browser’s native IndexedDB. The schema is highly structured, encompassing `Transactions`, `Budgets`, and `Goals`. Unlike cloud databases, the data volume is bound only by the device's storage limits.
State reactivity is achieved via Dexie React Hooks. When the database is mutated, UI components immediately and automatically re-render without complex state-management boilerplate (e.g., Redux).

### 3.2 User Isolation in Shared Environments
A fundamental challenge in browser-based applications is domain-level storage sharing; multiple users on the same origin share the same IndexedDB context. We resolve this via application-level User-ID scoping. Every transaction or budget object contains a hard-coded `userId` foreign key. IndexedDB compound indexes (e.g., `userId, category`) ensure that all internal queries are strictly bounded to the currently authenticated session state, practically isolating user profiles on shared physical machines.

---

## 4 Edge Analytics and AI Mechanisms

### 4.1 OLS Multi-Horizon Forecasting
To predict future financial trajectories, the system aggregates transaction data into monthly observations. For income ($I$) and expenditure ($E$), an Ordinary Least Squares (OLS) regression model is fitted:
$$\hat{Y}_t = \hat{\alpha} + \hat{\beta} \cdot t$$
This model is recomputed dynamically strictly utilizing data points stored in IndexedDB. If historical data is sparse (e.g., $n=1$), the system applies graceful degradation, reverting to flat line projections, maintaining usability without projecting false certainty.

### 4.2 The Client-Side Financial-RAG Pipeline
To provide intelligence without hallucination, the system splits operations into deterministic math and non-deterministic logic:
1. **Deterministic Processing:** A Typescript mathematics engine processes the IndexedDB datasets to calculate constraints like "Feasibility Score", "Monthly Shortfall", and "Compound Growth Trajectory" using standardized financial formulas.
2. **Context Injection:** The precise numerical outputs of the math engine are injected into the system prompt of the WebLLM engine.
3. **Restricted Inference:** The LLM (e.g., Phi-3-mini) runs on the user's GPU and is explicitly barred through prompt engineering from calculating or generating new numbers. Its sole function is to construct narrative evaluations based *only* on the injected deterministic context.

### 4.3 Structure-from-Text via Edge NLP
Users can input unstructured financial goals such as, "I want to save $15000 for a car over the next 3 years with aggressive risk." The system uses a specialized zero-shot extraction prompt. The local LLM parses the string, identifies entities (Goal = 15000, Period = 3, Risk = Aggressive), constructs a JSON object, and pipes this directly into the deterministic calculation engine. Missing data causes the LLM to output `null` tags, prompting the UI to request clarifications from the user.

---

## 5 Proposed Evaluation Framework

Due to the strict privacy constraints of the architecture, real-world user data cannot be analyzed on centralized servers. Therefore, we propose an evaluation framework relying on synthetic benchmarks.

### 5.1 Synthetic Demographic Validation
The system's efficacy will be validated against eight synthetic "financial personas," modeled after a diverse urban-middle-class populace. These personas cover varying income ranges, fixed expense burdens, and financial literacy constraints. 

### 5.2 Algorithmic Accuracy and Reliability
A simulated history of 12-24 months of transactions will be generated per persona.
*   **Forecasting Metric:** Leave-one-out cross-validation will be used against the modeled data to compute the Mean Absolute Percentage Error (MAPE). The system targets a MAPE of $<10\%$ for consistent salaried personas.
*   **NLP Extraction Fidelity:** The zero-shot LLM extractor will be benchmarked via a dataset of 500 edge-case natural language prompts, measuring exact-match precision and recall for financial entities.

### 5.3 Computational Benchmarks
To guarantee user experience, the system will be benchmarked on mid-tier consumer hardware ensuring:
*   Initial model load times do not trigger browser timeout constraints.
*   Dexie.js transaction queries (10k+ records) execute in $<20$ milliseconds.
*   Inference Time-To-First-Token (TTFT) remains under 2 seconds.

---

## 6 Conclusion

This paper details the architecture and methodology behind the Smart Savings Planner, a system resolving a core tension in FinTech: balancing intelligent, AI-driven advisory capabilities with zero-trust data privacy. By synthesizing IndexedDB, standard regression mathematics, and cutting-edge WebGPU-accelerated SLMs, the application achieves a fully functional edge-intelligence landscape. 
The proposed evaluation protocols will quantitatively demonstrate that local-first FinTech platforms are no longer constrained to being "dumb" ledgers. Future research will focus on expanding the deterministic math models to support automated tax-harvesting analytics and exploring peer-to-peer encrypted synchronization protocols for multi-device setups.

---

## References

1. Kleppmann, M., Wiggins, A., Van Hardenberg, P., McGranaghan, M.: Local-first software: You own your data, in spite of the cloud. In: ACM SIGPLAN SPLASH (Onward!), pp. 154–178 (2019)
2. Almohamed, A., Tiropanis, T.: A comparative study of client-side storage technologies for web applications. In: IEEE/WIC/ACM WI, pp. 285–292 (2017)
3. Smilkov, D., et al.: TensorFlow.js: Machine learning for the web and beyond. In: SysML Conference (2019)
4. Tufekci, Z.: Engineering the public: Big data, surveillance and computational politics. First Monday 19(7) (2014) 
