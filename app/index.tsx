import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '~/lib/auth-context';
import { Text } from '~/components/ui/text';

export default function IndexScreen() {
  const { user, loading } = useAuth();

  // Show a simple loading screen while authentication is being checked
  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-background">
        <Image
          source={require('~/assets/images/splash-logo.png')}
          style={{ width: 150, height: 150 }}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#6366F1" style={{ marginTop: 20 }} />
        <Text className="mt-4 text-muted-foreground">Loading...</Text>
      </View>
    );
  }

  // Redirect based on authentication status
  if (user) {
    // User is authenticated, redirect to home screen in the (app) group
    return <Redirect href="/(app)/home" />;
  } else {
    // User is not authenticated, redirect to login in the (auth) group
    return <Redirect href="/(auth)/login" />;
  }
}
