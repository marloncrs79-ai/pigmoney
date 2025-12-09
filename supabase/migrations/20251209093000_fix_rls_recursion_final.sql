-- SECURITY SUPER-FIX MIGRATION
-- 2025-12-09

-- 1. Create a secure helper function to get my couple IDs
-- This function runs as the owner (SECURITY DEFINER), bypassing RLS on couple_members
CREATE OR REPLACE FUNCTION public.get_my_couple_ids()
RETURNS TABLE (couple_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT cm.couple_id
  FROM public.couple_members cm
  WHERE cm.user_id = auth.uid();
END;
$$;

-- 2. FIX RLS ON COUPLE_MEMBERS (Using the helper)
DROP POLICY IF EXISTS "Users can view couple members" ON public.couple_members;
CREATE POLICY "Users can view couple members"
ON public.couple_members FOR SELECT
TO authenticated
USING (
  -- I can see the row if...
  user_id = auth.uid() -- It is ME
  OR
  couple_id IN (SELECT * FROM public.get_my_couple_ids()) -- Or it belongs to my family (found via secure helper)
);

-- 3. FIX RLS ON COUPLES (Using the helper or Creator check)
DROP POLICY IF EXISTS "Users can view their couples" ON public.couples;
CREATE POLICY "Users can view their couples"
ON public.couples FOR SELECT
TO authenticated
USING (
  -- I can see the couple if...
  created_by = auth.uid() -- I created it (Fail-safe)
  OR
  id IN (SELECT * FROM public.get_my_couple_ids()) -- I am a member of it
);
