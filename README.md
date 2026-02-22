# Smart Savings Planner

> A privacy-first, 100% local-inference financial planning application powered by WebGPU and React. Built as an advanced capstone project demonstrating the intersection of deterministic financial mathematics and secure, on-device Artificial Intelligence (Retrieval-Augmented Generation).

## What It Does

Smart Savings Planner helps you track income & expenses, set budgets, plan savings goals, forecast your financial future with AI, and learn financial literacy — all entirely within your browser.

## 📚 Comprehensive Documentation

We have prepared extensive documentation detailing every aspect of this project. Please refer to the following guides:

1. **[System Architecture](docs/ARCHITECTURE.md)** 🏗️
   - High-level component diagrams, data flow (RAG pipeline), and the 100% client-side security model.
2. **[Developer Guide](docs/DEVELOPER_GUIDE.md)** 💻
   - Core engineering patterns, custom hook data management, project structure, and local LLM lazy-loading techniques.
3. **[Installation & User Guide](docs/INSTALLATION_AND_USER_GUIDE.md)** 🚀
   - Step-by-step setup instructions (`npm install`, `npm run dev`) and an overview of the 8 included Demo Personas.
4. **[Local AI Integration](docs/AI_INTEGRATION.md)** 🤖
    - In-depth explanation of the WebLLM engine (Phi-3-Mini), the Zero-Shot Extraction pipeline, and how we prevent financial hallucination using strict RAG contexts.
 5. **[Smart Planner Prompts](docs/SMART_PLANNER_PROMPTS.md)** 💬
    - Examples ranging from perfect inputs to ambiguous sentences, showing exactly how the AI extracts unstructured text into deterministic plans.
 6. **[Whitepaper / Academic Overview](docs/WHITEPAPER.md)** 📄
    - Original algorithms, market analysis, and academic context.

---

## 🚀 Quick Start

Ensure you have Node.js (v18+) installed and a WebGPU-compatible modern browser.

```bash
# Clone the repository and cd into it
# Install dependencies
npm install

# Start the development server (Defaults to Port 8080)
npm run dev
```

Then go to `http://localhost:8080` and sign in with any demo account (password: `demo1234`):

| Account | Profile |
|---|---|
| `raj@demo.app` | High-income SWE, aggressive investor |
| `priya@demo.app` | Teacher, conservative saver |
| `arjun@demo.app` | Freelancer, variable income |
| `sneha@demo.app` | Fresh graduate, tight budget |
| `demo@demo.app` | Balanced showcase account |

---

## Privacy Guarantee

**All data stays in your browser.** There is no server, no API key requirement, and no telemetry. Everything runs locally in IndexedDB and your GPU memory.
