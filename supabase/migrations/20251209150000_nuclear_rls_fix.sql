-- NUCLEAR RLS FIX - ABSOLUTE MINIMUM POLICIES
-- 2025-12-09
-- This migration uses the SIMPLEST possible policy expressions
-- to eliminate any possibility of query planner confusion.

-- ==============================================================================
-- STEP 1: NUKE ALL POLICIES ON couple_members
-- ==============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'couple_members' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.couple_members', pol.policyname);
  END LOOP;
END $$;

-- ==============================================================================
-- STEP 2: NUKE ALL POLICIES ON couples
-- ==============================================================================

DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN 
    SELECT policyname FROM pg_policies WHERE tablename = 'couples' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.couples', pol.policyname);
  END LOOP;
END $$;

-- ==============================================================================
-- STEP 3: ENSURE RLS IS ENABLED
-- ==============================================================================

ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- STEP 4: CREATE THE SIMPLEST POSSIBLE POLICIES
-- ==============================================================================

-- COUPLE_MEMBERS: I can see rows where I am the user
-- NO SUBQUERIES, NO FUNCTIONS, JUST A DIRECT COLUMN CHECK
CREATE POLICY "cm_select" ON public.couple_members
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "cm_update" ON public.couple_members
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "cm_delete" ON public.couple_members
FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- COUPLES: I can see couples I created OR couples where I'm a member
-- Using a simple subquery on couple_members (which now works because of cm_select)
CREATE POLICY "c_select" ON public.couples
FOR SELECT TO authenticated
USING (
  created_by = auth.uid() 
  OR 
  id IN (SELECT couple_id FROM public.couple_members WHERE user_id = auth.uid())
);

CREATE POLICY "c_update" ON public.couples
FOR UPDATE TO authenticated
USING (created_by = auth.uid());

CREATE POLICY "c_delete" ON public.couples
FOR DELETE TO authenticated
USING (created_by = auth.uid());

-- ==============================================================================
-- STEP 5: GRANT PERMISSIONS
-- ==============================================================================

GRANT SELECT, INSERT, UPDATE, DELETE ON public.couple_members TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.couples TO authenticated;

-- ==============================================================================
-- STEP 6: VERIFY RPC IS CORRECT
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.create_family_space(name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_couple_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  INSERT INTO public.couples (name, created_by)
  VALUES (name, current_user_id)
  RETURNING id INTO new_couple_id;

  INSERT INTO public.couple_members (couple_id, user_id, role)
  VALUES (new_couple_id, current_user_id, 'owner');

  RETURN jsonb_build_object('id', new_couple_id, 'name', name);
END;
$$;
