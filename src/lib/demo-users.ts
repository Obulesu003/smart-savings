/**
 * Demo user profiles for showcase purposes.
 * All accounts use password: demo1234
 * All accounts start completely empty — no pre-seeded data.
 */

import { MockUser } from '@/lib/storage';

export interface DemoProfile {
  user: MockUser;
  password: string;
}

export const DEMO_USERS: DemoProfile[] = [
  // ── Set 1: Original personas ───────────────────────────────────────────────
  { user: { id: 'demo-raj',    email: 'raj@demo.app',    full_name: 'Raj Sharma',    created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-priya',  email: 'priya@demo.app',  full_name: 'Priya Nair',    created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-arjun',  email: 'arjun@demo.app',  full_name: 'Arjun Mehta',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-sneha',  email: 'sneha@demo.app',  full_name: 'Sneha Reddy',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-vikram', email: 'vikram@demo.app', full_name: 'Vikram Iyer',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-meera',  email: 'meera@demo.app',  full_name: 'Meera Das',     created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-kiran',  email: 'kiran@demo.app',  full_name: 'Kiran Rao',     created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'demo-user',   email: 'demo@demo.app',   full_name: 'Demo User',     created_at: new Date().toISOString() }, password: 'demo1234' },
  // ── Set 2: Blank accounts ──────────────────────────────────────────────────
  { user: { id: 'blank-1',     email: 'new1@demo.app',   full_name: 'Alex Jordan',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'blank-2',     email: 'new2@demo.app',   full_name: 'Sam Patel',     created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'blank-3',     email: 'new3@demo.app',   full_name: 'Chris Lee',     created_at: new Date().toISOString() }, password: 'demo1234' },
  // ── Set 3: Five additional accounts ───────────────────────────────────────
  { user: { id: 'extra-1',     email: 'user1@demo.app',  full_name: 'Ananya Singh',  created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'extra-2',     email: 'user2@demo.app',  full_name: 'Rohit Verma',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'extra-3',     email: 'user3@demo.app',  full_name: 'Divya Menon',   created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'extra-4',     email: 'user4@demo.app',  full_name: 'Nikhil Gupta',  created_at: new Date().toISOString() }, password: 'demo1234' },
  { user: { id: 'extra-5',     email: 'user5@demo.app',  full_name: 'Pooja Sharma',  created_at: new Date().toISOString() }, password: 'demo1234' },
];

// All seed data maps are empty — every account starts with a clean slate.
// Users build their own data after signing in.
export const DEMO_TRANSACTIONS: Record<string, []> = {};
export const DEMO_BUDGETS: Record<string, []> = {};
export const DEMO_GOALS: Record<string, []> = {};
