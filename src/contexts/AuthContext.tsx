import React, { createContext, useContext, useState, ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  login: (role: 'user' | 'admin') => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);

  const login = (newRole: 'user' | 'admin') => {
    setRole(newRole);
  };

  const logout = () => {
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated: role !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
