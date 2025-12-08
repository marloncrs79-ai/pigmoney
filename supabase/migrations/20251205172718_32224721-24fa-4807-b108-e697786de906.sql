-- Create couples table (tenant)
CREATE TABLE public.couples (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create couple_members table
CREATE TABLE public.couple_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(couple_id, user_id)
);

-- Create fixed_expenses table
CREATE TABLE public.fixed_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  due_day INT NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create income table
CREATE TABLE public.income (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  gross_amount NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  type TEXT NOT NULL DEFAULT 'salary' CHECK (type IN ('salary', 'bonus', 'extra', 'other')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create credit_cards table
CREATE TABLE public.credit_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  holder_name TEXT NOT NULL,
  nickname TEXT NOT NULL,
  limit_amount NUMERIC NOT NULL DEFAULT 0,
  closing_day INT NOT NULL CHECK (closing_day >= 1 AND closing_day <= 31),
  due_day INT NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create card_transactions table
CREATE TABLE public.card_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  card_id UUID NOT NULL REFERENCES public.credit_cards(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  amount_total NUMERIC NOT NULL DEFAULT 0,
  installments INT NOT NULL DEFAULT 1,
  first_invoice_month TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create variable_expenses table
CREATE TABLE public.variable_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_method TEXT NOT NULL DEFAULT 'pix' CHECK (payment_method IN ('pix', 'debit', 'cash')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create piggy_bank table
CREATE TABLE public.piggy_bank (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE UNIQUE,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create piggy_bank_movements table
CREATE TABLE public.piggy_bank_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdraw')),
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create monthly_snapshots table
CREATE TABLE public.monthly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  total_income NUMERIC NOT NULL DEFAULT 0,
  total_fixed_expenses NUMERIC NOT NULL DEFAULT 0,
  total_variable_expenses NUMERIC NOT NULL DEFAULT 0,
  total_card_invoices NUMERIC NOT NULL DEFAULT 0,
  piggy_bank_end_balance NUMERIC NOT NULL DEFAULT 0,
  projected_savings NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'projected' CHECK (status IN ('projected', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(couple_id, year_month)
);

-- Create ai_insights table
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  year_month TEXT NOT NULL,
  scope TEXT NOT NULL CHECK (scope IN ('month', 'year', 'card', 'category')),
  message TEXT NOT NULL,
  severity TEXT NOT NULL DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'alert')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.couples ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.couple_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.card_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variable_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piggy_bank ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.piggy_bank_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

-- Security definer function to check couple membership
CREATE OR REPLACE FUNCTION public.is_couple_member(_couple_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.couple_members
    WHERE couple_id = _couple_id AND user_id = auth.uid()
  )
$$;

-- RLS Policies for couples
CREATE POLICY "Users can view their couples"
ON public.couples FOR SELECT
TO authenticated
USING (public.is_couple_member(id));

CREATE POLICY "Users can create couples"
ON public.couples FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Members can update their couple"
ON public.couples FOR UPDATE
TO authenticated
USING (public.is_couple_member(id));

-- RLS Policies for couple_members
CREATE POLICY "Users can view couple members"
ON public.couple_members FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Users can add themselves as members"
ON public.couple_members FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- RLS Policies for fixed_expenses
CREATE POLICY "Members can view fixed expenses"
ON public.fixed_expenses FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create fixed expenses"
ON public.fixed_expenses FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update fixed expenses"
ON public.fixed_expenses FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete fixed expenses"
ON public.fixed_expenses FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for income
CREATE POLICY "Members can view income"
ON public.income FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create income"
ON public.income FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update income"
ON public.income FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete income"
ON public.income FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for credit_cards
CREATE POLICY "Members can view credit cards"
ON public.credit_cards FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create credit cards"
ON public.credit_cards FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update credit cards"
ON public.credit_cards FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete credit cards"
ON public.credit_cards FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for card_transactions
CREATE POLICY "Members can view card transactions"
ON public.card_transactions FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create card transactions"
ON public.card_transactions FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update card transactions"
ON public.card_transactions FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete card transactions"
ON public.card_transactions FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for variable_expenses
CREATE POLICY "Members can view variable expenses"
ON public.variable_expenses FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create variable expenses"
ON public.variable_expenses FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update variable expenses"
ON public.variable_expenses FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete variable expenses"
ON public.variable_expenses FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for piggy_bank
CREATE POLICY "Members can view piggy bank"
ON public.piggy_bank FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create piggy bank"
ON public.piggy_bank FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update piggy bank"
ON public.piggy_bank FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for piggy_bank_movements
CREATE POLICY "Members can view piggy bank movements"
ON public.piggy_bank_movements FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create piggy bank movements"
ON public.piggy_bank_movements FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update piggy bank movements"
ON public.piggy_bank_movements FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete piggy bank movements"
ON public.piggy_bank_movements FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for monthly_snapshots
CREATE POLICY "Members can view monthly snapshots"
ON public.monthly_snapshots FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create monthly snapshots"
ON public.monthly_snapshots FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update monthly snapshots"
ON public.monthly_snapshots FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

-- RLS Policies for ai_insights
CREATE POLICY "Members can view ai insights"
ON public.ai_insights FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create ai insights"
ON public.ai_insights FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));