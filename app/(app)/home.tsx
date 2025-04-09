import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth-context';
import { supabase } from '~/lib/supabase';
import { MessageSquare, Users, TrendingUp, Zap } from 'lucide-react-native';
import { ActivityFeed } from '~/components/activity/ActivityFeed';
import { router } from 'expo-router';
import { Activity } from '~/lib/types';

type RecentChat = {
  id: string;
  province_name: string;
  region_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

export default function HomeScreen() {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeRegions, setActiveRegions] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 18) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }

    loadHomeData();
    loadActivities();
  }, []);

  const loadHomeData = async () => {
    setLoading(true);
    setTimeout(() => {
      setRecentChats([
        {
          id: 'NCR-1',
          province_name: 'Manila',
          region_name: 'National Capital Region',
          last_message: 'Hello everyone! What\'s happening in Manila today?',
          last_message_time: '10 min ago',
          unread_count: 3,
        },
        {
          id: 'R7-2',
          province_name: 'Cebu',
          region_name: 'Central Visayas',
          last_message: 'Anyone joining the festival this weekend?',
          last_message_time: '2 hours ago',
          unread_count: 0,
        },
        {
          id: 'R3-3',
          province_name: 'Bulacan',
          region_name: 'Central Luzon',
          last_message: 'Looking for recommendations on best restaurants in Malolos!',
          last_message_time: '5 hours ago',
          unread_count: 5,
        },
      ]);
      setActiveUsers(152);
      setActiveRegions(12);
      setLoading(false);
      setRefreshing(false);
    }, 1000);
  };

  const loadActivities = async () => {
    const simulatedActivities = [
      {
        id: '1',
        activity_type: 'message_sent',
        metadata: {
          user: 'John Doe',
          message: 'Hello everyone!',
        },
        created_at: '10 min ago',
      },
      {
        id: '2',
        activity_type: 'status_update',
        metadata: {
          user: 'Jane Smith',
          status: 'Feeling great!',
        },
        created_at: '2 hours ago',
      },
    ];
    setActivities(simulatedActivities);
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadHomeData();
  };

  const renderHeader = () => (
    <View className="p-4">
      <View className="flex-row justify-between items-center mb-6">
        <View>
          <Text className="text-2xl font-bold">{greeting},</Text>
          <Text className="text-lg text-muted-foreground">
            {user?.username || user?.email?.split('@')[0] || 'Friend'}
          </Text>
        </View>
        {user?.user_metadata?.avatar_url ? (
          <Image
            source={{ uri: user.user_metadata.avatar_url }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
            <Text className="text-primary-foreground text-lg font-semibold">
              {user?.email?.substring(0, 1).toUpperCase() || 'U'}
            </Text>
          </View>
        )}
      </View>

      <View className="flex-row space-x-4 mb-6">
        <Card className="flex-1 p-4 border border-border">
          <View className="flex-row items-center space-x-2">
            <View className="bg-primary/10 p-2 rounded-full">
              <Users size={18} color="#6366F1" />
            </View>
            <Text className="text-sm text-muted-foreground">Active Users</Text>
          </View>
          <Text className="text-2xl font-bold mt-2">{activeUsers}</Text>
        </Card>
        
        <Card className="flex-1 p-4 border border-border">
          <View className="flex-row items-center space-x-2">
            <View className="bg-green-100 p-2 rounded-full">
              <TrendingUp size={18} color="#10B981" />
            </View>
            <Text className="text-sm text-muted-foreground">Active Regions</Text>
          </View>
          <Text className="text-2xl font-bold mt-2">{activeRegions}</Text>
        </Card>
      </View>

      <View className="mb-4">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-semibold">Recent Chats</Text>
          <Button 
            variant="ghost" 
            onPress={() => router.push('/chatrooms')}
            className="h-8 px-2"
          >
            <Text className="text-primary font-medium text-sm">View All</Text>
          </Button>
        </View>

        {recentChats.length === 0 && !loading ? (
          <Card className="p-6 items-center">
            <MessageSquare size={40} className="text-muted-foreground mb-2" />
            <Text className="text-center text-muted-foreground">
              No recent chats yet. Join a chatroom to start connecting!
            </Text>
            <Button
              className="mt-4"
              onPress={() => router.push('/chatrooms')}
            >
              <Text>Browse Chatrooms</Text>
            </Button>
          </Card>
        ) : (
          <View />
        )}
      </View>

      <Text className="text-xl font-semibold mb-4">Activity Feed</Text>
    </View>
  );

  const renderFooter = () => (
    <View className="p-4">
      <View className="mb-6">
        <Text className="text-xl font-semibold mb-4">Featured Topics</Text>
        <Card className="overflow-hidden border border-border">
          <View className="bg-primary/10 p-5">
            <View className="flex-row items-center mb-4">
              <View className="bg-primary p-2 rounded-full mr-3">
                <Zap size={20} color="#fff" />
              </View>
              <Text className="font-semibold">Philippine Festivals</Text>
            </View>
            <Text className="mb-4">
              Discover and discuss upcoming festivals and cultural events across the Philippines!
            </Text>
            <Button className="self-start">
              <Text>Explore Topics</Text>
            </Button>
          </View>
        </Card>
      </View>
    </View>
  );

  return (
    <FlatList
      data={activities}
      renderItem={({ item }) => (
        <View className="px-4">
          <ActivityFeed activities={[item]} />
        </View>
      )}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      contentContainerStyle={{ flexGrow: 1, backgroundColor: 'background' }}
    />
  );
}
