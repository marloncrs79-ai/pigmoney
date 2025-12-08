-- Add mood_tag to ai_insights
ALTER TABLE public.ai_insights 
ADD COLUMN IF NOT EXISTS mood_tag text NOT NULL DEFAULT 'neutral';

-- Create ai_memory_context table for long-term pattern memory
CREATE TABLE public.ai_memory_context (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  year_month_start text NOT NULL,
  year_month_end text NOT NULL,
  category text NOT NULL,
  trend text NOT NULL DEFAULT 'stable',
  summary text NOT NULL,
  suggestion text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on ai_memory_context
ALTER TABLE public.ai_memory_context ENABLE ROW LEVEL SECURITY;

-- RLS policies for ai_memory_context
CREATE POLICY "Members can view memory context"
ON public.ai_memory_context FOR SELECT
USING (is_couple_member(couple_id));

CREATE POLICY "Members can create memory context"
ON public.ai_memory_context FOR INSERT
WITH CHECK (is_couple_member(couple_id));

CREATE POLICY "Members can delete memory context"
ON public.ai_memory_context FOR DELETE
USING (is_couple_member(couple_id));

-- Create financial_tasks table
CREATE TABLE public.financial_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  couple_id uuid NOT NULL REFERENCES public.couples(id) ON DELETE CASCADE,
  created_by text NOT NULL DEFAULT 'ai',
  related_scope text,
  related_reference text,
  description text NOT NULL,
  priority text NOT NULL DEFAULT 'medium',
  status text NOT NULL DEFAULT 'open',
  due_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  completed_at timestamp with time zone
);

-- Enable RLS on financial_tasks
ALTER TABLE public.financial_tasks ENABLE ROW LEVEL SECURITY;

-- RLS policies for financial_tasks
CREATE POLICY "Members can view tasks"
ON public.financial_tasks FOR SELECT
USING (is_couple_member(couple_id));

CREATE POLICY "Members can create tasks"
ON public.financial_tasks FOR INSERT
WITH CHECK (is_couple_member(couple_id));

CREATE POLICY "Members can update tasks"
ON public.financial_tasks FOR UPDATE
USING (is_couple_member(couple_id));

CREATE POLICY "Members can delete tasks"
ON public.financial_tasks FOR DELETE
USING (is_couple_member(couple_id));