import React, { useState, useEffect } from 'react';
import { View, ScrollView, RefreshControl, TouchableOpacity, FlatList, ActivityIndicator, Animated } from 'react-native';
import { Stack } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Avatar } from '~/components/ui/avatar';
import { Search, User, MapPin, MessageSquare, UserPlus, UserMinus, AtSign } from 'lucide-react-native';
import { router } from 'expo-router';
import { useAuth } from '~/lib/auth-context';
import { supabase } from '~/lib/supabase';
import { cn } from '~/lib/utils';

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

  const renderTabBar = () => (
    <View className="flex-row justify-around mb-4">
      {(['all', 'following', 'suggested'] as TabType[]).map((tab) => (
        <TouchableOpacity
          key={tab}
          className={cn(
            "flex-1 items-center py-2 border-b-2",
            activeTab === tab
              ? "border-primary"
              : "border-transparent"
          )}
          onPress={() => setActiveTab(tab)}
        >
          <Text
            className={cn(
              "font-medium",
              activeTab === tab
                ? "text-primary"
                : "text-muted-foreground"
            )}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderPersonCard = ({ item }: { item: PersonProfile }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.id}`)}
            className="mr-3"
          >
            <View className="relative">
              <Avatar
                src={item.avatar || undefined}
                alt={item.name}
                size="lg"
                fallback={item.name[0].toUpperCase()}
              />
              {item.isOnline && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </View>
          </TouchableOpacity>
          
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-semibold mr-2">{item.name}</Text>
              {item.mutualChatrooms > 0 && (
                <Badge variant="secondary">
                  {item.mutualChatrooms} mutual
                </Badge>
              )}
            </View>
            <View className="flex-row items-center">
              <AtSign className="text-muted-foreground mr-1" size={14} />
              <Text className="text-muted-foreground text-sm">{item.username}</Text>
            </View>
            {item.location && (
              <View className="flex-row items-center mt-1">
                <MapPin className="text-muted-foreground mr-1" size={14} />
                <Text className="text-muted-foreground text-sm">{item.location}</Text>
              </View>
            )}
          </View>
          
          <View className="flex-row space-x-2">
            <Button
              variant="ghost"
              size="sm"
              className="p-2"
              onPress={() => router.push(`/chat/${item.id}`)}
            >
              <MessageSquare size={20} className="text-primary" />
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="p-2"
              onPress={() => toggleFollow(item.id)}
            >
              {following.includes(item.id) ? (
                <UserMinus size={20} className="text-primary-foreground" />
              ) : (
                <UserPlus size={20} className="text-primary-foreground" />
              )}
            </Button>
          </View>
        </View>
        
        {item.status_message && (
          <View className="mt-3 bg-muted/50 rounded-lg p-2">
            <Text className="text-sm italic">{item.status_message}</Text>
          </View>
        )}
      </CardContent>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'People',
        }}
      />
      
      <View className="p-4">
        {/* Search Bar */}
        <View className="flex-row items-center bg-muted rounded-lg px-3 mb-4">
          <Search size={18} className="text-muted-foreground" />
          <Input
            placeholder="Search people..."
            className="flex-1 h-12 border-0 bg-transparent"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Tab Bar */}
        {renderTabBar()}
      </View>
      
      {/* People List */}
      <FlatList
        data={filteredPeople}
        renderItem={renderPersonCard}
        keyExtractor={(item) => item.id}
        contentContainerClassName="p-4"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />
        }
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            {loading ? (
              <ActivityIndicator size="large" />
            ) : (
              <>
                <Text className="text-lg font-semibold mb-2">No people found</Text>
                <Text className="text-muted-foreground text-center">
                  {searchQuery
                    ? 'Try adjusting your search'
                    : 'No people to show at the moment'}
                </Text>
              </>
            )}
          </View>
        }
      />
    </View>
  );
}
