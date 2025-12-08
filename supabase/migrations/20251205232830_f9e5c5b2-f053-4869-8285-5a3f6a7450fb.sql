-- Update income table with new fields
ALTER TABLE public.income 
ADD COLUMN IF NOT EXISTS base_amount numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_salary_revision boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS effective_from date;

-- Create income_components table (recurring credits/debits)
CREATE TABLE public.income_components (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  income_id uuid REFERENCES public.income(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('credit', 'debit')),
  amount numeric NOT NULL DEFAULT 0,
  recurrence text NOT NULL DEFAULT 'monthly' CHECK (recurrence IN ('monthly', 'quarterly', 'annual', 'custom')),
  months integer[] DEFAULT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create income_events table (seasonal bonuses)
CREATE TABLE public.income_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  name text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  months integer[] NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create salary_deductions table (long-term deductions)
CREATE TABLE public.salary_deductions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  description text NOT NULL,
  amount_monthly numeric NOT NULL DEFAULT 0,
  installments_total integer NOT NULL DEFAULT 1,
  installments_paid integer NOT NULL DEFAULT 0,
  start_month text NOT NULL,
  end_month text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.income_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.income_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.salary_deductions ENABLE ROW LEVEL SECURITY;

-- RLS policies for income_components
CREATE POLICY "Members can view income components" ON public.income_components
FOR SELECT USING (is_couple_member(couple_id));

CREATE POLICY "Members can create income components" ON public.income_components
FOR INSERT WITH CHECK (is_couple_member(couple_id));

CREATE POLICY "Members can update income components" ON public.income_components
FOR UPDATE USING (is_couple_member(couple_id));

CREATE POLICY "Members can delete income components" ON public.income_components
FOR DELETE USING (is_couple_member(couple_id));

-- RLS policies for income_events
CREATE POLICY "Members can view income events" ON public.income_events
FOR SELECT USING (is_couple_member(couple_id));

CREATE POLICY "Members can create income events" ON public.income_events
FOR INSERT WITH CHECK (is_couple_member(couple_id));

CREATE POLICY "Members can update income events" ON public.income_events
FOR UPDATE USING (is_couple_member(couple_id));

CREATE POLICY "Members can delete income events" ON public.income_events
FOR DELETE USING (is_couple_member(couple_id));

-- RLS policies for salary_deductions
CREATE POLICY "Members can view salary deductions" ON public.salary_deductions
FOR SELECT USING (is_couple_member(couple_id));

CREATE POLICY "Members can create salary deductions" ON public.salary_deductions
FOR INSERT WITH CHECK (is_couple_member(couple_id));

CREATE POLICY "Members can update salary deductions" ON public.salary_deductions
FOR UPDATE USING (is_couple_member(couple_id));

CREATE POLICY "Members can delete salary deductions" ON public.salary_deductions
FOR DELETE USING (is_couple_member(couple_id));