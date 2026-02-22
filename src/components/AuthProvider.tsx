import React, { createContext, useContext, useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  user_metadata: {
    avatar_url?: string;
    full_name?: string;
  };
}

interface AuthContextType {
  session: { user: User } | null;
  loading: boolean;
  user: User | null;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  loading: true,
  user: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate checking for a user
    const timer = setTimeout(() => {
        // Auto-login as a local user
        const localUser = {
            id: 'local-user-1',
            email: 'user@local.app',
            user_metadata: {
                full_name: 'Local User',
                avatar_url: ''
            }
        };
        setUser(localUser);
        setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const signOut = async () => {
    setUser(null);
  };

  const value = {
    session: user ? { user } : null,
    loading,
    user,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
