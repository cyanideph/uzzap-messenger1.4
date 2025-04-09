import React, { useState } from 'react';
import { View, StatusBar } from 'react-native';
import { Stack } from 'expo-router';
import { useColorScheme } from '~/lib/useColorScheme';
import { CustomHeader } from '~/components/ui/custom-header';
import { Sidebar } from '~/components/ui/sidebar';

export default function AppLayout() {
  const { isDarkColorScheme } = useColorScheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  return (
    <View className="flex-1 bg-background">
      <CustomHeader 
        onOpenSidebar={() => setIsSidebarOpen(true)} 
      />
      
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { 
            backgroundColor: isDarkColorScheme ? '#09090b' : '#ffffff'
          },
        }}
      />
      
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </View>
  );
}
