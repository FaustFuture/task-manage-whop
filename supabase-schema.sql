-- Supabase Database Schema for Task Manager App
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

-- Boards table
CREATE TABLE boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Board members junction table
CREATE TABLE board_members (
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

-- Cards table
CREATE TABLE cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  list_id UUID NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_board_members_board_id ON board_members(board_id);
CREATE INDEX idx_board_members_user_id ON board_members(user_id);
CREATE INDEX idx_lists_board_id ON lists(board_id);
CREATE INDEX idx_cards_list_id ON cards(list_id);
CREATE INDEX idx_cards_created_by ON cards(created_by);
CREATE INDEX idx_card_assignees_card_id ON card_assignees(card_id);
CREATE INDEX idx_card_assignees_user_id ON card_assignees(user_id);
CREATE INDEX idx_subtasks_card_id ON subtasks(card_id);

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE board_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE subtasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies (Simple version - adjust based on your auth needs)
-- Users: Everyone can read all users
CREATE POLICY "Users are viewable by everyone" ON users
  FOR SELECT USING (true);

-- Boards: Users can view boards they are members of
CREATE POLICY "Users can view boards they are members of" ON boards
  FOR SELECT USING (
    id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Admins can create boards" ON boards
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Board creators can update their boards" ON boards
  FOR UPDATE USING (created_by = auth.uid());

CREATE POLICY "Board creators can delete their boards" ON boards
  FOR DELETE USING (created_by = auth.uid());

-- Board members: Can view board members if they are a member
CREATE POLICY "Board members viewable by board members" ON board_members
  FOR SELECT USING (
    board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );

-- Lists: Can view lists if they are a board member
CREATE POLICY "Lists viewable by board members" ON lists
  FOR SELECT USING (
    board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Lists manageable by board members" ON lists
  FOR ALL USING (
    board_id IN (SELECT board_id FROM board_members WHERE user_id = auth.uid())
  );

-- Cards: Can view cards if they are a board member
CREATE POLICY "Cards viewable by board members" ON cards
  FOR SELECT USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT board_id FROM board_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Cards manageable by board members" ON cards
  FOR ALL USING (
    list_id IN (
      SELECT id FROM lists WHERE board_id IN (
        SELECT board_id FROM board_members WHERE user_id = auth.uid()
      )
    )
  );

-- Card assignees: Viewable by board members
CREATE POLICY "Card assignees viewable by board members" ON card_assignees
  FOR SELECT USING (
    card_id IN (
      SELECT id FROM cards WHERE list_id IN (
        SELECT id FROM lists WHERE board_id IN (
          SELECT board_id FROM board_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Card assignees manageable by board members" ON card_assignees
  FOR ALL USING (
    card_id IN (
      SELECT id FROM cards WHERE list_id IN (
        SELECT id FROM lists WHERE board_id IN (
          SELECT board_id FROM board_members WHERE user_id = auth.uid()
        )
      )
    )
  );

-- Subtasks: Viewable by board members
CREATE POLICY "Subtasks viewable by board members" ON subtasks
  FOR SELECT USING (
    card_id IN (
      SELECT id FROM cards WHERE list_id IN (
        SELECT id FROM lists WHERE board_id IN (
          SELECT board_id FROM board_members WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Subtasks manageable by board members" ON subtasks
  FOR ALL USING (
    card_id IN (
      SELECT id FROM cards WHERE list_id IN (
        SELECT id FROM lists WHERE board_id IN (
          SELECT board_id FROM board_members WHERE user_id = auth.uid()
        )
      )
    )
  );
