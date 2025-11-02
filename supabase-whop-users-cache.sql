-- Create Whop Users Cache Table
-- This table caches Whop user information for display purposes
-- It's separate from the old users table and uses Whop user IDs

-- Create whop_users table
CREATE TABLE IF NOT EXISTS whop_users (
  id TEXT PRIMARY KEY, -- Whop user ID
  username TEXT NOT NULL,
  name TEXT,
  avatar TEXT,
  company_id TEXT NOT NULL, -- Which company this user belongs to
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_whop_users_company_id ON whop_users(company_id);
CREATE INDEX IF NOT EXISTS idx_whop_users_username ON whop_users(username);
CREATE INDEX IF NOT EXISTS idx_whop_users_last_seen ON whop_users(last_seen);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_whop_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS whop_users_updated_at ON whop_users;
CREATE TRIGGER whop_users_updated_at
  BEFORE UPDATE ON whop_users
  FOR EACH ROW
  EXECUTE FUNCTION update_whop_users_updated_at();

-- Note: This table is populated automatically when users access the app
-- The upsert happens in the dashboard page-client component
