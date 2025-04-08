import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, Image, FlatList, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Search, MessageSquare, User, Plus } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';

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
  
  // Fetch conversations from Supabase
  useEffect(() => {
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
      }
    };
    
    fetchConversations();
    
    // Set up subscription for real-time updates
    const subscription = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'direct_messages' }, (payload) => {
        const { new: newMessage } = payload;
        // Re-fetch conversations only if the new message involves the current user
        if (user && (newMessage.sender_id === user.id || newMessage.recipient_id === user.id)) {
          fetchConversations();
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);
  
  const filteredConversations = conversations.filter(
    (conv) => 
      conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const navigateToDirectMessage = (conversation: Conversation) => {
    router.push({
      pathname: '/direct-message/[id]',
      params: {
        id: conversation.userId,
        username: conversation.username
      }
    });
  };
  
  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <Text className="text-2xl font-bold mb-2">Messages</Text>
        <Text className="text-muted-foreground mb-4">
          Your private conversations
        </Text>
        
        {/* Search */}
        <View className="flex-row items-center bg-muted rounded-lg px-3 mb-4">
          <Search size={18} className="text-muted-foreground" />
          <Input
            placeholder="Search messages..."
            className="flex-1 h-12 border-0 bg-transparent"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* New Message Button */}
        <Button
          className="mb-4 flex-row justify-center"
          onPress={() => router.push('/people')}
        >
          <Plus size={18} className="text-primary-foreground mr-2" />
          <Text className="text-primary-foreground font-medium">New Message</Text>
        </Button>
        
        {/* Loading State */}
        {loading ? (
          <View className="items-center justify-center py-8">
            <ActivityIndicator size="large" color="#6366F1" />
            <Text className="text-muted-foreground mt-2">Loading messages...</Text>
          </View>
        ) : filteredConversations.length > 0 ? (
          <FlatList
            data={filteredConversations}
            keyExtractor={(item) => item.id}
            className="mb-4"
            renderItem={({ item }) => (
              <TouchableOpacity
                className="mb-2"
                onPress={() => navigateToDirectMessage(item)}
              >
                <Card className="p-4 border border-border">
                  <View className="flex-row">
                    <View className="relative mr-3">
                      {item.avatar ? (
                        <Image 
                          source={{ uri: item.avatar }} 
                          className="w-12 h-12 rounded-full"
                        />
                      ) : (
                        <View className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center">
                          <Text className="text-primary text-lg font-semibold">
                            {item.name ? item.name.substring(0, 1).toUpperCase() : ''}
                          </Text>
                        </View>
                      )}
                      {item.online && (
                        <View className="absolute right-0 bottom-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                      )}
                    </View>
                    
                    <View className="flex-1 justify-center">
                      <View className="flex-row justify-between items-center mb-1">
                        <Text className="font-semibold">{item.name}</Text>
                        <Text className="text-xs text-muted-foreground">{item.timestamp}</Text>
                      </View>
                      
                      <View className="flex-row justify-between items-center">
                        <Text 
                          className={`text-sm ${item.unread > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {item.lastMessage}
                        </Text>
                        
                        {item.unread > 0 && (
                          <Badge className="bg-primary ml-2 min-w-[20px] h-5 rounded-full">
                            <Text className="text-xs text-white text-center">
                              {item.unread}
                            </Text>
                          </Badge>
                        )}
                      </View>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          />
        ) : (
          <Card className="p-6 items-center">
            <MessageSquare size={40} className="text-muted-foreground mb-2" />
            <Text className="text-center text-muted-foreground">
              {searchQuery 
                ? `No messages matching "${searchQuery}"` 
                : "No messages yet"}
            </Text>
            <Text className="text-center text-xs text-muted-foreground mt-1 mb-4">
              {searchQuery 
                ? "Try a different search term" 
                : "Start a conversation with someone"}
            </Text>
            <Button
              onPress={() => router.push('/people')}
            >
              <Text className="text-primary-foreground">Find People</Text>
            </Button>
          </Card>
        )}
      </View>
    </View>
  );
}
