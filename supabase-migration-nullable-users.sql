-- Migration: Make user fields nullable
-- Run this in your Supabase SQL Editor to make the app work without users

-- Make created_by nullable in boards table
ALTER TABLE boards ALTER COLUMN created_by DROP NOT NULL;

-- Make created_by nullable in cards table
ALTER TABLE cards ALTER COLUMN created_by DROP NOT NULL;

-- Drop the RLS policies that require authentication
DROP POLICY IF EXISTS "Users are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Users can view boards they are members of" ON boards;
DROP POLICY IF EXISTS "Admins can create boards" ON boards;
DROP POLICY IF EXISTS "Board creators can update their boards" ON boards;
DROP POLICY IF EXISTS "Board creators can delete their boards" ON boards;
DROP POLICY IF EXISTS "Board members viewable by board members" ON board_members;
DROP POLICY IF EXISTS "Lists viewable by board members" ON lists;
DROP POLICY IF EXISTS "Lists manageable by board members" ON lists;
DROP POLICY IF EXISTS "Cards viewable by board members" ON cards;
DROP POLICY IF EXISTS "Cards manageable by board members" ON cards;
DROP POLICY IF EXISTS "Card assignees viewable by board members" ON card_assignees;
DROP POLICY IF EXISTS "Card assignees manageable by board members" ON card_assignees;
DROP POLICY IF EXISTS "Subtasks viewable by board members" ON subtasks;
DROP POLICY IF EXISTS "Subtasks manageable by board members" ON subtasks;

-- Disable RLS for all tables (for development without auth)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE boards DISABLE ROW LEVEL SECURITY;
ALTER TABLE board_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE lists DISABLE ROW LEVEL SECURITY;
ALTER TABLE cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE card_assignees DISABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks DISABLE ROW LEVEL SECURITY;

-- Optional: Add some sample users (you can skip this if you don't want users at all)
-- INSERT INTO users (name, email, role) VALUES
--   ('Admin User', 'admin@example.com', 'admin'),
--   ('John Doe', 'john@example.com', 'member'),
--   ('Jane Smith', 'jane@example.com', 'member')
-- ON CONFLICT (email) DO NOTHING;
