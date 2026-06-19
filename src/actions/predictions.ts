'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';

type BulkPredictionResult = {
  closed: number;
  invalid: number;
  saved: number;
  skipped: number;
};

function parseScore(formData: FormData, key: string) {
  const value = formData.get(key);
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    throw new Error('Scores must be whole numbers of 0 or more.');
  }

  return parsed;
}

function parseBulkScore(value: FormDataEntryValue | null) {
  const parsed = typeof value === 'string' ? Number(value) : Number.NaN;

  if (!Number.isInteger(parsed) || parsed < 0) {
    return null;
  }

  return parsed;
}

export async function submitPrediction(formData: FormData) {
  const user = await requireUser();
  const matchId = formData.get('matchId');
  const returnToValue = formData.get('returnTo');
  const returnTo =
    typeof returnToValue === 'string' && returnToValue.startsWith('/')
      ? returnToValue
      : '/matches';

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

  const kickoff = new Date(match.kickoff_at);

  if (Date.now() >= kickoff.getTime()) {
    await supabase.rpc('close_started_matches_with_null_predictions');
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
  const separator = returnTo.includes('?') ? '&' : '?';
  redirect(`${returnTo}${separator}saved=1`);
}

export async function submitMatchdayPredictions(
  formData: FormData,
): Promise<BulkPredictionResult> {
  const user = await requireUser();
  const matchIds = Array.from(new Set(formData.getAll('matchId')))
    .filter((matchId): matchId is string => typeof matchId === 'string' && !!matchId);

  if (!matchIds.length) {
    return { closed: 0, invalid: 0, saved: 0, skipped: 0 };
  }

  const supabase = await createClient();
  const { data: matches, error: matchesError } = await supabase
    .from('matches')
    .select('id, kickoff_at')
    .in('id', matchIds);

  if (matchesError) {
    throw new Error(matchesError.message);
  }

  const matchesById = new Map((matches ?? []).map((match) => [match.id, match]));
  const rows = [];
  const result: BulkPredictionResult = {
    closed: 0,
    invalid: 0,
    saved: 0,
    skipped: 0,
  };

  for (const matchId of matchIds) {
    const match = matchesById.get(matchId);
    const predictedHomeScore = parseBulkScore(
      formData.get(`predictedHomeScore:${matchId}`),
    );
    const predictedAwayScore = parseBulkScore(
      formData.get(`predictedAwayScore:${matchId}`),
    );

    if (!match) {
      result.skipped += 1;
      continue;
    }

    if (predictedHomeScore === null || predictedAwayScore === null) {
      result.invalid += 1;
      continue;
    }

    if (Date.now() >= new Date(match.kickoff_at).getTime()) {
      result.closed += 1;
      continue;
    }

    rows.push({
      user_id: user.id,
      match_id: matchId,
      predicted_home_score: predictedHomeScore,
      predicted_away_score: predictedAwayScore,
    });
  }

  if (!rows.length) {
    if (result.closed > 0) {
      await supabase.rpc('close_started_matches_with_null_predictions');
    }

    return result;
  }

  const { error } = await supabase.from('predictions').upsert(rows, {
    onConflict: 'user_id,match_id',
  });

  if (error) {
    throw new Error(error.message);
  }

  result.saved = rows.length;

  if (result.closed > 0) {
    await supabase.rpc('close_started_matches_with_null_predictions');
  }

  revalidatePath('/matches');
  revalidatePath('/matches/today');
  revalidatePath('/my-predictions');
  revalidatePath('/submissions');

  return result;
}
