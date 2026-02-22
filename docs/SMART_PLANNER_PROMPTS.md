# Smart Planner: Example Prompts & Questions

The Natural Language AI Planner feature allows you to bypass manual form filling by simply describing your financial situation and goals in plain English. 

The Local WebLLM Engine uses a **Zero-Shot Entity Extraction** pipeline to pull exact parameters (Age, Income, Expenses, Goal Amount, Timeframe, Risk Tolerance, Goal Type) out of your sentences, run them through deterministic mathematical formulas, and generate compounding interest plans.

Here are examples of the kinds of prompts and questions you can ask the Smart Planner ranging from simple to complex.

---

## 1. The "Perfect" Complete Prompt
A "perfect" prompt contains all 7 required data points, allowing the AI to instantly calculate your Feasibility Score without asking any follow-up questions.

> *"I am 32 years old, making $8,000 a month with $3,500 in monthly expenses. I want to save for a $60,000 house downpayment in 4 years. I have a medium risk tolerance."*

**Data Extracted:**
*   **Age:** 32
*   **Income:** $8,000
*   **Expenses:** $3,500
*   **Goal Type:** House
*   **Goal Amount:** $60,000
*   **Time Period:** 4 years
*   **Risk:** Medium

---

## 2. Inferred / Conversational Prompts
The AI is intelligent enough to infer missing context or calculate implied numbers.

> *"I'm 22, fresh out of college making 60k a year. My rent and bills are about 2k a month. I'd like to build an aggressive startup fund of 50k within the next 5 years."*

**Data Extracted (Inferred):**
*   **Age:** 22
*   **Income:** $5,000 *(Calculated from 60k/year)*
*   **Expenses:** $2,000
*   **Goal Type:** Business/Startup
*   **Goal Amount:** $50,000
*   **Time Period:** 5 years
*   **Risk:** High *(Inferred from "aggressive")*

---

## 3. High-Stress / Tight Timeline Prompts
You can test the deterministic math engine by giving the AI a mathematically difficult or impossible goal.

> *"I am 45. I make $4,000 a month and spend $3,800. I want a million-dollar retirement fund in 10 years playing it completely safe with low risk."*

**System Response:**
The AI will extract the data. The mathematical engine will calculate a very low Feasibility Score. The AI Engine will then read the math and tell the user truthfully that building a $1,000,000 corpus with $200/month in savings at low risk over 10 years is impossible, and provide recommendations on how to dramatically reduce expenses, increase income, or extend the timeline.

---

## 4. Ambiguous / Missing Data Prompts
If you provide an incomplete sentence, the AI's extraction engine will parse what it can, and the UI will alert you to what is missing.

> *"I want to buy a $30,000 car in 2 years."*

**System Response:**
The UI will pause the generation and display a red warning:
`Missing Information: The AI couldn't find all the details needed to run the exact mathematical calculations. Please update your prompt to include: age, monthlyIncome, monthlyExpenses, riskPreference.`

---

## How it works behind the scenes:
When you submit these prompts, the sentence is passed to the WebGPU model running locally in your browser. Since we don't use external APIs, none of your financial text is sent to the cloud. The AI simply converts English into JSON, and hands it off to the exact same rigorous mathematical charting engine used by the manual forms on the platform.
