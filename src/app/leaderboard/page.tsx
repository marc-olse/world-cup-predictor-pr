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
    </section>
  );
}
