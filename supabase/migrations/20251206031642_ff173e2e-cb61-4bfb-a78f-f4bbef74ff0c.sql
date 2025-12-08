-- Fix the circular RLS dependency
-- The issue: couple_members INSERT policy checks couples.created_by via SELECT,
-- but couples SELECT policy only allows viewing via is_couple_member(),
-- which requires being a member first - creating a deadlock.

-- Drop the existing policy
DROP POLICY IF EXISTS "Users can view their couples" ON public.couples;

-- Create a new policy that also allows viewing couples you created
-- This breaks the circular dependency
CREATE POLICY "Users can view their couples"
ON public.couples
FOR SELECT
USING (
  is_couple_member(id) OR created_by = auth.uid()
);