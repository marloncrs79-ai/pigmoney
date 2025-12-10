-- Migration: Grant admin to marloncrs79@gmail.com
-- This sets is_admin=true in user_metadata for the specified user

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'marloncrs79@gmail.com';

    IF target_user_id IS NOT NULL THEN
        -- Update user_metadata to include is_admin
        UPDATE auth.users
        SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
        WHERE id = target_user_id;
        
        RAISE NOTICE 'Granted admin to user: marloncrs79@gmail.com';
    ELSE
        RAISE NOTICE 'User marloncrs79@gmail.com not found - they need to sign up first';
    END IF;
END $$;
