# Installation & User Guide

Welcome to the Smart Savings Planner! This guide covers everything from initial setup to daily use of the application.

---

## 🚀 Installation & Prerequisites

To run this application locally on your machine, you need a basic Node.js development environment.

### Prerequisites
1.  **Node.js (v18 or higher):** Download and install from [nodejs.org](https://nodejs.org/).
2.  **Modern Browser:** A recent version of Chrome, Edge, or Brave. (Safari support for WebGPU is currently experimental).
3.  **Hardware:** The Artificial Intelligence feature requires a machine with at least 8GB-16GB of RAM and a functioning integrated or dedicated GPU (e.g., Apple M1/M2/M3, or a standard Windows PC).

### Setup Instructions

1.  **Extract the Project:** Unzip or clone the repository to your local machine.
2.  **Open Terminal:** Open a terminal or command prompt and navigate (`cd`) into the project directory (e.g., `cd smart-savings-planner`).
3.  **Install Dependencies:** Run the following command to download all necessary libraries:
    ```bash
    npm install
    ```
4.  **Start the Server:** Launch the application:
    ```bash
    npm run dev
    ```
5.  **Open in Browser:** Once the server starts, you will see a local URL in your terminal. By default, open your browser and go to:
    ```text
    http://localhost:8080
    ```

---

## 👤 Using the Application (Demo Mode)

This application is designed as a portfolio/capstone project and ships with **8 pre-configured Demo Personas** to showcase different financial situations. There is no backend sign-up process.

### How to Log In
1.  When you open `http://localhost:8080`, you will see the Login screen.
2.  Use the dropdown menu to select one of the 8 Personas.
    *   *Example: Select "Raj Sharma (High Income Tech)" to see an aggressive investment portfolio.*
    *   *Example: Select "Sneha Reddy (Fresh Grad)" to see a budget-focused starter dashboard.*
3.  The password for **all** accounts is simply: `demo1234`
4.  Click **Sign In**.

### Main Features Overview

#### 1. The Dashboard
Your financial command center. Here you will see:
*   Sparkline trends of your income and expenses over the last 6 months.
*   A recent transaction ledger.
*   Your Gamification score (Gamified Financial Health).
*   Progress bars for your active Savings Goals.

#### 2. Budgets & Transactions 
*   **Income/Expenses:** Add your daily transactions via the sidebar. Try adding a "Coffee" expense and watch your "Food" budget progress bar update automatically.
*   **Budgets:** Set spending limits for categories. The app warns you if you approach your limit.

#### 3. New Plan (Manual Form)
Navigate here to create a highly detailed, deterministic financial plan. 
*   Fill out your exact age, income, and a specific financial goal (e.g., "$300,000 for a House in 7 years").
*   Click **Generate**.
*   The system uses exact compounding interest formulas to calculate a Feasibility Score (e.g., 85%).
*   The Local AI Engine will read this math and give you specific advice on closing any shortfalls.

#### 4. AI Smart Plan (Natural Language)
If you don't want to type numbers into a form, click **AI Smart Plan**.
*   Just type a sentence like: *"I am 26 making $4000/mo and spending $2000. I want to save for a $30,000 car in 2 years with medium risk."*
*   The Local Artificial Intelligence engine will read your sentence, extract the data, pipe it through the mathematical engine, and generate a personalized plan instantly. 

> **Important Note on AI:** The *very first time* you use either the Manual Plan or the Smart Plan, the AI model (~1.8GB) must download into your browser's secure storage. This takes 1-3 minutes depending on your internet speed. Every subsequent visit will be nearly instantaneous.
