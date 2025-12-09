-- Fix "Database error saving new user" by removing faulty trigger on auth.users
-- The previous trigger attempted to log to admin_logs but likely failed due to RLS/permissions
DROP TRIGGER IF EXISTS trigger_log_auth_events ON auth.users;
DROP FUNCTION IF EXISTS public.log_auth_events();
