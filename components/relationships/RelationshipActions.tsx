import React, { useState } from 'react';
import { View, Alert } from 'react-native';
import { Button } from '~/components/ui/button';
import { UserMinus, UserPlus, UserX } from 'lucide-react-native';
import { addFriend, blockUser, removeRelationship } from '~/lib/supabase';

interface RelationshipActionsProps {
  userId: string;
  targetId: string;
  relationshipType?: string;  // Changed from relationship to relationshipType
  onRelationshipChange: () => void;
}

export function RelationshipActions({ 
  userId, 
  targetId, 
  relationshipType,
  onRelationshipChange 
}: RelationshipActionsProps) {
  const [loading, setLoading] = useState(false);

  const handleAddFriend = async () => {
    setLoading(true);
    const { error } = await addFriend(userId, targetId);
    if (error) {
      Alert.alert('Error', 'Failed to add friend');
    } else {
      onRelationshipChange();
    }
    setLoading(false);
  };

  const handleBlock = async () => {
    Alert.alert(
      'Block User',
      'Are you sure you want to block this user?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Block',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            const { error } = await blockUser(userId, targetId);
            if (error) {
              Alert.alert('Error', 'Failed to block user');
            } else {
              onRelationshipChange();
            }
            setLoading(false);
          }
        }
      ]
    );
  };

  const handleRemoveRelationship = async () => {
    setLoading(true);
    const { error } = await removeRelationship(userId, targetId);
    if (error) {
      Alert.alert('Error', 'Failed to remove relationship');
    } else {
      onRelationshipChange();
    }
    setLoading(false);
  };

  return (
    <View className="flex-row space-x-2">
      {!relationshipType && (
        <Button 
          variant="outline" 
          onPress={handleAddFriend}
          disabled={loading}
        >
          <UserPlus size={16} className="mr-1" />
          Add Friend
        </Button>
      )}

      {relationshipType === 'friend' && (
        <Button 
          variant="outline" 
          onPress={handleRemoveRelationship}
          disabled={loading}
        >
          <UserMinus size={16} className="mr-1" />
          Remove Friend
        </Button>
      )}

      {relationshipType !== 'blocked' && (
        <Button 
          variant="destructive" 
          onPress={handleBlock}
          disabled={loading}
        >
          <UserX size={16} className="mr-1" />
          Block
        </Button>
      )}
    </View>
  );
}
