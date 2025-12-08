-- Create a specific schema table for cancellations if it doesn't exist
create table if not exists public.cancellation_feedback (
    id uuid default gen_random_uuid() primary key,
    user_id uuid references auth.users(id) on delete cascade not null,
    reason text not null,
    details text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.cancellation_feedback enable row level security;

-- Policy: Authenticated users can insert their own feedback
create policy "Users can insert their own cancellation feedback"
    on public.cancellation_feedback
    for insert
    to authenticated
    with check (auth.uid() = user_id);

-- Policy: Users can view their own feedback (optional, but good for completeness)
create policy "Users can view their own feedback"
    on public.cancellation_feedback
    for select
    to authenticated
    using (auth.uid() = user_id);
