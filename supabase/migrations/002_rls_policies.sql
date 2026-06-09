alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "profiles are readable by authenticated users" on public.profiles;
create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);

drop policy if exists "users can insert their own profile" on public.profiles;
create policy "users can insert their own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "users can update their own profile" on public.profiles;
create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "matches are readable by authenticated users" on public.matches;
create policy "matches are readable by authenticated users"
on public.matches
for select
to authenticated
using (true);

drop policy if exists "admins can insert matches" on public.matches;
create policy "admins can insert matches"
on public.matches
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

drop policy if exists "admins can update matches" on public.matches;
create policy "admins can update matches"
on public.matches
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

drop policy if exists "admins can delete matches" on public.matches;
create policy "admins can delete matches"
on public.matches
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

drop policy if exists "users can read own predictions" on public.predictions;
create policy "users can read own predictions"
on public.predictions
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admins can read all predictions" on public.predictions;
create policy "admins can read all predictions"
on public.predictions
for select
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

drop policy if exists "users can insert own predictions before kickoff" on public.predictions;
create policy "users can insert own predictions before kickoff"
on public.predictions
for insert
to authenticated
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.matches m
    where m.id = match_id
    and now() < m.kickoff_at
  )
);

drop policy if exists "users can update own predictions before kickoff" on public.predictions;
create policy "users can update own predictions before kickoff"
on public.predictions
for update
to authenticated
using (
  auth.uid() = user_id
  and exists (
    select 1 from public.matches m
    where m.id = match_id
    and now() < m.kickoff_at
  )
)
with check (
  auth.uid() = user_id
  and exists (
    select 1 from public.matches m
    where m.id = match_id
    and now() < m.kickoff_at
  )
);

drop policy if exists "admins can update prediction points" on public.predictions;
create policy "admins can update prediction points"
on public.predictions
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
)
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);
