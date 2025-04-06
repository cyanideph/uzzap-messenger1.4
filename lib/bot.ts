// UzZap Bot Client Integration
import { supabase } from './supabase';

// Credentials for the bot account
const BOT_ID = '00000000-0000-0000-0000-000000000666';

/**
 * Send a message to the UzZap Bot and process the response
 * @param message The message/command to send to the bot
 * @param userId The ID of the current user
 * @param chatroomId Optional chatroom ID if used in a chatroom
 * @returns Promise with the bot's response
 */
export async function sendMessageToBot(
  message: string,
  userId: string,
  chatroomId?: string
): Promise<string | null> {
  try {
    // Get the Supabase URL from the client
    const supabaseUrl = supabase.getUrl();
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/uzzap-bot`;
    
    // Prepare the request payload
    const payload = {
      userId,
      message,
      chatroomId,
    };
    
    // Get the user's session token for authorization
    const {
      data: { session },
    } = await supabase.auth.getSession();
    
    if (!session) {
      console.error('No active session found');
      return null;
    }
    
    // Call the edge function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`,
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Bot response error:', errorData);
      return null;
    }
    
    const data = await response.json();
    return data.botResponse || null;
  } catch (error) {
    console.error('Error sending message to bot:', error);
    return null;
  }
}

/**
 * Check if a user ID belongs to the bot
 * @param userId The user ID to check
 * @returns boolean indicating if the user is the bot
 */
export function isBot(userId: string): boolean {
  return userId === BOT_ID;
}

/**
 * Helper function to format bot commands for display
 * @param commands An array of command objects
 * @returns Formatted HTML string with commands
 */
export function formatBotCommands(commands: { name: string; description: string }[]): string {
  return commands
    .map(cmd => `<div><strong>/${cmd.name}</strong> - ${cmd.description}</div>`)
    .join('');
}

/**
 * Get all available bot commands
 * @returns Array of bot commands
 */
export function getBotCommands() {
  return [
    { name: 'help', description: 'Shows available commands and usage' },
    { name: 'info', description: 'Shows information about UzZap messenger' },
    { name: 'weather', description: 'Shows weather forecast for a location' },
    { name: 'stats', description: 'Shows statistics about UzZap usage' },
    { name: 'profile', description: 'Shows user profile information' },
    { name: 'regions', description: 'Lists available regions in the Philippines' },
    { name: 'random', description: 'Generates a random number, rolls a dice, or flips a coin' },
  ];
}
