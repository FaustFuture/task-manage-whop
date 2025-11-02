-- Whop Authentication Migration
-- This migration adds company isolation and switches to Whop user IDs
-- Run this in your Supabase SQL Editor AFTER the initial schema is created

-- Step 1: Add company_id to boards table
ALTER TABLE boards
ADD COLUMN company_id TEXT NOT NULL DEFAULT 'default';

-- Step 2: Create index for company_id filtering
CREATE INDEX idx_boards_company_id ON boards(company_id);

-- Step 3: Modify board_members to use TEXT user_id (Whop user IDs)
-- Drop foreign key constraint first
ALTER TABLE board_members
DROP CONSTRAINT IF EXISTS board_members_user_id_fkey;

-- Change column type to TEXT
ALTER TABLE board_members
ALTER COLUMN user_id TYPE TEXT;

-- Step 4: Modify card_assignees to use TEXT user_id (Whop user IDs)
-- Drop foreign key constraint first
ALTER TABLE card_assignees
DROP CONSTRAINT IF EXISTS card_assignees_user_id_fkey;

-- Change column type to TEXT
ALTER TABLE card_assignees
ALTER COLUMN user_id TYPE TEXT;

-- Step 5: Modify boards.created_by to use TEXT (Whop user IDs)
-- Drop foreign key constraint first
ALTER TABLE boards
DROP CONSTRAINT IF EXISTS boards_created_by_fkey;

-- Change column type to TEXT
ALTER TABLE boards
ALTER COLUMN created_by TYPE TEXT;

-- Step 6: Modify cards.created_by to use TEXT (Whop user IDs)
-- Drop foreign key constraint first
ALTER TABLE cards
DROP CONSTRAINT IF EXISTS cards_created_by_fkey;

-- Change column type to TEXT
ALTER TABLE cards
ALTER COLUMN created_by TYPE TEXT;

-- Step 7: Recreate indexes after type changes
DROP INDEX IF EXISTS idx_board_members_user_id;
CREATE INDEX idx_board_members_user_id ON board_members(user_id);

DROP INDEX IF EXISTS idx_card_assignees_user_id;
CREATE INDEX idx_card_assignees_user_id ON card_assignees(user_id);

-- Note: The users table remains in the database but is no longer referenced
-- by any foreign keys. It can be safely ignored or removed in the future.

-- Verification queries:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'boards';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'board_members';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'card_assignees';
