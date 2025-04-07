import React from 'react';
import { View, TouchableOpacity, StyleSheet, StatusBar, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { Menu, Bell } from 'lucide-react-native';
import { router, usePathname, useLocalSearchParams } from 'expo-router';

interface CustomHeaderProps {
  title?: string;
  onOpenSidebar: () => void;
  rightComponent?: React.ReactNode;
}

export function CustomHeader({ title, onOpenSidebar, rightComponent }: CustomHeaderProps) {
  const { isDarkColorScheme } = useColorScheme();
  const pathname = usePathname();
  
  // Determine title based on current route if not provided
  const getRouteTitle = () => {
    if (title) return title;

    const { title: paramTitle } = useLocalSearchParams();
    
    if (paramTitle) {
      return String(paramTitle);
    }
    
    const routeTitles: Record<string, string> = {
      '/(app)/home': 'Home',
      '/(app)/chatrooms': 'Chatrooms',
      '/(app)/messages': 'Messages',
      '/(app)/people': 'People',
      '/(app)/settings': 'Settings',
      '/(app)/help': 'Help Center',
      '/(app)/about': 'About UzZap',
    };

    if (pathname in routeTitles) {
      return routeTitles[pathname];
    }

    return 'UzZap';
  };
  
  const routeTitle = getRouteTitle();

  return (
    <View
      className={`px-4 border-b z-10 ${
        isDarkColorScheme ? 'bg-background border-border' : 'bg-white border-gray-200'
      } pt-[${StatusBar.currentHeight ? StatusBar.currentHeight + 10 : 10}px] pb-2.5`}
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
