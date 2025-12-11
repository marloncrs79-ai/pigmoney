-- Migration: Fix User Deletion Cascade
-- Description: Ensures that when a user is deleted from auth.users, their data in earnings and subscriptions is also deleted.
-- Date: 2025-12-11

-- 1. Fix 'earnings' table
DO $$
BEGIN
    -- Only proceed if the table exists
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'earnings') THEN
        -- Check if constraint exists effectively (or just drop it safely)
        -- We try to drop any existing FK on user_id
        ALTER TABLE public.earnings DROP CONSTRAINT IF EXISTS earnings_user_id_fkey;
        
        -- Re-add with ON DELETE CASCADE
        ALTER TABLE public.earnings
        ADD CONSTRAINT earnings_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Fix 'subscriptions' table
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'subscriptions') THEN
        ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_user_id_fkey;
        
        ALTER TABLE public.subscriptions
        ADD CONSTRAINT subscriptions_user_id_fkey
        FOREIGN KEY (user_id)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 3. Fix 'couples' table (Referencing created_by if it exists)
DO $$
BEGIN
    -- Check if 'created_by' column exists in 'couples'
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'couples' 
        AND column_name = 'created_by'
    ) THEN
        -- Drop potentially existing constraint (names vary, we might need to guess or query)
        -- Common default naming: couples_created_by_fkey
        ALTER TABLE public.couples DROP CONSTRAINT IF EXISTS couples_created_by_fkey;

        ALTER TABLE public.couples
        ADD CONSTRAINT couples_created_by_fkey
        FOREIGN KEY (created_by)
        REFERENCES auth.users(id)
        ON DELETE CASCADE;
    END IF;
END $$;

-- 4. Clean up any existing orphaned data (optional but recommended once)
-- This deletes rows in these tables where the user_id requires a user that no longer exists
DELETE FROM public.earnings 
WHERE user_id NOT IN (SELECT id FROM auth.users);

DELETE FROM public.subscriptions 
WHERE user_id NOT IN (SELECT id FROM auth.users);

-- Couples might be trickier if created_by is nullable or if clean up logic is complex, 
-- but safely deleting those pointing to non-existent users is usually correct for consistency.
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'couples' AND column_name = 'created_by'
    ) THEN
        DELETE FROM public.couples WHERE created_by NOT IN (SELECT id FROM auth.users);
    END IF;
END $$;
