/*
  # Advanced Features Schema Update

  1. Schema Updates
    - Add advanced columns to `links` table for new features
    - Add database functions for click tracking and rotation
    - Add indexes for performance optimization

  2. New Features Support
    - UTM parameter tracking
    - Geo-targeting capabilities
    - Time-based targeting
    - Tracking snippet insertion
    - Link cloaking functionality
    - Rotation weight handling

  3. Performance Optimizations
    - Additional indexes for analytics queries
    - Database functions for atomic operations
*/

-- Add advanced columns to links table
DO $$
BEGIN
  -- UTM parameters storage
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'utm_parameters'
  ) THEN
    ALTER TABLE links ADD COLUMN utm_parameters jsonb;
  END IF;

  -- Geo-targeting rules
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'geo_targeting'
  ) THEN
    ALTER TABLE links ADD COLUMN geo_targeting jsonb;
  END IF;

  -- Time-based targeting rules
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'time_targeting'
  ) THEN
    ALTER TABLE links ADD COLUMN time_targeting jsonb;
  END IF;

  -- Tracking snippets configuration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'tracking_snippets'
  ) THEN
    ALTER TABLE links ADD COLUMN tracking_snippets jsonb;
  END IF;

  -- Cloaking functionality
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'cloaking_enabled'
  ) THEN
    ALTER TABLE links ADD COLUMN cloaking_enabled boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'cloak_page'
  ) THEN
    ALTER TABLE links ADD COLUMN cloak_page text;
  END IF;

  -- Deep link configuration
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'deep_link_config'
  ) THEN
    ALTER TABLE links ADD COLUMN deep_link_config jsonb;
  END IF;
END $$;

-- Create function to increment link clicks atomically
CREATE OR REPLACE FUNCTION increment_link_clicks(link_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE links 
  SET 
    total_clicks = total_clicks + 1,
    updated_at = now()
  WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;

-- Create function to get weighted rotation URL
CREATE OR REPLACE FUNCTION get_rotation_url(link_id uuid)
RETURNS text AS $$
DECLARE
  rotation_record RECORD;
  total_weight INTEGER;
  random_weight INTEGER;
  current_weight INTEGER := 0;
BEGIN
  -- Get total weight of active rotations
  SELECT COALESCE(SUM(weight), 0) INTO total_weight
  FROM link_rotations
  WHERE link_id = get_rotation_url.link_id AND is_active = true;

  -- If no rotations or zero weight, return null
  IF total_weight = 0 THEN
    RETURN NULL;
  END IF;

  -- Generate random number between 1 and total_weight
  random_weight := floor(random() * total_weight) + 1;

  -- Find the rotation URL based on weighted selection
  FOR rotation_record IN
    SELECT url, weight, id
    FROM link_rotations
    WHERE link_id = get_rotation_url.link_id AND is_active = true
    ORDER BY id
  LOOP
    current_weight := current_weight + rotation_record.weight;
    IF random_weight <= current_weight THEN
      -- Update click count for this rotation
      UPDATE link_rotations 
      SET clicks = clicks + 1 
      WHERE id = rotation_record.id;
      
      RETURN rotation_record.url;
    END IF;
  END LOOP;

  -- Fallback (should not reach here)
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_links_utm_parameters ON links USING GIN (utm_parameters);
CREATE INDEX IF NOT EXISTS idx_links_geo_targeting ON links USING GIN (geo_targeting);
CREATE INDEX IF NOT EXISTS idx_links_time_targeting ON links USING GIN (time_targeting);
CREATE INDEX IF NOT EXISTS idx_links_cloaking_enabled ON links(cloaking_enabled);
CREATE INDEX IF NOT EXISTS idx_clicks_ip_address ON clicks(ip_address);
CREATE INDEX IF NOT EXISTS idx_clicks_country ON clicks(country);
CREATE INDEX IF NOT EXISTS idx_clicks_device_type ON clicks(device_type);
CREATE INDEX IF NOT EXISTS idx_link_rotations_weight ON link_rotations(weight);

-- Create view for link analytics
CREATE OR REPLACE VIEW link_analytics AS
SELECT 
  l.id,
  l.short_code,
  l.original_url,
  l.title,
  l.total_clicks,
  l.unique_clicks,
  l.created_at,
  l.is_active,
  c.campaign_name,
  d.domain,
  COUNT(DISTINCT cl.ip_address) as unique_visitors,
  COUNT(cl.id) as total_visits,
  COUNT(DISTINCT cl.country) as countries_reached,
  COUNT(DISTINCT cl.device_type) as device_types,
  MAX(cl.clicked_at) as last_click
FROM links l
LEFT JOIN campaigns c ON l.campaign_id = c.id
LEFT JOIN domains d ON l.domain_id = d.id
LEFT JOIN clicks cl ON l.id = cl.link_id
GROUP BY l.id, l.short_code, l.original_url, l.title, l.total_clicks, 
         l.unique_clicks, l.created_at, l.is_active, c.name, d.domain;

-- Update RLS policies for new columns
CREATE POLICY "Users can read analytics for own links"
  ON link_analytics FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM links 
      WHERE links.id = link_analytics.id 
      AND links.user_id = auth.uid()
    )
  );
