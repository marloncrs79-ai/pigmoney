-- Rename table to plural if it exists as singular
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'piggy_bank') THEN
    ALTER TABLE public.piggy_bank RENAME TO piggy_banks;
  END IF;
END $$;

-- If table didn't exist at all (and wasn't just renamed, e.g. fresh install with skipped migrations), create it
CREATE TABLE IF NOT EXISTS public.piggy_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add missing columns for multiple piggy banks support
ALTER TABLE public.piggy_banks 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Meu Cofrinho',
ADD COLUMN IF NOT EXISTS goal_amount NUMERIC;

-- Remove unique constraint on couple_id to allow multiple piggy banks per couple
ALTER TABLE public.piggy_banks DROP CONSTRAINT IF EXISTS piggy_bank_couple_id_key;
ALTER TABLE public.piggy_banks DROP CONSTRAINT IF EXISTS piggy_banks_couple_id_key;

-- Fix piggy_bank_movements to support multiple piggy banks
ALTER TABLE public.piggy_bank_movements
ADD COLUMN IF NOT EXISTS piggy_bank_id UUID REFERENCES public.piggy_banks(id) ON DELETE CASCADE;

-- Data Migration: Link existing movements to the primary piggy bank of the couple
DO $$
DECLARE 
  movement RECORD;
  bank_id UUID;
BEGIN
  -- Only try to migrate if we have movements with null piggy_bank_id
  IF EXISTS (SELECT 1 FROM public.piggy_bank_movements WHERE piggy_bank_id IS NULL) THEN
    -- Iterate over distinct couples that have unlinked movements
    FOR movement IN SELECT DISTINCT couple_id FROM public.piggy_bank_movements WHERE piggy_bank_id IS NULL LOOP
      -- Find a piggy bank for this couple (any one will do, usually the first created)
      SELECT id INTO bank_id FROM public.piggy_banks WHERE couple_id = movement.couple_id ORDER BY created_at ASC LIMIT 1;
      
      -- If found, update all unlinked movements for this couple
      IF bank_id IS NOT NULL THEN
        UPDATE public.piggy_bank_movements 
        SET piggy_bank_id = bank_id 
        WHERE couple_id = movement.couple_id AND piggy_bank_id IS NULL;
      END IF;
    END LOOP;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.piggy_banks ENABLE ROW LEVEL SECURITY;

-- Drop old policies (using singular name if they carried over or plural if partly applied)
DROP POLICY IF EXISTS "Members can view piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can create piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can update piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can view piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can create piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can update piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can delete piggy banks" ON public.piggy_banks;

-- Create new RLS policies for piggy_banks
CREATE POLICY "Members can view piggy banks"
ON public.piggy_banks FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create piggy banks"
ON public.piggy_banks FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update piggy banks"
ON public.piggy_banks FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete piggy banks"
ON public.piggy_banks FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));
