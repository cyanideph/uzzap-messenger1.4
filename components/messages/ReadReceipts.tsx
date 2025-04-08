import React, { useEffect, useState } from 'react';
import { View, Image } from 'react-native';
import { Text } from '~/components/ui/text';
import { Check, CheckCheck } from 'lucide-react-native';
import { getMessageReadReceipts } from '~/lib/activity';

interface ReadReceiptsProps {
  messageId: string;
  isRead?: boolean;
}

interface ReadReceipt {
  reader: {
    username: string;
    avatar_url: string | null;
  };
  read_at: string;
}

export function ReadReceipts({ messageId, isRead }: ReadReceiptsProps) {
  const [readReceipts, setReadReceipts] = useState<ReadReceipt[]>([]);

  useEffect(() => {
    const fetchReadReceipts = async () => {
      const receipts = await getMessageReadReceipts(messageId);
      setReadReceipts(receipts);
    };

    if (isRead) {
      fetchReadReceipts();
    }
  }, [messageId, isRead]);

  if (!isRead) {
    return <Check size={14} className="text-muted-foreground" />;
  }

  return (
    <View className="flex-row items-center">
      <CheckCheck size={14} className="text-primary mr-1" />
      {readReceipts.length > 0 && (
        <View className="flex-row">
          {readReceipts.map((receipt, index) => (
            <View 
              key={index} 
              className="w-4 h-4 rounded-full overflow-hidden -ml-2 border border-background"
              style={{ zIndex: readReceipts.length - index }}
            >
              {receipt.reader.avatar_url ? (
                <Image
                  source={{ uri: receipt.reader.avatar_url }}
                  className="w-full h-full"
                />
              ) : (
                <View className="w-full h-full bg-primary justify-center items-center">
                  <Text className="text-[8px] text-primary-foreground">
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
