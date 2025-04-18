// UzZap Bot Edge Function
import { serve } from 'http/server';
import { createClient, SupabaseClient } from 'supabase';
import { BotCommand, processCommand } from './commands.ts';

// Bot configuration
// Remove hardcoded credentials
const BOT_ID = Deno.env.get('BOT_ID') || '';
const BOT_EMAIL = Deno.env.get('BOT_EMAIL') || '';
const BOT_PASSWORD = Deno.env.get('BOT_PASSWORD') || '';

if (!BOT_ID || !BOT_EMAIL || !BOT_PASSWORD) {
  throw new Error('Bot credentials not properly configured in environment variables');
}

export interface BotRequest {
  userId: string;
  chatroomId?: string;
  message: string;
  command?: string;
  args?: string[];
}

serve(async (req: Request) => {
  // CORS headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    });
  }

  try {
    // Parse request body
    const body = await req.json();
    const { userId, chatroomId, message } = body as BotRequest;

    if (!userId || !message) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if message is a command (starts with /)
    let isCommand = false;
    let commandResponse = '';
    let commandName = '';
    let args: string[] = [];

    if (message.startsWith('/')) {
      isCommand = true;
      const commandParts = message.slice(1).split(' ');
      commandName = commandParts[0].toLowerCase();
      args = commandParts.slice(1);
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? 'https://your-project-url.supabase.co';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? 'your-service-key';
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Service Key:', supabaseServiceKey);
    const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey);

    // Get bot credentials from database
    const { data: botConfig, error: botConfigError } = await supabase
      .from('bot_config')
      .select('bot_id, email, password_hash')
      .single();

    if (botConfigError || !botConfig) {
      console.error('Error fetching bot config:', botConfigError);
      throw new Error('Bot configuration not found');
    }

    // Authenticate as bot using database credentials
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: botConfig.email,
      password: botConfig.password_hash,
    });

    if (authError) {
      console.error('Bot authentication error:', authError);
      return new Response(JSON.stringify({ error: 'Bot authentication failed' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Process the command if it's a command message
    if (isCommand) {
      const botRequest: BotRequest = {
        userId,
        chatroomId,
        message,
        command: commandName,
        args,
      };
      commandResponse = await processCommand(botRequest, supabase);
    } else {
      // Regular conversation with the bot
      // Check if it's a direct message to the bot or if the bot was mentioned
      if (chatroomId) {
        // Bot was mentioned in a chatroom
        commandResponse = "I'm UzZap Bot! Type /help to see what I can do.";
      } else {
        // Direct message to the bot
        commandResponse = "Hello! I'm UzZap Bot. You can use commands like /help, /info, or /weather to interact with me.";
      }
    }

    // Send the bot's response
    if (commandResponse) {
      if (chatroomId) {
        // Send response to chatroom
        const { error: msgError } = await supabase
          .from('messages')
          .insert({
            chatroom_id: chatroomId,
            user_id: botConfig.bot_id,
            content: commandResponse,
            created_at: new Date().toISOString(),
          });

        if (msgError) {
          console.error('Error sending bot message to chatroom:', msgError);
          return new Response(JSON.stringify({ error: 'Failed to send bot response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }
      } else {
        // Send response as direct message
        const { error: dmError } = await supabase
          .from('direct_messages')
          .insert({
            sender_id: botConfig.bot_id,
            recipient_id: userId,
            content: commandResponse,
            created_at: new Date().toISOString(),
          });

        if (dmError) {
          console.error('Error sending bot direct message:', dmError);
          return new Response(JSON.stringify({ error: 'Failed to send bot response' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        // Ensure conversation exists or update last_message_at
        const { data: convoData, error: convoCheckError } = await supabase
          .from('conversations')
          .select('id')
          .or(`user1_id.eq.${botConfig.bot_id},user2_id.eq.${botConfig.bot_id}`)
          .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

        if (convoCheckError) {
          console.error('Error checking conversation:', convoCheckError);
        } else if (convoData && convoData.length > 0) {
          // Update conversation last_message_at
          await supabase
            .from('conversations')
            .update({ last_message_at: new Date().toISOString() })
            .eq('id', convoData[0].id);
        } else {
          // Create new conversation
          await supabase
            .from('conversations')
            .insert({
              user1_id: botConfig.bot_id,
              user2_id: userId,
              last_message_at: new Date().toISOString(),
              created_at: new Date().toISOString(),
            });
        }
      }
    }

    return new Response(JSON.stringify({ success: true, botResponse: commandResponse }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
