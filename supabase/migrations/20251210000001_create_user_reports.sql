-- Migration: Create user_reports table for support system
-- This table stores user-submitted problem reports

-- Create the user_reports table
CREATE TABLE IF NOT EXISTS public.user_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL CHECK (tipo IN (
        'Bug visual',
        'Erro de cálculo',
        'Dados inconsistentes',
        'Problema de login',
        'Falha de sincronização',
        'Problema de performance',
        'Outro'
    )),
    descricao TEXT NOT NULL,
    imagem_url TEXT,
    impacto TEXT NOT NULL CHECK (impacto IN ('Baixo', 'Médio', 'Alto', 'Crítico')),
    status TEXT NOT NULL DEFAULT 'Novo' CHECK (status IN ('Novo', 'Em análise', 'Resolvido')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_reports_user_id ON public.user_reports(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reports_status ON public.user_reports(status);
CREATE INDEX IF NOT EXISTS idx_user_reports_impacto ON public.user_reports(impacto);
CREATE INDEX IF NOT EXISTS idx_user_reports_created_at ON public.user_reports(created_at DESC);

-- Enable RLS
ALTER TABLE public.user_reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can insert their own reports
CREATE POLICY "Users can insert own reports"
    ON public.user_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- Policy: Users can view their own reports
CREATE POLICY "Users can view own reports"
    ON public.user_reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- Policy: Admins can view all reports (using app_metadata.is_admin)
CREATE POLICY "Admins can view all reports"
    ON public.user_reports
    FOR SELECT
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Policy: Admins can update report status
CREATE POLICY "Admins can update reports"
    ON public.user_reports
    FOR UPDATE
    TO authenticated
    USING (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    )
    WITH CHECK (
        (auth.jwt() -> 'app_metadata' ->> 'is_admin')::boolean = true
    );

-- Grant permissions
GRANT SELECT, INSERT ON public.user_reports TO authenticated;
GRANT UPDATE (status) ON public.user_reports TO authenticated;
