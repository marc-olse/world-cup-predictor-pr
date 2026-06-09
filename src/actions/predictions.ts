'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

function parseScore(formData: FormData, key: string) {
  const value = formData.get(key);
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('Scores must be whole numbers of 0 or more.');
  }

  return parsed;
}

export async function submitPrediction(formData: FormData) {
  const user = await requireUser();
  const matchId = formData.get('matchId');

  if (typeof matchId !== 'string' || !matchId) {
    throw new Error('A match is required.');
  }

  const predictedHomeScore = parseScore(formData, 'predictedHomeScore');
  const predictedAwayScore = parseScore(formData, 'predictedAwayScore');
  const supabase = await createClient();

  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, kickoff_at, status')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    throw new Error('Match not found.');
  }

  const today = new Date();
  const kickoff = new Date(match.kickoff_at);
  const isToday =
    kickoff.getFullYear() === today.getFullYear() &&
    kickoff.getMonth() === today.getMonth() &&
    kickoff.getDate() === today.getDate();
  const simulatedOpenToday = isToday && match.status !== 'finished';

  if (!simulatedOpenToday && Date.now() >= kickoff.getTime()) {
    throw new Error('Predictions are closed for this match.');
  }

  const { error } = await supabase.from('predictions').upsert(
    {
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
    },
    {
      onConflict: 'user_id,match_id',
    },
  );

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath('/matches');
  revalidatePath('/matches/today');
  revalidatePath('/my-predictions');
  revalidatePath('/submissions');
  redirect('/matches/today?saved=1');
}
