import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, MapPin, Users, Smile, Paperclip, Mic } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import { ChatBubble } from '~/components/messages/ChatBubble';

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
  userId?: string;
  userName: string;
  userAvatar: string | null;
  content: string;
  text?: string;
  created_at: string;
  timestamp?: Date;
  isCurrentUser: boolean;
}

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
          const profile = Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles;
          
          // Add logging to check user IDs
          console.log(`Message user_id: ${msg.user_id}, Current user ID: ${user?.id}, isCurrentUser: ${msg.user_id === user?.id}`);
          return {
            id: msg.id,
            user_id: msg.user_id,
            userId: msg.user_id,
            userName: profile?.username || 'Anonymous User',
            userAvatar: profile?.avatar_url,
            content: msg.content,
            text: msg.content,
            created_at: msg.created_at,
            timestamp: new Date(msg.created_at),
            isCurrentUser: msg.user_id === user?.id,
            // Add logging to check user IDs
            console.log(`Message user_id: ${msg.user_id}, Current user ID: ${user?.id}, isCurrentUser: ${msg.user_id === user?.id}`);
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
        const { data: userData, error: userError } = await supabase
          .from('profiles')
          .select('username, avatar_url')
          .eq('id', payload.new.user_id)
          .single();

        const newMessage: ChatMessage = {
          id: payload.new.id,
          user_id: payload.new.user_id,
          userId: payload.new.user_id,
          userName: userData ? userData.username : 'Anonymous User',
          userAvatar: userData ? userData.avatar_url : null,
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
      
      setNewMessage('');
      
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
        <View className="bg-primary/10 p-3 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <MapPin size={16} className="text-primary mr-2" />
            <Text className="text-sm font-medium">{regionName}</Text>
          </View>
          <Badge variant="outline">
            <Text className="text-xs">{provinceName}</Text>
          </Badge>
        </View>

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
              className={`mb-4 max-w-[80%] flex ${item.isCurrentUser ? 'self-end' : 'self-start'}`}
            >
              <View className="flex-row items-end">
                {!item.isCurrentUser && (
                  <View className="mr-2 mb-2">
                    {item.userAvatar ? (
                      <Image
                        source={{ uri: item.userAvatar }}
                        className="w-6 h-6 rounded-full bg-muted"
                      />
                    ) : (
                      <View className="w-6 h-6 rounded-full bg-primary/80 items-center justify-center">
                        <Text className="text-xs font-medium text-primary-foreground">
                          {item.userName?.substring(0, 1).toUpperCase()}
                        </Text>
                      </View>
                    )}
                  </View>
                )}

                <View className="flex-1">
                  {!item.isCurrentUser && (
                    <Text className="text-xs text-muted-foreground mb-1">
                      {item.userName}
                    </Text>
                  )}
                  
                  <ChatBubble 
                    message={item.text || item.content}
                    isCurrentUser={item.isCurrentUser}
                  />
                  
                  <Text 
                    className="text-xs text-muted-foreground mt-1"
                    style={{ alignSelf: item.isCurrentUser ? 'flex-end' : 'flex-start' }}
                  >
                    {formatTime(item.timestamp || new Date(item.created_at))}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />

        <View className="border-t border-border p-2 bg-background">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <View className="flex-row space-x-1 p-1">
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
