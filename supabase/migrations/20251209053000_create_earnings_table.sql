-- Create earnings table for Variable Income 2.1
CREATE TABLE IF NOT EXISTS public.earnings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) NOT NULL DEFAULT auth.uid(),
    amount NUMERIC NOT NULL,
    description TEXT,
    category TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.earnings ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own earnings"
    ON public.earnings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own earnings"
    ON public.earnings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own earnings"
    ON public.earnings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own earnings"
    ON public.earnings FOR DELETE
    USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_earnings_user_id ON public.earnings(user_id);
CREATE INDEX idx_earnings_created_at ON public.earnings(created_at DESC);
