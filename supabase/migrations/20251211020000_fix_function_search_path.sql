-- Migration: Fix mutable search_path security warnings
-- Functions should have SET search_path = '' to prevent search_path attacks

-- Fix check_plan_limits function
ALTER FUNCTION public.check_plan_limits() SET search_path = '';

-- Fix log_admin_action function with correct signature (UUID, TEXT, UUID, JSONB, INET)
ALTER FUNCTION public.log_admin_action(UUID, TEXT, UUID, JSONB, INET) SET search_path = '';

