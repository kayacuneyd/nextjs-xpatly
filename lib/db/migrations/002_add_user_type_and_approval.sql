-- Migration 002: Add user_type and is_approved columns to users table
-- Run this SQL in Supabase Dashboard > SQL Editor AFTER running 001_initial_schema.sql

-- Create user_type enum
CREATE TYPE user_type AS ENUM ('landlord', 'tenant', 'both');

-- Add new columns to users table
ALTER TABLE users 
  ADD COLUMN user_type user_type NOT NULL DEFAULT 'tenant',
  ADD COLUMN is_approved BOOLEAN NOT NULL DEFAULT false;

-- Add approve_user and reject_user to admin action types
ALTER TYPE admin_action_type ADD VALUE IF NOT EXISTS 'approve_user';
ALTER TYPE admin_action_type ADD VALUE IF NOT EXISTS 'reject_user';

-- Update the handle_new_user function to include new columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role, user_type, is_verified, is_approved, is_banned)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'tenant')::user_type,
    false,
    false,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for user_type and is_approved for faster queries
CREATE INDEX idx_users_user_type ON users(user_type);
CREATE INDEX idx_users_is_approved ON users(is_approved);

-- Comments for documentation
COMMENT ON COLUMN users.user_type IS 'Type of user: landlord (property owner), tenant (looking to rent), or both';
COMMENT ON COLUMN users.is_approved IS 'Whether the user account has been approved by an admin';
