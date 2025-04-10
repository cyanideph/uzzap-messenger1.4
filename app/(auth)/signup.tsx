import React, { useState } from 'react';
import { View, Image, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { Link, router } from 'expo-router';
import { cssInterop } from 'react-native-css-interop';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { useToast } from '~/components/ui/toast';
import { Loading } from '~/components/ui/loading';

cssInterop(View, { className: 'style' });
cssInterop(Image, { className: 'style' });
cssInterop(KeyboardAvoidingView, { className: 'style' });
cssInterop(Text, { className: 'style' });

const StyledView = View;
const StyledImage = Image;
const StyledKeyboardAvoidingView = KeyboardAvoidingView;
const StyledText = Text;

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      showToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement your signup logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      router.replace('/(app)/home');
    } catch (err) {
      setError('Failed to create account');
      showToast('Failed to create account', 'error');
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
              Create Account
            </StyledText>
            <StyledText className="text-gray-500 mt-2">
              Sign up to get started with UzZap
            </StyledText>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
            />

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
              placeholder="Create a password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <Input
              label="Confirm Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
          </CardContent>

          <CardFooter>
            <Button
              onPress={handleSignup}
              loading={loading}
              className="w-full"
            >
              Create Account
            </Button>
          </CardFooter>
        </Card>

        <StyledView className="mt-6 items-center">
          <StyledText className="text-gray-500">
            Already have an account?{' '}
            <Link href="/login">
              <StyledText className="text-primary-600 font-medium">
                Sign In
              </StyledText>
            </Link>
          </StyledText>
        </StyledView>
      </StyledView>

      {loading && <Loading fullScreen />}
    </StyledKeyboardAvoidingView>
  );
}
