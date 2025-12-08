-- Add type field and variable expense fields to fixed_expenses
ALTER TABLE public.fixed_expenses 
ADD COLUMN IF NOT EXISTS type text NOT NULL DEFAULT 'fixed',
ADD COLUMN IF NOT EXISTS date date,
ADD COLUMN IF NOT EXISTS payment_method text DEFAULT 'pix',
ADD COLUMN IF NOT EXISTS description text;

-- Migrate data from variable_expenses to fixed_expenses
INSERT INTO public.fixed_expenses (couple_id, name, amount, category, type, date, payment_method, description, due_day, is_active)
SELECT 
  couple_id,
  description as name,
  amount,
  category,
  'variable' as type,
  date,
  payment_method,
  description,
  1 as due_day,
  true as is_active
FROM public.variable_expenses;

-- Drop variable_expenses table (after migration)
DROP TABLE IF EXISTS public.variable_expenses;