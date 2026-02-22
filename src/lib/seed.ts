/**
 * Demo database seeding.
 * All demo accounts start with zero data — each user is fully isolated.
 */
import { db } from './db';
import { storage } from './storage';
import { DEMO_USERS, DEMO_TRANSACTIONS, DEMO_BUDGETS, DEMO_GOALS } from './demo-users';

const SEEDED_KEY_PREFIX = 'ssp_seeded_';

/** Register all demo user accounts in localStorage so they can sign in. */
export function registerDemoUsers(): void {
  DEMO_USERS.forEach(({ user, password }) => {
    const existing = storage.findUserByEmail(user.email);
    if (!existing) {
      storage.saveUser(user, password);
    }
  });
}

/** Seed Dexie data for a single user if not already seeded. */
export async function seedUserData(userId: string): Promise<void> {
  const key = SEEDED_KEY_PREFIX + userId;
  if (localStorage.getItem(key)) return; // already run for this user

  const transactions = DEMO_TRANSACTIONS[userId];
  const budgets      = DEMO_BUDGETS[userId];
  const goals        = DEMO_GOALS[userId];

  // Only bulkAdd if there is actually seed data for this user
  if (transactions?.length) await db.transactions.bulkAdd(transactions.map(t => ({ ...t, userId })));
  if (budgets?.length)      await db.budgets.bulkAdd(budgets.map(b => ({ ...b, userId })));
  if (goals?.length)        await db.goals.bulkAdd(goals.map(g => ({ ...g, userId })));

  // Mark as seeded (even if empty) so we don't check again
  localStorage.setItem(key, '1');
}
