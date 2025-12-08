-- Add created_by column to couples table
ALTER TABLE public.couples ADD COLUMN created_by uuid REFERENCES auth.users(id);

-- Backfill existing couples: set created_by to the owner member
UPDATE public.couples c
SET created_by = (
  SELECT cm.user_id 
  FROM public.couple_members cm 
  WHERE cm.couple_id = c.id AND cm.role = 'owner' 
  LIMIT 1
);

-- Make created_by NOT NULL after backfill
ALTER TABLE public.couples ALTER COLUMN created_by SET NOT NULL;

-- Drop existing problematic policies on couple_members
DROP POLICY IF EXISTS "Users can view couple members" ON public.couple_members;
DROP POLICY IF EXISTS "Users can add themselves as members" ON public.couple_members;

-- New SELECT policy: users can only view members of couples they belong to
CREATE POLICY "Users can view their couple members"
ON public.couple_members
FOR SELECT
USING (auth.uid() = user_id);

-- New INSERT policy: users can only add themselves to couples they created
CREATE POLICY "Users can add themselves only to their own couple"
ON public.couple_members
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 
    FROM public.couples c
    WHERE c.id = couple_id
    AND c.created_by = auth.uid()
  )
);

-- Policy for service_role to add invited members
CREATE POLICY "Service role can add members"
ON public.couple_members
FOR INSERT
TO service_role
WITH CHECK (true);