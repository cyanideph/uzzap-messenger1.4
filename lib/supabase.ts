import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Use environment variables for Supabase configuration with fallback values for development
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://your-project-url.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key';

// Log a warning if environment variables are not properly set
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('Warning: Supabase environment variables are not properly configured. Using fallback values.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Types for authentication
export type AuthUser = {
  id: string;
  email: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
};

// Helper functions for authentication
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  return { data, error };
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

// Function to update user profile
export async function updateUserProfile(userId: string, updates: { username?: string; avatar_url?: string }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select();
  
  return { data, error };
}
// Function to upload avatar to Supabase storage
export async function uploadAvatar(userId: string, avatarFile: File) {
  try {
    const fileName = `avatars/${userId}/${avatarFile.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, avatarFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Error uploading avatar:', error);
      return { data: null, error };
    }

    const avatar_url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${fileName}`;
    
    // Update user profile with the new avatar URL
    const { data: profileData, error: profileError } = await updateUserProfile(userId, { avatar_url });

    if (profileError) {
      console.error('Error updating user profile:', profileError);
      return { data: null, error: profileError };
    }

    return { data: { ...data, avatar_url }, error: null };
  } catch (error: any) {
    console.error('Unexpected error uploading avatar:', error);
    return { data: null, error: { message: error.message } };
  }
}
