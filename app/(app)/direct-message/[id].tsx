import React, { useEffect, useState, useRef } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar } from '~/components/ui/avatar';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { useAuth } from '~/lib/auth-context';
import { supabase } from '~/lib/supabase';
import { AuthUser } from '~/lib/supabase';
import { MessageSquare, Send, User, ArrowLeft } from 'lucide-react-native';
import { cn } from '~/lib/utils';

interface Profile {
  id: string;
  username: string;
  avatar_url?: string;
  is_online?: boolean;
}

interface DMData {
  id: string;
  user_id: string;
  related_user: Profile;
  created_at: string;
}

interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  sender: Profile;
}

export default function DirectMessageScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [conversation, setConversation] = useState<DMData | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  const fetchConversation = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          user_id,
          related_user:related_user_id (
            id,
            username,
            full_name,
            avatar_url,
            is_online
          ),
          created_at
        `)
        .or(`user_id.eq.${user.id},related_user_id.eq.${user.id}`)
        .eq('related_user_id', id)
        .single();

      if (error) throw error;
      if (data) {
        setConversation({
          id: data.id,
          user_id: data.user_id,
          related_user: data.related_user[0],
          created_at: data.created_at
        });
      }
    } catch (error) {
      console.error('Error fetching conversation:', error);
    }
  };

  const fetchMessages = async () => {
    if (!conversation?.id) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          conversation_id,
          sender_id,
          content,
          created_at,
          sender:sender_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversation.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      if (data) {
        setMessages(data.map(msg => ({
          ...msg,
          sender: msg.sender[0]
        })));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchConversation();
  }, [id, user?.id]);

  useEffect(() => {
    if (conversation?.id) {
      fetchMessages();
    }
  }, [conversation?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !conversation?.id || !user?.id) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversation.id,
          sender_id: user.id,
          content: newMessage.trim(),
        });

      if (error) throw error;
      setNewMessage('');
      fetchMessages();
    } catch (error) {
      console.error('Error sending message:', error);
      Alert.alert('Error', 'Failed to send message');
    }
  };

  const renderMessage = ({ item }: { item: DirectMessage }) => {
    const isMe = item.sender_id === user?.id;
    
    return (
      <View className={cn(
        "flex-row mb-4",
        isMe ? "justify-end" : "justify-start"
      )}>
        {!isMe && (
          <Avatar
            src={item.sender.avatar_url}
            alt={item.sender.username}
            size="sm"
            fallback={item.sender.username[0].toUpperCase()}
            className="w-8 h-8 mr-2"
          />
        )}
        <View className={cn(
          "max-w-[80%]",
          isMe ? "items-end" : "items-start"
        )}>
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
            alt={user?.username || 'You'}
            size="sm"
            fallback={(user?.username?.[0] || 'Y').toUpperCase()}
            className="w-8 h-8 ml-2"
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
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: conversation?.related_user.username || 'Chat',
          headerLeft: () => (
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onPress={() => router.back()}
            >
              <ArrowLeft className="text-foreground" size={24} />
            </Button>
          ),
        }}
      />
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        className="flex-1 px-4"
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        onLayout={() => flatListRef.current?.scrollToEnd()}
      />
      <View className="flex-row items-center p-4 border-t border-border">
        <Text className="text-sm font-medium text-gray-900">
          {user?.username || 'Anonymous'}
        </Text>
        <Input
          value={newMessage}
          onChangeText={(text) => {
            setNewMessage(text);
            if (text.endsWith('\n') && text.trim()) {
              sendMessage();
            }
          }}
          placeholder="Type a message..."
          className="flex-1 mr-2"
          multiline
          numberOfLines={1}
        />
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onPress={sendMessage}
          disabled={!newMessage.trim()}
        >
          <Send className="text-primary" size={24} />
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}
