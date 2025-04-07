import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Stack, useLocalSearchParams, router } from 'expo-router';
import { Text } from '~/components/ui/text';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { useAuth } from '~/lib/auth-context';
import { Send, ArrowLeft, MoreVertical, Phone, Video, User, Bot, Smile, Paperclip } from 'lucide-react-native';
import { useColorScheme } from '~/lib/useColorScheme';
import { supabase } from '~/lib/supabase';
import { sendMessageToBot, isBot, getBotCommands } from '~/lib/bot';

// Type definitions for Supabase data
interface Profile {
  username: string;
  avatar_url: string | null;
  full_name?: string;
}

interface DMData {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender?: Profile;
  recipient?: Profile;
}

// Direct message type for UI
interface DirectMessage {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string | null;
  text: string;
  timestamp: Date;
  isCurrentUser: boolean;
}

export default function DirectMessageScreen() {
  const { id, username } = useLocalSearchParams<{ id: string; username: string }>();
  const { user } = useAuth();
  const { isDarkColorScheme } = useColorScheme();
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [recipientProfile, setRecipientProfile] = useState<Profile | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!id || !user?.id) return;
    
    const fetchMessages = async () => {
      try {
        setLoading(true);
        
        // Get recipient profile info
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, avatar_url, full_name')
          .eq('id', id)
          .single();
        
        if (profileError) {
          console.error('Error fetching recipient profile:', profileError);
        } else {
          setRecipientProfile(profileData);
        }
        
        // Check if a conversation exists or create one
        const { data: existingConversation, error: conversationError } = await supabase
          .from('conversations')
          .select('id')
          .or(`user1_id.eq.${user.id}.and.user2_id.eq.${id},user1_id.eq.${id}.and.user2_id.eq.${user.id}`)
          .single();
        
        if (conversationError && conversationError.code !== 'PGRST116') { // Code for no rows returned
          console.error('Error checking for existing conversation:', conversationError);
        }
        
        if (!existingConversation) {
          // Create a new conversation
          const { data: newConversation, error: createError } = await supabase
            .from('conversations')
            .insert({
              user1_id: user.id,
              user2_id: id,
            })
            .select('id')
            .single();
          
          if (createError) {
            console.error('Error creating conversation:', createError);
          }
        }
        
        // Fetch messages
        const { data: messagesData, error: messagesError } = await supabase
          .from('direct_messages')
          .select('id, sender_id, recipient_id, content, created_at, is_read')
          .or(`sender_id.eq.${user.id}.and.recipient_id.eq.${id},sender_id.eq.${id}.and.recipient_id.eq.${user.id}`)
          .order('created_at', { ascending: true });
        
        if (messagesError) {
          console.error('Error fetching messages:', messagesError);
          return;
        }
        
        // Format messages for display
        const formattedMessages: DirectMessage[] = messagesData.map((msg) => ({
          id: msg.id,
          userId: msg.sender_id,
          userName: msg.sender_id === user?.id ? 'You' : (profileData?.username || 'User'),
          userAvatar: msg.sender_id === user?.id ? null : profileData?.avatar_url,
          text: msg.content,
          timestamp: new Date(msg.created_at),
          isCurrentUser: msg.sender_id === user?.id
        }));
        
        setMessages(formattedMessages);
        
        // Mark messages as read
        if (messagesData.some(msg => msg.recipient_id === user.id && !msg.is_read)) {
          const { error: updateError } = await supabase
            .from('direct_messages')
            .update({ is_read: true })
            .eq('recipient_id', user.id)
            .eq('sender_id', id);
          
          if (updateError) {
            console.error('Error marking messages as read:', updateError);
          }
        }
      } catch (error) {
        console.error('Unexpected error in fetchMessages:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('public:direct_messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'direct_messages',
        filter: `or(and(sender_id.eq.${user.id},recipient_id.eq.${id}),and(sender_id.eq.${id},recipient_id.eq.${user.id}))`
      }, async (payload) => {
        const newMsg = payload.new as DMData;
        const isCurrentUser = newMsg.sender_id === user.id;
        
        // Add new message to state
        const formattedMessage: DirectMessage = {
          id: newMsg.id,
          userId: newMsg.sender_id,
          userName: isCurrentUser ? 'You' : (recipientProfile?.username || 'User'),
          userAvatar: isCurrentUser ? null : recipientProfile?.avatar_url ?? null,
          text: newMsg.content,
          timestamp: new Date(newMsg.created_at),
          isCurrentUser
        };
        
        setMessages(prev => [...prev, formattedMessage]);
        
        // Mark message as read if we're the recipient
        if (newMsg.recipient_id === user.id) {
          const { error: updateError } = await supabase
            .from('direct_messages')
            .update({ is_read: true })
            .eq('id', newMsg.id);
          
          if (updateError) {
            console.error('Error marking message as read:', updateError);
          }
        }
        
        // Scroll to bottom
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [id, user?.id, username]);

  const sendMessage = async () => {
    if (message.trim() === '' || !user?.id || !id) return;

    try {
      const messageContent = message.trim();
      
      // Check if the recipient is the bot
      const isBotRecipient = id === '00000000-0000-0000-0000-000000000666';
      
      // Check if this is a bot command or message to the bot
      if (messageContent.startsWith('/') || isBotRecipient) {
        // Save user's message to database
        const { error } = await supabase
          .from('direct_messages')
          .insert({
            sender_id: user.id,
            recipient_id: id,
            content: messageContent,
            is_read: false
          });

        if (error) {
          console.error('Error saving user message:', error);
          return;
        }
        
        // Call the bot with this command/message
        const botResponse = await sendMessageToBot(messageContent, user.id);
        
        if (!botResponse) {
          console.log('No response from bot or error occurred');
        }
        // Note: The bot response will be handled by the subscription
      } else {
        // Regular message to another user
        const { error } = await supabase
          .from('direct_messages')
          .insert({
            sender_id: user.id,
            recipient_id: id,
            content: messageContent,
            is_read: false
          });

        if (error) {
          console.error('Error sending message:', error);
          return;
        }
      }
      
      // Update the conversation's last_message_at timestamp
      await supabase
        .from('conversations')
        .update({ last_message_at: new Date().toISOString() })
        .or(`user1_id.eq.${user.id}.and.user2_id.eq.${id},user1_id.eq.${id}.and.user2_id.eq.${user.id}`);

      // Clear input
      setMessage('');
    } catch (error) {
      console.error('Unexpected error in sendMessage:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessageDate = (timestamp: Date) => {
    const today = new Date();
    const messageDate = new Date(timestamp);
    
    if (today.toDateString() === messageDate.toDateString()) {
      return 'Today';
    } else if (
      new Date(today.setDate(today.getDate() - 1)).toDateString() === messageDate.toDateString()
    ) {
      return 'Yesterday';
    } else {
      return messageDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    }
  };
  
  // Show bot commands when user taps the bot button
  const showBotCommands = () => {
    const commands = getBotCommands();
    const commandsText = commands.map(cmd => `/${cmd.name} - ${cmd.description}`).join('\n');
    
    Alert.alert(
      'UzZap Bot Commands',
      commandsText,
      [{ text: 'OK', style: 'default' }]
    );
  };

  // Group messages by date
  const groupedMessages: { [key: string]: DirectMessage[] } = {};
  messages.forEach(msg => {
    const dateString = renderMessageDate(msg.timestamp);
    if (!groupedMessages[dateString]) {
      groupedMessages[dateString] = [];
    }
    groupedMessages[dateString].push(msg);
  });

  // Flatten the grouped messages for FlatList
  const flatListData: (DirectMessage | { id: string; isDateDivider: true; date: string })[] = [];
  Object.entries(groupedMessages).forEach(([date, msgs]) => {
    flatListData.push({ id: `date-${date}`, isDateDivider: true, date });
    flatListData.push(...msgs);
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <Stack.Screen
        options={{
          headerShown: true,
          headerTitle: () => (
            <TouchableOpacity 
              className="flex-row items-center" 
              onPress={() => router.push({
                pathname: "/profile/[id]",
                params: { id, username }
              })}
            >
              <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2">
                <Text className="text-primary font-semibold">
                  {username?.substring(0, 1).toUpperCase() || 'U'}
                </Text>
              </View>
              <Text className="font-semibold">{username || 'User'}</Text>
            </TouchableOpacity>
          ),
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} className="mr-2">
              <ArrowLeft size={24} color={isDarkColorScheme ? '#fff' : '#000'} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <View className="flex-row space-x-4">
              <TouchableOpacity onPress={showBotCommands}>
                <Bot size={20} className="text-primary" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {/* Add voice call functionality */}}>
                <Phone size={20} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {/* Add video call functionality */}}>
                <Video size={20} color={isDarkColorScheme ? '#fff' : '#000'} />
              </TouchableOpacity>
            </View>
          ),
        }}
      />

      <View className="flex-1 bg-background">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
            <Text className="mt-4 text-muted-foreground">Loading messages...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={flatListData}
            keyExtractor={(item) => 'isDateDivider' in item ? item.id : item.id}
            contentContainerStyle={{ paddingTop: 16, paddingBottom: 8, paddingHorizontal: 16 }}
            initialNumToRender={25}
            onContentSizeChange={() => {
              // Initial scroll to bottom
              flatListRef.current?.scrollToEnd({ animated: false });
            }}
            renderItem={({ item }) => {
              // Render date divider
              if ('isDateDivider' in item && item.isDateDivider) {
                return (
                  <View className="flex-row justify-center my-4">
                    <Badge variant="outline">
                      {item.date}
                    </Badge>
                  </View>
                );
              }
              
              // Render message
              const message = item as DirectMessage;
              const isBotMessage = isBot(message.userId);
              
              return (
                <View 
                  className={`mb-2 max-w-[80%] ${message.isCurrentUser ? 'self-end' : 'self-start'}`}
                  style={{ alignSelf: message.isCurrentUser ? 'flex-end' : 'flex-start' }}
                >
                  {isBotMessage && !message.isCurrentUser && (
                    <View className="flex-row items-center mb-1">
                      <Text className="text-xs text-muted-foreground">UzZap Bot</Text>
                      <Badge className="ml-1 py-0" variant="secondary">
                        <Bot size={10} className="mr-1" />
                        <Text className="text-[9px]">BOT</Text>
                      </Badge>
                    </View>
                  )}
                  
                  <View 
                    className={`rounded-2xl p-3 ${
                      message.isCurrentUser 
                        ? 'bg-primary' 
                        : isBotMessage
                          ? 'bg-secondary border border-border'
                          : 'bg-muted border border-border'
                    }`}
                  >
                    <Text 
                      className={message.isCurrentUser 
                        ? 'text-primary-foreground' 
                        : isBotMessage 
                          ? 'text-secondary-foreground' 
                          : 'text-foreground'}
                    >
                      {message.text}
                    </Text>
                  </View>
                  <Text
                    className="text-xs text-muted-foreground mt-1"
                    style={{ alignSelf: message.isCurrentUser ? 'flex-end' : 'flex-start' }}
                  >
                    {formatTime(message.timestamp)}
                  </Text>
                </View>
              );
            }}
          />
        )}
        
        <View className="border-t border-border p-2 bg-background">
          <View className="flex-row items-center bg-muted rounded-full p-1">
            <View className="flex-row space-x-1 p-1">
              <TouchableOpacity className="p-2" onPress={showBotCommands}>
                <Bot size={22} className="text-primary" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Smile size={22} className="text-muted-foreground" />
              </TouchableOpacity>
              <TouchableOpacity className="p-2">
                <Paperclip size={22} className="text-muted-foreground" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              className="flex-1 h-10 px-3 text-foreground"
              placeholder="Message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            {message.trim() !== '' && (
              <TouchableOpacity 
                className="bg-primary w-10 h-10 rounded-full items-center justify-center mr-1"
                onPress={sendMessage}
              >
                <Send size={18} color="#ffffff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
