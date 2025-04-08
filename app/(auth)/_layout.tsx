import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

export default function AuthLayout() {
  const { isDarkColorScheme } = useColorScheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { 
          backgroundColor: isDarkColorScheme ? '#09090b' : '#ffffff'
        },
      }}
    />
  );
}
