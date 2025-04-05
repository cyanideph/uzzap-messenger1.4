import React, { useState } from 'react';
import { View, StatusBar, Platform } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { CustomHeader } from '~/components/ui/custom-header';
import { Sidebar } from '~/components/ui/sidebar';

export default function AppLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <View className="flex-1">
      <StatusBar
        barStyle={isDarkColorScheme ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      
      {/* Custom Header */}
      <CustomHeader 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />
      
      {/* Main Content */}
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: isDarkColorScheme ? '#09090b' : '#ffffff'
          },
        }}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </View>
  );
}
