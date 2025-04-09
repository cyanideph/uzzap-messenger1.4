import React, { useState } from 'react';
import { View, ScrollView, Switch, Alert, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { useAuth } from '~/lib/auth-context';
import { router } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import {
  Moon,
  Sun,
  User,
  Bell,
  Shield,
  HelpCircle,
  LogOut,
  ChevronRight,
  Mail,
  Globe,
  Camera,
} from 'lucide-react-native';
import { supabase } from '~/lib/supabase';

export default function SettingsScreen() {
  const { user, signOut } = useAuth();
  const { isDarkColorScheme, toggleColorScheme } = useColorScheme();
  const [isLoading, setIsLoading] = useState(false);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(user?.user_metadata?.avatar_url || null);

  const uploadAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
        base64: true,
      });

      if (!result.canceled && result.assets[0].base64) {
        setIsLoading(true);

        // Upload image to Supabase Storage
        const fileName = `avatar_${user?.id}_${Date.now()}.jpg`;
        const filePath = `avatars/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('user-content')
          .upload(filePath, decode(result.assets[0].base64), {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          Alert.alert('Error', 'Failed to upload avatar');
          console.error('Upload error:', uploadError);
          return;
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('user-content')
          .getPublicUrl(filePath);

        // Update user metadata
        const { error: updateError } = await supabase.auth.updateUser({
          data: { avatar_url: publicUrl },
        });

        if (updateError) {
          Alert.alert('Error', 'Failed to update profile');
          console.error('Update error:', updateError);
          return;
        }

        setAvatarUrl(publicUrl);
        Alert.alert('Success', 'Avatar updated successfully');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'An error occurred while uploading avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const promptSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', onPress: handleSignOut, style: 'destructive' },
      ]
    );
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      // Navigation will be handled by auth-context.tsx
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Unable to sign out');
      setIsLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-6">Settings</Text>
        
        {/* Account Section */}
        <Card className="p-4 mb-6 border border-border">
          <View className="flex-row items-center mb-4">
            <TouchableOpacity 
              onPress={uploadAvatar}
              className="relative mr-3"
            >
              {avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-16 h-16 rounded-full"
                />
              ) : (
                <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                  <Text className="text-primary-foreground text-xl font-bold">
                    {user?.email?.substring(0, 1).toUpperCase() || 'U'}
                  </Text>
                </View>
              )}
              <View className="absolute right-0 bottom-0 bg-primary rounded-full p-1">
                <Camera size={12} color="#fff" />
              </View>
            </TouchableOpacity>
            <View className="flex-1">
              <Text className="font-semibold">
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text className="text-sm text-muted-foreground">{user?.email}</Text>
            </View>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onPress={() => router.push({
                pathname: "/profile/[id]",
                params: { id: 'me' }
              })}
            >
              <Text className="text-xs">Edit</Text>
            </Button>
          </View>
          
          <Separator className="mb-4" />
          
          <View className="space-y-3">
            <Button
              variant="ghost"
              className="justify-start h-12 pl-1"
              onPress={() => router.push({
                pathname: "/profile/[id]",
                params: { id: 'me' }
              })}
            >
              <User size={18} className="text-primary mr-3" />
              <Text>Account Details</Text>
              <ChevronRight size={18} className="text-muted-foreground ml-auto" />
            </Button>
            
            <Button
              variant="ghost"
              className="justify-start h-12 pl-1"
              onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
            >
              <Shield size={18} className="text-primary mr-3" />
              <Text>Privacy & Security</Text>
              <ChevronRight size={18} className="text-muted-foreground ml-auto" />
            </Button>
          </View>
        </Card>
        
        {/* Preferences Section */}
        <Text className="text-lg font-semibold mb-3">Preferences</Text>
        <Card className="p-4 mb-6 border border-border">
          <View className="space-y-4">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                {isDarkColorScheme ? (
                  <Moon size={18} className="text-primary mr-3" />
                ) : (
                  <Sun size={18} className="text-primary mr-3" />
                )}
                <Text>Dark Mode</Text>
              </View>
              <Switch
                value={isDarkColorScheme}
                onValueChange={toggleColorScheme}
                trackColor={{ false: '#e5e7eb', true: '#6366F1' }}
                thumbColor="#ffffff"
              />
            </View>
            
            <Separator />
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Bell size={18} className="text-primary mr-3" />
                <Text>Push Notifications</Text>
              </View>
              <Switch
                value={pushNotifications}
                onValueChange={setPushNotifications}
                trackColor={{ false: '#e5e7eb', true: '#6366F1' }}
                thumbColor="#ffffff"
              />
            </View>
            
            <Separator />
            
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <Mail size={18} className="text-primary mr-3" />
                <Text>Email Notifications</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#e5e7eb', true: '#6366F1' }}
                thumbColor="#ffffff"
              />
            </View>
            
            <Separator />
            
            <Button
              variant="ghost"
              className="justify-start h-12 pl-1"
              onPress={() => Alert.alert('Language', 'Language settings coming soon!')}
            >
              <Globe size={18} className="text-primary mr-3" />
              <Text>Language</Text>
              <Text className="text-muted-foreground ml-auto mr-1">English</Text>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Button>
          </View>
        </Card>
        
        {/* Support Section */}
        <Text className="text-lg font-semibold mb-3">Support</Text>
        <Card className="p-4 mb-6 border border-border">
          <View className="space-y-3">
            <Button
              variant="ghost"
              className="justify-start h-12 pl-1"
              onPress={() => router.push('/help')}
            >
              <HelpCircle size={18} className="text-primary mr-3" />
              <Text>Help Center</Text>
              <ChevronRight size={18} className="text-muted-foreground ml-auto" />
            </Button>
            
            <Separator />
            
            <Button
              variant="ghost"
              className="justify-start h-12 pl-1"
              onPress={() => router.push('/about')}
            >
              <Text className="mr-3">ℹ️</Text>
              <Text>About UzZap</Text>
              <Text className="text-muted-foreground ml-auto mr-1">v1.0.0</Text>
              <ChevronRight size={18} className="text-muted-foreground" />
            </Button>
          </View>
        </Card>
        
        {/* Sign Out Button */}
        <Button
          variant="destructive"
          className="mt-2"
          onPress={promptSignOut}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <LogOut size={18} className="mr-2" />
              <Text className="text-white">Sign Out</Text>
            </>
          )}
        </Button>
      </View>
    </ScrollView>
  );
}
