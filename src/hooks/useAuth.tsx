import { useState, useEffect, createContext, useContext, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { storage, initializeStorage, MockUser } from '@/lib/storage';
import { registerDemoUsers, seedUserData } from '@/lib/seed';

const generateId = () => Math.random().toString(36).substring(2) + Date.now().toString(36);

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Inner provider that has access to the router context
function AuthProviderInner({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    initializeStorage();
    // Register all demo accounts on every boot (idempotent)
    registerDemoUsers();

    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      // Validate the stored session user still exists in the registry
      // (guards against stale sessions from an old demo setup)
      const registeredUser = storage.findUserByEmail(currentUser.email ?? '');
      if (registeredUser) {
        setUser(currentUser);
        setSession({
          access_token: 'mock-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          token_type: 'bearer',
          user: currentUser,
        });
        seedUserData(currentUser.id).catch(console.error);
      } else {
        // Stale session — clear it and send to login
        storage.setCurrentSession(null);
      }
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingUser = storage.findUserByEmail(email);
      if (existingUser) throw new Error('User already registered');

      const newUser: MockUser = {
        id: generateId(),
        email,
        full_name: fullName,
        password,
        created_at: new Date().toISOString(),
      };

      storage.saveUser(newUser, password);
      storage.setCurrentSession(newUser);
      const convertedUser = storage.getCurrentUser();
      setUser(convertedUser);
      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      const existingUser = storage.findUserByEmail(email);

      if (!existingUser || existingUser.password !== password) {
        throw new Error('Invalid login credentials');
      }

      storage.setCurrentSession(existingUser);
      const convertedUser = storage.getCurrentUser();
      setUser(convertedUser);

      if (convertedUser) seedUserData(convertedUser.id).catch(console.error);

      return { error: null };
    } catch (err: unknown) {
      return { error: err instanceof Error ? err : new Error(String(err)) };
    }
  };

  const signOut = useCallback(async () => {
    storage.setCurrentSession(null);
    setUser(null);
    setSession(null);
    navigate('/auth');
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// Outer provider — must be inside BrowserRouter so useNavigate works
export function AuthProvider({ children }: { children: ReactNode }) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}