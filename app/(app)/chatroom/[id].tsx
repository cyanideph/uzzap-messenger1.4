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
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, MapPin, Users, Camera, Mic, Smile, Paperclip } from 'lucide-react-native';

// Mock chat message type
interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

// Mock data for messages
const generateMockMessages = (chatroomId: string): ChatMessage[] => {
  const baseMessages = [
    {
      id: '1',
      userId: 'user1',
      userName: 'Maria Santos',
      userAvatar: null,
      text: 'Hello everyone! How are you all doing today?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
      isCurrentUser: false,
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Juan Dela Cruz',
      userAvatar: null,
      text: 'I\'m doing great! Just visited the local market here in our province.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
      isCurrentUser: false,
    },
    {
      id: '3',
      userId: 'user3',
      userName: 'Anna Reyes',
      userAvatar: null,
      text: 'Does anyone know if there are any events happening this weekend?',
      timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
      isCurrentUser: false,
    },
    {
      id: '4',
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: null,
      text: 'I heard there\'s a festival happening in the town plaza!',
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
      isCurrentUser: true,
    },
    {
      id: '5',
      userId: 'user1',
      userName: 'Maria Santos',
      userAvatar: null,
      text: 'Yes, that\'s right! It starts at 6pm on Saturday.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
      isCurrentUser: false,
    },
    {
      id: '6',
      userId: 'user2',
      userName: 'Juan Dela Cruz',
      userAvatar: null,
      text: 'Will there be food stalls as well?',
      timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
      isCurrentUser: false,
    },
    {
      id: '7',
      userId: 'current-user',
      userName: 'Current User',
      userAvatar: null,
      text: 'Yes, I saw them setting up food stalls today. There should be lots of local cuisine to try!',
      timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
      isCurrentUser: true,
    },
  ];

  // Custom message for specific chatrooms to make it feel more realistic
  if (chatroomId === 'NCR-1') {
    baseMessages.push({
      id: '8',
      userId: 'user3',
      userName: 'Anna Reyes',
      userAvatar: null,
      text: 'I hear Manila Bay has a beautiful sunset view these days. Anyone planning to visit?',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      isCurrentUser: false,
    });
  } else if (chatroomId === 'R7-2') {
    baseMessages.push({
      id: '8',
      userId: 'user3',
      userName: 'Anna Reyes',
      userAvatar: null,
      text: 'Cebu has amazing beaches! Anyone been to Moalboal recently?',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      isCurrentUser: false,
    });
  } else if (chatroomId === 'R3-3') {
    baseMessages.push({
      id: '8',
      userId: 'user3',
      userName: 'Anna Reyes',
      userAvatar: null,
      text: 'The Barasoain Church in Bulacan is a must-visit historical site!',
      timestamp: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
      isCurrentUser: false,
    });
  }

  return baseMessages;
};

export default function ChatroomScreen() {
  const { id, provinceName, regionName } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    // Simulate loading messages
    setMessages(generateMockMessages(id as string));
    
    // Simulate online user count
    setOnlineUsers(Math.floor(Math.random() * 30) + 10);
  }, [id]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: user?.email?.split('@')[0] || 'User',
      userAvatar: null,
      text: newMessage.trim(),
      timestamp: new Date(),
      isCurrentUser: true,
    };
    
    setMessages(prev => [...prev, newMsg]);
    setNewMessage('');
    
    // Scroll to the bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          title: provinceName as string || 'Chatroom',
          headerRight: () => (
            <View className="flex-row items-center">
              <Badge className="mr-2" variant="outline">
                <Users size={14} className="mr-1" />
                <Text className="text-xs">{onlineUsers}</Text>
              </Badge>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-background">
        {/* Region info banner */}
        <View className="bg-primary/10 p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MapPin size={16} className="text-primary mr-2" />
            <Text className="text-sm font-medium">{regionName}</Text>
          </View>
          <Badge variant="outline">
            <Text className="text-xs">{provinceName}</Text>
          </Badge>
        </View>

        {/* Messages */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
          initialNumToRender={15}
          onContentSizeChange={() => {
            flatListRef.current?.scrollToEnd({ animated: false });
          }}
          renderItem={({ item }) => (
            <View 
              className={`mb-4 max-w-[80%] ${item.isCurrentUser ? 'self-end' : 'self-start'}`}
              style={{ alignSelf: item.isCurrentUser ? 'flex-end' : 'flex-start' }}
            >
              {!item.isCurrentUser && (
                <Text className="text-xs text-muted-foreground mb-1">{item.userName}</Text>
              )}
              
              <View 
                className={`rounded-2xl p-3 ${
                  item.isCurrentUser 
                    ? 'bg-primary' 
                    : 'bg-muted border border-border'
                }`}
              >
                <Text 
                  className={item.isCurrentUser ? 'text-primary-foreground' : 'text-foreground'}
                >
                  {item.text}
                </Text>
              </View>
              
              <Text 
                className="text-xs text-muted-foreground mt-1"
                style={{ alignSelf: item.isCurrentUser ? 'flex-end' : 'flex-start' }}
              >
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
        />

        {/* Message input */}
        <View className="border-t border-border p-2 bg-background">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <View className="flex-row space-x-1 p-1">
              <TouchableOpacity className="p-2">
                <Smile size={22} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Paperclip size={22} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Camera size={22} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="flex-1 px-3 py-2 text-foreground"
              placeholder="Type a message..."
              placeholderTextColor="#9ca3af"
              value={newMessage}
              onChangeText={setNewMessage}
              multiline
              maxLength={500}
            />
            
            {newMessage.trim() ? (
              <TouchableOpacity 
                className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-1"
                onPress={sendMessage}
              >
                <Send size={18} color="#ffffff" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity className="p-2 mr-1">
                <Mic size={22} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
