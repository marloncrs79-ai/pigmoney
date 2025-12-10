-- Migration: Fix admin_logs foreign key constraints
-- The FK constraints on admin_user_id and target_user_id cause issues
-- When logging actions for users that might not exist in auth.users yet

-- Drop the foreign key constraints
ALTER TABLE public.admin_logs 
    DROP CONSTRAINT IF EXISTS admin_logs_admin_user_id_fkey;

ALTER TABLE public.admin_logs 
    DROP CONSTRAINT IF EXISTS admin_logs_target_user_id_fkey;

-- The columns remain as UUID but without FK reference
-- This allows logging for any UUID without validation
COMMENT ON COLUMN public.admin_logs.admin_user_id IS 'Admin user UUID (no FK constraint for flexibility)';
COMMENT ON COLUMN public.admin_logs.target_user_id IS 'Target user UUID (no FK constraint for flexibility)';
