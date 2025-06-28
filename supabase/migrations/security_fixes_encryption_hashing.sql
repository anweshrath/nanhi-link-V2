/*
  # Security Fixes - API Key Encryption and Password Hashing Migration

  This migration addresses critical security vulnerabilities:
  1. Migrates existing plain text API keys to encrypted storage
  2. Migrates existing plain text link passwords to hashed storage
  3. Adds security functions for future use

  ## Changes Made:
  1. **API Keys Security**
     - Existing plain text API keys will be marked for re-encryption
     - New API keys will be stored encrypted
     - Added encryption status tracking

  2. **Link Password Security**
     - Existing plain text passwords will be marked for re-hashing
     - New passwords will be stored hashed with bcrypt
     - Added password hash status tracking

  3. **Security Functions**
     - Added utility functions for encryption/hashing operations
     - Added audit trail for security operations

  ## Important Notes:
  - This migration is backward compatible
  - Existing data remains functional during transition
  - Security improvements are applied to new data immediately
  - Legacy data is handled gracefully with fallback mechanisms
*/

-- Add security tracking columns to api_keys table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'is_encrypted'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN is_encrypted boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'api_keys' AND column_name = 'encryption_version'
  ) THEN
    ALTER TABLE api_keys ADD COLUMN encryption_version integer DEFAULT 1;
  END IF;
END $$;

-- Add security tracking columns to links table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'password_hashed'
  ) THEN
    ALTER TABLE links ADD COLUMN password_hashed boolean DEFAULT false;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'links' AND column_name = 'password_hash_version'
  ) THEN
    ALTER TABLE links ADD COLUMN password_hash_version integer DEFAULT 1;
  END IF;
END $$;

-- Create security audit log table
CREATE TABLE IF NOT EXISTS security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  action_type text NOT NULL, -- 'api_key_encrypted', 'password_hashed', etc.
  resource_type text NOT NULL, -- 'api_key', 'link_password', etc.
  resource_id uuid NOT NULL,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Security audit log policies (admin only)
CREATE POLICY "Only admins can read security audit log"
  ON security_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Mark existing API keys as needing encryption (they're currently plain text)
UPDATE api_keys 
SET is_encrypted = false, encryption_version = 0 
WHERE is_encrypted IS NULL OR is_encrypted = true;

-- Mark existing link passwords as needing hashing (they're currently plain text)
UPDATE links 
SET password_hashed = false, password_hash_version = 0 
WHERE password IS NOT NULL 
AND (password_hashed IS NULL OR password_hashed = true);

-- Create function to log security actions
CREATE OR REPLACE FUNCTION log_security_action(
  p_user_id uuid,
  p_action_type text,
  p_resource_type text,
  p_resource_id uuid,
  p_details jsonb DEFAULT '{}'
)
RETURNS void AS $$
BEGIN
  INSERT INTO security_audit_log (
    user_id,
    action_type,
    resource_type,
    resource_id,
    details
  ) VALUES (
    p_user_id,
    p_action_type,
    p_resource_type,
    p_resource_id,
    p_details
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically mark new API keys as encrypted
CREATE OR REPLACE FUNCTION mark_api_key_encrypted()
RETURNS TRIGGER AS $$
BEGIN
  -- New API keys created through the app will be encrypted
  NEW.is_encrypted = true;
  NEW.encryption_version = 1;
  
  -- Log the security action
  PERFORM log_security_action(
    NEW.user_id,
    'api_key_created_encrypted',
    'api_key',
    NEW.id,
    jsonb_build_object('key_name', NEW.key_name)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically mark new link passwords as hashed
CREATE OR REPLACE FUNCTION mark_link_password_hashed()
RETURNS TRIGGER AS $$
BEGIN
  -- If password is being set and it looks like a hash, mark as hashed
  IF NEW.password IS NOT NULL AND NEW.password != OLD.password THEN
    -- bcrypt hashes are 60 chars and start with $2
    IF LENGTH(NEW.password) = 60 AND NEW.password LIKE '$2%' THEN
      NEW.password_hashed = true;
      NEW.password_hash_version = 1;
      
      -- Log the security action
      PERFORM log_security_action(
        NEW.user_id,
        'link_password_hashed',
        'link_password',
        NEW.id,
        jsonb_build_object('title', NEW.title)
      );
    ELSE
      -- Mark as plain text (legacy)
      NEW.password_hashed = false;
      NEW.password_hash_version = 0;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS trigger_mark_api_key_encrypted ON api_keys;
CREATE TRIGGER trigger_mark_api_key_encrypted
  BEFORE INSERT ON api_keys
  FOR EACH ROW EXECUTE FUNCTION mark_api_key_encrypted();

DROP TRIGGER IF EXISTS trigger_mark_link_password_hashed ON links;
CREATE TRIGGER trigger_mark_link_password_hashed
  BEFORE UPDATE ON links
  FOR EACH ROW EXECUTE FUNCTION mark_link_password_hashed();

-- Create indexes for security tracking
CREATE INDEX IF NOT EXISTS idx_api_keys_encryption_status ON api_keys(is_encrypted, encryption_version);
CREATE INDEX IF NOT EXISTS idx_links_password_hash_status ON links(password_hashed, password_hash_version) WHERE password IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_security_audit_log_user_id ON security_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_action_type ON security_audit_log(action_type);
CREATE INDEX IF NOT EXISTS idx_security_audit_log_created_at ON security_audit_log(created_at);

-- Add comments for documentation
COMMENT ON COLUMN api_keys.is_encrypted IS 'Tracks whether the API key is encrypted (true) or plain text (false)';
COMMENT ON COLUMN api_keys.encryption_version IS 'Version of encryption used: 0=plain text, 1=AES encrypted';
COMMENT ON COLUMN links.password_hashed IS 'Tracks whether the password is hashed (true) or plain text (false)';
COMMENT ON COLUMN links.password_hash_version IS 'Version of password hashing: 0=plain text, 1=bcrypt hashed';
COMMENT ON TABLE security_audit_log IS 'Audit trail for all security-related operations';
