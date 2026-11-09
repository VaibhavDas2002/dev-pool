-- ==============================================================================
-- Migration: Add is_active column to profiles and update views
-- Ensures inactive / deactivated members are properly tracked and isolated
-- ==============================================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
CREATE INDEX IF NOT EXISTS idx_profiles_is_active ON profiles(is_active);

-- Update public_profiles view to include is_active and voted_reason
CREATE OR REPLACE VIEW public_profiles AS
SELECT 
    p.id,
    p.full_name,
    p.role,
    p.is_active,
    p.created_at,
    CASE WHEN v.id IS NOT NULL THEN TRUE ELSE FALSE END AS has_voted,
    v.option_id AS voted_option_id,
    v.reason AS voted_reason
FROM profiles p
LEFT JOIN votes v ON v.user_id = p.id;
