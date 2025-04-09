import React from 'react';
import { View, TouchableOpacity, Image, StatusBar, Platform } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { Menu } from 'lucide-react-native';
import { Bell } from 'lucide-react-native';
import { router, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface CustomHeaderProps {
  title?: string;
  onOpenSidebar?: () => void;
  rightComponent?: React.ReactNode;
}

// Map routes to titles
const routeTitles: { [key: string]: string } = {
  '/chatrooms': 'Chatrooms',
  '/messages': 'Messages',
  '/people': 'People',
  '/friends': 'Friends',
  '/settings': 'Settings',
  '/help': 'Help Center',
  '/about': 'About',
};

export function CustomHeader({ title, onOpenSidebar, rightComponent }: CustomHeaderProps) {
  const { isDarkColorScheme } = useColorScheme();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  
  // Get the route title or use provided title
  const routeTitle = title || routeTitles[pathname] || '';

  return (
    <View
      className={`px-4 border-b z-10 ${
        isDarkColorScheme ? 'bg-background border-border' : 'bg-white border-gray-200'
      }`}
      style={{
        paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : insets.top,
        paddingBottom: 10,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onOpenSidebar}
            className="mr-3 p-1"
            aria-label="Open Sidebar"
          >
            <Text style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: 0, opacity: 0 }}>
              Menu
            </Text>
            <Menu size={24} color={isDarkColorScheme ? "#fff" : "#000"} />
          </TouchableOpacity>
          {pathname === '/home' ? (
            <Image
              source={require('~/assets/images/logo.png')}
              style={{ width: 100, height: 30 }}
              resizeMode="contain"
            />
          ) : (
            <Text className="text-lg font-semibold">{routeTitle}</Text>
          )}
        </View>
        
        <View className="flex-row items-center">
          {rightComponent ? (
            rightComponent
          ) : (
            <TouchableOpacity 
              className="p-2"
              onPress={() => router.push('/(app)/messages')}
              aria-label="Messages"
            >
              <Text style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: 0, opacity: 0 }}>
                Messages
              </Text>
              <Bell size={22} color={isDarkColorScheme ? "#fff" : "#000"} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}
