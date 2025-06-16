
import React, { createContext, useState, useEffect, useContext } from 'react';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ data: any; error: any; }>;
  signIn: (email: string, password?: string) => Promise<{ data: any; error: any; }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true);
        const { data: { session } } = await supabase.auth.getSession();

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      setUser(session?.user ?? null);
      setSession(session);
    });
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName || email
          }
        }
      });

      if (error) throw error;

      // Check for referral code in URL
      const urlParams = new URLSearchParams(window.location.search);
      const referralCode = urlParams.get('ref');

      if (referralCode && data.user) {
        // Process referral signup
        try {
          await supabase.functions.invoke('process-referral-signup', {
            body: {
              referralCode,
              userEmail: email,
              userId: data.user.id
            }
          });
        } catch (referralError) {
          console.error('Error processing referral:', referralError);
          // Don't fail the signup if referral processing fails
        }
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing up:', error);
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password?: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password: password || 'default_password', // Provide a default password
      });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Error",
        description: "Invalid credentials",
        variant: "destructive",
      });
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      // Navigation will be handled by the component calling signOut
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });
      toast({
        title: "Success",
        description: "Password reset link sent to your email",
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      toast({
        title: "Error",
        description: "Failed to send password reset link",
        variant: "destructive",
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
