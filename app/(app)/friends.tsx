import React, { useEffect, useState } from 'react';
import { View, FlatList, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { useAuth } from '~/lib/auth-context';
import { getUserRelationships } from '~/lib/supabase';
import { RelationshipActions } from '~/components/relationships/RelationshipActions';

interface Friend {
  id: string;
  user_id: string;
  related_user: {
    id: string;
    username: string;
    full_name?: string;
    avatar_url?: string;
  };
  relationship_type: string;
  created_at: string;
}

export default function FriendsScreen() {
  const { user } = useAuth();
  const [relationships, setRelationships] = useState<Friend[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRelationships = async () => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to view relationships');
      return;
    }
    
    const { data, error } = await getUserRelationships(user.id);
    if (error) {
      console.error('Error fetching relationships:', error);
      return;
    }
    
    // Ensure data is not null and matches Friend type
    setRelationships(data?.filter((item): item is Friend => !!item) ?? []);
  };

  useEffect(() => {
    fetchRelationships();
  }, [user?.id]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchRelationships().finally(() => setRefreshing(false));
  };

  return (
    <View className="flex-1 bg-background">
      <FlatList
        data={relationships}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="p-4 border-b border-border"
            onPress={() => router.push({
              pathname: '/profile/[id]',
              params: { id: item.related_user.id }
            })}
          >
            <View className="flex-row justify-between items-center">
              <View>
                <Text className="font-semibold">
                  {item.related_user.full_name || item.related_user.username}
                </Text>
                <Text className="text-sm text-muted-foreground">
                  @{item.related_user.username}
                </Text>
                <Text className="text-xs text-muted-foreground mt-1 capitalize">
                  {item.relationship_type}
                </Text>
              </View>
              
              {user && (
                <RelationshipActions
                  userId={user.id}
                  targetId={item.related_user.id}
                  currentRelationship={item.relationship_type}
                  onRelationshipChange={fetchRelationships}
                />
              )}
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
