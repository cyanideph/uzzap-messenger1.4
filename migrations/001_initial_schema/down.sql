-- Migration: 001_initial_schema (rollback)
-- Description: Rollback script for initial database schema
-- Created: 2025-04-05

-- First drop triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_chatrooms_updated_at ON chatrooms;
DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Drop all tables in reverse order of creation to handle dependencies
DROP TABLE IF EXISTS user_chatrooms;
DROP TABLE IF EXISTS conversations;
DROP TABLE IF EXISTS direct_messages;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS chatrooms;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS provinces;
DROP TABLE IF EXISTS regions;
DROP TABLE IF EXISTS profiles;

-- Drop functions
DROP FUNCTION IF EXISTS update_updated_at();
DROP FUNCTION IF EXISTS handle_new_user();

-- Note: Extensions are typically not dropped during rollbacks as they may be used by other applications
