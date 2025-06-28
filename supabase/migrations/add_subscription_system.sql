/*
  # Add Subscription and Pricing System

  1. New Tables
    - `subscription_plans` - Available pricing tiers
      - `id` (text, primary key)
      - `name` (text)
      - `price_monthly` (decimal)
      - `price_yearly` (decimal)
      - `link_limit` (integer)
      - `features` (jsonb)
      - `is_active` (boolean)
    
    - `user_subscriptions` - User subscription status
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `plan_id` (text, references subscription_plans)
      - `status` (text)
      - `billing_cycle` (text)
      - `current_period_start` (timestamp)
      - `current_period_end` (timestamp)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `usage_tracking` - Monthly usage tracking
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `month` (text)
      - `year` (integer)
      - `links_created` (integer)
      - `clicks_tracked` (integer)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all new tables
    - Add policies for user access control

  3. Data
    - Insert default pricing plans
*/

-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id text PRIMARY KEY,
  name text NOT NULL,
  price_monthly decimal(10,2) NOT NULL,
  price_yearly decimal(10,2) NOT NULL,
  link_limit integer, -- NULL means unlimited
  features jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  plan_id text REFERENCES subscription_plans(id) NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'trialing')),
  billing_cycle text DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start timestamptz DEFAULT now(),
  current_period_end timestamptz DEFAULT (now() + interval '1 month'),
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create usage_tracking table
CREATE TABLE IF NOT EXISTS usage_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  month text NOT NULL,
  year integer NOT NULL,
  links_created integer DEFAULT 0,
  clicks_tracked integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, month, year)
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_tracking ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies (public read)
CREATE POLICY "Anyone can read active subscription plans"
  ON subscription_plans
  FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- User subscriptions policies
CREATE POLICY "Users can read own subscription"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON user_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Usage tracking policies
CREATE POLICY "Users can read own usage"
  ON usage_tracking
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage"
  ON usage_tracking
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage"
  ON usage_tracking
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Insert pricing plans
INSERT INTO subscription_plans (id, name, price_monthly, price_yearly, link_limit, features) VALUES
('free', 'Free', 0.00, 0.00, 5, '{
  "analytics": true,
  "qr_codes": true,
  "basic_customization": true,
  "cloaking": false,
  "rotator": false,
  "geo_targeting": false,
  "time_targeting": false,
  "script_injection": false,
  "ab_testing": false,
  "password_protection": false,
  "custom_domains": false,
  "api_access": false,
  "priority_support": false,
  "vip_support": false
}'),
('pro', 'Pro', 12.97, 129.70, 25, '{
  "analytics": true,
  "qr_codes": true,
  "basic_customization": true,
  "cloaking": true,
  "rotator": true,
  "geo_targeting": true,
  "time_targeting": true,
  "script_injection": true,
  "ab_testing": true,
  "password_protection": true,
  "custom_domains": false,
  "api_access": true,
  "priority_support": true,
  "vip_support": false
}'),
('vip', 'VIP', 27.00, 197.00, NULL, '{
  "analytics": true,
  "qr_codes": true,
  "basic_customization": true,
  "cloaking": true,
  "rotator": true,
  "geo_targeting": true,
  "time_targeting": true,
  "script_injection": true,
  "ab_testing": true,
  "password_protection": true,
  "custom_domains": true,
  "api_access": true,
  "priority_support": true,
  "vip_support": true,
  "white_label": true,
  "bulk_operations": true,
  "advanced_analytics": true
}')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  link_limit = EXCLUDED.link_limit,
  features = EXCLUDED.features,
  updated_at = now();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON usage_tracking(user_id, year, month);

-- Create function to auto-assign free plan to new users
CREATE OR REPLACE FUNCTION assign_free_plan_to_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_id, status, billing_cycle, current_period_end)
  VALUES (
    NEW.id,
    'free',
    'active',
    'monthly',
    (now() + interval '1 month')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for auto-assigning free plan
DROP TRIGGER IF EXISTS on_profile_created_assign_free_plan ON profiles;
CREATE TRIGGER on_profile_created_assign_free_plan
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION assign_free_plan_to_new_user();

-- Create function to track usage
CREATE OR REPLACE FUNCTION track_link_creation()
RETURNS trigger AS $$
DECLARE
  current_month text;
  current_year integer;
BEGIN
  current_month := to_char(now(), 'Month');
  current_year := extract(year from now());
  
  INSERT INTO usage_tracking (user_id, month, year, links_created)
  VALUES (NEW.user_id, current_month, current_year, 1)
  ON CONFLICT (user_id, month, year)
  DO UPDATE SET links_created = usage_tracking.links_created + 1;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for tracking link creation
DROP TRIGGER IF EXISTS on_link_created_track_usage ON links;
CREATE TRIGGER on_link_created_track_usage
  AFTER INSERT ON links
  FOR EACH ROW EXECUTE FUNCTION track_link_creation();

-- Add updated_at triggers
CREATE TRIGGER update_subscription_plans_updated_at
  BEFORE UPDATE ON subscription_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
