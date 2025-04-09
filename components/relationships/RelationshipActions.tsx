import React from 'react';
import { View } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { supabase } from '~/lib/supabase';
import { UserMinus, UserX } from 'lucide-react-native';

interface RelationshipActionsProps {
  userId: string;
  targetId: string;
  relationshipType?: string;
  onRelationshipChange: () => void;
}

export function RelationshipActions({
  userId,
  targetId,
  relationshipType,
  onRelationshipChange,
}: RelationshipActionsProps) {
  const blockUser = async () => {
    try {
      // First remove any existing relationship
      await supabase
        .from('user_relationships')
        .delete()
        .match({ user_id: userId, related_user_id: targetId });

      // Then add blocked relationship
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          user_id: userId,
          related_user_id: targetId,
          relationship_type: 'blocked'
        });

      if (error) {
        console.error('Error blocking user:', error);
        return;
      }

      onRelationshipChange();
    } catch (error) {
      console.error('Unexpected error in blockUser:', error);
    }
  };

  const unblockUser = async () => {
    try {
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .match({ user_id: userId, related_user_id: targetId });

      if (error) {
        console.error('Error unblocking user:', error);
        return;
      }

      onRelationshipChange();
    } catch (error) {
      console.error('Unexpected error in unblockUser:', error);
    }
  };

  if (relationshipType === 'blocked') {
    return (
      <View className="mt-4">
        <Button variant="destructive" onPress={unblockUser}>
          <UserMinus className="mr-2 h-4 w-4" />
          <Text className="text-destructive-foreground">Unblock User</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="mt-4">
      <Button variant="destructive" onPress={blockUser}>
        <UserX className="mr-2 h-4 w-4" />
        <Text className="text-destructive-foreground">Block User</Text>
      </Button>
    </View>
  );
}
