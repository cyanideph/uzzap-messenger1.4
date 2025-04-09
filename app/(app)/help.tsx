import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { Search, ChevronDown, ChevronUp, MessageSquare, User, Users, Shield, Mail, HelpCircle } from 'lucide-react-native';
import { cn } from '~/lib/utils';
import { useColorScheme } from '~/lib/useColorScheme';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export default function HelpCenterScreen() {
  const { isDarkColorScheme } = useColorScheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQs, setExpandedFAQs] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const faqData: FAQItem[] = [
    {
      question: 'How do I join a regional chatroom?',
      answer: 'Navigate to the Chatrooms tab, browse through the regions and provinces, and tap on the chatroom you want to join. You\'ll then be able to participate in the conversation.',
      category: 'chatrooms'
    },
    {
      question: 'Can I create my own chatroom?',
      answer: 'Currently, chatrooms are organized by Philippine regions and provinces. Custom user-created chatrooms will be available in a future update.',
      category: 'chatrooms'
    },
    {
      question: 'How do I send a direct message to another user?',
      answer: 'Visit a user\'s profile or find them in the People tab, then tap on the "Message" button to start a direct conversation.',
      category: 'messages'
    },
    {
      question: 'How do I change my profile information?',
      answer: 'Go to your profile page by tapping on "Account Details" in the Settings tab, then tap the edit button to update your information.',
      category: 'profile'
    },
    {
      question: 'How do I switch between light and dark mode?',
      answer: 'Go to the Settings tab and toggle the "Dark Mode" switch. Your preference will be saved for future sessions.',
      category: 'settings'
    },
    {
      question: 'Is my data secure on UzZap?',
      answer: 'Yes, UzZap uses Supabase for secure authentication and data storage. We prioritize your privacy and data security.',
      category: 'security'
    },
    {
      question: 'How do I follow other users?',
      answer: 'Visit a user\'s profile in the People tab and tap the "Follow" button to follow them and see their updates.',
      category: 'profile'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Account deletion functionality is coming soon. In the meantime, please contact support for assistance with your account.',
      category: 'account'
    },
  ];
  
  const toggleFAQ = (question: string) => {
    if (expandedFAQs.includes(question)) {
      setExpandedFAQs(expandedFAQs.filter(q => q !== question));
    } else {
      setExpandedFAQs([...expandedFAQs, question]);
    }
  };
  
  const filteredFAQs = faqData.filter(faq => {
    const matchesSearch = 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!selectedCategory) return matchesSearch;
    return matchesSearch && faq.category === selectedCategory;
  });
  
  const categories = [
    { name: 'Chatrooms', icon: <MessageSquare size={20} className="text-primary" />, value: 'chatrooms' },
    { name: 'Messages', icon: <Mail size={20} className="text-primary" />, value: 'messages' },
    { name: 'Profile', icon: <User size={20} className="text-primary" />, value: 'profile' },
    { name: 'Community', icon: <Users size={20} className="text-primary" />, value: 'community' },
    { name: 'Security', icon: <Shield size={20} className="text-primary" />, value: 'security' },
  ];

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'Help Center',
        }}
      />

      <ScrollView className="flex-1">
        <View className="p-4">
          {/* Header */}
          <View className="items-center mb-6">
            <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
              <HelpCircle size={32} className="text-primary" />
            </View>
            <Text className="text-2xl font-bold text-center">How can we help?</Text>
            <Text className="text-muted-foreground text-center">
              Find answers to common questions about using UzZap
            </Text>
          </View>
          
          {/* Search */}
          <View className="flex-row items-center bg-muted rounded-lg px-3 mb-6">
            <Search size={18} className="text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              className="flex-1 h-12 border-0 bg-transparent"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          {/* Categories */}
          <Text className="text-lg font-semibold mb-3">Browse by Category</Text>
          <View className="flex-row flex-wrap mb-6">
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.value}
                className={cn(
                  "bg-muted rounded-lg p-3 m-1 items-center flex-1 min-w-[30%]",
                  selectedCategory === category.value && "bg-primary/10"
                )}
                onPress={() => setSelectedCategory(
                  selectedCategory === category.value ? null : category.value
                )}
              >
                <View className="mb-2">{category.icon}</View>
                <Text className={cn(
                  "text-center",
                  selectedCategory === category.value && "text-primary font-medium"
                )}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* FAQs */}
          <Text className="text-lg font-semibold mb-3">Frequently Asked Questions</Text>
          <Card className="mb-6">
            <CardContent className="p-4">
              {filteredFAQs.length > 0 ? (
                <View className="space-y-2">
                  {filteredFAQs.map((faq, index) => (
                    <View key={index}>
                      {index > 0 && <Separator className="my-2" />}
                      <TouchableOpacity
                        className="py-2"
                        onPress={() => toggleFAQ(faq.question)}
                      >
                        <View className="flex-row justify-between items-center">
                          <Text className="font-semibold flex-1 pr-2">{faq.question}</Text>
                          {expandedFAQs.includes(faq.question) ? (
                            <ChevronUp size={18} className="text-muted-foreground" />
                          ) : (
                            <ChevronDown size={18} className="text-muted-foreground" />
                          )}
                        </View>
                        
                        {expandedFAQs.includes(faq.question) && (
                          <Text className="text-muted-foreground mt-2">{faq.answer}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View className="py-4 items-center">
                  <Text className="text-muted-foreground text-center">
                    No results found for "{searchQuery}"
                  </Text>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onPress={() => {
                      setSearchQuery('');
                      setSelectedCategory(null);
                    }}
                  >
                    Clear Search
                  </Button>
                </View>
              )}
            </CardContent>
          </Card>
          
          {/* Contact Support */}
          <Text className="text-lg font-semibold mb-3">Need More Help?</Text>
          <Card>
            <CardContent className="p-4">
              <Text className="text-foreground mb-3">
                Can't find what you're looking for? Contact our support team for personalized assistance.
              </Text>
              <Button>
                <Mail size={18} className="mr-2" />
                <Text>Contact Support</Text>
              </Button>
            </CardContent>
          </Card>
        </View>
      </ScrollView>
    </View>
  );
}
