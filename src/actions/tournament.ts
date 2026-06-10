'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { worldCupFixtures } from '@/lib/fixtures';
import { createClient } from '@/lib/supabase/server';
import { tournamentTeams } from '@/lib/teams';

function firstGameKickoff() {
  return new Date(
    [...worldCupFixtures]
      .sort(
        (first, second) =>
          new Date(first.kickoffAt).getTime() - new Date(second.kickoffAt).getTime(),
      )[0].kickoffAt,
  );
}

function getOptionalTeam(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== 'string' || !value) {
    return null;
  }

  if (!tournamentTeams.includes(value)) {
    throw new Error('Choose a valid team.');
  }

  return value;
}

export async function saveTournamentPredictions(formData: FormData) {
  const user = await requireUser();

  if (Date.now() >= firstGameKickoff().getTime()) {
    throw new Error('Tournament predictions are closed.');
  }

  const winner = getOptionalTeam(formData, 'winner');
  const semiFinalists = ['semiFinalist1', 'semiFinalist2', 'semiFinalist3', 'semiFinalist4']
    .map((key) => getOptionalTeam(formData, key))
    .filter((team): team is string => Boolean(team));
  const uniqueSemiFinalists = Array.from(new Set(semiFinalists));

  const supabase = await createClient();
  const { error } = await supabase.from('tournament_predictions').upsert(
    {
      user_id: user.id,
      winner,
      semi_finalists: uniqueSemiFinalists,
    },
    {
      onConflict: 'user_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/my-predictions');
  revalidatePath('/leaderboard');
  redirect('/my-predictions?saved=1');
}
