-- =================================================================
-- FIX PARA COFRINHOS (PIGGY BANKS)
-- Execute este script no SQL Editor do seu Supabase Dashboard
-- =================================================================

-- 1. Renomear tabela singular para plural (se existir a antiga)
DO $$
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'piggy_bank') THEN
    ALTER TABLE public.piggy_bank RENAME TO piggy_banks;
  END IF;
END $$;

-- 2. Criar tabela se não existir (garantia)
CREATE TABLE IF NOT EXISTS public.piggy_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  current_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Adicionar colunas que faltavam (Nome e Meta)
ALTER TABLE public.piggy_banks 
ADD COLUMN IF NOT EXISTS name TEXT NOT NULL DEFAULT 'Meu Cofrinho',
ADD COLUMN IF NOT EXISTS goal_amount NUMERIC;

-- 4. Remover restrição de um único cofrinho por casal (agora permitimos vários)
ALTER TABLE public.piggy_banks DROP CONSTRAINT IF EXISTS piggy_bank_couple_id_key;
ALTER TABLE public.piggy_banks DROP CONSTRAINT IF EXISTS piggy_banks_couple_id_key;

-- 5. Corrigir tabela de movimentações para apontar para o cofrinho correto
ALTER TABLE public.piggy_bank_movements
ADD COLUMN IF NOT EXISTS piggy_bank_id UUID REFERENCES public.piggy_banks(id) ON DELETE CASCADE;

-- 6. Migrar dados antigos (se houver movimentações soltas, vincular ao primeiro cofrinho do casal)
DO $$
DECLARE 
  movement RECORD;
  bank_id UUID;
BEGIN
  -- Se houver movimentos sem link direto com um cofrinho
  IF EXISTS (SELECT 1 FROM public.piggy_bank_movements WHERE piggy_bank_id IS NULL) THEN
    FOR movement IN SELECT DISTINCT couple_id FROM public.piggy_bank_movements WHERE piggy_bank_id IS NULL LOOP
      -- Pega o cofrinho mais antigo desse casal
      SELECT id INTO bank_id FROM public.piggy_banks WHERE couple_id = movement.couple_id ORDER BY created_at ASC LIMIT 1;
      
      -- Se achou, atualiza os movimentos
      IF bank_id IS NOT NULL THEN
        UPDATE public.piggy_bank_movements 
        SET piggy_bank_id = bank_id 
        WHERE couple_id = movement.couple_id AND piggy_bank_id IS NULL;
      END IF;
    END LOOP;
  END IF;
END $$;

-- 7. Configurar Segurança (RLS)
ALTER TABLE public.piggy_banks ENABLE ROW LEVEL SECURITY;

-- Remove policies antigas para recriar corretas
DROP POLICY IF EXISTS "Members can view piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can create piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can update piggy bank" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can view piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can create piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can update piggy banks" ON public.piggy_banks;
DROP POLICY IF EXISTS "Members can delete piggy banks" ON public.piggy_banks;

-- Novas Policies
CREATE POLICY "Members can view piggy banks"
ON public.piggy_banks FOR SELECT
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can create piggy banks"
ON public.piggy_banks FOR INSERT
TO authenticated
WITH CHECK (public.is_couple_member(couple_id));

CREATE POLICY "Members can update piggy banks"
ON public.piggy_banks FOR UPDATE
TO authenticated
USING (public.is_couple_member(couple_id));

CREATE POLICY "Members can delete piggy banks"
ON public.piggy_banks FOR DELETE
TO authenticated
USING (public.is_couple_member(couple_id));

-- 8. Recarregar cache do schema (importante para o erro sumir imediatamente)
NOTIFY pgrst, 'reload schema';
