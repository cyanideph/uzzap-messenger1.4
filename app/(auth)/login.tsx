import React, { useState } from 'react';
import { View, Image, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card } from '~/components/ui/card';
import { useAuth } from '~/lib/auth-context';
import { Mail, Lock, LogIn } from 'lucide-react-native';
import { Badge } from '~/components/ui/badge';
import { Text } from '~/components/ui/text';
import { Title } from '~/components/ui/title';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        Alert.alert('Error', error.message || 'Failed to sign in');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-background">
      <View className="min-h-screen justify-center items-center p-6">
        <View className="items-center mb-8">
          <Badge className="mb-6 py-1.5 px-4" variant="outline">
            <LogIn size={14} className="mr-1" />
            <Text className="text-xs font-medium">Member Access</Text>
          </Badge>
          <Image 
            source={require('~/assets/images/logo.png')} 
            style={{ width: 180, height: 60 }}
            className="mb-4"
            resizeMode="contain"
          />
          <Title level={1} className="text-center">Welcome Back</Title>
          <Text variant="contrast" className="text-sm mt-1 text-center">Sign in to your UzZap account</Text>
        </View>

        <Card className="w-full max-w-md p-6 mb-6">
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
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                  className="flex-1 border-0 h-12"
                />
              </View>
            </View>

            <Button
              onPress={handleLogin}
              disabled={loading}
              className="w-full h-12 mt-2"
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text>Login</Text>
              )}
            </Button>
          </View>
        </Card>

        <View className="flex-row justify-center mt-2">
          <Text variant="contrast" className="text-base">Don't have an account? </Text>
          <Text 
            className="text-primary font-medium"
            onPress={() => router.push('/(auth)/signup' as any)}
          >
            Sign up
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
