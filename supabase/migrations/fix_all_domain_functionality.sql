/*
  # Complete System Fix - Domain Functionality

  1. Database Schema Fixes
    - Fix links table structure to match redirect service expectations
    - Add missing columns that redirect service needs
    - Fix column naming inconsistencies
    - Add proper indexes for performance

  2. Security
    - Enable RLS on all tables
    - Add proper policies for authenticated users
    - Fix any security gaps

  3. Performance
    - Add indexes for fast lookups
    - Optimize queries
*/

-- Fix links table structure to match what redirect service expects
DO $$
BEGIN
  -- Add missing columns that redirect service expects
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'destination_url') THEN
    ALTER TABLE links ADD COLUMN destination_url text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'expiration_enabled') THEN
    ALTER TABLE links ADD COLUMN expiration_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'expiration_date') THEN
    ALTER TABLE links ADD COLUMN expiration_date timestamptz;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'click_limit_enabled') THEN
    ALTER TABLE links ADD COLUMN click_limit_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'click_limit') THEN
    ALTER TABLE links ADD COLUMN click_limit integer;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'password_protection') THEN
    ALTER TABLE links ADD COLUMN password_protection boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_enabled') THEN
    ALTER TABLE links ADD COLUMN utm_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_source') THEN
    ALTER TABLE links ADD COLUMN utm_source text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_medium') THEN
    ALTER TABLE links ADD COLUMN utm_medium text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_campaign') THEN
    ALTER TABLE links ADD COLUMN utm_campaign text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_term') THEN
    ALTER TABLE links ADD COLUMN utm_term text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'utm_content') THEN
    ALTER TABLE links ADD COLUMN utm_content text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'script_injection_enabled') THEN
    ALTER TABLE links ADD COLUMN script_injection_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'tracking_scripts') THEN
    ALTER TABLE links ADD COLUMN tracking_scripts jsonb DEFAULT '[]'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'script_position') THEN
    ALTER TABLE links ADD COLUMN script_position text DEFAULT 'head';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'script_delay') THEN
    ALTER TABLE links ADD COLUMN script_delay integer DEFAULT 2;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'cloaking_enabled') THEN
    ALTER TABLE links ADD COLUMN cloaking_enabled boolean DEFAULT false;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'cloaking_page_title') THEN
    ALTER TABLE links ADD COLUMN cloaking_page_title text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'links' AND column_name = 'cloaking_page_description') THEN
    ALTER TABLE links ADD COLUMN cloaking_page_description text;
  END IF;
END $$;

-- Update existing links to have destination_url = original_url if null
UPDATE links SET destination_url = original_url WHERE destination_url IS NULL;

-- Create clicks table if it doesn't exist
CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  user_agent text,
  ip_address text,
  referrer text,
  clicked_at timestamptz DEFAULT now(),
  country text,
  city text,
  device_type text,
  browser text,
  os text
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_links_is_active ON links(is_active);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);

-- Enable RLS
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for links
DROP POLICY IF EXISTS "Users can view own links" ON links;
CREATE POLICY "Users can view own links"
  ON links
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own links" ON links;
CREATE POLICY "Users can insert own links"
  ON links
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own links" ON links;
CREATE POLICY "Users can update own links"
  ON links
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own links" ON links;
CREATE POLICY "Users can delete own links"
  ON links
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Allow anonymous access to active links for redirects
DROP POLICY IF EXISTS "Anonymous can view active links" ON links;
CREATE POLICY "Anonymous can view active links"
  ON links
  FOR SELECT
  TO anon
  USING (is_active = true);

-- RLS Policies for clicks
DROP POLICY IF EXISTS "Users can view clicks for own links" ON clicks;
CREATE POLICY "Users can view clicks for own links"
  ON clicks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = clicks.link_id 
      AND links.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Anonymous can insert clicks" ON clicks;
CREATE POLICY "Anonymous can insert clicks"
  ON clicks
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Function to increment click count
CREATE OR REPLACE FUNCTION increment_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE links 
  SET total_clicks = total_clicks + 1 
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-increment click count
DROP TRIGGER IF EXISTS trigger_increment_click_count ON clicks;
CREATE TRIGGER trigger_increment_click_count
  AFTER INSERT ON clicks
  FOR EACH ROW
  EXECUTE FUNCTION increment_click_count();
