-- Create admin logs table for auditing admin actions
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_admin_logs_admin_user ON admin_logs(admin_user_id);
CREATE INDEX idx_admin_logs_created_at ON admin_logs(created_at DESC);
CREATE INDEX idx_admin_logs_action ON admin_logs(action);
CREATE INDEX idx_admin_logs_target_user ON admin_logs(target_user_id);

-- Enable RLS (only admins via service role can access)
ALTER TABLE admin_logs ENABLE ROW LEVEL SECURITY;

-- No policies needed - only service role will access this table

-- Add comment
COMMENT ON TABLE admin_logs IS 'Audit log for all administrative actions performed in the system';

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_admin_user_id UUID,
    p_action TEXT,
    p_target_user_id UUID DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_log_id UUID;
BEGIN
    INSERT INTO admin_logs (
        admin_user_id,
        action,
        target_user_id,
        metadata,
        ip_address
    ) VALUES (
        p_admin_user_id,
        p_action,
        p_target_user_id,
        p_metadata,
        p_ip_address
    ) RETURNING id INTO v_log_id;
    
    RETURN v_log_id;
END;
$$;

-- Create trigger function for auth events logging
CREATE OR REPLACE FUNCTION log_auth_events()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Log user creation
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO admin_logs (admin_user_id, action, target_user_id, metadata)
        VALUES (
            NULL,  -- System action
            'user_created',
            NEW.id,
            jsonb_build_object(
                'email', NEW.email,
                'provider', COALESCE(NEW.raw_app_meta_data->>'provider', 'email'),
                'created_at', NEW.created_at
            )
        );
    END IF;
    
    -- Log user deletion
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO admin_logs (admin_user_id, action, target_user_id, metadata)
        VALUES (
            NULL,  -- Could be admin or system
            'user_deleted',
            OLD.id,
            jsonb_build_object(
                'email', OLD.email,
                'last_login', OLD.last_sign_in_at
            )
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create trigger on auth.users
DROP TRIGGER IF EXISTS trigger_log_auth_events ON auth.users;
CREATE TRIGGER trigger_log_auth_events
    AFTER INSERT OR DELETE ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION log_auth_events();
