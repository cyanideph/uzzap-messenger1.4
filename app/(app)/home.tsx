import React, { useEffect, useState } from 'react';
import { View, FlatList, RefreshControl, Image, ScrollView, Animated, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from '~/components/ui/text';
import { Card, CardHeader, CardContent, CardFooter } from '~/components/ui/card';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth-context';
import { supabase } from '~/lib/supabase';
import { MessageSquare, Users, TrendingUp, Zap, Bell, Search, Settings, Heart, MessageCircle } from 'lucide-react-native';
import { ActivityFeed } from '~/components/activity/ActivityFeed';
import { router, Stack } from 'expo-router';
import { Activity } from '~/lib/types';
import { Avatar } from '~/components/ui/avatar';
import { Loading } from '~/components/ui/loading';
import { cn } from '~/lib/utils';
import { AuthUser } from '../../lib/supabase';
import { formatDistanceToNow } from 'date-fns';
import { User } from '@supabase/supabase-js';

type ExtendedUser = User & {
  avatar_url?: string;
  username?: string;
};

type RecentChat = {
  id: string;
  province_name: string;
  region_name: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
};

interface Post {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    username: string;
    avatar_url?: string;
  };
  likes_count: number;
  comments_count: number;
}

export default function HomeScreen() {
  const { user } = useAuth() as { user: ExtendedUser | null };
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [recentChats, setRecentChats] = useState<RecentChat[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [activeRegions, setActiveRegions] = useState(0);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const scrollY = new Animated.Value(0);

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

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadHomeData();
    loadActivities();
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const renderHeader = () => (
    <View className="px-4 py-6 bg-background">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-2xl font-bold text-foreground">{greeting}</Text>
          <Text className="text-muted-foreground">Welcome back!</Text>
        </View>
        <View className="flex-row space-x-2">
          <Button variant="ghost" size="sm" onPress={() => router.push('/(app)/messages')}>
            <Bell className="text-foreground" size={24} />
          </Button>
          <Button variant="ghost" size="sm" onPress={() => router.push('/(app)/people')}>
            <Search className="text-foreground" size={24} />
          </Button>
        </View>
      </View>

      <View className="flex-row justify-between mb-6">
        <Card className="flex-1 mr-2">
          <CardContent className="p-4">
            <View className="flex-row items-center">
              <View className="bg-primary/10 p-2 rounded-full mr-3">
                <Users className="text-primary" size={20} />
              </View>
              <View>
                <Text className="text-lg font-semibold">{activeUsers}</Text>
                <Text className="text-sm text-muted-foreground">Active Users</Text>
              </View>
            </View>
          </CardContent>
        </Card>
        <Card className="flex-1 ml-2">
          <CardContent className="p-4">
            <View className="flex-row items-center">
              <View className="bg-primary/10 p-2 rounded-full mr-3">
                <TrendingUp className="text-primary" size={20} />
              </View>
              <View>
                <Text className="text-lg font-semibold">{activeRegions}</Text>
                <Text className="text-sm text-muted-foreground">Active Regions</Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </View>
    </View>
  );

  const renderPost = ({ item }: { item: Post }) => (
    <Card className="mx-4 mb-4 overflow-hidden">
      <CardHeader className="p-4">
        <View className="flex-row items-center">
          <Avatar
            src={item.author.avatar_url}
            className="mr-3 w-8 h-8"
          />
          <View>
            <Text className="font-semibold">{item.author.username}</Text>
            <Text className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(item.created_at))} ago</Text>
          </View>
        </View>
      </CardHeader>
      <CardContent className="p-4">
        <Text className="text-base mb-4">{item.content}</Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row space-x-4">
            <Button variant="ghost" size="sm" className="flex-row items-center">
              <Heart className="w-4 h-4 mr-1" />
              <Text>{item.likes_count}</Text>
            </Button>
            <Button variant="ghost" size="sm" className="flex-row items-center">
              <MessageCircle className="w-4 h-4 mr-1" />
              <Text>{item.comments_count}</Text>
            </Button>
          </View>
        </View>
      </CardContent>
    </Card>
  );

  if (loading) {
    return <Loading />;
  }

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />

      <View className="p-4">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Avatar
              src={user?.avatar_url}
              className="w-8 h-8 mr-2"
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
              onPress={() => router.push('/(app)/messages')}
            >
              <Bell size={20} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onPress={() => router.push('/(app)/people')}
            >
              <Search size={20} />
            </Button>
          </View>
        </View>

        <View className="mt-6">
          {posts.map((post) => (
            <View key={post.id} className="bg-card rounded-lg p-4 mb-4">
              <View className="flex-row items-center mb-3">
                <Avatar
                  src={post.author.avatar_url}
                  className="w-8 h-8 mr-2"
                />
                <View>
                  <Text className="font-semibold">{post.author.username}</Text>
                  <Text className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(post.created_at))} ago
                  </Text>
                </View>
              </View>
              <Text className="text-base mb-3">{post.content}</Text>
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-row items-center"
                  >
                    <Heart className="w-4 h-4 mr-1" />
                    <Text>{post.likes_count}</Text>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-row items-center ml-2"
                  >
                    <MessageCircle className="w-4 h-4 mr-1" />
                    <Text>{post.comments_count}</Text>
                  </Button>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
