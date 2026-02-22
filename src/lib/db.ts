import Dexie, { Table } from "dexie";

export interface Transaction {
  id?: number;
  userId: string;          // owner of this record
  amount: number;
  type: "income" | "expense";
  category: string;
  date: string;
  description?: string;
  accountId?: number;
}

export interface Account {
  id?: number;
  name: string;
  type: "checking" | "savings" | "investment" | "cash";
  balance: number;
}

export interface Budget {
  id?: number;
  userId: string;
  category: string;
  limit: number;
  period: "monthly" | "yearly";
  alertThreshold?: number;
}

export interface Goal {
  id?: number;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
}

export interface LearningProgress {
  id?: number;
  topicId: string;
  level: string;
  score: number;
  history: string[];
}

export interface UserSettings {
  id?: number;
  theme: "light" | "dark" | "system";
  currency: string;
  aiModel: "local" | "none";
}

export class FinancialDatabase extends Dexie {
  transactions!: Table<Transaction>;
  accounts!: Table<Account>;
  budgets!: Table<Budget>;
  goals!: Table<Goal>;
  learningProgress!: Table<LearningProgress>;
  userSettings!: Table<UserSettings>;

  constructor() {
    super("SmartSavingsDB");

    // Version 1 — original schema (no userId)
    this.version(1).stores({
      transactions: "++id, type, category, date, accountId",
      accounts: "++id, name, type",
      budgets: "++id, category",
      goals: "++id, name, deadline",
      learningProgress: "++id, topicId, level",
      userSettings: "++id",
    });

    // Version 2 — per-user indexes on transactions, budgets, goals
    this.version(2).stores({
      transactions: "++id, userId, type, category, date, accountId",
      accounts: "++id, name, type",
      budgets: "++id, userId, category",
      goals: "++id, userId, name, deadline",
      learningProgress: "++id, topicId, level",
      userSettings: "++id",
    });
  }
}

export const db = new FinancialDatabase();
