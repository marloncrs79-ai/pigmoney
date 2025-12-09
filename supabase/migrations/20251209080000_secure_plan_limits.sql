-- SECURE PLAN SYSTEM MIGRATION
-- 2025-12-09

-- 1. Create PLANS table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY, -- 'free', 'pro', 'annual'
  name TEXT NOT NULL,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for plans (Public Read-Only)
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can view plans" ON public.plans FOR SELECT TO authenticated USING (true);

-- 2. Create SUBSCRIPTIONS table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  plan_id TEXT REFERENCES public.plans(id) NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due'
  starts_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id) -- One subscription per user for simplicity
);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. SEED DEFAULT PLANS
INSERT INTO public.plans (id, name, price, limits) VALUES
(
  'free', 
  'Plano Gratuito', 
  0, 
  '{
    "max_credit_cards": 2,
    "max_piggy_banks": 3,
    "max_fixed_expenses": 10,
    "max_goals": 1
  }'::jsonb
),
(
  'pro', 
  'Plano Premium', 
  29.90, 
  '{
    "max_credit_cards": 999,
    "max_piggy_banks": 999,
    "max_fixed_expenses": 999,
    "max_goals": 999
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET limits = EXCLUDED.limits;

-- 4. FUNCTION TO CHECK LIMITS (THE BOUNCER)
CREATE OR REPLACE FUNCTION public.check_plan_limits()
RETURNS TRIGGER AS $$
DECLARE
  user_plan_id TEXT;
  plan_limits JSONB;
  current_count INT;
  limit_key TEXT;
  max_allowed INT;
BEGIN
  -- 1. Get User's Plan (Default to 'free' if no sub found)
  SELECT plan_id INTO user_plan_id
  FROM public.subscriptions
  WHERE user_id = auth.uid() AND status = 'active'
  LIMIT 1;

  IF user_plan_id IS NULL THEN
    user_plan_id := 'free';
  END IF;

  -- 2. Get Limits for that Plan
  SELECT limits INTO plan_limits
  FROM public.plans
  WHERE id = user_plan_id;

  -- 3. Determine which table we are checking
  IF TG_TABLE_NAME = 'credit_cards' THEN
    limit_key := 'max_credit_cards';
  ELSIF TG_TABLE_NAME = 'piggy_banks' THEN
    limit_key := 'max_piggy_banks';
  ELSIF TG_TABLE_NAME = 'fixed_expenses' THEN
    limit_key := 'max_fixed_expenses';
  ELSE
    RETURN NEW; -- Not a restricted table? Should not happen if trigger is applied correctly.
  END IF;

  -- 4. Get the numeric limit (handle nulls safely)
  max_allowed := (plan_limits->>limit_key)::INT;
  
  -- If unlimited (e.g., 999 or null), pass
  IF max_allowed IS NULL OR max_allowed >= 999 THEN
    RETURN NEW;
  END IF;

  -- 5. Count existing records for this user (using the RLS context)
  -- Note: We count *before* the insert.
  EXECUTE format('SELECT count(*) FROM public.%I WHERE created_by = $1', TG_TABLE_NAME)
  INTO current_count
  USING auth.uid();

  -- 6. Stop if limit reached
  IF current_count >= max_allowed THEN
    RAISE EXCEPTION 'PLAN_LIMIT_EXCEEDED: Seu plano % permite apenas % registros nesta categoria. Faça upgrade para continuar!', user_plan_id, max_allowed;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. APPLY TRIGGERS
DROP TRIGGER IF EXISTS check_limits_cards ON public.credit_cards;
CREATE TRIGGER check_limits_cards
BEFORE INSERT ON public.credit_cards
FOR EACH ROW
EXECUTE FUNCTION public.check_plan_limits();

DROP TRIGGER IF EXISTS check_limits_banks ON public.piggy_banks;
CREATE TRIGGER check_limits_banks
BEFORE INSERT ON public.piggy_banks
FOR EACH ROW
EXECUTE FUNCTION public.check_plan_limits();

-- Note: We need to be careful with 'created_by' existing on fixed_expenses.
-- The Security Hardening migration added it, so we are safe assuming it exists.
-- However, for shared expenses (couple), we might want to count by 'couple_id' instead?
-- For now, let's stick to 'created_by' as the strict limit owner for simplicity.
DROP TRIGGER IF EXISTS check_limits_fixed ON public.fixed_expenses;
CREATE TRIGGER check_limits_fixed
BEFORE INSERT ON public.fixed_expenses
FOR EACH ROW
EXECUTE FUNCTION public.check_plan_limits();

-- 6. BACKFILL: Give everyone a free subscription if they don't have one
INSERT INTO public.subscriptions (user_id, plan_id, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.subscriptions)
ON CONFLICT (user_id) DO NOTHING;
