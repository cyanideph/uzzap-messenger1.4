-- Create user_activity table
CREATE TABLE IF NOT EXISTS user_activity (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create message_reads table for tracking read receipts
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    message_id UUID NOT NULL,
    reader_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(message_id, reader_id)
);

-- Add RLS policies
ALTER TABLE user_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- User activity policies
CREATE POLICY "Users can view their own activity"
ON user_activity FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activity records"
ON user_activity FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Message reads policies
CREATE POLICY "Users can view message read receipts"
ON message_reads FOR SELECT
USING (true);

CREATE POLICY "Users can mark messages as read"
ON message_reads FOR INSERT
WITH CHECK (auth.uid() = reader_id);
