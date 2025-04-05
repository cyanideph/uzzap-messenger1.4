import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';

export default function AuthLayout() {
  const { isDarkColorScheme } = useColorScheme();
  
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        contentStyle: { backgroundColor: isDarkColorScheme ? '#000' : '#fff' },
      }}
    />
  );
}
