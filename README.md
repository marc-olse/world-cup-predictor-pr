# Codex Instructions: Build a Basic World Cup Predictions Website

## Goal

Build a simple web app where a private group of friends can predict World Cup match scores.

Users should be able to:

- Sign in.
- See today's World Cup matches.
- Submit a predicted score before kickoff.
- See their own predictions.
- See a leaderboard.
- Get points automatically after final scores are entered.

Scoring rules:

- `+3` points for exact score.
- `+1` point for correct result only: home win, away win, or draw.
- `0` points otherwise.
- Exact score should receive `3` total points, not `3 + 1`.

Keep the implementation basic and production-deployable for a small private group.

---

## Tech Stack

Use:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- Supabase
  - PostgreSQL database
  - Supabase Auth
  - Row Level Security
- Vercel deployment compatibility

Do not add unnecessary complexity. Avoid external football APIs for the first version. Admins can manually seed matches and enter final scores.

---

## Main Requirements

### Authentication

Use Supabase Auth.

Implement:

- Sign up
- Sign in
- Sign out
- Protected pages for logged-in users

Use email/password auth for the first version.

---

## Pages

Create the following pages.

### `/`

Home page.

If logged out:

- Show app name.
- Show short rules.
- Show links/buttons to sign in and sign up.

If logged in:

- Show links to:
  - Today's matches
  - All matches
  - My predictions
  - Leaderboard

---

### `/login`

Login page.

Fields:

- Email
- Password

After successful login, redirect to `/matches/today`.

---

### `/signup`

Signup page.

Fields:

- Display name
- Email
- Password

After successful signup:

- Create a profile row in `profiles`.
- Redirect to `/matches/today`.

---

### `/matches/today`

Show matches where `kickoff_at` falls on the current local date.

For each match show:

- Kickoff time
- Home team
- Away team
- Match status
- Existing user prediction, if any
- Prediction form if predictions are still open

Prediction form:

- Home score input
- Away score input
- Submit button

Rules:

- Users can create or update predictions only before kickoff.
- After kickoff, prediction fields should be disabled.

---

### `/matches`

Show all matches ordered by kickoff time.

For each match show:

- Kickoff date/time
- Home team
- Away team
- Status
- Final score if available
- Current user's prediction if available

---

### `/my-predictions`

Show all predictions for the logged-in user.

For each prediction show:

- Match
- Predicted score
- Final score if available
- Points earned

---

### `/leaderboard`

Show users ranked by total points descending.

Columns:

- Rank
- Display name
- Total points
- Exact scores count
- Correct result count
- Predictions count

---

### `/admin`

Create a basic admin page for entering final scores.

For the first version, protect this page with a simple `is_admin` boolean in the `profiles` table.

Admins can:

- View all matches.
- Update match status.
- Enter final home score.
- Enter final away score.
- Trigger score recalculation for that match.

Match statuses:

- `scheduled`
- `live`
- `finished`

Only admins can update match scores.

---

## Database Schema

Create Supabase SQL migrations for the following tables.

### `profiles`

```sql
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  is_admin boolean not null default false,
  created_at timestamptz not null default now()
);
```

---

### `matches`

```sql
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  kickoff_at timestamptz not null,
  home_team text not null,
  away_team text not null,
  home_score integer,
  away_score integer,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

---

### `predictions`

```sql
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score integer not null check (predicted_home_score >= 0),
  predicted_away_score integer not null check (predicted_away_score >= 0),
  points integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, match_id)
);
```

---

## Useful Views

Create a leaderboard view.

```sql
create or replace view public.leaderboard as
select
  p.id as user_id,
  p.display_name,
  coalesce(sum(pr.points), 0)::integer as total_points,
  count(pr.id)::integer as predictions_count,
  count(*) filter (where pr.points = 3)::integer as exact_scores_count,
  count(*) filter (where pr.points = 1)::integer as correct_results_count
from public.profiles p
left join public.predictions pr on pr.user_id = p.id
group by p.id, p.display_name
order by total_points desc, exact_scores_count desc, correct_results_count desc, display_name asc;
```

---

## Row Level Security

Enable RLS on all public tables.

```sql
alter table public.profiles enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;
```

### Profiles policies

Users can read all profiles so the leaderboard works.

```sql
create policy "profiles are readable by authenticated users"
on public.profiles
for select
to authenticated
using (true);
```

Users can update only their own profile, but not `is_admin`.

Codex should implement this carefully. The simplest acceptable first version is:

```sql
create policy "users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
```

Then avoid exposing `is_admin` editing in the UI.

### Matches policies

Authenticated users can read matches.

```sql
create policy "matches are readable by authenticated users"
on public.matches
for select
to authenticated
using (true);
```

Only admins can insert/update/delete matches.

```sql
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
```

### Predictions policies

Users can read their own predictions.

```sql
create policy "users can read own predictions"
on public.predictions
for select
to authenticated
using (auth.uid() = user_id);
```

Users can insert their own predictions before kickoff.

```sql
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
```

Users can update their own predictions before kickoff.

```sql
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
```

Admins can read all predictions.

```sql
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
```

Admins can update points.

```sql
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
```

---

## Scoring Function

Create a TypeScript utility function.

File:

```text
src/lib/scoring.ts
```

Implementation:

```ts
export function calculatePredictionPoints(params: {
  predictedHomeScore: number;
  predictedAwayScore: number;
  actualHomeScore: number | null;
  actualAwayScore: number | null;
}): number {
  const {
    predictedHomeScore,
    predictedAwayScore,
    actualHomeScore,
    actualAwayScore,
  } = params;

  if (actualHomeScore === null || actualAwayScore === null) {
    return 0;
  }

  const exactScore =
    predictedHomeScore === actualHomeScore &&
    predictedAwayScore === actualAwayScore;

  if (exactScore) {
    return 3;
  }

  const predictedResult =
    predictedHomeScore > predictedAwayScore
      ? 'home'
      : predictedHomeScore < predictedAwayScore
        ? 'away'
        : 'draw';

  const actualResult =
    actualHomeScore > actualAwayScore
      ? 'home'
      : actualHomeScore < actualAwayScore
        ? 'away'
        : 'draw';

  return predictedResult === actualResult ? 1 : 0;
}
```

Add unit tests for this function.

Test cases:

- Exact home win score returns 3.
- Exact draw score returns 3.
- Correct home win result but wrong score returns 1.
- Correct away win result but wrong score returns 1.
- Correct draw result but wrong score returns 1.
- Wrong result returns 0.
- Missing actual score returns 0.

---

## Server Actions / API Routes

Implement server-side actions for:

### `submitPrediction(matchId, predictedHomeScore, predictedAwayScore)`

Rules:

- Require authenticated user.
- Validate scores are integers >= 0.
- Check match exists.
- Check current time is before kickoff.
- Upsert prediction using `(user_id, match_id)`.

---

### `updateMatchScore(matchId, homeScore, awayScore, status)`

Rules:

- Require authenticated admin.
- Validate scores are integers >= 0 if status is `finished`.
- Update match.
- Recalculate prediction points for that match.

---

### `recalculateMatchPoints(matchId)`

Rules:

- Require authenticated admin.
- Load match.
- If final scores are null, set all prediction points for that match to 0.
- Otherwise calculate points for every prediction for the match.
- Update predictions.

---

## Suggested File Structure

```text
src/
  app/
    page.tsx
    login/page.tsx
    signup/page.tsx
    matches/page.tsx
    matches/today/page.tsx
    my-predictions/page.tsx
    leaderboard/page.tsx
    admin/page.tsx
  components/
    AuthButton.tsx
    MatchCard.tsx
    PredictionForm.tsx
    LeaderboardTable.tsx
  lib/
    supabase/
      client.ts
      server.ts
      middleware.ts
    scoring.ts
    auth.ts
  actions/
    predictions.ts
    admin.ts
supabase/
  migrations/
    001_initial_schema.sql
    002_rls_policies.sql
    003_leaderboard_view.sql
```

---

## UI Requirements

Keep styling simple and clean.

Use Tailwind CSS.

Design principles:

- Mobile-friendly first.
- Clear match cards.
- Obvious prediction inputs.
- Simple leaderboard table.
- Show success/error messages after form submissions.

Do not spend time on advanced styling.

---

## Seed Data

Add a simple SQL seed file with fake test matches.

Example:

```sql
insert into public.matches (kickoff_at, home_team, away_team, status)
values
  (now() + interval '2 hours', 'Brazil', 'Germany', 'scheduled'),
  (now() + interval '5 hours', 'Spain', 'Argentina', 'scheduled'),
  (now() - interval '1 day', 'France', 'England', 'finished');
```

The finished match should include final scores.

---

## Environment Variables

Use these variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Important:

- Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.
- Use the anon key for browser/client access.
- Use server-side Supabase client for protected operations.

---

## Deployment Instructions To Include In README

To deploy this first version:

1. Create Supabase project.
2. Run the SQL migrations in `supabase/migrations`.
3. Copy Supabase URL and anon key.
4. Create `.env.local` from `.env.example`.
5. Run locally:

```bash
npm install
npm run dev
```

6. Push to GitHub.
7. Import project into Vercel.
8. Add environment variables in Vercel.
9. Deploy.

To make a user an admin for the first version, update that user's profile row:

```sql
update public.profiles
set is_admin = true
where id = '<user-id>';
```

---

## Acceptance Criteria

The MVP is complete when:

- A user can sign up and log in.
- A logged-in user can view today's matches.
- A logged-in user can submit or update a prediction before kickoff.
- A logged-in user cannot submit or update a prediction after kickoff.
- An admin can enter final scores.
- Prediction points are recalculated correctly.
- Leaderboard ranks users by total points.
- The app can be deployed to Vercel.
- No service-role key is exposed to the client.

---

## Implementation Order

Follow this order:

1. Create Next.js app with TypeScript and Tailwind.
2. Add Supabase client/server helpers.
3. Add database migrations.
4. Add auth pages.
5. Add protected route handling.
6. Add match listing pages.
7. Add prediction form and submit action.
8. Add scoring utility and tests.
9. Add leaderboard view and page.
10. Add admin score-entry page.
11. Add README deployment instructions.
12. Test full flow locally.

---

## Do Not Build Yet

Do not add:

- Paid football API integration.
- Live score syncing.
- Complex leagues/groups logic.
- Social features.
- Comments.
- Payments.
- Custom domain setup.

Keep the first version small and working.
