import Link from 'next/link';

import { getProfile, getUser } from '@/lib/auth';

export default async function Home() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  if (!user) {
    return (
      <section className="grid gap-6">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-turf">
            Private World Cup score predictions
          </p>
          <h1 className="mt-3 text-4xl font-bold tracking-normal text-ink sm:text-5xl">
            Pick the scores, climb the table.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink/70">
            Submit match predictions before kickoff. Exact score earns 3 points,
            correct result earns 1, and the leaderboard updates after final
            scores are entered.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="btn-primary" href="/signup">
              Create account
            </Link>
            <Link className="btn-secondary" href="/login">
              Sign in
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="grid gap-6">
      <div>
        <p className="text-sm text-ink/60">Signed in as {profile?.display_name ?? user.email}</p>
        <h1 className="mt-2 text-3xl font-bold">Match centre</h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link className="panel hover:border-turf/40" href="/matches/today">
          <h2 className="font-semibold">Today&apos;s matches</h2>
          <p className="mt-1 text-sm text-ink/60">Predict anything kicking off today.</p>
        </Link>
        <Link className="panel hover:border-turf/40" href="/matches">
          <h2 className="font-semibold">All matches</h2>
          <p className="mt-1 text-sm text-ink/60">Browse the full fixture list.</p>
        </Link>
        <Link className="panel hover:border-turf/40" href="/my-predictions">
          <h2 className="font-semibold">My predictions</h2>
          <p className="mt-1 text-sm text-ink/60">Check scores and points.</p>
        </Link>
        <Link className="panel hover:border-turf/40" href="/leaderboard">
          <h2 className="font-semibold">Leaderboard</h2>
          <p className="mt-1 text-sm text-ink/60">See who is out in front.</p>
        </Link>
      </div>
      {profile?.is_admin ? (
        <Link className="btn-secondary w-fit" href="/admin">
          Admin scores
        </Link>
      ) : null}
    </section>
  );
}
