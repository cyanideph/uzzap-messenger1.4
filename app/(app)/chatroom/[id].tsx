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
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, MapPin, Users, Camera, Mic, Smile, Paperclip, Bot } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import { sendMessageToBot, isBot, getBotCommands } from '~/lib/bot';

// Define types for Supabase data
interface Profile {
  username: string;
  avatar_url: string | null;
}

interface MessageData {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: Profile;
}

// Chat message type for rendered UI
interface ChatMessage {
  id: string;
  user_id: string;
  userId?: string; // For compatibility with rendering code
  userName: string;
  userAvatar: string | null;
  content: string;
  text?: string; // For compatibility with rendering code
  created_at: string;
  timestamp?: Date; // For compatibility with rendering code
  isCurrentUser: boolean;
}

// Function to fetch messages from Supabase

export default function ChatroomScreen() {
  const { id, provinceName, regionName } = useLocalSearchParams();
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!id) return;

        // Fetch messages from the database
        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select('id, content, created_at, user_id, profiles(username, avatar_url)')
          .eq('chatroom_id', id)
          .order('created_at', { ascending: true });

        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }

        // Fetch online users count
        const { data: onlineData, error: onlineError } = await supabase
          .from('users')
          .select('id')
          .eq('is_online', true);

        if (onlineError) {
          console.error('Error fetching online users:', onlineError);
        } else {
          setOnlineUsers(onlineData?.length || 0);
        }

        // Map the data to our ChatMessage interface
        const formattedMessages = messagesData?.map(msg => {
          // Access the first profile item if it's an array, otherwise use the object directly
          const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
          
          return {
            id: msg.id,
            user_id: msg.user_id,
            userId: msg.user_id, // For compatibility with existing code
            userName: profile?.username || 'Anonymous User',
            userAvatar: profile?.avatar_url,
            content: msg.content,
            text: msg.content, // For compatibility with existing code
            created_at: msg.created_at,
            timestamp: new Date(msg.created_at), // For compatibility with existing code
            isCurrentUser: msg.user_id === user?.id
          };
        }) || [];

        setMessages(formattedMessages);
      } catch (error) {
        console.error('Error in fetchMessages:', error);
      }
    };

    fetchMessages();

    // Set up real-time subscription
    const subscription = supabase
      .channel('public:messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chatroom_id=eq.${id}`
      }, async (payload) => {
        // When a new message is added, fetch the user info
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar_url, status_message, last_status_update')
          .eq('id', payload.new.user_id)
          .single();

        const newMessage: ChatMessage = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          userId: payload.new.user_id,
          userName: userData?.username || 'Anonymous User',
          userAvatar: userData?.avatar_url,
          content: payload.new.content,
          text: payload.new.content,
          created_at: payload.new.created_at,
          timestamp: new Date(payload.new.created_at),
          isCurrentUser: payload.new.user_id === user?.id
        };

        setMessages(prev => [...prev, newMessage]);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id, user?.id]);

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !id) return;
    
    try {
      const messageContent = newMessage.trim();
      
      // Check if this is a bot command
      if (messageContent.startsWith('/')) {
        // First insert the user's command as a message
        await supabase
          .from('messages')
          .insert({
            chatroom_id: id,
            user_id: user.id,
            content: messageContent
          });
        
        // Call the bot with this command
        const botResponse = await sendMessageToBot(messageContent, user.id, id as string);
        
        if (!botResponse) {
          console.log('No response from bot or error occurred');
        }
        // Note: The bot response will be handled by the subscription
      } else {
        // Regular message, just insert it
        const { error } = await supabase
          .from('messages')
          .insert({
            chatroom_id: id,
            user_id: user.id,
            content: messageContent
          });

        if (error) {
          console.error('Error sending message:', error);
          return;
        }
      }
      
      // Clear the input field
      setNewMessage('');
      
      // Scroll to the bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error in sendMessage:', error);
    }
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
  
  // Show bot commands when user taps the bot button
  const showBotCommands = () => {
    const commands = getBotCommands();
    const commandsText = commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join('\n');
    
    Alert.alert(
      'UzZap Bot Commands',
      commandsText,
      [{ text: 'OK', style: 'default' }]
    );
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
              <TouchableOpacity onPress={showBotCommands} className="mr-3">
                <Bot size={20} className="text-primary" />
              </TouchableOpacity>
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
                <View className="flex-row items-center mb-1">
                  <Text className="text-xs text-muted-foreground">{item.userName}</Text>
                  {isBot(item.user_id) && (
                    <Badge className="ml-1 py-0" variant="secondary">
                      <Bot size={10} className="mr-1" />
                      <Text className="text-[9px]">BOT</Text>
                    </Badge>
                  )}
                </View>
              )}
              
              <View 
                className={`rounded-2xl p-3 ${
                  item.isCurrentUser 
                    ? 'bg-primary' 
                    : isBot(item.user_id)
                      ? 'bg-secondary border border-border'
                      : 'bg-muted border border-border'
                }`}
              >
                <Text 
                  className={item.isCurrentUser 
                    ? 'text-primary-foreground' 
                    : isBot(item.user_id) 
                      ? 'text-secondary-foreground' 
                      : 'text-foreground'}
                >
                  {item.text}
                </Text>
              </View>
              
              <Text 
                className="text-xs text-muted-foreground mt-1"
                style={{ alignSelf: item.isCurrentUser ? 'flex-end' : 'flex-start' }}
              >
                {formatTime(item.timestamp || new Date(item.created_at))}
              </Text>
            </View>
          )}
        />

        {/* Message input */}
        <View className="border-t border-border p-2 bg-background">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <View className="flex-row space-x-1 p-1">
              <TouchableOpacity className="p-2" onPress={showBotCommands}>
                <Bot size={22} className="text-primary" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Smile size={22} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Paperclip size={22} className="text-muted-foreground" />
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
