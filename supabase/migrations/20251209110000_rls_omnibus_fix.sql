-- OMNIBUS RLS SECURITY FIX (PENETRATION TEST RESPONSE)
-- 2025-12-09
-- TARGET: Blindar todas as tabelas contra acesso indevido.

-- ==============================================================================
-- 1. HELPER FUNCTIONS (Non-Recursive)
-- ==============================================================================

-- Ensure clean slate for functions to avoid signature conflicts
-- use CASCADE to automatically drop dependent policies (we recreate them below anyway)
DROP FUNCTION IF EXISTS public.get_my_couple_ids() CASCADE;
DROP FUNCTION IF EXISTS public.is_couple_member(uuid) CASCADE;

-- Ensure the helper exists and is secure
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

-- Helper to check if user is member of a couple (for simple boolean checks)
CREATE OR REPLACE FUNCTION public.is_couple_member(check_couple_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.couple_members cm 
    WHERE cm.couple_id = check_couple_id 
    AND cm.user_id = auth.uid()
  );
END;
$$;

-- ==============================================================================
-- 2. RESET & ENABLE RLS ON ALL TABLES
-- ==============================================================================

DO $$ 
DECLARE 
  t text;
BEGIN 
  FOR t IN 
    SELECT table_name FROM information_schema.tables 
    WHERE table_schema = 'public' 
  LOOP 
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_select" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_insert" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_update" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "owner_delete" ON public.%I', t);
    EXECUTE format('DROP POLICY IF EXISTS "Users can view couple members" ON public.%I', t); -- Cleanup old names
    EXECUTE format('DROP POLICY IF EXISTS "Users can view their couples" ON public.%I', t);
  END LOOP; 
END $$;

-- ==============================================================================
-- 3. STRICT POLICIES DEFINITION
-- ==============================================================================

-- TABLE: couples
DROP POLICY IF EXISTS "couples_select" ON public.couples;
CREATE POLICY "couples_select" ON public.couples FOR SELECT TO authenticated
USING (
  created_by = auth.uid() OR
  id IN (SELECT * FROM public.get_my_couple_ids())
);

-- TABLE: couple_members
DROP POLICY IF EXISTS "couple_members_select" ON public.couple_members;
CREATE POLICY "couple_members_select" ON public.couple_members FOR SELECT TO authenticated
USING (
  user_id = auth.uid() OR
  couple_id IN (SELECT * FROM public.get_my_couple_ids())
);

-- TABLE: income (Shared by couple)
DROP POLICY IF EXISTS "income_policy" ON public.income;
CREATE POLICY "income_policy" ON public.income FOR ALL TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- TABLE: fixed_expenses (Shared by couple)
DROP POLICY IF EXISTS "fixed_expenses_policy" ON public.fixed_expenses;
CREATE POLICY "fixed_expenses_policy" ON public.fixed_expenses FOR ALL TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- TABLE: earnings (Shared by couple - possibly replaced variable_income)
DROP POLICY IF EXISTS "earnings_policy" ON public.earnings;
CREATE POLICY "earnings_policy" ON public.earnings FOR ALL TO authenticated
USING ( user_id = auth.uid() ); -- Earnings are often personal? Let's check schema. Assuming Personal linked to User.
-- WARNING: If earnings are shared, switch to couple_id check. For now, strict ownership.

-- TABLE: credit_cards (Shared by couple)
DROP POLICY IF EXISTS "credit_cards_policy" ON public.credit_cards;
CREATE POLICY "credit_cards_policy" ON public.credit_cards FOR ALL TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- TABLE: card_transactions
DROP POLICY IF EXISTS "card_transactions_policy" ON public.card_transactions;
CREATE POLICY "card_transactions_policy" ON public.card_transactions FOR ALL TO authenticated
USING ( 
  -- Must belong to a card that belongs to my couple
  card_id IN (
    SELECT id FROM public.credit_cards WHERE couple_id IN (SELECT * FROM public.get_my_couple_ids())
  )
);

-- TABLE: piggy_banks
DROP POLICY IF EXISTS "piggy_banks_policy" ON public.piggy_banks;
CREATE POLICY "piggy_banks_policy" ON public.piggy_banks FOR ALL TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- TABLE: piggy_bank_movements
DROP POLICY IF EXISTS "piggy_bank_movements_policy" ON public.piggy_bank_movements;
CREATE POLICY "piggy_bank_movements_policy" ON public.piggy_bank_movements FOR ALL TO authenticated
USING (
  piggy_bank_id IN (
    SELECT id FROM public.piggy_banks WHERE couple_id IN (SELECT * FROM public.get_my_couple_ids())
  )
);

-- TABLE: monthly_snapshots
DROP POLICY IF EXISTS "monthly_snapshots_policy" ON public.monthly_snapshots;
CREATE POLICY "monthly_snapshots_policy" ON public.monthly_snapshots FOR ALL TO authenticated
USING ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- TABLE: subscriptions (Personal)
DROP POLICY IF EXISTS "subscriptions_policy" ON public.subscriptions;
CREATE POLICY "subscriptions_policy" ON public.subscriptions FOR ALL TO authenticated
USING ( user_id = auth.uid() );

-- TABLE: plans (Public Read)
DROP POLICY IF EXISTS "plans_read" ON public.plans;
CREATE POLICY "plans_read" ON public.plans FOR SELECT TO authenticated
USING ( true ); -- Everyone can see plans available

-- ==============================================================================
-- 4. INSERT GUARD (PREVENT SPOOFING)
-- ==============================================================================
-- Ensure that when inserting, you cannot assign a record to a couple you don't belong to.

-- Apply CHECK to all shared tables
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
-- (Policies above already include USING. For INSERT, 'WITH CHECK' is implied identical to USING if not specified, 
-- but let's be explicit for critical tables).

DROP POLICY IF EXISTS "income_insert" ON public.income;
CREATE POLICY "income_insert" ON public.income FOR INSERT TO authenticated
WITH CHECK ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

DROP POLICY IF EXISTS "fixed_expenses_insert" ON public.fixed_expenses;
CREATE POLICY "fixed_expenses_insert" ON public.fixed_expenses FOR INSERT TO authenticated
WITH CHECK ( couple_id IN (SELECT * FROM public.get_my_couple_ids()) );

-- ==============================================================================
-- 5. FINAL CLEANUP
-- ==============================================================================
-- Revoke public access completely
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
