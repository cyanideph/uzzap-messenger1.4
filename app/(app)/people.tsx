import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, Image, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Search, User, MapPin, MessageSquare, UserPlus } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '~/lib/auth-context';
import { supabase } from '~/lib/supabase';

// Interface for user profile data
interface PersonProfile {
  id: string;
  name: string;
  username: string;
  avatar: string | null;
  location: string;
  isOnline: boolean;
  mutualChatrooms: number;
  status_message?: string;
  last_status_update?: string;
}

type TabType = 'all' | 'following' | 'suggested';

export default function PeopleScreen() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [people, setPeople] = useState<PersonProfile[]>([]);
  const [following, setFollowing] = useState<string[]>([]);

  // Fetch people data from Supabase
  const fetchPeople = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      
      // Fetch all profiles except the current user
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, status_message, last_status_update')
        .neq('id', user.id);
      
      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        return;
      }
      
      // Fetch users' online status and location
      const { data: usersData, error: usersError } = await supabase
        .from('users')
        .select('id, is_online, location')
        .in('id', profilesData.map(profile => profile.id));
      
      if (usersError) {
        console.error('Error fetching users data:', usersError);
      }
      
      // Fetch following relationships
      const { data: followingData, error: followingError } = await supabase
        .from('user_follows')
        .select('following_id')
        .eq('follower_id', user.id);
      
      if (followingError) {
        console.error('Error fetching following data:', followingError);
      } else {
        // Set the following state
        setFollowing(followingData?.map(follow => follow.following_id) || []);
      }
      
      // Map the data to our UI model
      const formattedPeople: PersonProfile[] = profilesData.map(profile => {
        const userData = usersData?.find(u => u.id === profile.id);
        
        // Get location from users table or default
        let location = 'Unknown';
        if (userData?.location) {
          location = userData.location;
        }
        
        return {
          id: profile.id,
          name: profile.full_name || profile.username,
          username: profile.username,
          avatar: profile.avatar_url,
          location: location,
          isOnline: userData?.is_online || false,
          // In a real implementation, you would calculate this
          // by checking which chatrooms both the current user and this user are in
          mutualChatrooms: Math.floor(Math.random() * 5),
          status_message: profile.status_message,
          last_status_update: profile.last_status_update
        };
      });
      
      setPeople(formattedPeople);
    } catch (error) {
      console.error('Unexpected error in fetchPeople:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchPeople();
    
    // Set up subscription for real-time updates on user status
    const subscription = supabase
      .channel('public:users')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'users' }, (payload) => {
        const { new: updatedUser } = payload;
        // Update the people data only for the user whose status has changed
        setPeople(prevPeople => {
          return prevPeople.map(person => {
            if (person.id === updatedUser.id) {
              return {
                ...person,
                isOnline: updatedUser.is_online,
                location: updatedUser.location,
              };
            } else {
              return person;
            }
          });
        });
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchPeople();
  };

  const toggleFollow = async (id: string) => {
    if (!user?.id) return;
    
    try {
      if (following.includes(id)) {
        // Unfollow user
        const { error } = await supabase
          .from('user_follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', id);
        
        if (error) {
          console.error('Error unfollowing user:', error);
          return;
        }
        
        // Update local state
        setFollowing(following.filter(userId => userId !== id));
      } else {
        // Follow user
        const { error } = await supabase
          .from('user_follows')
          .insert({
            follower_id: user.id,
            following_id: id,
            created_at: new Date().toISOString()
          });
        
        if (error) {
          console.error('Error following user:', error);
          return;
        }
        
        // Update local state
        setFollowing([...following, id]);
      }
    } catch (error) {
      console.error('Unexpected error in toggleFollow:', error);
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
              className={activeTab === 'all' 
                ? "text-center font-medium text-primary-foreground dark:text-primary-foreground"
                : "text-center font-medium text-foreground dark:text-foreground"
              }
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 p-2 rounded-lg mr-2 ${activeTab === 'following' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setActiveTab('following')}
          >
            <Text 
              className={activeTab === 'following'
                ? "text-center font-medium text-primary-foreground dark:text-primary-foreground"
                : "text-center font-medium text-foreground dark:text-foreground"
              }
            >
              Following
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            className={`flex-1 p-2 rounded-lg ${activeTab === 'suggested' ? 'bg-primary' : 'bg-muted'}`}
            onPress={() => setActiveTab('suggested')}
          >
            <Text 
              className={activeTab === 'suggested'
                ? "text-center font-medium text-primary-foreground dark:text-primary-foreground"
                : "text-center font-medium text-foreground dark:text-foreground"
              }
            >
              Suggested
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-4 text-muted-foreground">Loading people...</Text>
        </View>
      ) : (
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
                <Text className="font-medium text-primary-foreground">Discover People</Text>
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

                {item.status_message && (
                  <Text 
                    className="text-sm text-muted-foreground mt-1"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {item.status_message}
                  </Text>
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
                  <Text 
                    className={
                      following.includes(item.id)
                        ? "text-xs font-medium text-foreground dark:text-foreground"
                        : "text-xs font-medium text-primary-foreground dark:text-primary-foreground"
                    }
                  >
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
                  <Text className="text-xs font-medium text-foreground dark:text-foreground">Message</Text>
                </Button>
              </View>
            </View>
          </Card>
        )}
      />
      )}
    </View>
  );
}
