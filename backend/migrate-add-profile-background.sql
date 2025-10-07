-- Add profile_background column to users table
ALTER TABLE users ADD COLUMN profile_background TEXT DEFAULT 'none';

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_profile_background ON users(profile_background);
