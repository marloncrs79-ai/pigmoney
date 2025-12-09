-- FIX RLS RECURSION MIGRATION
-- 2025-12-09

-- The previous policy for couple_members was:
-- couple_id IN (SELECT couple_id FROM couple_members WHERE user_id = auth.uid())
-- This causes a recursion/block because you can't read the table to find your ID to read the table.

-- Solution: Allow users to ALWAYS see their own membership row explicitly.

DROP POLICY IF EXISTS "Users can view couple members" ON public.couple_members;

CREATE POLICY "Users can view couple members"
ON public.couple_members FOR SELECT
TO authenticated
USING (
  user_id = auth.uid() -- Can see MY row
  OR
  couple_id IN ( -- Can see rows of MY family
    SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid()
  )
);

-- Also ensure 'couples' is readable if you are a member
-- The previous policy relied on querying couple_members. 
-- Now that couple_members is fixed, the couples policy should work fine, 
-- but let's re-verify it doesn't need a tweak.
-- It uses: EXISTS (SELECT 1 FROM couple_members WHERE couple_id = couples.id AND user_id = auth.uid())
-- This is fine because it filters couple_members by user_id=auth.uid() which is now explicitly allowed above.
