-- FINAL ONBOARDING FIX
-- 2025-12-09

-- 1. Redefine create_family_space to be absolutely foolproof
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
  
  -- Validation
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'User not authenticated';
  END IF;

  -- 1. Create the couple
  INSERT INTO public.couples (name, created_by)
  VALUES (name, current_user_id)
  RETURNING id INTO new_couple_id;

  -- 2. Add the creator as the owner
  INSERT INTO public.couple_members (couple_id, user_id, role)
  VALUES (new_couple_id, current_user_id, 'owner');

  -- 3. IMMEDIATELY Return the structure expected by frontend
  -- This avoids a second round-trip query that might fail due to RLS lag
  RETURN jsonb_build_object(
    'id', new_couple_id,
    'name', name
  );
END;
$$;
