-- Migration: Set marloncrs79@gmail.com as admin
-- This sets the is_admin flag in app_metadata for the specified user

DO $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find the user by email
    SELECT id INTO target_user_id
    FROM auth.users
    WHERE email = 'marloncrs79@gmail.com'
    LIMIT 1;

    IF target_user_id IS NOT NULL THEN
        -- Update app_metadata to set is_admin = true
        UPDATE auth.users
        SET raw_app_meta_data = COALESCE(raw_app_meta_data, '{}'::jsonb) || '{"is_admin": true}'::jsonb
        WHERE id = target_user_id;
        
        RAISE NOTICE 'User marloncrs79@gmail.com (%) set as admin', target_user_id;
    ELSE
        RAISE WARNING 'User marloncrs79@gmail.com not found';
    END IF;
END $$;
