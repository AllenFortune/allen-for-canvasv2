
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

  const clearAuthState = () => {
    console.log('Clearing local auth state');
    setSession(null);
    setUser(null);
  };

  const refreshSession = async () => {
    try {
      console.log('Refreshing session...');
      const { data: { session }, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        if (error.message.includes('session_not_found') || error.message.includes('refresh_token_not_found')) {
          console.log('Session expired, clearing auth state');
          clearAuthState();
        }
      } else {
        console.log('Session refreshed successfully');
        setSession(session);
        setUser(session?.user ?? null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
      clearAuthState();
    }
  };

  const sendWelcomeEmail = async (email: string, fullName: string) => {
    try {
      console.log('Sending welcome email to:', email);
      await supabase.functions.invoke('send-welcome-email', {
        body: { email, fullName }
      });
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
      // Don't throw the error - we don't want to block signup if email fails
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
          console.log('User signed out - clearing state');
          clearAuthState();
        } else {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Error getting initial session:', error);
        if (error.message.includes('session_not_found')) {
          console.log('No valid session found, clearing auth state');
          clearAuthState();
        }
      } else {
        console.log('Initial session loaded:', !!session);
        console.log('Initial session access token exists:', !!session?.access_token);
        setSession(session);
        setUser(session?.user ?? null);
      }
      
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
      // Send welcome email after successful signup
      setTimeout(() => {
        sendWelcomeEmail(email, fullName);
      }, 1000); // Small delay to ensure user is created
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
    console.log('Attempting to sign out user');
    
    try {
      // First, try to validate the current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session validation error before sign out:', sessionError);
      }
      
      if (!currentSession) {
        console.log('No active session found, clearing local state');
        clearAuthState();
        return;
      }

      // Attempt server-side sign out
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Server-side sign out error:', error);
        
        // Handle specific session-related errors
        if (error.message.includes('session_not_found') || 
            error.message.includes('Session not found') ||
            error.message.includes('refresh_token_not_found')) {
          console.log('Session already invalid on server, clearing local state');
          clearAuthState();
          return;
        }
        
        // For other errors, still try to clear local state as fallback
        console.log('Sign out error occurred, clearing local state as fallback');
        clearAuthState();
        
        // Don't throw the error - we want to ensure the user is signed out locally
        return;
      }
      
      console.log('Server-side sign out successful');
      // State will be cleared by the onAuthStateChange listener
      
    } catch (error) {
      console.error('Unexpected error during sign out:', error);
      // Ensure we clear local state even if there's an unexpected error
      clearAuthState();
    }
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
