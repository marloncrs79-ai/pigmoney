-- Enable RLS on the migrations table to secure it from public API access
ALTER TABLE IF EXISTS public.supabase_migrations ENABLE ROW LEVEL SECURITY;

-- No policies are created, which means implicit DENY ALL for anon/authenticated roles.
-- The postgres/service_role users bypass RLS, so CLI operations will continue to work.
