import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator, Animated, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Search, MessageSquare, User, Plus, MoreVertical } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';
import { cn } from '~/lib/utils';
import { Avatar } from '~/components/ui/avatar';

interface Conversation {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatar: string | null;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

// Format a timestamp for display
const formatMessageTime = (timestamp: string): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 24) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (diffInHours < 48) {
    return 'Yesterday';
  } else if (diffInHours < 168) { // Within a week
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
};

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Define fetchConversations at component level
  const fetchConversations = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Get all conversations where the current user is involved
      const { data: conversationsData, error: conversationsError } = await supabase
        .from('conversations')
        .select('id, last_message_at, user1_id, user2_id')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });
      
      if (conversationsError) {
        console.error('Error fetching conversations:', conversationsError);
        setLoading(false);
        return;
      }
      
      // For each conversation, get the other user's profile and the last message
      const conversationsWithDetails = await Promise.all(conversationsData.map(async (conv) => {
        // Determine which user is the other person in the conversation
        const otherUserId = conv.user1_id === user.id ? conv.user2_id : conv.user1_id;
        
        // Get the other user's profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', otherUserId)
          .single();
        
        if (profileError) {
          console.error('Error fetching profile:', profileError);
          return null;
        }
        
        // Get the last message in the conversation
        const { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select('content, created_at, is_read')
          .or(`sender_id.eq.${conv.user1_id}.and.recipient_id.eq.${conv.user2_id},sender_id.eq.${conv.user2_id}.and.recipient_id.eq.${conv.user1_id}`)
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (messagesError) {
          console.error('Error fetching last message:', messagesError);
          return null;
        }
        
        // Count unread messages where current user is recipient and messages are unread
        const { count, error: countError } = await supabase
          .from('direct_messages')
          .select('id', { count: 'exact' })
          .eq('recipient_id', user.id)
          .eq('sender_id', otherUserId)
          .eq('is_read', false);
        
        if (countError) {
          console.error('Error counting unread messages:', countError);
        }
        
        // Check if user is online
        const { data: onlineData, error: onlineError } = await supabase
          .from('users')
          .select('is_online')
          .eq('id', otherUserId)
          .single();
        
        const lastMessage = messagesData && messagesData.length > 0 ? messagesData[0] : null;
        
        return {
          id: conv.id,
          userId: otherUserId,
          name: profileData.full_name || profileData.username,
          username: profileData.username,
          avatar: profileData.avatar_url,
          lastMessage: lastMessage ? lastMessage.content : 'Start a conversation',
          timestamp: lastMessage ? formatMessageTime(lastMessage.created_at) : '',
          unread: count || 0,
          online: onlineData?.is_online || false
        };
      }));
      
      // Filter out any null values and update state
      setConversations(conversationsWithDetails.filter(Boolean) as Conversation[]);
    } catch (error) {
      console.error('Unexpected error in fetchConversations:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchConversations();
    
    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const { new: newMessage } = payload;
        if (user && (newMessage.sender_id === user.id || newMessage.recipient_id === user.id)) {
          fetchConversations();
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);
  
  const navigateToDirectMessage = (conversation: Conversation) => {
    router.push({
      pathname: '/direct-message/[id]',
      params: {
        id: conversation.userId,
        username: conversation.username
      }
    });
  };
  
  const renderHeader = () => (
    <View className="px-4 py-4">
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-2xl font-bold">Messages</Text>
        <Button
          variant="ghost"
          size="sm"
          className="p-2"
          onPress={() => router.push('/new-message')}
        >
          <Plus className="text-foreground" size={24} />
        </Button>
      </View>
      <View className="flex-row items-center bg-muted rounded-lg px-3">
        <Search size={18} className="text-muted-foreground mr-2" />
        <Input
          placeholder="Search messages..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="flex-1 h-12 border-0 bg-transparent"
        />
      </View>
    </View>
  );

  const renderConversationItem = ({ item: conversation }: { item: Conversation }) => {
    const scaleAnim = new Animated.Value(1);

    const handlePressIn = () => {
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    };

    const handlePressOut = () => {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
        }}
      >
        <TouchableOpacity
          onPress={() => navigateToDirectMessage(conversation)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.7}
          className="mb-2"
        >
          <Card>
            <CardContent className="p-4">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center space-x-3">
                  <View className="relative">
                    <Avatar
                      src={conversation.avatar || undefined}
                      alt={conversation.name}
                      size="lg"
                      fallback={conversation.name[0].toUpperCase()}
                    />
                    {conversation.online && (
                      <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                    )}
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center space-x-2">
                      <Text className="font-semibold">{conversation.name}</Text>
                      {conversation.unread > 0 && (
                        <Badge variant="secondary">
                          {conversation.unread}
                        </Badge>
                      )}
                    </View>
                    <Text
                      className={cn(
                        'text-sm',
                        conversation.unread > 0
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground'
                      )}
                      numberOfLines={1}
                    >
                      {conversation.lastMessage}
                    </Text>
                  </View>
                </View>
                <View className="items-end">
                  <Text className="text-xs text-muted-foreground">
                    {formatMessageTime(conversation.timestamp)}
                  </Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={conversations}
        renderItem={renderConversationItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={fetchConversations} />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
