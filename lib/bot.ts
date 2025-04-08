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
    const supabaseUrl = "https://zvkwzfrafdytjfmxawed.supabase.co";
    const edgeFunctionUrl = `${supabaseUrl}/functions/v1/uzzap-bot`;
    
    // Prepare the request payload
    const payload = {
      userId,
      message,
      chatroomId,
    };
    
    // Use the service role key for authorization
    const serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp2a3d6ZnJhZmR5dGpmbXhhd2VkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Mzg0MzU4NCwiZXhwIjoyMDU5NDE5NTg0fQ.go73lsYGtBkZ47RtteYY63Pk8ncsWIya-0emxtcgxsw";

    // Call the edge function
    const response = await fetch(edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceRoleKey}`,
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
