import { createContext, useContext, ReactNode, useState, useEffect } from 'react';

type AuthContextType = {
  user: {
    id: string;
    name: string;
    role: string;
  } | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  logout: () => void;
};

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthContextType['user']>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (credentials: { username: string; password: string }) => {
    // TODO: Implement actual authentication logic
    setUser({
      id: '1',
      name: 'Admin User',
      role: 'admin'
    });
  };

  const logout = () => {
    setUser(null);
    // localStorage will be cleared by the effect below, but we clear here as well for immediacy
    localStorage.removeItem('user');
  };

  // Keep localStorage in sync with the current authentication state
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
