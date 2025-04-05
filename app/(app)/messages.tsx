import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Image, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Search, MessageSquare, User, Plus } from 'lucide-react-native';

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

const mockConversations: Conversation[] = [
  {
    id: '1',
    userId: '1',
    name: 'Maria Santos',
    username: 'maria_s',
    avatar: null,
    lastMessage: 'Thanks for the info about the festival!',
    timestamp: '10:45 AM',
    unread: 2,
    online: true,
  },
  {
    id: '2',
    userId: '2',
    name: 'Juan Dela Cruz',
    username: 'juan_dc',
    avatar: null,
    lastMessage: 'Are you going to the event this weekend?',
    timestamp: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: '3',
    userId: '3',
    name: 'Anna Reyes',
    username: 'anna_r',
    avatar: null,
    lastMessage: 'Let me know if you need any recommendations for Cebu!',
    timestamp: 'Yesterday',
    unread: 0,
    online: true,
  },
  {
    id: '4',
    userId: '4',
    name: 'Pedro Lim',
    username: 'pedro_l',
    avatar: null,
    lastMessage: 'I\'ll send you the details later',
    timestamp: 'Mon',
    unread: 0,
    online: false,
  },
  {
    id: '5',
    userId: '5',
    name: 'Sofia Garcia',
    username: 'sofia_g',
    avatar: null,
    lastMessage: 'What time is the meeting tomorrow?',
    timestamp: 'Sun',
    unread: 1,
    online: true,
  },
];

export default function MessagesScreen() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState(mockConversations);
  const [searchQuery, setSearchQuery] = useState('');
  
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
        
        {/* Conversations List */}
        {filteredConversations.length > 0 ? (
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
                            {item.name.substring(0, 1).toUpperCase()}
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
              Find People
            </Button>
          </Card>
        )}
      </View>
    </View>
  );
}
