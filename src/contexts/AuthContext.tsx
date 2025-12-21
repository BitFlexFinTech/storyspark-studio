import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'user' | 'admin' | null;

interface AuthContextType {
  role: UserRole;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (role: 'user' | 'admin') => void;
  logout: () => void;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<UserRole>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          setIsDemoMode(false);
          // Defer role fetch to avoid deadlock
          setTimeout(() => {
            fetchUserRole(session.user.id);
          }, 0);
        } else {
          setRole(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching role:', error);
        setRole('user');
        return;
      }

      setRole((data?.role as UserRole) || 'user');
    } catch (err) {
      console.error('Error fetching role:', err);
      setRole('user');
    }
  };

  // Demo mode login (for testing without auth)
  const login = (newRole: 'user' | 'admin') => {
    setRole(newRole);
    setIsDemoMode(true);
    setUser({ id: 'demo-user', email: 'demo@example.com' } as User);
  };

  const logout = () => {
    setRole(null);
    setIsDemoMode(false);
    setUser(null);
    setSession(null);
  };

  // Real authentication
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signUp = async (email: string, password: string, displayName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          display_name: displayName,
        },
      },
    });
    return { error: error ? new Error(error.message) : null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    logout();
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        isAuthenticated: role !== null || !!session,
        isDemoMode,
        user,
        session,
        isLoading,
        login,
        logout,
        signIn,
        signUp,
        signOut,
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
