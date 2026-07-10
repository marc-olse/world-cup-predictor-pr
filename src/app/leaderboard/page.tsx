import {
  LeaderboardTable,
  type LeaderboardStarStats,
} from '@/components/LeaderboardTable';
import { requireUser } from '@/lib/auth';
import { calculateMatchPredictionPoints } from '@/lib/match-points';
import { createClient } from '@/lib/supabase/server';
import type { LeaderboardRow, MatchStatus } from '@/lib/types';

const predictionsPageSize = 500;

type LeaderboardPrediction = {
  user_id: string;
  predicted_home_score: number | null;
  predicted_away_score: number | null;
  matches: {
    away_score: number | null;
    home_score: number | null;
    is_starred: boolean;
    status: MatchStatus;
  };
};

type TournamentPredictionRow = {
  semi_finalists: string[];
  user_id: string;
  winner: string | null;
};

type TournamentResultRow = {
  semi_finalists: string[];
  winner: string | null;
};

type TournamentStats = {
  semiFinalistMatches: number;
  semiFinalistPoints: number;
  winnerMatches: number;
  winnerPoints: number;
};

function predictionOutcome(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) {
    return 'home';
  }

  if (homeScore < awayScore) {
    return 'away';
  }

  return 'draw';
}

function calculateTournamentStats(
  prediction: TournamentPredictionRow | undefined,
  result: TournamentResultRow | null,
): TournamentStats {
  if (!prediction || !result) {
    return {
      semiFinalistMatches: 0,
      semiFinalistPoints: 0,
      winnerMatches: 0,
      winnerPoints: 0,
    };
  }

  const semiFinalistMatches = prediction.semi_finalists.filter((team) =>
    result.semi_finalists.includes(team),
  ).length;
  const winnerMatches =
    result.winner !== null && prediction.winner === result.winner ? 1 : 0;

  return {
    semiFinalistMatches,
    semiFinalistPoints: semiFinalistMatches * 5,
    winnerMatches,
    winnerPoints: winnerMatches * 10,
  };
}

export default async function LeaderboardPage() {
  await requireUser();

  const supabase = await createClient();
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, display_name');

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const predictions: LeaderboardPrediction[] = [];

  for (let from = 0; ; from += predictionsPageSize) {
    const { data, error } = await supabase
      .from('predictions')
      .select(
        'user_id, predicted_home_score, predicted_away_score, matches!inner(status, home_score, away_score, is_starred)',
      )
      .range(from, from + predictionsPageSize - 1);

    if (error) {
      throw new Error(error.message);
    }

    const page = (data ?? []) as unknown as LeaderboardPrediction[];
    predictions.push(...page);

    if (page.length < predictionsPageSize) {
      break;
    }
  }

  const { data: tournamentPredictions, error: tournamentPredictionsError } =
    await supabase
      .from('tournament_predictions')
      .select('user_id, winner, semi_finalists');

  if (tournamentPredictionsError) {
    throw new Error(tournamentPredictionsError.message);
  }

  const { data: tournamentResult, error: tournamentResultError } = await supabase
    .from('tournament_results')
    .select('winner, semi_finalists')
    .eq('id', true)
    .maybeSingle();

  if (tournamentResultError) {
    throw new Error(tournamentResultError.message);
  }

  const tournamentPredictionByUserId = new Map(
    ((tournamentPredictions ?? []) as TournamentPredictionRow[]).map((prediction) => [
      prediction.user_id,
      prediction,
    ]),
  );

  const rowsByUserId = new Map<string, LeaderboardRow>();
  const starStats: LeaderboardStarStats = {};
  const tournamentStatsByUserId: Record<string, TournamentStats> = {};

  for (const profile of profiles ?? []) {
    const tournamentStats = calculateTournamentStats(
      tournamentPredictionByUserId.get(profile.id),
      tournamentResult as TournamentResultRow | null,
    );

    rowsByUserId.set(profile.id, {
      user_id: profile.id,
      display_name: profile.display_name,
      total_points: tournamentStats.semiFinalistPoints + tournamentStats.winnerPoints,
      predictions_count: 0,
      exact_scores_count: 0,
      correct_results_count: 0,
    });
    tournamentStatsByUserId[profile.id] = tournamentStats;

    starStats[profile.id] = {
      exact: 0,
      finishedPredictions: 0,
      result: 0,
    };
  }

  for (const prediction of predictions) {
    const row = rowsByUserId.get(prediction.user_id);

    if (!row) {
      continue;
    }

    row.predictions_count += 1;

    if (prediction.matches.status !== 'finished') {
      continue;
    }

    const stats = starStats[prediction.user_id];
    stats.finishedPredictions += 1;

    const points = calculateMatchPredictionPoints({
      status: prediction.matches.status,
      isStarred: prediction.matches.is_starred,
      predictedHomeScore: prediction.predicted_home_score,
      predictedAwayScore: prediction.predicted_away_score,
      actualHomeScore: prediction.matches.home_score,
      actualAwayScore: prediction.matches.away_score,
    });

    row.total_points += points;

    if (points === 0) {
      continue;
    }

    const exactScore =
      prediction.predicted_home_score === prediction.matches.home_score &&
      prediction.predicted_away_score === prediction.matches.away_score;

    if (exactScore) {
      row.exact_scores_count += 1;

      if (prediction.matches.is_starred) {
        stats.exact += 1;
      }

      continue;
    }

    if (
      prediction.predicted_home_score !== null &&
      prediction.predicted_away_score !== null &&
      prediction.matches.home_score !== null &&
      prediction.matches.away_score !== null &&
      predictionOutcome(
        prediction.predicted_home_score,
        prediction.predicted_away_score,
      ) ===
        predictionOutcome(prediction.matches.home_score, prediction.matches.away_score)
    ) {
      row.correct_results_count += 1;

      if (prediction.matches.is_starred) {
        stats.result += 1;
      }
    }
  }

  const rows = Array.from(rowsByUserId.values()).sort(
    (first, second) =>
      second.total_points - first.total_points ||
      second.exact_scores_count - first.exact_scores_count ||
      second.correct_results_count - first.correct_results_count ||
      first.display_name.localeCompare(second.display_name),
  );

  return (
    <section className="grid gap-5">
      <div>
        <h1 className="text-3xl font-bold">Leaderboard</h1>
        <p className="mt-2 text-sm text-ink/60">Ranked by total points, then exact scores.</p>
      </div>
      <LeaderboardTable
        rows={rows}
        starStats={starStats}
        tournamentStats={tournamentStatsByUserId}
      />
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
