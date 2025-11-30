-- Migration 003: Add RLS policies for admin user management
-- Run this SQL in Supabase Dashboard > SQL Editor
-- This fixes the 500 error when approving users

-- First, drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Admins can view all users" ON users;
DROP POLICY IF EXISTS "Admins can update any user" ON users;
DROP POLICY IF EXISTS "System can insert users" ON users;

-- Allow admins to view all users
CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users AS admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role IN ('super_admin', 'moderator')
    )
  );

-- Allow admins to update any user
CREATE POLICY "Admins can update any user"
  ON users FOR UPDATE
  USING (
    auth.uid() = id OR
    EXISTS (
      SELECT 1 FROM users AS admin_user
      WHERE admin_user.id = auth.uid()
      AND admin_user.role IN ('super_admin', 'moderator')
    )
  );

-- Allow the system to insert new users (for the trigger function)
CREATE POLICY "System can insert users"
  ON users FOR INSERT
  WITH CHECK (true);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON admin_actions TO authenticated;
