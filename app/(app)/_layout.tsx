import React, { useState, useEffect } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { CustomHeader } from '~/components/ui/custom-header';
import { Sidebar } from '~/components/ui/sidebar';
import { useAuth } from '~/lib/auth-context';
import { Animated } from 'react-native';
import { cn } from '~/lib/utils';

export default function AppLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const { user } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarAnimation = new Animated.Value(0);
  
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    }
  }, [user]);

  useEffect(() => {
    Animated.timing(sidebarAnimation, {
      toValue: isSidebarOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isSidebarOpen]);

  const overlayStyle = {
    opacity: sidebarAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 0.5],
    }),
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar
        barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent={true}
      />
      
      <CustomHeader 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
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
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {isSidebarOpen && (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: '#000',
            },
            overlayStyle,
          ]}
        />
      )}
    </View>
  );
}
