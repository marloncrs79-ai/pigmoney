-- Add created_by column if it doesn't exist (fixing frontend logic gap)
ALTER TABLE public.couples ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- Create secure RPC function for creating couples
CREATE OR REPLACE FUNCTION public.create_family_space(name TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with admin privileges to bypass the new restrictive RLS
SET search_path = public
AS $$
DECLARE
  new_couple_id UUID;
  current_user_id UUID;
BEGIN
  current_user_id := auth.uid();
  
  -- 1. Create the couple
  INSERT INTO public.couples (name, created_by)
  VALUES (name, current_user_id)
  RETURNING id INTO new_couple_id;

  -- 2. Add the creator as the owner
  INSERT INTO public.couple_members (couple_id, user_id, role)
  VALUES (new_couple_id, current_user_id, 'owner');

  -- Return the new couple data
  RETURN jsonb_build_object(
    'id', new_couple_id,
    'name', name
  );
END;
$$;

-- LOCK DOWN RLS POLICIES
-- Drop the insecure "Users can create couples" policy
DROP POLICY IF EXISTS "Users can create couples" ON public.couples;

-- Drop the insecure "Users can add themselves as members" policy
DROP POLICY IF EXISTS "Users can add themselves as members" ON public.couple_members;

-- Create new restrictive policies
-- Only allow INSERT via the SECURIY DEFINER function (effectively disabling public insert)
-- Actually, for RLS, we can just effectively remove the INSERT policy for authenticated users.
-- But to be explicit:
CREATE POLICY "No direct inserts on couples"
ON public.couples FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "No direct inserts on couple_members"
ON public.couple_members FOR INSERT
TO authenticated
WITH CHECK (false);
