alter table public.matches
add column if not exists source_id text unique;
