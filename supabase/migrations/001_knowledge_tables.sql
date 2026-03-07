-- Run this in Supabase SQL Editor to create knowledge tables
-- Dashboard: https://supabase.com/dashboard/project/_/sql

-- Hub leads (city -> lead mapping)
CREATE TABLE IF NOT EXISTS hub_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL UNIQUE,
  lead text NOT NULL,
  region text,
  created_at timestamptz DEFAULT now()
);

-- Region leads
CREATE TABLE IF NOT EXISTS region_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  region text NOT NULL UNIQUE,
  lead text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Knowledge sections (event planning, points, etc.)
CREATE TABLE IF NOT EXISTS knowledge_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  content text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Content blocks for website (hero, FAQs, links)
CREATE TABLE IF NOT EXISTS content_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  content text,
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS (optional - use service role key for server access)
ALTER TABLE hub_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE region_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_blocks ENABLE ROW LEVEL SECURITY;

-- Allow read for anon (or use service role which bypasses RLS)
CREATE POLICY "Allow read hub_leads" ON hub_leads FOR SELECT USING (true);
CREATE POLICY "Allow read region_leads" ON region_leads FOR SELECT USING (true);
CREATE POLICY "Allow read knowledge_sections" ON knowledge_sections FOR SELECT USING (true);
CREATE POLICY "Allow read content_blocks" ON content_blocks FOR SELECT USING (true);

-- Chat persistence (for Drizzle/API)
CREATE TYPE vote_type AS ENUM ('up', 'down');

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  title text DEFAULT 'New Chat',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  vote vote_type NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Chats/messages/votes: API uses service role (bypasses RLS). Deny anon access.
CREATE POLICY "Deny anon chats" ON chats FOR ALL USING (false);
CREATE POLICY "Deny anon messages" ON messages FOR ALL USING (false);
CREATE POLICY "Deny anon votes" ON votes FOR ALL USING (false);
