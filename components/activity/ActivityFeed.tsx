import React from 'react';
import { View, FlatList } from 'react-native';
import { Text } from '~/components/ui/text';
import { MessageCircle, UserPlus, UserMinus, LogIn, Edit } from 'lucide-react-native';

interface Activity {
  id: string;
  activity_type: string;
  target_type?: string;
  target_id?: string;
  metadata: Record<string, any>;
  created_at: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const renderActivityIcon = (type: string) => {
    switch (type) {
      case 'message_sent':
      case 'message_read':
        return <MessageCircle size={16} className="text-primary" />;
      case 'follow':
        return <UserPlus size={16} className="text-primary" />;
      case 'unfollow':
        return <UserMinus size={16} className="text-destructive" />;
      case 'login':
        return <LogIn size={16} className="text-primary" />;
      case 'profile_update':
        return <Edit size={16} className="text-primary" />;
      default:
        return null;
    }
  };

  const formatActivity = (activity: Activity) => {
    switch (activity.activity_type) {
      case 'message_sent':
        return 'sent a message';
      case 'message_read':
        return 'read a message';
      case 'follow':
        return 'followed someone';
      case 'unfollow':
        return 'unfollowed someone';
      case 'login':
        return 'logged in';
      case 'profile_update':
        return 'updated their profile';
      default:
        return activity.activity_type;
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <FlatList
      data={activities}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <View className="flex-row items-center py-2 border-b border-border">
          <View className="mr-3">{renderActivityIcon(item.activity_type)}</View>
          <View className="flex-1">
            <Text className="text-sm">{formatActivity(item)}</Text>
            <Text className="text-xs text-muted-foreground">
              {formatTime(item.created_at)}
            </Text>
          </View>
        </View>
      )}
    />
  );
}
