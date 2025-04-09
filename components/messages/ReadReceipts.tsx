import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { supabase } from '~/lib/supabase';

interface ReadReceipt {
  reader: {
    id: string;
    username: string;
    avatar_url: string | null;
  };
  read_at: string;
}

interface SupabaseReadReceipt {
  reader: {
    id: string;
    username: string;
    avatar_url: string | null;
  }[];
  read_at: string;
}

interface ReadReceiptsProps {
  messageId: string;
  isRead?: boolean;
}

export function ReadReceipts({ messageId, isRead }: ReadReceiptsProps) {
  const [receipts, setReceipts] = useState<ReadReceipt[]>([]);

  useEffect(() => {
    if (!messageId || !isRead) return;

    const fetchReadReceipts = async () => {
      const { data, error } = await supabase
        .from('message_reads')
        .select('reader:reader_id(id, username, avatar_url), read_at')
        .eq('message_id', messageId)
        .order('read_at', { ascending: false });

      if (error) {
        console.error('Error fetching read receipts:', error);
        return;
      }

      // Transform the data to match the ReadReceipt type
      const formattedReceipts: ReadReceipt[] = (data || []).map((item: SupabaseReadReceipt) => ({
        reader: {
          id: item.reader[0].id,
          username: item.reader[0].username,
          avatar_url: item.reader[0].avatar_url
        },
        read_at: item.read_at
      }));

      setReceipts(formattedReceipts);
    };

    fetchReadReceipts();
  }, [messageId, isRead]);

  return (
    <View className="flex items-center justify-center">
      {isRead && (
        <View className="flex-row">
          {receipts.map((receipt, index) => (
            <View
              key={receipt.reader.id}
              className="w-4 h-4 rounded-full overflow-hidden border border-background"
              style={{ marginLeft: index > 0 ? -6 : 0, zIndex: receipts.length - index }}
            >
              {receipt.reader.avatar_url ? (
                <Image
                  source={{ uri: receipt.reader.avatar_url }}
                  className="w-full h-full bg-muted"
                />
              ) : (
                <View className="w-full h-full bg-primary/90 justify-center items-center">
                  <Text className="text-[8px] text-primary-foreground font-medium">
                    {receipt.reader.username[0].toUpperCase()}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
