import { LeaderboardTable } from '@/components/LeaderboardTable';
import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function LeaderboardPage() {
  await requireUser();

  const supabase = await createClient();
  const { data: rows } = await supabase.from('leaderboard').select('*');

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-sm text-ink/60">Ranked by total points, then exact scores.</p>
      </div>
      <LeaderboardTable rows={rows ?? []} />
      <section className="rounded-lg border border-ink/10 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold">Scoring system</h2>
            <p className="mt-1 text-sm text-ink/60">
              Points are assigned when a final score is entered.
            </p>
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-md border border-turf/20 bg-turf/5 p-4">
            <p className="text-3xl font-black text-turf">+3</p>
            <p className="mt-1 font-bold text-ink">Exact score</p>
            <p className="mt-2 text-sm text-ink/60">Your prediction matches the final score.</p>
          </div>
          <div className="rounded-md border border-ocean/20 bg-ocean/5 p-4">
            <p className="text-3xl font-black text-ocean">+1</p>
            <p className="mt-1 font-bold text-ink">Correct outcome</p>
            <p className="mt-2 text-sm text-ink/60">You get the win, draw, or loss right.</p>
          </div>
          <div className="rounded-md border border-gold/30 bg-gold/10 p-4">
            <p className="text-3xl font-black text-ink">+10</p>
            <p className="mt-1 font-bold text-ink">Tournament winner</p>
            <p className="mt-2 text-sm text-ink/60">Your winner pick lifts the trophy.</p>
          </div>
          <div className="rounded-md border border-coral/20 bg-coral/10 p-4">
            <p className="text-3xl font-black text-coral">+5</p>
            <p className="mt-1 font-bold text-ink">Semi-finalist</p>
            <p className="mt-2 text-sm text-ink/60">For each semi-finalist you predict correctly.</p>
          </div>
          <div className="rounded-md border border-gold/40 bg-gold/15 p-4">
            <p className="text-3xl font-black text-ink">x2</p>
            <p className="mt-1 font-bold text-ink">Star game</p>
            <p className="mt-2 text-sm text-ink/60">Match points count double for starred games.</p>
          </div>
        </div>
        <p className="mt-4 rounded-md bg-ink/5 px-3 py-2 text-sm text-ink/65">
          Exact score receives 3 total points, not 3 plus 1. Star games double
          those match points. If an admin updates a finished result, star setting,
          or tournament outcome, the leaderboard recalculates automatically.
        </p>
      </section>
    </section>
  );
}
