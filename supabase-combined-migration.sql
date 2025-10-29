-- Combined Supabase Database Schema and Migrations
-- Task Manager App - Single Migration Script
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member')),
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boards table (created_by is nullable)
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board users junction table
CREATE TABLE board_users (
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (board_id, user_id)
);

-- Lists table
CREATE TABLE lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cards table (created_by is nullable, includes status column)
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done')),
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Card assignees junction table
CREATE TABLE card_assignees (
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (card_id, user_id)
);

-- Subtasks table
CREATE TABLE subtasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better query performance
CREATE INDEX idx_boards_created_by ON boards(created_by);
CREATE INDEX idx_board_users_board_id ON board_users(board_id);
CREATE INDEX idx_board_users_user_id ON board_users(user_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_cards_status ON cards(status);
CREATE INDEX idx_card_assignees_card_id ON card_assignees(card_id);
CREATE INDEX idx_card_assignees_user_id ON card_assignees(user_id);
CREATE INDEX idx_subtasks_card_id ON subtasks(card_id);

-- Row Level Security is disabled for development without auth
-- If you need to enable RLS in the future, you can do so with appropriate policies

-- ============================================================================
-- MIGRATION: Rename board_members to board_users (for existing databases)
-- ============================================================================
-- If you already have data in your database with the old 'board_members' table,
-- run the following commands to migrate to the new 'board_users' naming:

-- Rename the table
-- ALTER TABLE board_members RENAME TO board_users;

-- Rename the indexes
-- DROP INDEX IF EXISTS idx_board_members_board_id;
-- DROP INDEX IF EXISTS idx_board_members_user_id;
-- CREATE INDEX idx_board_users_board_id ON board_users(board_id);
-- CREATE INDEX idx_board_users_user_id ON board_users(user_id);

-- Note: The column names (board_id, user_id) remain the same as they are already correct
