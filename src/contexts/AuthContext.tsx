
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
      } else {
        console.log('Session refreshed successfully');
        setSession(session);
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email);
        console.log('Session access token exists:', !!session?.access_token);
        
        if (event === 'TOKEN_REFRESHED') {
          console.log('Token was refreshed');
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('User signed out');
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
      } else {
        console.log('Initial session loaded:', !!session);
        console.log('Initial session access token exists:', !!session?.access_token);
      }
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('Attempting to sign up user:', email);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    
    if (error) {
      console.error('Sign up error:', error);
    } else {
      console.log('Sign up successful');
    }
    
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('Attempting to sign in user:', email);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Sign in error:', error);
    } else {
      console.log('Sign in successful');
    }
    
    return { error };
  };

  const signOut = async () => {
    console.log('Signing out user');
    await supabase.auth.signOut();
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
