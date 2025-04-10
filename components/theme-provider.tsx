import React from 'react';
import { useColorScheme } from 'react-native';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const colorScheme = useColorScheme();

  return <>{children}</>;
}
