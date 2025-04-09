import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, Alert, ActivityIndicator } from 'react-native';
import { Stack } from 'expo-router';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Card, CardContent } from '~/components/ui/card';
import { Avatar } from '~/components/ui/avatar';
import { Badge } from '~/components/ui/badge';
import { Button } from '~/components/ui/button';
import { useAuth } from '~/lib/auth-context';
import { getUserRelationships } from '~/lib/supabase';
import { RelationshipActions } from '~/components/relationships/RelationshipActions';
import { MessageSquare, User, UserPlus } from 'lucide-react-native';
import { cn } from '~/lib/utils';

interface Friend {
  id: string;
  user_id: string;
  related_user: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
    is_online?: boolean;
  };
  relationship_type: string;
  created_at: string;
}

export default function FriendsScreen() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchRelationships = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to view relationships');
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await getUserRelationships(user.id);
      if (error) {
        console.error('Error fetching relationships:', error);
        return;
      }
      
      setRelationships(data?.filter((item): item is Friend => !!item) ?? []);
    } catch (error) {
      console.error('Unexpected error in fetchRelationships:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRelationships();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRelationships();
  };

  const renderFriendCard = ({ item }: { item: Friend }) => (
    <Card className="mb-3">
      <CardContent className="p-4">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => router.push(`/profile/${item.related_user.id}`)}
            className="mr-3"
          >
            <View className="relative">
              <Avatar
                src={item.related_user.avatar_url || undefined}
                alt={item.related_user.full_name || item.related_user.username}
                size="lg"
                fallback={(item.related_user.username[0] || '?').toUpperCase()}
              />
              {item.related_user.is_online && (
                <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
              )}
            </View>
          </TouchableOpacity>
          
          <View className="flex-1">
            <View className="flex-row items-center">
              <Text className="font-semibold mr-2">
                {item.related_user.full_name || item.related_user.username}
              </Text>
              <Badge variant="secondary" className="capitalize">
                {item.relationship_type}
              </Badge>
            </View>
            <Text className="text-muted-foreground text-sm">
              @{item.related_user.username}
            </Text>
          </View>
          
          <View className="flex-row space-x-2">
            <Button
              variant="outline"
              size="sm"
              className="p-2"
              onPress={() => router.push(`/direct-message/${item.related_user.id}`)}
            >
              <MessageSquare size={18} className="text-primary" />
            </Button>
            {user && (
              <RelationshipActions
                userId={user.id}
                targetId={item.related_user.id}
                relationshipType={item.relationship_type}
                onRelationshipChange={fetchRelationships}
              />
            )}
          </View>
        </View>
      </CardContent>
    </Card>
  );

  return (
    <View className="flex-1 bg-background">
      <Stack.Screen
        options={{
          title: 'Friends',
        }}
      />
      
      {loading && !refreshing ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={relationships}
          renderItem={renderFriendCard}
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
              <View className="w-16 h-16 bg-primary/10 rounded-full items-center justify-center mb-3">
                <UserPlus size={32} className="text-primary" />
              </View>
              <Text className="text-lg font-semibold mb-2">No friends yet</Text>
              <Text className="text-muted-foreground text-center mb-4">
                Start connecting with people in the People tab
              </Text>
              <Button
                variant="outline"
                onPress={() => router.push('/people')}
              >
                <UserPlus size={18} className="mr-2" />
                <Text>Find People</Text>
              </Button>
            </View>
          }
        />
      )}
    </View>
  );
}
