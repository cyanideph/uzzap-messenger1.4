import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, Users, Smile, Paperclip, Mic, MapPin, Bell, Search } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import { cn } from '~/lib/utils';
import { User } from '@supabase/supabase-js';

type ExtendedUser = User & {
  avatar_url?: string;
  username?: string;
};

interface Profile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface Message {
  id: string;
  chatroom_id: string;
  user_id: string;
  content: string;
  created_at: string;
  sender: Profile;
}

export default function ChatroomScreen() {
  const { id, provinceName, regionName } = useLocalSearchParams<{ id: string; provinceName: string; regionName: string }>();
  const { user } = useAuth() as { user: ExtendedUser | null };
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchMessages = async () => {
    if (!id) return;

    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select(`
          id,
          chatroom_id,
          user_id,
          content,
          created_at,
          sender:profiles!messages_user_id_fkey (
            id,
            username,
            full_name,
            avatar_url,
            is_online
          )
        `)
        .eq('chatroom_id', id)
        .order('created_at', { ascending: true });

      if (messagesError) throw messagesError;

      const { data: onlineData, error: onlineError } = await supabase
        .from('profiles')
        .select('id')
        .eq('is_online', true);

      if (onlineError) {
        console.error('Error fetching online users:', onlineError);
      } else {
        setOnlineUsers(onlineData?.length || 0);
      }

      // Transform the data to match the Message type
      const transformedMessages = messagesData?.map(msg => ({
        ...msg,
        sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender
      })) as Message[];

      setMessages(transformedMessages || []);
    } catch (error) {
      console.error('Error in fetchMessages:', error);
      Alert.alert('Error', 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMessages();

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
          .select('id, username, full_name, avatar_url, is_online')
          .eq('id', payload.new.user_id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
          return;
        }

        const newMessage: Message = {
          id: payload.new.id,
          chatroom_id: payload.new.chatroom_id,
          user_id: payload.new.user_id,
          content: payload.new.content,
          created_at: payload.new.created_at,
          sender: userData
        };

        setMessages(prev => [...prev, newMessage]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id || !id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chatroom_id: id,
          user_id: user.id,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const handleKeyPress = (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
    if (e.nativeEvent.key === 'Enter') {
      sendMessage();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.user_id === user?.id;
    
    return (
      <View className={cn(
        "flex-row mb-4",
        isMe ? "justify-end" : "justify-start"
      )}>
        {!isMe && (
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.sender.id}`)}
            className="mr-2"
          >
            <Avatar
              src={item.sender.avatar_url}
              alt={item.sender.username}
              size="sm"
              fallback={item.sender.username?.[0]?.toUpperCase()}
            />
          </TouchableOpacity>
        )}
        <View className={cn(
          "max-w-[80%]",
          isMe ? "items-end" : "items-start"
        )}>
          {!isMe && (
            <Text className="text-xs text-muted-foreground mb-1">
              {item.sender.full_name || item.sender.username}
            </Text>
          )}
          <Card className={cn(
            "rounded-2xl",
            isMe ? "bg-primary" : "bg-muted"
          )}>
            <CardContent className="p-3">
              <Text className={cn(
                isMe ? "text-primary-foreground" : "text-foreground"
              )}>
                {item.content}
              </Text>
            </CardContent>
          </Card>
          <Text className="text-xs text-muted-foreground mt-1">
            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        {isMe && (
          <Avatar
            src={user?.avatar_url}
            alt={user?.username || 'User'}
            size="sm"
            className="ml-2"
            fallback={(user?.username?.[0] || 'U').toUpperCase()}
          />
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-background"
    >
      <Stack.Screen
        options={{
          title: provinceName || 'Chat',
          headerRight: () => (
            <View className="flex-row items-center">
              <Badge variant="secondary" className="mr-2">
                <Users size={12} className="mr-1" />
                <Text className="text-xs">{onlineUsers} online</Text>
              </Badge>
            </View>
          ),
        }}
      />

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Avatar
              src={user?.avatar_url}
              alt={user?.username || 'User'}
              className="w-8 h-8 mr-2"
              fallback={(user?.username?.[0] || 'U').toUpperCase()}
            />
            <View>
              <Text className="text-lg font-semibold">Welcome back,</Text>
              <Text className="text-muted-foreground">
                {user?.username || 'User'}
              </Text>
            </View>
          </View>
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/notifications')}
            >
              <Bell size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/search')}
            >
              <Search size={20} />
            </Button>
          </View>
        </View>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          className="flex-1 p-4"
          inverted={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      </View>

      <View className="p-4 border-t border-border">
        <View className="flex-row items-center space-x-2">
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {/* Handle attachment */}}
            >
              <Paperclip size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {/* Handle emoji */}}
            >
              <Smile size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => {/* Handle location */}}
            >
              <MapPin size={20} />
            </Button>
          </View>
          
          <TextInput
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            className="flex-1 bg-input text-foreground px-3 py-2 rounded-md"
            onKeyPress={handleKeyPress}
          />
          
          <Button
            size="sm"
            className="ml-2"
            onPress={sendMessage}
            disabled={!newMessage.trim()}
          >
            <Send size={20} />
          </Button>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
