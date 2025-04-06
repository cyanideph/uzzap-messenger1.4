-- Migration: 002_application_seed
-- Description: Seed data for UzZap application (all tables except regions and provinces)
-- Created: 2025-04-06

-- First, clear existing data (except regions and provinces)
TRUNCATE TABLE user_chatrooms CASCADE;
TRUNCATE TABLE conversations CASCADE;
TRUNCATE TABLE direct_messages CASCADE;
TRUNCATE TABLE messages CASCADE;
TRUNCATE TABLE chatrooms CASCADE;

-- Note: For a real production application, you would handle user creation through Supabase Auth API
-- This is a simplification for development/testing purposes only


-- We need to check if user_follows table exists since it was used in the app but wasn't in the original schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_follows') THEN
        CREATE TABLE user_follows (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(follower_id, following_id)
        );
        
        -- Enable RLS on the new table
        ALTER TABLE user_follows ENABLE ROW LEVEL SECURITY;
        
        -- Create policies for the new table
        CREATE POLICY "Users can view all follow relationships"
        ON user_follows FOR SELECT
        USING (true);
        
        CREATE POLICY "Users can follow others"
        ON user_follows FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = follower_id);
        
        CREATE POLICY "Users can unfollow others"
        ON user_follows FOR DELETE
        USING (auth.uid() = follower_id);
    ELSE
        TRUNCATE TABLE user_follows CASCADE;
    END IF;
END $$;

-- Insert users into auth.users table first
-- Note: In a real application, users would be created through Supabase Auth API
-- This is an approximation for testing purposes

-- Create extension for UUID generation if not already created
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Since we don't have direct access to auth.users passwords and auth methods,
-- we'll create a function to safely insert test users
CREATE OR REPLACE FUNCTION create_test_user(
    user_id UUID,
    email TEXT,
    username TEXT,
    created_at TIMESTAMP WITH TIME ZONE
) RETURNS VOID AS $$
BEGIN
    -- Only insert if the user doesn't already exist
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        -- Insert into auth.users with minimal required fields
        INSERT INTO auth.users (
            id, 
            email,
            raw_user_meta_data,
            created_at,
            updated_at,
            last_sign_in_at,
            is_anonymous
        ) VALUES (
            user_id,
            email,
            jsonb_build_object('username', username),
            created_at,
            created_at,
            created_at,
            false
        );
    END IF;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Error creating auth user %: %', user_id, SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Create test users
SELECT create_test_user(
    '00000000-0000-0000-0000-000000000001'::UUID, 
    'admin@uzzap.com', 
    'admin', 
    '2025-01-01T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

SELECT create_test_user(
    '00000000-0000-0000-0000-000000000002'::UUID, 
    'maria@uzzap.com', 
    'maria', 
    '2025-01-15T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

SELECT create_test_user(
    '00000000-0000-0000-0000-000000000003'::UUID, 
    'juan@uzzap.com', 
    'juan', 
    '2025-02-01T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

SELECT create_test_user(
    '00000000-0000-0000-0000-000000000004'::UUID, 
    'lisa@uzzap.com', 
    'lisa', 
    '2025-02-15T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

SELECT create_test_user(
    '00000000-0000-0000-0000-000000000005'::UUID, 
    'carlo@uzzap.com', 
    'carlo', 
    '2025-03-01T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

-- Create bot user
SELECT create_test_user(
    '00000000-0000-0000-0000-000000000666'::UUID, 
    'uzzapbot@uzzap.com', 
    'uzzapbot', 
    '2025-01-01T00:00:00Z'::TIMESTAMP WITH TIME ZONE
);

-- Now insert profiles data
-- Test user 1 (admin)
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000001', 'admin', 'Admin User', 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'Administrator of UzZap application', 'Manila, Philippines', '2025-01-01T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000001', 'Manila', 'NCR', true, NOW());

-- Test user 2 (maria)
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000002', 'maria', 'Maria Santos', 'https://api.dicebear.com/7.x/bottts/svg?seed=maria', 'Travel enthusiast | Food lover | Exploring the beautiful Philippines one province at a time', 'Manila, Philippines', '2025-01-15T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000002', 'Manila', 'NCR', false, NOW() - INTERVAL '2 HOURS');

-- Test user 3 (juan)
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000003', 'juan', 'Juan Dela Cruz', 'https://api.dicebear.com/7.x/bottts/svg?seed=juan', 'Software developer from Cebu. Passionate about tech and connecting local communities.', 'Cebu City, Philippines', '2025-02-01T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000003', 'Cebu City', 'CEB', true, NOW());

-- Test user 4 (lisa)
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000004', 'lisa', 'Lisa Reyes', 'https://api.dicebear.com/7.x/bottts/svg?seed=lisa', 'Digital artist and photographer. Loves to capture the beauty of Davao.', 'Davao City, Philippines', '2025-02-15T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000004', 'Davao City', 'DVO', false, NOW() - INTERVAL '1 DAY');

-- Test user 5 (carlo)
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000005', 'carlo', 'Carlo Aquino', 'https://api.dicebear.com/7.x/bottts/svg?seed=carlo', 'Music lover and foodie. Always on the lookout for the best local cuisine.', 'Baguio City, Philippines', '2025-03-01T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000005', 'Baguio City', 'BEN', true, NOW());

-- UzZap Bot
INSERT INTO profiles (id, username, full_name, avatar_url, bio, location, created_at) VALUES
('00000000-0000-0000-0000-000000000666', 'uzzapbot', 'UzZap Bot', 'https://api.dicebear.com/7.x/bottts/svg?seed=bot', 'Official UzZap Helper Bot. I can help you navigate the app and answer questions. Try commands like /help, /info, or /weather.', 'Manila, Philippines', '2025-01-01T00:00:00Z');

INSERT INTO users (id, location, province_id, is_online, last_online) VALUES
('00000000-0000-0000-0000-000000000666', 'Manila', 'NCR', true, NOW());

-- Create chatrooms (one for each major province)
INSERT INTO chatrooms (id, province_id, name, description, created_at) VALUES
('manila-chat', 'NCR', 'Manila Chat', 'General chat for people in Manila', '2025-01-05T00:00:00Z'),
('cebu-chat', 'CEB', 'Cebu Chat', 'General chat for people in Cebu', '2025-01-06T00:00:00Z'),
('davao-chat', 'DVO', 'Davao Chat', 'General chat for people in Davao', '2025-01-07T00:00:00Z'),
('baguio-chat', 'BEN', 'Baguio Chat', 'General chat for people in Baguio', '2025-01-08T00:00:00Z');

-- Add users to chatrooms
INSERT INTO user_chatrooms (user_id, chatroom_id, joined_at) VALUES
('00000000-0000-0000-0000-000000000001', 'manila-chat', '2025-01-05T01:00:00Z'),
('00000000-0000-0000-0000-000000000002', 'manila-chat', '2025-01-15T02:00:00Z'),
('00000000-0000-0000-0000-000000000003', 'cebu-chat', '2025-02-01T03:00:00Z'),
('00000000-0000-0000-0000-000000000004', 'davao-chat', '2025-02-15T04:00:00Z'),
('00000000-0000-0000-0000-000000000005', 'baguio-chat', '2025-03-01T05:00:00Z'),
-- Cross-regional participation
('00000000-0000-0000-0000-000000000001', 'cebu-chat', '2025-01-10T06:00:00Z'),
('00000000-0000-0000-0000-000000000002', 'davao-chat', '2025-01-20T07:00:00Z'),
('00000000-0000-0000-0000-000000000003', 'manila-chat', '2025-02-05T08:00:00Z');

-- Add messages to chatrooms
INSERT INTO messages (id, chatroom_id, user_id, content, created_at) VALUES
(uuid_generate_v4(), 'manila-chat', '00000000-0000-0000-0000-000000000001', 'Welcome to the Manila chat room!', '2025-01-05T01:30:00Z'),
(uuid_generate_v4(), 'manila-chat', '00000000-0000-0000-0000-000000000002', 'Hi everyone, I''m Maria from Makati!', '2025-01-15T02:30:00Z'),
(uuid_generate_v4(), 'manila-chat', '00000000-0000-0000-0000-000000000003', 'Hello Manila folks! Visiting from Cebu here.', '2025-02-05T08:30:00Z'),
(uuid_generate_v4(), 'manila-chat', '00000000-0000-0000-0000-000000000001', 'How''s everyone doing today?', '2025-02-10T09:30:00Z'),

(uuid_generate_v4(), 'cebu-chat', '00000000-0000-0000-0000-000000000003', 'Welcome to the Cebu chat!', '2025-02-01T03:30:00Z'),
(uuid_generate_v4(), 'cebu-chat', '00000000-0000-0000-0000-000000000001', 'Cebu is beautiful! I love visiting.', '2025-02-02T04:30:00Z'),

(uuid_generate_v4(), 'davao-chat', '00000000-0000-0000-0000-000000000004', 'Welcome to the Davao chat room!', '2025-02-15T04:30:00Z'),
(uuid_generate_v4(), 'davao-chat', '00000000-0000-0000-0000-000000000002', 'Hello from Manila! Planning to visit Davao soon.', '2025-02-16T05:30:00Z'),

(uuid_generate_v4(), 'baguio-chat', '00000000-0000-0000-0000-000000000005', 'Welcome to the Baguio chat! It''s cold up here!', '2025-03-01T05:30:00Z');

-- Create conversations between users
INSERT INTO conversations (id, user1_id, user2_id, last_message_at) VALUES
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2025-03-15T10:30:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2025-03-16T11:30:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '2025-03-17T12:30:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '2025-03-18T13:30:00Z');

-- Add direct messages between users
INSERT INTO direct_messages (id, sender_id, recipient_id, content, is_read, created_at) VALUES
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Hi Maria, how are you?', true, '2025-03-15T10:00:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'I''m good Admin, thanks for asking!', true, '2025-03-15T10:30:00Z'),

(uuid_generate_v4(), '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Hello Juan, welcome to UzZap!', true, '2025-03-16T11:00:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Thanks for the welcome Admin!', true, '2025-03-16T11:30:00Z'),

(uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Hey Juan, I heard you''re a developer?', true, '2025-03-17T12:00:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Yes Maria, I work mainly with web technologies!', true, '2025-03-17T12:30:00Z'),

(uuid_generate_v4(), '00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', 'Hi Carlo, have you been to Davao?', true, '2025-03-18T13:00:00Z'),
(uuid_generate_v4(), '00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'Not yet Lisa, but it''s on my travel list!', true, '2025-03-18T13:30:00Z');

-- Create follow relationships
INSERT INTO user_follows (follower_id, following_id, created_at) VALUES
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', '2025-02-01T00:00:00Z'),
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', '2025-02-02T00:00:00Z'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', '2025-02-03T00:00:00Z'),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', '2025-02-04T00:00:00Z'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', '2025-02-05T00:00:00Z'),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', '2025-02-06T00:00:00Z'),
('00000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', '2025-02-07T00:00:00Z'),
('00000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', '2025-02-08T00:00:00Z');
