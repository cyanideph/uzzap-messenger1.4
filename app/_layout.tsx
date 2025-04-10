import React from 'react';
import { Stack } from 'expo-router';
import { ToastProvider } from '~/components/ui/toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '~/components/theme-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { enableScreens } from 'react-native-screens';

// Enable screens for better performance
enableScreens();

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer>
          <ThemeProvider>
            <ToastProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
              </Stack>
            </ToastProvider>
          </ThemeProvider>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
