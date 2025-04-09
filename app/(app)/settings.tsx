import React, { useState } from 'react';
import { View, ScrollView, Switch, Alert, ActivityIndicator, TouchableOpacity, Image, Animated } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
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
  Settings,
} from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import { Avatar } from '~/components/ui/avatar';
import { cn } from '~/lib/utils';
import { LucideIcon } from 'lucide-react-native';

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

  const renderProfileSection = () => (
    <Card className="mx-4 mb-4">
      <CardContent className="p-4">
        <View className="flex-row items-center space-x-4">
          <TouchableOpacity onPress={uploadAvatar} disabled={isLoading}>
            <View className="relative">
              <Avatar
                src={avatarUrl || undefined}
                alt={user?.email?.split('@')[0] || 'User'}
                size="lg"
                fallback={(user?.email?.[0] || 'U').toUpperCase()}
              />
              <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full">
                <Camera className="text-primary-foreground" size={16} />
              </View>
            </View>
          </TouchableOpacity>
          <View className="flex-1">
            <Text className="text-xl font-bold">{user?.email?.split('@')[0]}</Text>
            <Text className="text-muted-foreground">{user?.email}</Text>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onPress={() => router.push('/profile')}
            >
              <Text>Edit Profile</Text>
            </Button>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  const renderSettingsItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    rightComponent,
  }: {
    icon: LucideIcon;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
  }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          onPress={onPress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
        >
          <Card className="mx-4 mb-2">
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3">
                  <View className="bg-primary/10 p-2 rounded-full">
                    <Icon size={20} className="text-primary" />
                  </View>
                  <View>
                    <Text className="font-medium">{title}</Text>
                    {subtitle && (
                      <Text className="text-sm text-muted-foreground">
                        {subtitle}
                      </Text>
                    )}
                  </View>
                </View>
                {rightComponent || <ChevronRight size={20} className="text-muted-foreground" />}
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <ScrollView className="flex-1 bg-background">
      {renderProfileSection()}

      <View className="mb-4">
        <Text className="text-lg font-semibold px-4 mb-2">Preferences</Text>
        {renderSettingsItem({
          icon: isDarkColorScheme ? Moon : Sun,
          title: 'Dark Mode',
          subtitle: 'Switch between light and dark theme',
          rightComponent: (
            <Switch
              value={isDarkColorScheme}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={isDarkColorScheme ? '#f5dd4b' : '#f4f3f4'}
            />
          ),
        })}
        {renderSettingsItem({
          icon: Bell,
          title: 'Push Notifications',
          subtitle: 'Receive push notifications',
          rightComponent: (
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={pushNotifications ? '#f5dd4b' : '#f4f3f4'}
            />
          ),
        })}
        {renderSettingsItem({
          icon: Mail,
          title: 'Email Notifications',
          subtitle: 'Receive email notifications',
          rightComponent: (
            <Switch
              value={emailNotifications}
              onValueChange={setEmailNotifications}
              trackColor={{ false: '#767577', true: '#81b0ff' }}
              thumbColor={emailNotifications ? '#f5dd4b' : '#f4f3f4'}
            />
          ),
        })}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold px-4 mb-2">Account</Text>
        {renderSettingsItem({
          icon: User,
          title: 'Profile',
          subtitle: 'Manage your profile information',
          onPress: () => router.push('/profile'),
        })}
        {renderSettingsItem({
          icon: Shield,
          title: 'Privacy',
          subtitle: 'Manage your privacy settings',
          onPress: () => router.push('/privacy'),
        })}
      </View>

      <View className="mb-4">
        <Text className="text-lg font-semibold px-4 mb-2">Support</Text>
        {renderSettingsItem({
          icon: HelpCircle,
          title: 'Help Center',
          subtitle: 'Get help and support',
          onPress: () => router.push('/help'),
        })}
        {renderSettingsItem({
          icon: Globe,
          title: 'About',
          subtitle: 'Learn more about the app',
          onPress: () => router.push('/about'),
        })}
      </View>

      <View className="mb-8">
        {renderSettingsItem({
          icon: LogOut,
          title: 'Sign Out',
          subtitle: 'Log out of your account',
          onPress: promptSignOut,
        })}
      </View>
    </ScrollView>
  );
}
