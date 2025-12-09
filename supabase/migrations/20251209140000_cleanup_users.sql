-- CLEANUP ALL NON-ADMIN USERS (WITH FK HANDLING)
-- 2025-12-09
-- CAUTION: This deletes users and all their data!

DO $$
DECLARE
  target_email TEXT := 'marloncrs79@gmail.com';
  admin_uid UUID;
BEGIN
  -- 1. Identify Admin
  SELECT id INTO admin_uid FROM auth.users WHERE email = target_email;

  IF admin_uid IS NULL THEN
    RAISE NOTICE 'Admin user % not found. Aborting cleanup to prevent total wipeout.', target_email;
    RETURN;
  END IF;

  RAISE NOTICE 'Preserving Admin UID: %', admin_uid;

  -- 2. Delete from ALL user-data tables first (order matters for foreign keys)
  
  -- earnings (user_id FK)
  DELETE FROM public.earnings WHERE user_id != admin_uid;
  
  -- subscriptions (user_id FK)
  DELETE FROM public.subscriptions WHERE user_id != admin_uid;
  
  -- piggy_bank_movements (depends on piggy_banks)
  DELETE FROM public.piggy_bank_movements 
  WHERE piggy_bank_id IN (
    SELECT id FROM public.piggy_banks 
    WHERE couple_id IN (
      SELECT id FROM public.couples WHERE created_by != admin_uid
    )
  );
  
  -- piggy_banks (couple_id FK)
  DELETE FROM public.piggy_banks 
  WHERE couple_id IN (
    SELECT id FROM public.couples WHERE created_by != admin_uid
  );
  
  -- card_transactions (card_id FK)
  DELETE FROM public.card_transactions 
  WHERE card_id IN (
    SELECT id FROM public.credit_cards 
    WHERE couple_id IN (
      SELECT id FROM public.couples WHERE created_by != admin_uid
    )
  );
  
  -- credit_cards (couple_id FK)
  DELETE FROM public.credit_cards 
  WHERE couple_id IN (
    SELECT id FROM public.couples WHERE created_by != admin_uid
  );
  
  -- fixed_expenses (couple_id FK)
  DELETE FROM public.fixed_expenses 
  WHERE couple_id IN (
    SELECT id FROM public.couples WHERE created_by != admin_uid
  );
  
  -- income (couple_id FK)
  DELETE FROM public.income 
  WHERE couple_id IN (
    SELECT id FROM public.couples WHERE created_by != admin_uid
  );
  
  -- monthly_snapshots (couple_id FK)
  DELETE FROM public.monthly_snapshots 
  WHERE couple_id IN (
    SELECT id FROM public.couples WHERE created_by != admin_uid
  );

  -- couple_members (user_id and couple_id FK)
  DELETE FROM public.couple_members WHERE user_id != admin_uid;

  -- couples (created_by FK)
  DELETE FROM public.couples WHERE created_by != admin_uid;

  -- 3. Finally, delete from auth.users
  DELETE FROM auth.users WHERE id != admin_uid;

  RAISE NOTICE 'Cleanup complete. Only admin user preserved.';
END $$;
