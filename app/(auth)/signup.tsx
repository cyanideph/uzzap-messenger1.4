import React, { useState } from 'react';
import { View, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card } from '~/components/ui/card';
import { useAuth } from '~/lib/auth-context';
import Mail from '~/lib/icons/Mail';
import { Lock } from '~/lib/icons/Lock';
import User from '~/lib/icons/User';
import Shield from '~/lib/icons/Shield';
import ResponsiveLogo from '~/components/ResponsiveLogo';
import { Text } from '~/components/ui/text';
import { Title } from '~/components/ui/title';
import { cn } from '~/lib/utils';
import { useColorScheme } from '~/lib/useColorScheme';

export default function SignupScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signUp(email, password);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign up');
      } else {
        Alert.alert(
          'Success',
          'Registration successful! Please check your email for verification.',
          [{ text: 'OK', onPress: () => router.push('/(auth)/login' as any) }]
        );
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background" contentContainerStyle={{ flexGrow: 1 }}>
      <View className="min-h-screen justify-center items-center p-6">
        <View className="items-center mb-8">
          <ResponsiveLogo />
          <Title level={1} className="text-center">Create an Account</Title>
          <Text variant="contrast" className="text-sm mt-1 text-center">Join the Philippine community on UzZap</Text>
        </View>

        <Card className="w-full max-w-md p-6 mb-6 shadow-md">
          <View className="space-y-5">
            <View>
              <Text variant="contrast" className="text-sm font-medium mb-1.5">Email</Text>
              <View className="flex-row items-center border border-input rounded-md bg-background overflow-hidden">
                <View className="py-3 pl-3 pr-2">
                  <Mail size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  className="flex-1 border-0 h-12"
                />
              </View>
            </View>

            <View>
              <Text variant="contrast" className="text-sm font-medium mb-1.5">Password</Text>
              <View className="flex-row items-center border border-input rounded-md bg-background overflow-hidden">
                <View className="py-3 pl-3 pr-2">
                  <Lock size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="Create a password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 border-0 h-12"
                />
                <Text variant="contrast" className="text-xs mt-1">Must be at least 6 characters</Text>
              </View>
            </View>

            <View>
              <Text variant="contrast" className="text-sm font-medium mb-1.5">Confirm Password</Text>
              <View className="flex-row items-center border border-input rounded-md bg-background overflow-hidden">
                <View className="py-3 pl-3 pr-2">
                  <Shield size={18} className="text-muted-foreground" />
                </View>
                <Input
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  className="flex-1 border-0 h-12"
                />
              </View>
            </View>

            <Button
              onPress={handleSignup}
              disabled={loading}
              className="w-full h-12 mt-4 rounded-full"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className={cn(isDarkColorScheme ? "text-white" : "")}>Create Account</Text>
              )}
            </Button>
          </View>
        </Card>

        <View className="flex-row justify-center mt-4">
          <Text variant="contrast" className="text-base">Already have an account? </Text>
          <Text
            className="text-primary font-medium"
            onPress={() => router.push('/(auth)/login' as any)}
          >
            Login
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
