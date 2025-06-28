/*
  # Initial Schema Setup for SureTo.Click

  1. New Tables
    - `profiles` - User profile information extending Supabase auth.users
      - `id` (uuid, references auth.users)
      - `email` (text)
      - `name` (text)
      - `avatar_url` (text)
      - `plan` (text, default 'Free')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `campaigns` - Marketing campaigns for organizing links
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `status` (text, default 'active')
      - `color` (text, default '#3b82f6')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `domains` - Custom domains for link shortening
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `domain` (text, unique)
      - `status` (text, default 'pending')
      - `verified` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `links` - Shortened links with rotation and cloaking capabilities
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `campaign_id` (uuid, references campaigns, nullable)
      - `domain_id` (uuid, references domains, nullable)
      - `short_code` (text, unique)
      - `original_url` (text)
      - `title` (text)
      - `description` (text)
      - `is_active` (boolean, default true)
      - `expires_at` (timestamp, nullable)
      - `password` (text, nullable)
      - `click_limit` (integer, nullable)
      - `total_clicks` (integer, default 0)
      - `unique_clicks` (integer, default 0)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `link_rotations` - Multiple destination URLs for rotation
      - `id` (uuid, primary key)
      - `link_id` (uuid, references links)
      - `url` (text)
      - `weight` (integer, default 1)
      - `is_active` (boolean, default true)
      - `clicks` (integer, default 0)
      - `created_at` (timestamp)

    - `clicks` - Click tracking and analytics
      - `id` (uuid, primary key)
      - `link_id` (uuid, references links)
      - `ip_address` (text)
      - `user_agent` (text)
      - `referer` (text, nullable)
      - `country` (text, nullable)
      - `city` (text, nullable)
      - `device_type` (text, nullable)
      - `browser` (text, nullable)
      - `os` (text, nullable)
      - `clicked_at` (timestamp, default now())

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Public read access for link resolution
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  name text,
  avatar_url text,
  plan text DEFAULT 'Free' CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'paused', 'archived')),
  color text DEFAULT '#3b82f6',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create domains table
CREATE TABLE IF NOT EXISTS domains (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  domain text UNIQUE NOT NULL,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'failed')),
  verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create links table
CREATE TABLE IF NOT EXISTS links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  domain_id uuid REFERENCES domains(id) ON DELETE SET NULL,
  short_code text UNIQUE NOT NULL,
  original_url text NOT NULL,
  title text,
  description text,
  is_active boolean DEFAULT true,
  expires_at timestamptz,
  password text,
  click_limit integer,
  total_clicks integer DEFAULT 0,
  unique_clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create link_rotations table
CREATE TABLE IF NOT EXISTS link_rotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  url text NOT NULL,
  weight integer DEFAULT 1,
  is_active boolean DEFAULT true,
  clicks integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create clicks table
CREATE TABLE IF NOT EXISTS clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE NOT NULL,
  ip_address text,
  user_agent text,
  referer text,
  country text,
  city text,
  device_type text,
  browser text,
  os text,
  clicked_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE links ENABLE ROW LEVEL SECURITY;
ALTER TABLE link_rotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Users can manage own campaigns"
  ON campaigns FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Domains policies
CREATE POLICY "Users can manage own domains"
  ON domains FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Links policies
CREATE POLICY "Users can manage own links"
  ON links FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Public can read active links for resolution"
  ON links FOR SELECT
  TO anon
  USING (is_active = true);

-- Link rotations policies
CREATE POLICY "Users can manage rotations for own links"
  ON link_rotations FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_rotations.link_id 
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read active rotations for resolution"
  ON link_rotations FOR SELECT
  TO anon
  USING (
    is_active = true AND
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_rotations.link_id 
      AND links.is_active = true
    )
  );

-- Clicks policies
CREATE POLICY "Users can read clicks for own links"
  ON clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = clicks.link_id 
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can insert clicks"
  ON clicks FOR INSERT
  TO anon
  WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_short_code ON links(short_code);
CREATE INDEX IF NOT EXISTS idx_links_user_id ON links(user_id);
CREATE INDEX IF NOT EXISTS idx_clicks_link_id ON clicks(link_id);
CREATE INDEX IF NOT EXISTS idx_clicks_clicked_at ON clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON campaigns(user_id);
CREATE INDEX IF NOT EXISTS idx_domains_user_id ON domains(user_id);

-- Create function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
