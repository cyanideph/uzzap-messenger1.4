import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth-context';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

export default function AuthLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const { user } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user) {
      router.replace('/home');
    }
  }, [user]);

  return (
    <React.Fragment>
      <StatusBar
        style={isDarkColorScheme ? 'light' : 'dark'}
        backgroundColor="transparent"
        translucent
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: isDarkColorScheme ? '#09090b' : '#ffffff'
          },
          animation: Platform.OS === 'ios' ? 'default' : 'none',
        }}
      />
    </React.Fragment>
  );
}
