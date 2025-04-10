import React from 'react';
import { Stack } from 'expo-router';
import { ToastProvider } from '~/components/ui/toast';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '~/components/theme-provider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ToastProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" />
            </Stack>
          </ToastProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
