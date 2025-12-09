-- FIX: SPLIT COUPLE POLICIES TO AVOID OPTIMIZER RECURSION
-- 2025-12-09

-- 1. Drop the potential problem policy
DROP POLICY IF EXISTS "couple_members_select" ON public.couple_members;

-- 2. Create the "Self Access" policy (Guaranteed safe/fast)
-- This ensures fetchCouple(userId) always succeeds for the user's own row.
CREATE POLICY "couple_members_select_self" ON public.couple_members
FOR SELECT TO authenticated
USING ( user_id = auth.uid() );

-- 3. Create the "Team Access" policy (Secondary)
-- Allows viewing other members of the same couple.
CREATE POLICY "couple_members_select_team" ON public.couple_members
FOR SELECT TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- 4. Re-verify couples policy
DROP POLICY IF EXISTS "couples_select" ON public.couples;
CREATE POLICY "couples_select" ON public.couples FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR
  id IN (SELECT * FROM public.get_my_couple_ids())
);
