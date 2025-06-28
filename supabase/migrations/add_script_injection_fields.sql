/*
  # Add Script Injection Fields to Links Table

  1. New Columns
    - `script_injection_enabled` (boolean) - Enable/disable script injection
    - `tracking_scripts` (jsonb) - Array of tracking scripts with metadata
    - `script_delay` (integer) - Delay before redirect in seconds
    - `script_position` (text) - Where to inject scripts (head, body, footer)

  2. Updates
    - Add new fields to existing links table
    - Set default values for existing records
*/

-- Add script injection fields to links table
DO $$
BEGIN
  -- Add script injection enabled flag
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'script_injection_enabled'
  ) THEN
    ALTER TABLE links ADD COLUMN script_injection_enabled boolean DEFAULT false;
  END IF;

  -- Add tracking scripts array
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'tracking_scripts'
  ) THEN
    ALTER TABLE links ADD COLUMN tracking_scripts jsonb DEFAULT '[]';
  END IF;

  -- Add script delay
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'script_delay'
  ) THEN
    ALTER TABLE links ADD COLUMN script_delay integer DEFAULT 0;
  END IF;

  -- Add script position
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'script_position'
  ) THEN
    ALTER TABLE links ADD COLUMN script_position text DEFAULT 'head';
  END IF;
END $$;

-- Add check constraint for script position
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints
    WHERE constraint_name = 'links_script_position_check'
  ) THEN
    ALTER TABLE links ADD CONSTRAINT links_script_position_check 
    CHECK (script_position IN ('head', 'body', 'footer'));
  END IF;
END $$;

-- Add index for script injection queries
CREATE INDEX IF NOT EXISTS idx_links_script_injection ON links(script_injection_enabled) WHERE script_injection_enabled = true;
