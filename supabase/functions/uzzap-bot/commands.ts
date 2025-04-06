// UzZap Bot Commands
import { SupabaseClient } from 'supabase';
import { BotRequest } from './index';

export interface BotCommand {
  name: string;
  description: string;
  usage: string;
  execute: (request: BotRequest, supabase: SupabaseClient) => Promise<string>;
}

// Command: Help
const helpCommand: BotCommand = {
  name: 'help',
  description: 'Shows available commands and usage',
  usage: '/help [command]',
  execute: async (request: BotRequest, supabase: SupabaseClient) => {
    if (request.args && request.args.length > 0) {
      const commandName = request.args[0].toLowerCase();
      const command = commands.find(cmd => cmd.name === commandName);
      
      if (command) {
        return `**${command.name}**: ${command.description}\nUsage: ${command.usage}`;
      } else {
        return `Command not found: ${commandName}\nType /help to see all available commands.`;
      }
    }
    
    let response = '**UzZap Bot Commands**\n\n';
    commands.forEach(command => {
      response += `**/${command.name}** - ${command.description}\n`;
    });
    
    response += '\nFor more details about a specific command, type /help [command]';
    return response;
  }
};

// Command: Info
const infoCommand: BotCommand = {
  name: 'info',
  description: 'Shows information about UzZap messenger',
  usage: '/info',
  execute: async () => {
    return `**UzZap Messenger**\n\nUzZap is a Filipino chat application that connects people across different regions of the Philippines. Features include:\n\n- Regional chatrooms for local communities\n- Direct messaging between users\n- User profiles and follow system\n- Real-time messaging via Supabase\n\nVersion: 1.4\nCreated: 2025`;
  }
};

// Command: Weather
const weatherCommand: BotCommand = {
  name: 'weather',
  description: 'Shows weather forecast for a location',
  usage: '/weather [location]',
  execute: async (request: BotRequest) => {
    if (!request.args || request.args.length === 0) {
      return 'Please specify a location. Usage: /weather [location]';
    }
    
    const location = request.args.join(' ');
    // In a real implementation, this would call a weather API
    // For demonstration, we'll return mock data
    
    const conditions = [
      'Sunny', 'Partly cloudy', 'Cloudy', 'Light rain', 'Heavy rain',
      'Thunderstorms', 'Clear skies', 'Foggy', 'Windy'
    ];
    
    const randomCondition = conditions[Math.floor(Math.random() * conditions.length)];
    const temperature = Math.floor(Math.random() * 10) + 25; // 25-34°C typical for Philippines
    const humidity = Math.floor(Math.random() * 30) + 60; // 60-90% humidity
    
    return `**Weather for ${location}**\n\nCondition: ${randomCondition}\nTemperature: ${temperature}°C\nHumidity: ${humidity}%\n\n_Note: This is simulated data for demonstration purposes._`;
  }
};

// Command: Stats
const statsCommand: BotCommand = {
  name: 'stats',
  description: 'Shows statistics about UzZap usage',
  usage: '/stats',
  execute: async (request: BotRequest, supabase: SupabaseClient) => {
    try {
      // Get user count
      const { count: userCount, error: userError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
        
      if (userError) throw userError;
      
      // Get chatroom count
      const { count: chatroomCount, error: chatroomError } = await supabase
        .from('chatrooms')
        .select('*', { count: 'exact', head: true });
        
      if (chatroomError) throw chatroomError;
      
      // Get message count
      const { count: messageCount, error: messageError } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true });
        
      if (messageError) throw messageError;
      
      // Get online user count
      const { count: onlineCount, error: onlineError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_online', true);
        
      if (onlineError) throw onlineError;
      
      return `**UzZap Statistics**\n\nTotal Users: ${userCount || 0}\nChatrooms: ${chatroomCount || 0}\nMessages Sent: ${messageCount || 0}\nUsers Online: ${onlineCount || 0}`;
    } catch (error) {
      console.error('Error fetching stats:', error);
      return 'Sorry, I encountered an error while fetching statistics. Please try again later.';
    }
  }
};

// Command: Profile
const profileCommand: BotCommand = {
  name: 'profile',
  description: 'Shows user profile information',
  usage: '/profile [username]',
  execute: async (request: BotRequest, supabase: SupabaseClient) => {
    try {
      let targetUsername: string;
      let targetUserId: string;
      
      if (request.args && request.args.length > 0) {
        // Get profile by specified username
        targetUsername = request.args[0];
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', targetUsername)
          .single();
          
        if (error || !data) {
          return `User not found: ${targetUsername}`;
        }
        
        targetUserId = data.id;
      } else {
        // Get profile of the requesting user
        targetUserId = request.userId;
        
        // Get username
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', targetUserId)
          .single();
          
        if (error || !data) {
          return 'Could not retrieve your profile information.';
        }
        
        targetUsername = data.username;
      }
      
      // Get detailed profile info
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, bio, avatar_url, created_at')
        .eq('id', targetUserId)
        .single();
        
      if (profileError || !profile) {
        return 'Could not retrieve profile information.';
      }
      
      // Get follower count
      const { count: followerCount, error: followerError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetUserId);
      
      if (followerError) {
        console.error('Error fetching follower count:', followerError);
      }
      
      // Get following count
      const { count: followingCount, error: followingError } = await supabase
        .from('user_follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetUserId);
      
      if (followingError) {
        console.error('Error fetching following count:', followingError);
      }
      
      // Format profile info
      const joinDate = new Date(profile.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long'
      });
      
      return `**Profile: @${profile.username}**\n\nName: ${profile.full_name || 'Not set'}\nJoined: ${joinDate}\nFollowers: ${followerCount || 0}\nFollowing: ${followingCount || 0}\n\nBio: ${profile.bio || 'No bio available'}`;
    } catch (error) {
      console.error('Error in profile command:', error);
      return 'Sorry, I encountered an error while retrieving profile information.';
    }
  }
};

// Command: Regions
const regionsCommand: BotCommand = {
  name: 'regions',
  description: 'Lists available regions in the Philippines',
  usage: '/regions',
  execute: async (request: BotRequest, supabase: SupabaseClient) => {
    try {
      const { data: regions, error } = await supabase
        .from('regions')
        .select('id, name, description')
        .order('name');
        
      if (error) throw error;
      
      if (!regions || regions.length === 0) {
        return 'No regions found in the database.';
      }
      
      let response = '**Philippine Regions**\n\n';
      regions.forEach((region: { name: string; id: string; description?: string }) => {
        response += `**${region.name}** (${region.id}) - ${region.description || 'No description'}\n`;
      });
      
      return response;
    } catch (error) {
      console.error('Error fetching regions:', error);
      return 'Sorry, I encountered an error while fetching region information.';
    }
  }
};

// Command: Random
const randomCommand: BotCommand = {
  name: 'random',
  description: 'Generates a random number, rolls a dice, or flips a coin',
  usage: '/random [number|dice|coin]',
  execute: async (request: BotRequest) => {
    if (!request.args || request.args.length === 0) {
      return 'Please specify what to randomize: number, dice, or coin. Example: /random dice';
    }
    
    const type = request.args[0].toLowerCase();
    
    switch (type) {
      case 'number':
        const max = request.args[1] ? parseInt(request.args[1]) : 100;
        const randomNumber = Math.floor(Math.random() * max) + 1;
        return `Random number (1-${max}): **${randomNumber}**`;
      
      case 'dice':
        const sides = request.args[1] ? parseInt(request.args[1]) : 6;
        const diceRoll = Math.floor(Math.random() * sides) + 1;
        return `Dice roll (${sides}-sided): 🎲 **${diceRoll}**`;
      
      case 'coin':
        const coinFlip = Math.random() < 0.5 ? 'Heads' : 'Tails';
        return `Coin flip: **${coinFlip}**`;
      
      default:
        return `Invalid option: ${type}. Please use 'number', 'dice', or 'coin'.`;
    }
  }
};

// List of all available commands
export const commands: BotCommand[] = [
  helpCommand,
  infoCommand,
  weatherCommand,
  statsCommand,
  profileCommand,
  regionsCommand,
  randomCommand
];

// Process a command
export async function processCommand(request: BotRequest, supabase: SupabaseClient): Promise<string> {
  const { command } = request;
  
  if (!command) {
    return 'Invalid command format. Use /help to see available commands.';
  }
  
  const targetCommand = commands.find(cmd => cmd.name === command);
  
  if (!targetCommand) {
    return `Unknown command: /${command}. Type /help to see available commands.`;
  }
  
  try {
    return await targetCommand.execute(request, supabase);
  } catch (error) {
    console.error(`Error executing command /${command}:`, error);
    return `Sorry, an error occurred while processing the /${command} command.`;
  }
}
