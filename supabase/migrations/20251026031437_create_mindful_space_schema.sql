/*
  # MindfulSpace Database Schema

  ## Overview
  This migration creates the complete database schema for MindfulSpace, a mental wellness chatbot application.

  ## Tables Created

  1. **profiles**
     - Stores user profile information linked to auth.users
     - `id` (uuid, primary key) - Links to auth.users.id
     - `email` (text) - User's email address
     - `full_name` (text) - User's full name
     - `created_at` (timestamptz) - Account creation timestamp

  2. **conversations**
     - Stores chat conversation sessions
     - `id` (uuid, primary key) - Unique conversation identifier
     - `user_id` (uuid) - Links to profiles
     - `title` (text) - Conversation title (auto-generated from first message)
     - `created_at` (timestamptz) - Conversation start time
     - `updated_at` (timestamptz) - Last message time

  3. **messages**
     - Stores individual chat messages
     - `id` (uuid, primary key) - Unique message identifier
     - `conversation_id` (uuid) - Links to conversations
     - `user_id` (uuid) - Links to profiles
     - `role` (text) - 'user' or 'assistant'
     - `content` (text) - Message content
     - `created_at` (timestamptz) - Message timestamp

  4. **mood_entries**
     - Tracks user mood over time
     - `id` (uuid, primary key) - Unique entry identifier
     - `user_id` (uuid) - Links to profiles
     - `mood` (text) - Mood category (happy, calm, anxious, stressed, sad, confused)
     - `intensity` (integer) - Mood intensity (1-5)
     - `notes` (text, optional) - Additional notes
     - `created_at` (timestamptz) - Entry timestamp

  ## Security (Row Level Security)

  ### Policies Created
  
  1. **profiles table**
     - Users can read their own profile
     - Users can insert their own profile
     - Users can update their own profile

  2. **conversations table**
     - Users can read their own conversations
     - Users can insert their own conversations
     - Users can update their own conversations
     - Users can delete their own conversations

  3. **messages table**
     - Users can read messages from their conversations
     - Users can insert messages to their conversations
     - Users can delete their own messages

  4. **mood_entries table**
     - Users can read their own mood entries
     - Users can insert their own mood entries
     - Users can update their own mood entries
     - Users can delete their own mood entries

  ## Indexes
  - Index on conversations.user_id for faster queries
  - Index on messages.conversation_id for faster message retrieval
  - Index on mood_entries.user_id and created_at for mood tracking queries
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text DEFAULT 'New Conversation',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own conversations"
  ON conversations FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
  ON conversations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON conversations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON conversations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Create mood_entries table
CREATE TABLE IF NOT EXISTS mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mood text NOT NULL CHECK (mood IN ('happy', 'calm', 'anxious', 'stressed', 'sad', 'confused', 'overwhelmed', 'hopeful')),
  intensity integer NOT NULL CHECK (intensity >= 1 AND intensity <= 5),
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own mood entries"
  ON mood_entries FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood entries"
  ON mood_entries FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON mood_entries FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON mood_entries FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_mood_entries_user_id ON mood_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_entries_created_at ON mood_entries(created_at);
