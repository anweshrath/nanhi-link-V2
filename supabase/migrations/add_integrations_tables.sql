/*
  # Add Integration System Tables

  1. New Tables
    - `user_integrations` - Store user's connected integrations
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `integration_type` (text) - 'google_analytics', 'slack', etc.
      - `config` (jsonb) - integration-specific config
      - `is_active` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `api_keys` - User API keys
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `key_name` (text)
      - `api_key` (text, unique)
      - `permissions` (jsonb)
      - `last_used` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can only access their own integrations and API keys
*/

-- Create user_integrations table
CREATE TABLE IF NOT EXISTS user_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  integration_type text NOT NULL,
  config jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create api_keys table
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  key_name text NOT NULL,
  api_key text UNIQUE NOT NULL,
  permissions jsonb DEFAULT '{"read": true, "write": false}',
  last_used timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- user_integrations policies
CREATE POLICY "Users can read own integrations"
  ON user_integrations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own integrations"
  ON user_integrations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own integrations"
  ON user_integrations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own integrations"
  ON user_integrations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- api_keys policies
CREATE POLICY "Users can read own api keys"
  ON api_keys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own api keys"
  ON api_keys
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys"
  ON api_keys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys"
  ON api_keys
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_integrations_user_id ON user_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_integrations_type ON user_integrations(integration_type);
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key ON api_keys(api_key);

-- Create trigger for updated_at
CREATE TRIGGER update_user_integrations_updated_at
  BEFORE UPDATE ON user_integrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS text AS $$
BEGIN
  RETURN 'sk_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;
