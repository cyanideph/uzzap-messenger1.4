-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create profiles table (referenced in auth-context.tsx)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create regions table (referenced in chatrooms.tsx)
CREATE TABLE regions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provinces table (referenced in chatrooms.tsx)
CREATE TABLE provinces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    region_id TEXT NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table for tracking online status (referenced in chatrooms.tsx)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    location TEXT REFERENCES provinces(name),
    is_online BOOLEAN DEFAULT FALSE,
    last_online TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chatrooms table
CREATE TABLE chatrooms (
    id TEXT PRIMARY KEY,
    province_id TEXT NOT NULL REFERENCES provinces(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chatroom_id TEXT NOT NULL REFERENCES chatrooms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create direct_messages table
CREATE TABLE direct_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create conversations table to track direct message conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user1_id, user2_id)
);

-- Create user_chatroom table to track which chatrooms a user has joined
CREATE TABLE user_chatrooms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chatroom_id TEXT NOT NULL REFERENCES chatrooms(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, chatroom_id)
);

-- Create functions and triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on profiles
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update updated_at on users
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update updated_at on chatrooms
CREATE TRIGGER update_chatrooms_updated_at
BEFORE UPDATE ON chatrooms
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Trigger to update updated_at on messages
CREATE TRIGGER update_messages_updated_at
BEFORE UPDATE ON messages
FOR EACH ROW
EXECUTE FUNCTION update_updated_at();

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id)
    VALUES (NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create a user record when a new auth user is created
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION handle_new_user();

-- Create RLS (Row Level Security) policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE provinces ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE direct_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chatrooms ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Regions and Provinces policies (public read-only)
CREATE POLICY "Regions are viewable by everyone"
ON regions FOR SELECT
USING (true);

CREATE POLICY "Provinces are viewable by everyone"
ON provinces FOR SELECT
USING (true);

-- Users policies
CREATE POLICY "Users info is viewable by everyone"
ON users FOR SELECT
USING (true);

CREATE POLICY "Users can update their own user record"
ON users FOR UPDATE
USING (auth.uid() = id);

-- Chatrooms policies (public read-only)
CREATE POLICY "Chatrooms are viewable by everyone"
ON chatrooms FOR SELECT
USING (true);

-- Messages policies
CREATE POLICY "Messages are viewable by everyone"
ON messages FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can insert messages"
ON messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can update their own messages"
ON messages FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON messages FOR DELETE
USING (auth.uid() = user_id);

-- Direct messages policies
CREATE POLICY "Users can view their own direct messages"
ON direct_messages FOR SELECT
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Authenticated users can send direct messages"
ON direct_messages FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = sender_id);

CREATE POLICY "Users can update their own sent direct messages"
ON direct_messages FOR UPDATE
USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations"
ON conversations FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "Authenticated users can create conversations"
ON conversations FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND (auth.uid() = user1_id OR auth.uid() = user2_id));

-- User chatrooms policies
CREATE POLICY "Users can view chatroom memberships"
ON user_chatrooms FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can join chatrooms"
ON user_chatrooms FOR INSERT
WITH CHECK (auth.role() = 'authenticated' AND auth.uid() = user_id);

CREATE POLICY "Users can leave chatrooms"
ON user_chatrooms FOR DELETE
USING (auth.uid() = user_id);

-- Seed data for regions and provinces in the Philippines
INSERT INTO regions (id, name, description) VALUES
('NCR', 'National Capital Region', 'Metro Manila'),
('R1', 'Ilocos Region', 'Northwestern Luzon'),
('R2', 'Cagayan Valley', 'Northeastern Luzon'),
('R3', 'Central Luzon', 'Central plains of Luzon'),
('R4A', 'CALABARZON', 'Southern Luzon'),
('R4B', 'MIMAROPA', 'Southwestern Tagalog'),
('R5', 'Bicol Region', 'Southeastern Luzon'),
('R6', 'Western Visayas', 'Western Visayas islands'),
('R7', 'Central Visayas', 'Central Visayas islands'),
('R8', 'Eastern Visayas', 'Eastern Visayas islands'),
('R9', 'Zamboanga Peninsula', 'Western Mindanao'),
('R10', 'Northern Mindanao', 'Northern Mindanao'),
('R11', 'Davao Region', 'Southeastern Mindanao'),
('R12', 'SOCCSKSARGEN', 'South-central Mindanao'),
('R13', 'Caraga', 'Northeastern Mindanao'),
('BARMM', 'Bangsamoro', 'Autonomous Region in Muslim Mindanao'),
('CAR', 'Cordillera Administrative Region', 'Northern Luzon highlands');

-- NCR Provinces/Cities
INSERT INTO provinces (id, name, region_id) VALUES
('NCR-1', 'Manila', 'NCR'),
('NCR-2', 'Quezon City', 'NCR'),
('NCR-3', 'Makati', 'NCR'),
('NCR-4', 'Pasig', 'NCR'),
('NCR-5', 'Taguig', 'NCR');

-- Central Luzon Provinces
INSERT INTO provinces (id, name, region_id) VALUES
('R3-1', 'Bulacan', 'R3'),
('R3-2', 'Pampanga', 'R3'),
('R3-3', 'Bataan', 'R3'),
('R3-4', 'Nueva Ecija', 'R3'),
('R3-5', 'Tarlac', 'R3'),
('R3-6', 'Zambales', 'R3'),
('R3-7', 'Aurora', 'R3');

-- Central Visayas Provinces
INSERT INTO provinces (id, name, region_id) VALUES
('R7-1', 'Cebu', 'R7'),
('R7-2', 'Bohol', 'R7'),
('R7-3', 'Negros Oriental', 'R7'),
('R7-4', 'Siquijor', 'R7');

-- Create chatrooms for each province
INSERT INTO chatrooms (id, province_id, name, description)
SELECT id, id, name || ' Chatroom', 'Official chatroom for ' || name
FROM provinces;