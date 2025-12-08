-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can add themselves only to their own couple" ON public.couple_members;

-- Create a simpler policy that allows authenticated users to insert their own membership
-- after they've created a couple with created_by = their user id
CREATE POLICY "Users can add themselves to couples they created"
ON public.couple_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.couples 
    WHERE id = couple_id 
    AND created_by = auth.uid()
  )
);