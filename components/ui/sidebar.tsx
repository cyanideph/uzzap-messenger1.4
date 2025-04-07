import React, { useEffect } from 'react';
import { View, TouchableOpacity, ScrollView, Animated, Dimensions, BackHandler } from 'react-native';
import { router, usePathname } from 'expo-router';
import { Text } from '~/components/ui/text';
import { useColorScheme } from '~/lib/useColorScheme';
import { useAuth } from '~/lib/auth-context';
import { 
  Home, 
  MessageSquare, 
  Users, 
  Settings, 
  X, 
  LogOut, 
  Mail, 
  HelpCircle, 
  Info, 
  User
} from 'lucide-react-native';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { isDarkColorScheme } = useColorScheme();
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const screenWidth = Dimensions.get('window').width;
  const sidebarWidth = screenWidth * 0.7; // Sidebar takes 70% of screen width
  const translateX = React.useRef(new Animated.Value(-sidebarWidth)).current;
  
  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isOpen) {
        onClose();
        return true;
      }
      return false;
    });
    
    return () => backHandler.remove();
  }, [isOpen, onClose]);
  
  // Animate sidebar
  useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -sidebarWidth,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen, translateX, sidebarWidth]);
  
  const navigateTo = (path: any) => {
    router.push(path);
    onClose();
  };
  
  const handleSignOut = async () => {
    await signOut();
    onClose();
  };
  
  // Define types for navigation items
  type NavItemPath = string | { pathname: string; params: Record<string, string | number> };
  
  interface NavItem {
    icon: React.ReactNode;
    label: string;
    path: NavItemPath;
    active: boolean;
  }

  // Navigation items
  const navItems: NavItem[] = [
    { 
      icon: <Home size={22} color={pathname === '/(app)/home' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Home', 
      path: '/(app)/home' as const,
      active: pathname === '/(app)/home' 
    },
    { 
      icon: <MessageSquare size={22} color={pathname === '/(app)/chatrooms' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Chatrooms', 
      path: '/(app)/chatrooms' as const,
      active: pathname === '/(app)/chatrooms' 
    },
    { 
      icon: <Mail size={22} color={pathname === '/(app)/messages' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Messages', 
      path: '/(app)/messages' as const,
      active: pathname === '/(app)/messages'
    },
    { 
      icon: <Users size={22} color={pathname === '/(app)/people' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'People', 
      path: '/(app)/people' as const,
      active: pathname === '/(app)/people' 
    },
    { 
      icon: <User size={22} color={pathname.includes('/(app)/profile/') ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Profile', 
      path: { pathname: '/(app)/profile/[id]' as const, params: { id: 'me' } },
      active: pathname.includes('/(app)/profile/') 
    },
    { 
      icon: <Settings size={22} color={pathname === '/(app)/settings' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Settings', 
      path: '/(app)/settings' as const,
      active: pathname === '/(app)/settings' 
    },
    { 
      icon: <HelpCircle size={22} color={pathname === '/(app)/help' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'Help Center', 
      path: '/(app)/help' as const,
      active: pathname === '/(app)/help' 
    },
    { 
      icon: <Info size={22} color={pathname === '/(app)/about' ? "#6366F1" : isDarkColorScheme ? "#fff" : "#000"} />, 
      label: 'About', 
      path: '/(app)/about' as const,
      active: pathname === '/(app)/about' 
    },
  ];
  
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="absolute inset-0 bg-black/50 z-40"
        />
      )}
      
      {/* Sidebar */}
      <Animated.View
        className={`absolute top-0 left-0 bottom-0 z-50 ${isDarkColorScheme ? 'bg-background' : 'bg-white'} border-r border-border`}
        style={{
          width: sidebarWidth,
          transform: [{ translateX }],
        }}
        aria-label="Sidebar"
      >
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b border-border">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
              <Text className="text-white text-lg font-bold">
                {user?.email?.substring(0, 1).toUpperCase() || 'U'}
              </Text>
            </View>
            <View>
              <Text className="font-semibold">
                {user?.email?.split('@')[0] || 'User'}
              </Text>
              <Text className="text-xs text-muted-foreground">{user?.email}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} aria-label="Close Sidebar">
            <Text style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: 0, opacity: 0 }}>
              Close
            </Text>
            <X size={22} color={isDarkColorScheme ? "#fff" : "#000"} />
          </TouchableOpacity>
        </View>
        
        {/* Nav Items */}
        <ScrollView className="flex-1 pt-2">
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              className={`flex-row items-center px-4 py-3 mx-2 rounded-md ${
                item.active ? 'bg-primary/10' : ''
              }`}
              aria-label={item.label}
              onPress={() => {
                if (typeof item.path === 'string') {
                  navigateTo(item.path);
                } else {
                  // Cast to any to avoid TypeScript errors with complex path objects
                  router.push(item.path as any);
                  onClose();
                }
              }}
            >
              <View className="w-8">{item.icon}</View>
              <Text 
                className={`ml-2 font-medium ${
                  item.active ? 'text-primary' : 'text-foreground'
                }`}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Sign Out Button */}
        <TouchableOpacity
          className="flex-row items-center px-4 py-4 border-t border-border"
          onPress={handleSignOut}
          aria-label="Sign Out"
        >
          <LogOut size={22} color={isDarkColorScheme ? "#fff" : "#000"} />
          <Text className="ml-2 font-medium">Sign Out</Text>
        </TouchableOpacity>
      </Animated.View>
    </>
  );
}
