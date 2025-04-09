import React, { useState } from 'react';
import { View, TextInput } from 'react-native';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Clock, Send } from 'lucide-react-native';
import { supabase } from '~/lib/supabase';

interface StatusUpdateProps {
  userId: string;
  currentStatus?: string;
  lastUpdate?: string;
  onStatusUpdated: () => void;
}

export function StatusUpdate({ userId, currentStatus, lastUpdate, onStatusUpdated }: StatusUpdateProps) {
  const [status, setStatus] = useState(currentStatus || '');
  const [updating, setUpdating] = useState(false);

  const updateStatus = async () => {
    if (!status.trim()) return;
    setUpdating(true);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          status_message: status.trim(),
          last_status_update: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      onStatusUpdated();
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdating(false);
    }
  };

  const formatLastUpdate = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes

    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <View className="mb-4">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium">Status Update</Text>
        {lastUpdate && (
          <View className="flex-row items-center">
            <Clock size={12} className="text-muted-foreground mr-1" />
            <Text className="text-xs text-muted-foreground">
              {formatLastUpdate(lastUpdate)}
            </Text>
          </View>
        )}
      </View>
      
      <View className="flex-row items-center space-x-2">
        <TextInput
          className="flex-1 px-3 py-2 rounded-lg bg-muted text-foreground"
          placeholder="What's on your mind?"
          value={status}
          onChangeText={setStatus}
          maxLength={100}
        />
        <Button
          size="sm"
          variant="ghost"
          className="p-2"
          disabled={!status.trim() || updating}
          onPress={updateStatus}
        >
          <Send size={16} />
        </Button>
      </View>
    </View>
  );
}
