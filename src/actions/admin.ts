'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireAdmin } from '@/lib/auth';
import { calculateMatchPredictionPoints } from '@/lib/match-points';
import { createClient } from '@/lib/supabase/server';
import type { MatchStatus } from '@/lib/types';

const statuses = new Set<MatchStatus>(['scheduled', 'live', 'finished']);

function parseOptionalScore(formData: FormData, key: string) {
  const value = formData.get(key);

  if (value === null || value === '') {
    return null;
  }

  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('Scores must be whole numbers of 0 or more.');
  }

  return parsed;
}

async function recalculateMatchPointsInternal(matchId: string) {
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase
    .from('matches')
    .select('id, home_score, away_score, status, is_starred')
    .eq('id', matchId)
    .single();

  if (matchError || !match) {
    throw new Error('Match not found.');
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('*')
    .eq('match_id', matchId);

  if (predictionsError) {
    throw new Error(predictionsError.message);
  }

  const pointUpdates = await Promise.all(
    (predictions ?? []).map((prediction) =>
      supabase
        .from('predictions')
        .update({
          points:
            calculateMatchPredictionPoints({
              status: match.status,
              isStarred: match.is_starred,
              predictedHomeScore: prediction.predicted_home_score,
              predictedAwayScore: prediction.predicted_away_score,
              actualHomeScore: match.home_score,
              actualAwayScore: match.away_score,
            }),
        })
        .eq('id', prediction.id),
    ),
  );

  const failedUpdate = pointUpdates.find(({ error }) => error);

  if (failedUpdate?.error) {
    throw new Error(failedUpdate.error.message);
  }
}

export async function updateMatchScore(formData: FormData) {
  await requireAdmin();

  const matchId = formData.get('matchId');
  const status = formData.get('status');

  if (typeof matchId !== 'string' || !matchId) {
    throw new Error('A match is required.');
  }

  if (typeof status !== 'string' || !statuses.has(status as MatchStatus)) {
    throw new Error('A valid match status is required.');
  }

  const homeScore = parseOptionalScore(formData, 'homeScore');
  const awayScore = parseOptionalScore(formData, 'awayScore');

  if (status === 'finished' && (homeScore === null || awayScore === null)) {
    throw new Error('Finished matches need both final scores.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update({
      status: status as MatchStatus,
      home_score: homeScore,
      away_score: awayScore,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (error) {
    throw new Error(error.message);
  }

  await recalculateMatchPointsInternal(matchId);

  revalidatePath('/admin');
  revalidatePath('/leaderboard');
  revalidatePath('/matches');
  revalidatePath('/matches/today');
  revalidatePath('/my-predictions');
  revalidatePath('/submissions');
  redirect('/admin?saved=1');
}

export async function recalculateMatchPoints(formData: FormData) {
  await requireAdmin();

  const matchId = formData.get('matchId');

  if (typeof matchId !== 'string' || !matchId) {
    throw new Error('A match is required.');
  }

  await recalculateMatchPointsInternal(matchId);

  revalidatePath('/admin');
  revalidatePath('/leaderboard');
  revalidatePath('/my-predictions');
  revalidatePath('/submissions');
  redirect('/admin?recalculated=1');
}

export async function toggleMatchStar(formData: FormData) {
  await requireAdmin();

  const matchId = formData.get('matchId');
  const isStarred = formData.get('isStarred') === 'true';

  if (typeof matchId !== 'string' || !matchId) {
    throw new Error('A match is required.');
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('matches')
    .update({
      is_starred: !isStarred,
      updated_at: new Date().toISOString(),
    })
    .eq('id', matchId);

  if (error) {
    throw new Error(error.message);
  }

  await recalculateMatchPointsInternal(matchId);

  revalidatePath('/admin');
  revalidatePath('/leaderboard');
  revalidatePath('/matches');
  revalidatePath('/matches/today');
  revalidatePath('/my-predictions');
  revalidatePath('/submissions');
  redirect('/admin?starred=1');
}
