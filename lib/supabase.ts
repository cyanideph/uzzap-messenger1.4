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

// Gallery management functions
export async function uploadGalleryImage(userId: string, imageFile: File, caption?: string) {
  try {
    const fileName = `gallery/${userId}/${Date.now()}-${imageFile.name}`;
    
    const { data, error } = await supabase.storage
      .from('gallery')
      .upload(fileName, imageFile, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const image_url = `${process.env.EXPO_PUBLIC_SUPABASE_URL}/storage/v1/object/public/gallery/${fileName}`;
    
    const { error: insertError } = await supabase
      .from('profile_gallery')
      .insert({
        profile_id: userId,
        image_url,
        caption
      });

    if (insertError) throw insertError;
    
    return { data, error: null };
  } catch (error) {
    console.error('Error uploading gallery image:', error);
    return { data: null, error };
  }
}

export async function getGalleryImages(userId: string) {
  const { data, error } = await supabase
    .from('profile_gallery')
    .select('*')
    .eq('profile_id', userId)
    .order('created_at', { ascending: false });
    
  return { data, error };
}

export async function deleteGalleryImage(imageId: string) {
  const { error } = await supabase
    .from('profile_gallery')
    .delete()
    .eq('id', imageId);
    
  return { error };
}

// Relationship management functions
export async function addFriend(userId: string, friendId: string) {
  const { error } = await supabase
    .from('user_relationships')
    .insert({
      user_id: userId,
      related_user_id: friendId,
      relationship_type: 'friend'
    });
  return { error };
}

export async function blockUser(userId: string, blockedId: string) {
  const { error } = await supabase
    .from('user_relationships')
    .insert({
      user_id: userId,
      related_user_id: blockedId,
      relationship_type: 'blocked'
    });
  return { error };
}

export async function removeRelationship(userId: string, relatedId: string) {
  const { error } = await supabase
    .from('user_relationships')
    .delete()
    .match({ user_id: userId, related_user_id: relatedId });
  return { error };
}

export async function getUserRelationships(userId: string) {
  const { data, error } = await supabase
    .from('user_relationships')
    .select('*, related_user:profiles(id, username, full_name, avatar_url)')
    .eq('user_id', userId);
  return { data, error };
}
