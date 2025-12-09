
alter table "public"."couples" add column "plan" text default 'free' not null;
alter table "public"."couples" add column "plan_updated_at" timestamp with time zone default now();
