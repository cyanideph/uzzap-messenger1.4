import { supabase } from './supabase';

export type ActivityType = 
  | 'login'
  | 'logout'
  | 'view_profile'
  | 'send_message'
  | 'join_chatroom'
  | 'leave_chatroom';

export async function trackActivity(
  userId: string, 
  activityType: ActivityType, 
  metadata: any = {}
) {
  try {
    const { error } = await supabase
      .from('user_activity')
      .insert({
        user_id: userId,
        activity_type: activityType,
        metadata
      });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
}

export async function markMessageAsRead(messageId: string, readerId: string) {
  try {
    const { error } = await supabase
      .from('message_reads')
      .insert({
        message_id: messageId,
        reader_id: readerId
      })
      .select()
      .single();

    if (error && error.code !== '23505') { // Ignore unique violation
      throw error;
    }
  } catch (error) {
    console.error('Error marking message as read:', error);
  }
}

export async function getMessageReadReceipts(messageId: string) {
  const { data, error } = await supabase
    .from('message_reads')
    .select('*, reader:profiles(username, avatar_url)')
    .eq('message_id', messageId)
    .order('read_at', { ascending: true });

  if (error) {
    console.error('Error fetching read receipts:', error);
    return [];
  }

  return data;
}
