-- Add card payment fields to fixed_expenses
ALTER TABLE public.fixed_expenses
ADD COLUMN paid_with_card boolean NOT NULL DEFAULT false,
ADD COLUMN card_id uuid REFERENCES public.credit_cards(id) ON DELETE SET NULL;

-- Create index for better query performance
CREATE INDEX idx_fixed_expenses_card_id ON public.fixed_expenses(card_id) WHERE card_id IS NOT NULL;