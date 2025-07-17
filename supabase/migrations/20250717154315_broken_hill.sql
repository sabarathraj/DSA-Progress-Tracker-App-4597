/*
  # Fix RLS Policy for Problem Deletion

  1. Policy Updates
    - Remove restrictive UPDATE policies that prevent soft deletion
    - Add proper policy to allow users to update their own problems including is_active field
    - Ensure users can soft delete (set is_active = false) on problems they created

  2. Security
    - Maintain security by ensuring users can only modify their own problems
    - Allow soft deletion by permitting is_active updates for problem owners
*/

-- Drop existing restrictive UPDATE policies that might prevent soft deletion
DROP POLICY IF EXISTS "Allow update for all authenticated users" ON problems;
DROP POLICY IF EXISTS "Allow update for all users" ON problems;
DROP POLICY IF EXISTS "Allow update for creator" ON problems;
DROP POLICY IF EXISTS "Allow update of own problems" ON problems;
DROP POLICY IF EXISTS "Allow user to update own problems" ON problems;
DROP POLICY IF EXISTS "Users can update own problems" ON problems;
DROP POLICY IF EXISTS "Users can update their own problems" ON problems;
DROP POLICY IF EXISTS "update_own_problems" ON problems;

-- Create a comprehensive UPDATE policy that allows users to update their own problems
-- including the ability to soft delete by setting is_active = false
CREATE POLICY "users_can_update_own_problems"
  ON problems
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

-- Ensure the DELETE policies are also properly configured for completeness
DROP POLICY IF EXISTS "Allow delete for all authenticated users" ON problems;
DROP POLICY IF EXISTS "Allow delete of own problems" ON problems;
DROP POLICY IF EXISTS "Users can delete own problems" ON problems;
DROP POLICY IF EXISTS "Users can delete their own problems" ON problems;
DROP POLICY IF EXISTS "Allow users to delete only their own problems" ON problems;
DROP POLICY IF EXISTS "delete_own_problems" ON problems;

-- Create a proper DELETE policy (though we use soft delete, this is for completeness)
CREATE POLICY "users_can_delete_own_problems"
  ON problems
  FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by);