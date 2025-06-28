/*
  # Add Missing Schema Components - SAFE NON-BREAKING ADDITIONS

  1. New Tables
    - `campaigns` - Marketing campaign organization
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `status` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `domains` - Custom domain management
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `domain` (text, unique)
      - `is_verified` (boolean)
      - `verification_token` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `admin_users` - Admin panel authentication
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `role` (text)
      - `created_at` (timestamp)
    
    - `link_rotations` - A/B testing URL rotation tracking
      - `id` (uuid, primary key)
      - `link_id` (uuid, references links)
      - `url` (text)
      - `weight` (integer)
      - `clicks` (integer)
      - `created_at` (timestamp)

  2. New Columns (SAFE ADDITIONS ONLY)
    - Add missing fields to `links` table using conditional logic
    - All additions use DEFAULT values to ensure existing data remains intact

  3. Security
    - Enable RLS on all new tables
    - Add appropriate policies for user data isolation
    - Maintain anonymous access patterns

  4. Performance
    - Add indexes for new foreign key relationships
    - Optimize query patterns for new features
*/

-- Add missing columns to links table SAFELY
DO $$
BEGIN
  -- Add link_type column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'link_type'
  ) THEN
    ALTER TABLE links ADD COLUMN link_type text DEFAULT 'short';
  END IF;

  -- Add campaign_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'campaign_id'
  ) THEN
    ALTER TABLE links ADD COLUMN campaign_id uuid;
  END IF;

  -- Add domain_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'domain_id'
  ) THEN
    ALTER TABLE links ADD COLUMN domain_id uuid;
  END IF;

  -- Add device_rules column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'device_rules'
  ) THEN
    ALTER TABLE links ADD COLUMN device_rules jsonb DEFAULT '{"desktop": true, "mobile": true, "tablet": true}';
  END IF;

  -- Add unique_clicks column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'unique_clicks'
  ) THEN
    ALTER TABLE links ADD COLUMN unique_clicks integer DEFAULT 0;
  END IF;

  -- Add last_clicked_at column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'last_clicked_at'
  ) THEN
    ALTER TABLE links ADD COLUMN last_clicked_at timestamptz;
  END IF;

  -- Add total_clicks column if it doesn't exist (service expects this name)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'total_clicks'
  ) THEN
    ALTER TABLE links ADD COLUMN total_clicks integer DEFAULT 0;
  END IF;
END $$;

-- Create campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create domains table if it doesn't exist
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text UNIQUE NOT NULL,
  is_verified boolean DEFAULT false,
  verification_token text DEFAULT gen_random_uuid()::text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at timestamptz DEFAULT now()
);

-- Create link_rotations table if it doesn't exist
CREATE TABLE IF NOT EXISTS link_rotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  weight integer DEFAULT 50 CHECK (weight >= 0 AND weight <= 100),
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add foreign key constraints SAFELY (only if they don't exist)
DO $$
BEGIN
  -- Add campaign_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'links_campaign_id_fkey'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_campaign_id_fkey 
    FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE SET NULL;
  END IF;

  -- Add domain_id foreign key if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'links_domain_id_fkey'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_domain_id_fkey 
    FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_rotations ENABLE ROW LEVEL SECURITY;

-- Campaigns policies
CREATE POLICY "Users can read own campaigns"
  ON campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own campaigns"
  ON campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own campaigns"
  ON campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own campaigns"
  ON campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Domains policies
CREATE POLICY "Users can read own domains"
  ON domains
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own domains"
  ON domains
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own domains"
  ON domains
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own domains"
  ON domains
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin users policies (only super admins can manage)
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND role = 'super_admin'
    )
  );

-- Link rotations policies
CREATE POLICY "Users can read rotations for their links"
  ON link_rotations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_rotations.link_id 
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage rotations for their links"
  ON link_rotations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_rotations.link_id 
      AND links.user_id = auth.uid()
    )
  );

-- Create indexes for performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain ON domains(domain);
CREATE INDEX IF NOT EXISTS idx_link_rotations_link_id ON link_rotations(link_id);
CREATE INDEX IF NOT EXISTS idx_links_campaign_id ON links(campaign_id);
CREATE INDEX IF NOT EXISTS idx_links_domain_id ON links(domain_id);
CREATE INDEX IF NOT EXISTS idx_links_link_type ON links(link_type);

-- Add updated_at triggers for new tables
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_domains_updated_at
  BEFORE UPDATE ON domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update existing click_count data to total_clicks if total_clicks is 0
UPDATE links 
SET total_clicks = click_count 
WHERE total_clicks = 0 AND click_count > 0;
