import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { User } from '@supabase/supabase-js';
import { Alert } from 'react-native';

// Define the AuthUser type that extends the Supabase User type
export type AuthUser = User & { 
  username: string | null;
  avatar_url?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component that wraps your app and provides the auth context
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    // Check if onboarding has been completed
    const checkOnboarding = async () => {
      const onboardingStatus = await SecureStore.getItemAsync('onboardingCompleted');
      setOnboardingCompleted(onboardingStatus === 'true');
    };
    
    checkOnboarding();

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ? { ...session.user, username: session.user.email?.split('@')[0] || null } : null);
      console.log("User ID:", session?.user?.id);
      setLoading(false);

      if (event === 'SIGNED_IN') {
        try {
          // Check if user profile exists, if not, create it
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session?.user?.id)
            .single();

          if (profileError) {
            console.error('Error checking profile:', profileError);
            Alert.alert('Error', 'Failed to check profile status');
          }

          if (!profile && session?.user) {
            console.log('Creating new profile for user:', session.user.id);
            const username = session.user.email ? session.user.email.split('@')[0] : 'user';
            
            const { error: insertError } = await supabase.from('profiles').insert([
              {
                id: session.user.id,
                username: username,
                full_name: username,
                created_at: new Date().toISOString(),
                status_message: null,
                last_status_update: null,
              }
            ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              Alert.alert('Error', 'Failed to create profile');
            } else {
              // Also create a user record in the users table
              const { error: userError } = await supabase.from('users').insert([
                {
                  id: session.user.id,
                  created_at: new Date().toISOString(),
                },
              ]);
              
              if (userError) {
                console.error('Error creating user record:', userError);
              } else {
                console.log('Profile and user record created successfully');
              }
            }
          }

          // Check onboarding status before navigating
          const onboardingStatus = await SecureStore.getItemAsync('onboardingCompleted');
          if (onboardingStatus === 'true') {
            router.replace('/(app)/home' as any);
          } else {
            router.replace('/(auth)/onboarding' as any);
          }
        } catch (error) {
          console.error('Unexpected error in profile creation:', error);
          Alert.alert('Error', 'An unexpected error occurred while setting up your profile');
        }
      }

      if (event === 'SIGNED_OUT') {
        router.replace('/');
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ? { ...session.user, username: session.user.email?.split('@')[0] || null } : null);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  // Authentication functions
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  // Set onboarding completed
  const setOnboardingCompletedState = async (completed: boolean) => {
    await SecureStore.setItemAsync('onboardingCompleted', completed ? 'true' : 'false');
    setOnboardingCompleted(completed);
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    onboardingCompleted,
    setOnboardingCompleted: setOnboardingCompletedState,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
