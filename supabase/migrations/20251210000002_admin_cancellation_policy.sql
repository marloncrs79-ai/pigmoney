-- Add admin policy to cancellation_feedback table
-- Allows admins to view all cancellation feedbacks

CREATE POLICY "Admins can view all cancellations"
    ON public.cancellation_feedback
    FOR SELECT
    TO authenticated
    USING ((auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true);
