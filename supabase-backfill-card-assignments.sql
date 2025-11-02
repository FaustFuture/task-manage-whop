-- Backfill Card Assignments
-- This script assigns all existing cards to all members of their respective boards
-- Run this ONCE in your Supabase SQL Editor after implementing auto-assignment feature

-- Step 1: Clear any existing assignments (optional, comment out if you want to keep manual assignments)
-- DELETE FROM card_assignees;

-- Step 2: Insert assignments for all existing cards
-- This assigns each card to all members of its board
INSERT INTO card_assignees (card_id, user_id)
SELECT DISTINCT
  c.id as card_id,
  bu.user_id
FROM cards c
JOIN lists l ON c.list_id = l.id
JOIN board_users bu ON l.board_id = bu.board_id
WHERE NOT EXISTS (
  -- Don't insert if assignment already exists
  SELECT 1 FROM card_assignees ca
  WHERE ca.card_id = c.id
  AND ca.user_id = bu.user_id
);

-- Step 3: Verify the assignments
-- Run this query to check how many assignments were created
SELECT
  b.title as board_name,
  COUNT(DISTINCT c.id) as total_cards,
  COUNT(DISTINCT bu.user_id) as total_members,
  COUNT(ca.card_id) as total_assignments
FROM boards b
LEFT JOIN lists l ON b.id = l.board_id
LEFT JOIN cards c ON l.id = c.list_id
LEFT JOIN board_users bu ON b.id = bu.board_id
LEFT JOIN card_assignees ca ON c.id = ca.card_id
GROUP BY b.id, b.title
ORDER BY b.title;

-- Expected result: total_assignments should equal total_cards * total_members for each board
