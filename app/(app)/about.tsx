import React from 'react';
import { View, ScrollView, Linking, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Card, CardContent } from '~/components/ui/card';
import { Separator } from '~/components/ui/separator';
import { 
  Heart, 
  MessageSquare, 
  MapPin, 
  Users, 
  Moon, 
  Shield, 
  Globe, 
  Star, 
  Mail,
  Code,
  Database,
  Palette
} from 'lucide-react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { cn } from '~/lib/utils';

export default function AboutScreen() {
  const { isDarkColorScheme } = useColorScheme();

  const appFeatures = [
    {
      icon: <MessageSquare size={20} className="text-primary" />,
      title: 'Regional Chatrooms',
      description: 'Connect with people from different provinces and regions across the Philippines'
    },
    {
      icon: <Users size={20} className="text-primary" />,
      title: 'Community Building',
      description: 'Create and join communities based on interests, locations, and activities'
    },
    {
      icon: <Mail size={20} className="text-primary" />,
      title: 'Direct Messaging',
      description: 'Private conversations with other users in a secure environment'
    },
    {
      icon: <MapPin size={20} className="text-primary" />,
      title: 'Location-based Networking',
      description: 'Discover people and conversations near you or from your hometown'
    },
    {
      icon: <Moon size={20} className="text-primary" />,
      title: 'Dark/Light Mode',
      description: 'Personalize your experience with theme options that save your preferences'
    },
    {
      icon: <Shield size={20} className="text-primary" />,
      title: 'Secure Authentication',
      description: 'Powered by Supabase for secure and reliable user authentication'
    }
  ];

  const techStack = [
    {
      icon: <Code size={20} className="text-primary" />,
      name: 'React Native with Expo',
      description: 'Cross-platform mobile development'
    },
    {
      icon: <Database size={20} className="text-primary" />,
      name: 'Supabase',
      description: 'Backend and authentication'
    },
    {
      icon: <Palette size={20} className="text-primary" />,
      name: 'NativeWind & Tailwind CSS',
      description: 'Styling and theming'
    }
  ];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'About UzZap',
        }}
      />

      <ScrollView className="flex-1">
        <View className="p-4">
          {/* App Logo and Version */}
          <View className="items-center mb-6">
            <View className="w-24 h-24 bg-primary/10 rounded-2xl items-center justify-center mb-3">
              <Text className="text-primary text-4xl font-bold">UZ</Text>
            </View>
            <Text className="text-2xl font-bold text-center">UzZap</Text>
            <Text className="text-muted-foreground text-center">Version 1.0.0</Text>
          </View>

          {/* App Description */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <Text className="text-lg font-semibold mb-2">About UzZap Chat</Text>
              <Text className="text-foreground mb-4">
                UzZap is a chat application designed to connect people across the Philippines through regional
                chatrooms, direct messaging, and community building. Our mission is to bring Filipinos together
                regardless of where they are located.
              </Text>
              <Text className="text-foreground font-medium">
                Developed by UzZap Cy
              </Text>
            </CardContent>
          </Card>

          {/* Features */}
          <Text className="text-lg font-semibold mb-3">Features</Text>
          <Card className="mb-6">
            <CardContent className="p-4">
              <View className="space-y-4">
                {appFeatures.map((feature, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Separator className="my-2" />}
                    <View className="flex-row">
                      <View className="mr-3 mt-1">{feature.icon}</View>
                      <View className="flex-1">
                        <Text className="font-semibold">{feature.title}</Text>
                        <Text className="text-muted-foreground text-sm">
                          {feature.description}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Technology Stack */}
          <Text className="text-lg font-semibold mb-3">Built With</Text>
          <Card className="mb-6">
            <CardContent className="p-4">
              <View className="space-y-4">
                {techStack.map((tech, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <Separator className="my-2" />}
                    <View className="flex-row">
                      <View className="mr-3 mt-1">{tech.icon}</View>
                      <View className="flex-1">
                        <Text className="font-semibold">{tech.name}</Text>
                        <Text className="text-muted-foreground text-sm">
                          {tech.description}
                        </Text>
                      </View>
                    </View>
                  </React.Fragment>
                ))}
              </View>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <Text className="text-lg font-semibold mb-3">Contact & Support</Text>
              <View className="space-y-3">
                <Button
                  variant="outline"
                  className="justify-start h-12"
                  onPress={() => Linking.openURL('mailto:support@uzzap.com')}
                >
                  <Mail size={18} className="text-primary mr-3" />
                  <Text>support@uzzap.com</Text>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start h-12"
                  onPress={() => Linking.openURL('https://uzzap.com')}
                >
                  <Globe size={18} className="text-primary mr-3" />
                  <Text>www.uzzap.com</Text>
                </Button>
              </View>
            </CardContent>
          </Card>

          {/* Copyright */}
          <View className="items-center mt-2 mb-8">
            <Text className="text-muted-foreground text-center text-sm">
              © 2025 UzZap Chat. All rights reserved.
            </Text>
            <Text className="text-muted-foreground text-center text-sm mt-1">
              Made with <Heart size={12} className="text-red-500" /> by UzZap Cy
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
