import { AdminMatchList } from '@/components/AdminMatchList';
import { Notice } from '@/components/Notice';
import { requireAdmin } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; recalculated?: string; starred?: string }>;
}) {
  await requireAdmin();

  const params = await searchParams;
  const supabase = await createClient();
  const { data: matches } = await supabase
    .from('matches')
    .select('*')
    .order('kickoff_at', { ascending: true });

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Admin scores</h1>
        <p className="mt-2 text-sm text-ink/60">
          Update match status, enter final scores, and recalculate prediction points.
        </p>
      </div>
      <Notice
        success={
          params.saved
            ? 'Match score saved and points recalculated.'
            : params.recalculated
              ? 'Points recalculated.'
              : params.starred
                ? 'Star game setting saved and points recalculated.'
              : undefined
        }
      />
      <AdminMatchList matches={matches ?? []} />
    </section>
  );
}
