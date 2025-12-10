-- Migration: Fix admin RLS policies to check both user_metadata and app_metadata
-- This ensures admins can access data regardless of where the is_admin flag is stored

-- Drop existing admin policies for user_reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.user_reports;

-- Recreate admin policies checking BOTH metadata locations
CREATE POLICY "Admins can view all reports"
    ON public.user_reports
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        OR
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update reports"
    ON public.user_reports
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        OR
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
        OR
        (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
    );

-- Add admin policies for cancellation_feedback table if they don't exist
-- First check if the table exists and has RLS enabled
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cancellation_feedback') THEN
        -- Enable RLS if not already enabled
        EXECUTE 'ALTER TABLE public.cancellation_feedback ENABLE ROW LEVEL SECURITY';
        
        -- Drop existing admin policy if it exists
        DROP POLICY IF EXISTS "Admins can view all cancellations" ON public.cancellation_feedback;
        
        -- Create admin view policy
        CREATE POLICY "Admins can view all cancellations"
            ON public.cancellation_feedback
            FOR SELECT
            TO authenticated
            USING (
                (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
                OR
                (auth.jwt() -> 'user_metadata' ->> 'is_admin')::boolean = true
            );
    END IF;
END $$;

-- Add comment
COMMENT ON POLICY "Admins can view all reports" ON public.user_reports 
    IS 'Allow admins (via app_metadata or user_metadata) to view all user reports';
COMMENT ON POLICY "Admins can update reports" ON public.user_reports 
    IS 'Allow admins (via app_metadata or user_metadata) to update report status';
