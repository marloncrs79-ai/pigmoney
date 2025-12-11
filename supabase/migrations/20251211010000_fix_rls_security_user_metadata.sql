-- Migration: Fix RLS policies to only use app_metadata (secure)
-- user_metadata is editable by end users and should NEVER be used for security checks

-- Drop existing problematic policies for user_reports
DROP POLICY IF EXISTS "Admins can view all reports" ON public.user_reports;
DROP POLICY IF EXISTS "Admins can update reports" ON public.user_reports;

-- Recreate admin policies using ONLY app_metadata (secure, not user-editable)
CREATE POLICY "Admins can view all reports"
    ON public.user_reports
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

CREATE POLICY "Admins can update reports"
    ON public.user_reports
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Fix cancellation_feedback policies
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'cancellation_feedback') THEN
        -- Drop existing problematic policy
        DROP POLICY IF EXISTS "Admins can view all cancellations" ON public.cancellation_feedback;
        
        -- Create secure admin view policy
        CREATE POLICY "Admins can view all cancellations"
            ON public.cancellation_feedback
            FOR SELECT
            TO authenticated
            USING (
                (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
            );
    END IF;
END $$;

-- Add comments
COMMENT ON POLICY "Admins can view all reports" ON public.user_reports 
    IS 'Allow admins (via app_metadata only) to view all user reports';
COMMENT ON POLICY "Admins can update reports" ON public.user_reports 
    IS 'Allow admins (via app_metadata only) to update report status';
