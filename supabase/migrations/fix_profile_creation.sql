/*
  # Fix Profile Creation Issues

  1. Database Changes
    - Drop and recreate the profile creation trigger with better error handling
    - Update RLS policies to ensure proper INSERT permissions
    - Add better error handling in the trigger function
    - Ensure the trigger has proper permissions

  2. Security Updates
    - Fix RLS policies for profile insertion
    - Ensure authenticated users can create their own profiles
    - Add proper error logging
*/

-- Drop existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Recreate the function with better error handling and logging
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert into profiles table
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', '')
  );
  
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log the error (this will appear in Supabase logs)
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    -- Don't fail the auth process, just log the error
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update RLS policies for profiles table
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new RLS policies with proper permissions
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow the trigger function to insert profiles
CREATE POLICY "Allow profile creation via trigger"
  ON profiles FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Ensure the profiles table has the correct structure
DO $$
BEGIN
  -- Make sure email column allows nulls temporarily for the trigger
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'email' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
  END IF;
END $$;

-- Update the email column to be nullable and add a default
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
ALTER TABLE profiles ALTER COLUMN name SET DEFAULT '';
