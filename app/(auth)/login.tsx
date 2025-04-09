import React, { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { styled } from 'nativewind/styled';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { Toast } from '~/components/ui/toast';
import { Loading } from '~/components/ui/loading';

const StyledView = styled(View);
const StyledImage = styled(Image);
const StyledKeyboardAvoidingView = styled(KeyboardAvoidingView);
const StyledText = styled(Text);

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showToast, setShowToast] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      setShowToast(true);
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement your login logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      router.replace('/(app)');
    } catch (err) {
      setError('Invalid email or password');
      setShowToast(true);
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
            source={require('@/assets/images/logo.png')}
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

            <Link href="/forgot-password" className="text-right">
              <StyledText className="text-primary-600 text-sm">
                Forgot Password?
              </StyledText>
            </Link>
          </CardContent>

          <CardFooter>
            <Button
              onPress={handleLogin}
              loading={loading}
              className="w-full"
            >
              Sign In
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

      {showToast && (
        <Toast
          message={error}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}

      {loading && <Loading fullScreen />}
    </StyledKeyboardAvoidingView>
  );
}
