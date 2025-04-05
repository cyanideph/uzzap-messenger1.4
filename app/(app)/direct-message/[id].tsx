import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, ArrowLeft, MoreVertical, Phone, Video, User } from 'lucide-react-native';
import { useColorScheme } from '~/lib/useColorScheme';

// Direct message type
interface DirectMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

// Mock data for DM messages
const generateMockMessages = (recipientId: string): DirectMessage[] => {
  const baseMessages = [
    {
      id: '1',
      userId: 'user1',
      userName: 'You',
      userAvatar: null,
      text: 'Hey there! How are you doing?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isCurrentUser: true,
    },
    {
      id: '2',
      userId: recipientId,
      userName: 'User',
      userAvatar: null,
      text: 'I\'m good! How about you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1.5), // 1.5 hours ago
      isCurrentUser: false,
    },
    {
      id: '3',
      userId: 'user1',
      userName: 'You',
      userAvatar: null,
      text: 'Doing well! Just checking out this new app called UzZap. It\'s pretty cool!',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), // 1 hour ago
      isCurrentUser: true,
    },
    {
      id: '4',
      userId: recipientId,
      userName: 'User',
      userAvatar: null,
      text: 'Oh nice! I\'ve been using it too. I love how it connects people from all over the Philippines.',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isCurrentUser: false,
    },
    {
      id: '5',
      userId: 'user1',
      userName: 'You',
      userAvatar: null,
      text: 'Absolutely! Which region are you from?',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      isCurrentUser: true,
    },
    {
      id: '6',
      userId: recipientId,
      userName: 'User',
      userAvatar: null,
      text: 'I\'m from Cebu! How about you?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      isCurrentUser: false,
    },
  ];

  return baseMessages;
};

export default function DirectMessageScreen() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
  const { user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Load mock messages
    if (id) {
      setMessages(generateMockMessages(id));
    }
  }, [id]);

  const sendMessage = () => {
    if (message.trim() === '') return;

    const newMessage: DirectMessage = {
      id: Date.now().toString(),
      userId: 'user1',
      userName: 'You',
      userAvatar: null,
      text: message,
      timestamp: new Date(),
      isCurrentUser: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');

    // Scroll to bottom after sending message
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageDate = (timestamp: Date) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return 'Today';
    } else if (
      new Date(today.setDate(today.getDate() - 1)).toDateString() === messageDate.toDateString()
    ) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };

  // Group messages by date
  const groupedMessages: { [key: string]: DirectMessage[] } = {};
  messages.forEach(msg => {
    const dateString = renderMessageDate(msg.timestamp);
    if (!groupedMessages[dateString]) {
      groupedMessages[dateString] = [];
    }
    groupedMessages[dateString].push(msg);
  });

  // Flatten the grouped messages for FlatList
  const flatListData: (DirectMessage | { id: string; isDateDivider: true; date: string })[] = [];
  Object.entries(groupedMessages).forEach(([date, msgs]) => {
    flatListData.push({ id: `date-${date}`, isDateDivider: true, date });
    flatListData.push(...msgs);
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <TouchableOpacity 
              className="flex-row items-center" 
              onPress={() => router.push({
                pathname: "/profile/[id]",
                params: { id, username }
              })}
            >
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                <Text className="text-primary font-semibold">
                  {username?.substring(0, 1).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text className="font-semibold">{username || 'User'}</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <ArrowLeft size={24} color={isDarkColorScheme ? '#fff' : '#000'} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity className="mr-5">
                <Phone size={22} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity className="mr-5">
                <Video size={22} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity>
                <MoreVertical size={22} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-background">
        <FlatList
          ref={flatListRef}
          data={flatListData}
          keyExtractor={item => ('isDateDivider' in item ? item.id : item.id)}
          className="flex-1 px-4"
          initialNumToRender={20}
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            // Render date divider
            if ('isDateDivider' in item) {
              return (
                <View className="flex-row justify-center my-3">
                  <Badge variant="outline" className="px-3 py-1">
                    <Text className="text-xs text-muted-foreground">{item.date}</Text>
                  </Badge>
                </View>
              );
            }

            // Render message
            const message = item as DirectMessage;
            return (
              <View
                className={`flex-row mb-3 ${
                  message.isCurrentUser ? 'justify-end' : 'justify-start'
                }`}
              >
                {!message.isCurrentUser && (
                  <View className="h-8 w-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                    <Text className="text-primary font-semibold">
                      {username?.substring(0, 1).toUpperCase() || 'U'}
                    </Text>
                  </View>
                )}
                
                <View className="max-w-[80%]">
                  <View 
                    className={`rounded-2xl p-3 ${
                      message.isCurrentUser 
                        ? 'bg-primary' 
                        : 'bg-muted border border-border'
                    }`}
                  >
                    <Text 
                      className={message.isCurrentUser ? 'text-primary-foreground' : 'text-foreground'}
                    >
                      {message.text}
                    </Text>
                  </View>
                  
                  <Text className="text-muted-foreground text-xs mt-1 text-right">
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              </View>
            );
          }}
        />

        <View className="flex-row items-center p-2 border-t border-border bg-background">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onPress={() => {}}
          >
            <MoreVertical size={20} className="text-primary" />
          </Button>
          
          <TextInput
            className="flex-1 h-10 bg-muted rounded-full px-4 mx-2 text-foreground"
            placeholder="Message..."
            placeholderTextColor="#9ca3af"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          
          <Button
            variant={message.trim() ? 'default' : 'ghost'}
            size="icon"
            className="h-10 w-10 rounded-full"
            onPress={sendMessage}
            disabled={!message.trim()}
          >
            <Text style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: 0, opacity: 0 }}>
              Send
            </Text>
            <Send size={20} className={message.trim() ? 'text-white' : 'text-primary'} />
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
