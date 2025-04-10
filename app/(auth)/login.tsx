import React, { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { cssInterop } from 'react-native-css-interop';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { useToast } from '~/components/ui/toast';
import { Loading } from '~/components/ui/loading';
import { StyleSheet } from 'react-native-css-interop';

cssInterop(View, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(KeyboardAvoidingView, { className: 'style' });
cssInterop(Text, { className: 'style' });

const StyledView = View;
const StyledImage = Image;
const StyledKeyboardAvoidingView = KeyboardAvoidingView;
const StyledText = Text;

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      showToast('Please fill in all fields', 'error');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement your login logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      router.push('/');
    } catch (err) {
      setError('Invalid email or password');
      showToast('Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledKeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-white"
    >
      <StyledView className="flex-1 px-6">
        <StyledView className="items-center justify-center py-12">
          <StyledImage
            source={require('~/assets/images/logo.png')}
            className="w-32 h-32"
            resizeMode="contain"
          />
        </StyledView>

        <Card className="w-full">
          <CardHeader>
            <StyledText className="text-2xl font-bold text-gray-900">
              Welcome Back
            </StyledText>
            <StyledText className="text-gray-500 mt-2">
              Sign in to continue to your account
            </StyledText>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Email"
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Input
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Link href="/" asChild>
              <StyledText className="text-primary-600 text-sm text-right">
                Forgot Password?
              </StyledText>
            </Link>
          </CardContent>

          <CardFooter>
            <Button
              onPress={handleLogin}
              className="w-full"
              disabled={loading}
            >
              {loading ? <Loading /> : 'Sign In'}
            </Button>
          </CardFooter>
        </Card>

        <StyledView className="mt-6 items-center">
          <StyledText className="text-gray-500">
            Don't have an account?{' '}
            <Link href="/signup">
              <StyledText className="text-primary-600 font-medium">
                Sign Up
              </StyledText>
            </Link>
          </StyledText>
        </StyledView>
      </StyledView>
    </StyledKeyboardAvoidingView>
  );
}
