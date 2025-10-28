-- Migration: Add status column to cards table
-- Run this in your Supabase SQL Editor

-- Add status column to cards table
ALTER TABLE cards
ADD COLUMN status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'done'));

-- Add an index for better query performance
CREATE INDEX idx_cards_status ON cards(status);

-- Update existing cards to have default status if needed
-- (This is optional since we have a default value)
UPDATE cards SET status = 'not_started' WHERE status IS NULL;
