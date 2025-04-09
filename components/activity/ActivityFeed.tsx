import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { MessageCircle, UserPlus, UserMinus, LogIn, Edit } from 'lucide-react-native';

interface Activity {
  id: string;
  activity_type: string;
  metadata: {
    user: string;
    message?: string;
    status?: string;
  };
  created_at: string;
}

interface ActivityFeedProps {
  activities: Activity[];
}

const formatActivity = (activity: Activity): string => {
  switch (activity.activity_type) {
    case 'message_sent':
      return `${activity.metadata.user} sent a message: "${activity.metadata.message}"`;
    case 'status_update':
      return `${activity.metadata.user} updated their status: "${activity.metadata.status}"`;
    default:
      return `${activity.metadata.user} performed an action`;
  }
};

const formatTime = (time: string): string => {
  return time; // You can add more sophisticated time formatting here
};

export function ActivityFeed({ activities }: ActivityFeedProps) {
  if (!activities || activities.length === 0) return null;
  
  const activity = activities[0]; // We now expect only one activity
  
  return (
    <View className="p-4 bg-muted/50 rounded-lg mb-2">
      <View className="flex-1">
        <Text className="text-sm">{formatActivity(activity)}</Text>
        <Text className="text-xs text-muted-foreground">
          {formatTime(activity.created_at)}
        </Text>
      </View>
    </View>
  );
}
