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
      <section className="panel">
        <h2 className="text-lg font-bold">Scoring system</h2>
        <div className="mt-3 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
          <div>
            <p className="text-2xl font-black text-turf">+3</p>
            <p className="font-semibold text-ink">Exact score</p>
            <p className="mt-1">Example: you predict 2-1 and the final score is 2-1.</p>
          </div>
          <div>
            <p className="text-2xl font-black text-turf">+1</p>
            <p className="font-semibold text-ink">Correct result</p>
            <p className="mt-1">You get the win, loss, or draw right, but not the exact score.</p>
          </div>
          <div>
            <p className="text-2xl font-black text-ink/35">0</p>
            <p className="font-semibold text-ink">Wrong result</p>
            <p className="mt-1">No points if the predicted outcome is incorrect.</p>
          </div>
        </div>
        <p className="mt-4 text-sm text-ink/60">
          When an admin enters a finished game result, the leaderboard recalculates
          automatically. Exact score receives 3 total points, not 3 plus 1.
        </p>
      </section>
    </section>
  );
}
