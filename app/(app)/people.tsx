import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Image, TouchableOpacity, FlatList } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Search, User, MapPin, MessageSquare, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '~/lib/auth-context';

// Mock data for people
const MOCK_PEOPLE = [
  {
    id: '1',
    name: 'Maria Santos',
    username: 'maria_s',
    avatar: null,
    location: 'Manila, NCR',
    isOnline: true,
    mutualChatrooms: 3,
  },
  {
    id: '2',
    name: 'Juan Dela Cruz',
    username: 'juan_dc',
    avatar: null,
    location: 'Cebu City, Cebu',
    isOnline: true,
    mutualChatrooms: 2,
  },
  {
    id: '3',
    name: 'Anna Reyes',
    username: 'anna_r',
    avatar: null,
    location: 'Quezon City, NCR',
    isOnline: false,
    mutualChatrooms: 1,
  },
  {
    id: '4',
    name: 'Pedro Lim',
    username: 'pedro_l',
    avatar: null,
    location: 'Davao City, Davao',
    isOnline: false,
    mutualChatrooms: 4,
  },
  {
    id: '5',
    name: 'Sofia Garcia',
    username: 'sofia_g',
    avatar: null,
    location: 'Iloilo City, Iloilo',
    isOnline: true,
    mutualChatrooms: 2,
  },
  {
    id: '6',
    name: 'Miguel Tan',
    username: 'miguel_t',
    avatar: null,
    location: 'Baguio City, Benguet',
    isOnline: true,
    mutualChatrooms: 1,
  },
  {
    id: '7',
    name: 'Lucia Mendoza',
    username: 'lucia_m',
    avatar: null,
    location: 'Makati, NCR',
    isOnline: false,
    mutualChatrooms: 3,
  },
];

type TabType = 'all' | 'following' | 'suggested';

export default function PeopleScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [people, setPeople] = useState(MOCK_PEOPLE);
  const [following, setFollowing] = useState<string[]>(['1', '3']); // Mock IDs of people the user follows

  useEffect(() => {
    // Initial data load - in a real app, fetch from Supabase
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const toggleFollow = (id: string) => {
    if (following.includes(id)) {
      setFollowing(following.filter(userId => userId !== id));
    } else {
      setFollowing([...following, id]);
    }
  };

  const filteredPeople = people.filter(person => {
    const matchesQuery = 
      person.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      person.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      person.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesQuery;
    if (activeTab === 'following') return matchesQuery && following.includes(person.id);
    if (activeTab === 'suggested') return matchesQuery && !following.includes(person.id);
    
    return matchesQuery;
  });

  const startDirectMessage = (userId: string, username: string) => {
    // In a real app, navigate to a direct message chat
    router.push({
      pathname: `/direct-message/${userId}`,
      params: { username }
    } as any);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="p-4">
        <View className="mb-4">
          <Text className="text-2xl font-bold mb-2">People</Text>
          <Text className="text-muted-foreground">
            Connect with other users across the Philippines
          </Text>
        </View>

        <View className="flex-row items-center bg-muted rounded-lg px-3 mb-4">
          <Search size={18} className="text-muted-foreground" />
          <Input
            placeholder="Search by name, username, or location..."
            className="flex-1 h-12 border-0 bg-transparent"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View className="flex-row mb-4">
          <TouchableOpacity 
            className={`flex-1 p-2 rounded-lg mr-2 ${activeTab === 'all' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setActiveTab('all')}
          >
            <Text 
              className={`text-center font-medium ${activeTab === 'all' ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 p-2 rounded-lg mr-2 ${activeTab === 'following' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setActiveTab('following')}
          >
            <Text 
              className={`text-center font-medium ${activeTab === 'following' ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              Following
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 p-2 rounded-lg ${activeTab === 'suggested' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setActiveTab('suggested')}
          >
            <Text 
              className={`text-center font-medium ${activeTab === 'suggested' ? 'text-primary-foreground' : 'text-foreground'}`}
            >
              Suggested
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPeople}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 16 }}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={() => (
          <Card className="p-6 items-center">
            <User size={40} className="text-muted-foreground mb-2" />
            <Text className="text-center text-muted-foreground">
              {searchQuery 
                ? `No users found matching "${searchQuery}"` 
                : activeTab === 'following' 
                  ? "You're not following anyone yet" 
                  : "No users found"}
            </Text>
            {activeTab === 'following' && (
              <Button
                className="mt-4"
                onPress={() => setActiveTab('suggested')}
              >
                Discover People
              </Button>
            )}
          </Card>
        )}
        renderItem={({ item }) => (
          <Card className="p-4 border border-border">
            <View className="flex-row">
              <View className="mr-3">
                {item.avatar ? (
                  <Image
                    source={{ uri: item.avatar }}
                    className="w-12 h-12 rounded-full"
                  />
                ) : (
                  <View className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Text className="text-primary text-lg font-semibold">
                      {item.name.substring(0, 1)}
                    </Text>
                  </View>
                )}
                {item.isOnline && (
                  <View className="w-3 h-3 rounded-full bg-green-500 absolute right-0 bottom-0 border-2 border-background" />
                )}
              </View>
              
              <View className="flex-1">
                <View className="flex-row items-center">
                  <Text className="font-semibold">{item.name}</Text>
                  {item.isOnline && (
                    <Badge variant="outline" className="ml-2 h-5 px-1.5">
                      <Text className="text-xs">Online</Text>
                    </Badge>
                  )}
                </View>
                
                <Text className="text-muted-foreground text-sm">@{item.username}</Text>
                
                <View className="flex-row items-center mt-1">
                  <MapPin size={12} className="text-muted-foreground mr-1" />
                  <Text className="text-xs text-muted-foreground">{item.location}</Text>
                </View>
                
                {item.mutualChatrooms > 0 && (
                  <View className="flex-row items-center mt-1">
                    <MessageSquare size={12} className="text-muted-foreground mr-1" />
                    <Text className="text-xs text-muted-foreground">
                      {item.mutualChatrooms} mutual {item.mutualChatrooms === 1 ? 'chatroom' : 'chatrooms'}
                    </Text>
                  </View>
                )}
              </View>
              
              <View className="flex-col space-y-2">
                <Button 
                  variant={following.includes(item.id) ? "outline" : "default"}
                  size="sm"
                  className="h-8"
                  onPress={() => toggleFollow(item.id)}
                >
                  <UserPlus size={14} className="mr-1" />
                  <Text className="text-xs">
                    {following.includes(item.id) ? 'Following' : 'Follow'}
                  </Text>
                </Button>
                
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-8"
                  onPress={() => startDirectMessage(item.id, item.username)}
                >
                  <MessageSquare size={14} className="mr-1" />
                  <Text className="text-xs">Message</Text>
                </Button>
              </View>
            </View>
          </Card>
        )}
      />
    </View>
  );
}
