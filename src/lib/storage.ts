
import { User } from '@supabase/supabase-js'; // Keeping types for compatibility

export const STORAGE_KEYS = {
  USERS: 'ssp_users',
  CURRENT_USER: 'ssp_current_user',
  ALL_DATA: 'ssp_all_data' // For easy clear/export
};

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  password?: string; // stored for mock auth only
  created_at: string;
}

// Initialize storage if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify([]));
  }
};

export const storage = {
  getUsers: (): MockUser[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    } catch {
      return [];
    }
  },

  saveUser: (user: MockUser, password?: string) => {
    const users = storage.getUsers();
    users.push({ ...user, ...(password ? { password } : {}) });
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  findUserByEmail: (email: string): MockUser | undefined => {
    const users = storage.getUsers();
    return users.find(u => u.email === email);
  },

  setCurrentSession: (user: MockUser | null) => {
    if (user) {
        // Don't store password in session
        const { password, ...safeUser } = user; 
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(safeUser));
    } else {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  getCurrentUser: (): User | null => {
      const stored = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!stored) return null;
      try {
          const parsed = JSON.parse(stored);
          // Mocking the Supabase User structure so we don't break types everywhere
          return {
              id: parsed.id,
              email: parsed.email,
              user_metadata: { full_name: parsed.full_name },
              app_metadata: {},
              aud: 'authenticated',
              created_at: parsed.created_at,
          } as unknown as User;
      } catch {
          return null;
      }
  }
};
